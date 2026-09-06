IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_GetSidebarRootPageSp')
BEGIN
	DROP PROCEDURE Sessions_GetSidebarRootPageSp
END
GO
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Sessions_GetSidebarRootPageSp]
	@Search [nvarchar](255),
	@SkipRoots [int],
	@NumRoots [int]
AS
	SET NOCOUNT ON;

	IF @SkipRoots < 0
		THROW 50001, 'SkipRoots must be nonnegative.', 1;
	IF @NumRoots < 1 OR @NumRoots > 100
		THROW 50002, 'NumRoots must be between 1 and 100.', 1;

	DECLARE @SearchPattern nvarchar(257) = '%' + ISNULL(@Search, '') + '%';

	IF ISNULL(@Search, '') <> ''
	BEGIN
		;WITH SearchableSessions AS
		(
			SELECT	sessionRow.SessionID,
					sessionRow.SessionKey,
					sessionRow.ParentSessionID,
					sessionRow.SessionName,
					sessionRow.AgentName,
					sessionRow.ProjectName,
					sessionRow.ProjectFilePath,
					sessionRow.Provider,
					sessionRow.ModelName,
					sessionRow.ReasoningLevel,
					sessionRow.CompactionProvider,
					sessionRow.DateCreated,
					sessionRow.LastUpdated
			FROM	dbo.Sessions sessionRow WITH (NOLOCK)
			WHERE	sessionRow.IsArchived = 0
		),
		MatchingSessions AS
		(
			SELECT	sessionRow.SessionID,
					sessionRow.ParentSessionID,
					sessionRow.LastUpdated
			FROM	SearchableSessions sessionRow
			WHERE	sessionRow.SessionKey LIKE @SearchPattern
					OR sessionRow.SessionName LIKE @SearchPattern
		),
		CappedMatchingSessions AS
		(
			SELECT TOP (201)
					matching.SessionID,
					matching.ParentSessionID,
					matching.LastUpdated
			FROM	MatchingSessions matching
			ORDER BY matching.LastUpdated DESC,
					matching.SessionID DESC
		),
		WalkedMatchingSessions AS
		(
			SELECT TOP (200)
					matching.SessionID,
					matching.ParentSessionID,
					matching.LastUpdated,
					CONVERT(int, CASE WHEN (SELECT COUNT(*) FROM CappedMatchingSessions) > 200 THEN 1 ELSE 0 END) AS IsMatchSetBounded
			FROM	CappedMatchingSessions matching
			ORDER BY matching.LastUpdated DESC,
					matching.SessionID DESC
		),
		MatchAncestors AS
		(
			SELECT	matching.SessionID,
					matching.ParentSessionID,
					matching.SessionID AS MatchSessionID,
					matching.LastUpdated,
					1 AS DistanceFromMatch
			FROM	WalkedMatchingSessions matching

			UNION ALL

			SELECT	parent.SessionID,
					parent.ParentSessionID,
					child.MatchSessionID,
					child.LastUpdated,
					child.DistanceFromMatch + 1
			FROM	MatchAncestors child
			JOIN	SearchableSessions parent
			ON		parent.SessionID = child.ParentSessionID
		),
		MatchingRows AS
		(
			SELECT	matching.SessionID,
					matching.ParentSessionID,
					root.SessionID AS RootSessionID,
					root.DistanceFromMatch AS HierarchyDepth,
					matching.LastUpdated,
					matching.IsMatchSetBounded
			FROM	WalkedMatchingSessions matching
			JOIN	MatchAncestors root
			ON		root.MatchSessionID = matching.SessionID
					AND root.ParentSessionID IS NULL
		),
		RankedRoots AS
		(
			SELECT	RootSessionID,
					MAX(LastUpdated) AS EffectiveLastUpdated,
					ROW_NUMBER() OVER (ORDER BY MAX(LastUpdated) DESC, RootSessionID DESC) AS RootOrdinal,
					COUNT(*) OVER () AS TotalRootRows
			FROM	MatchingRows
			GROUP BY RootSessionID
		),
		PagedRoots AS
		(
			SELECT	RootSessionID,
					EffectiveLastUpdated,
					RootOrdinal,
					TotalRootRows,
					COUNT(*) OVER () AS RootRowsReturned
			FROM	RankedRoots
			WHERE	RootOrdinal BETWEEN @SkipRoots + 1 AND @SkipRoots + @NumRoots
		),
		RankedMatchingRows AS
		(
			SELECT	matching.SessionID,
					matching.ParentSessionID,
					matching.RootSessionID,
					matching.HierarchyDepth,
					matching.LastUpdated,
					pagedRoot.EffectiveLastUpdated AS RootEffectiveLastUpdated,
					pagedRoot.RootOrdinal,
					pagedRoot.TotalRootRows,
					pagedRoot.RootRowsReturned,
					matching.IsMatchSetBounded,
					COUNT(*) OVER (PARTITION BY matching.RootSessionID) AS MatchingRowsWithinRoot,
					COUNT(*) OVER () AS TotalMatchingRows,
					ROW_NUMBER() OVER
					(
						PARTITION BY matching.RootSessionID
						ORDER BY matching.LastUpdated DESC,
								 matching.SessionID DESC
					) AS SearchResultOrdinalWithinRoot,
					ROW_NUMBER() OVER
					(
						ORDER BY matching.LastUpdated DESC,
								 matching.SessionID DESC
					) AS SearchResultOrdinal
			FROM	MatchingRows matching
			JOIN	PagedRoots pagedRoot
			ON		pagedRoot.RootSessionID = matching.RootSessionID
		),
		CappedMatchingRows AS
		(
			SELECT	*,
					CONVERT(int, CASE
						WHEN MAX(matching.IsMatchSetBounded) OVER () = 1
							OR TotalMatchingRows > 200
							OR MatchingRowsWithinRoot > CONVERT(int, CEILING(200.0 / NULLIF(RootRowsReturned, 0)))
						THEN 1 ELSE 0 END) AS IsSearchBounded
			FROM	RankedMatchingRows matching
			WHERE	SearchResultOrdinalWithinRoot <= CONVERT(int, CEILING(200.0 / NULLIF(RootRowsReturned, 0)))
					AND SearchResultOrdinal <= 200
		),
		SearchRowsWithAncestors AS
		(
			SELECT	matching.SessionID,
					matching.ParentSessionID,
					matching.RootSessionID,
					matching.HierarchyDepth,
					matching.LastUpdated,
					matching.RootEffectiveLastUpdated,
					matching.RootOrdinal,
					matching.TotalRootRows,
					matching.RootRowsReturned,
					matching.SearchResultOrdinal,
					matching.IsSearchBounded,
					CONVERT(bit, 1) AS IsSearchMatch
			FROM	CappedMatchingRows matching

			UNION ALL

			SELECT	parent.SessionID,
					parent.ParentSessionID,
					child.RootSessionID,
					child.HierarchyDepth - 1,
					parent.LastUpdated,
					child.RootEffectiveLastUpdated,
					child.RootOrdinal,
					child.TotalRootRows,
					child.RootRowsReturned,
					child.SearchResultOrdinal,
					child.IsSearchBounded,
					CONVERT(bit, 0) AS IsSearchMatch
			FROM	SearchRowsWithAncestors child
			JOIN	SearchableSessions parent
			ON		parent.SessionID = child.ParentSessionID
		),
		DedupedSearchRows AS
		(
			SELECT	searchRow.SessionID,
					searchRow.RootSessionID,
					MIN(searchRow.HierarchyDepth) AS HierarchyDepth,
					MAX(searchRow.LastUpdated) AS LastUpdated,
					MAX(searchRow.RootEffectiveLastUpdated) AS RootEffectiveLastUpdated,
					MIN(searchRow.RootOrdinal) AS RootOrdinal,
					MAX(searchRow.TotalRootRows) AS TotalRootRows,
					MAX(searchRow.RootRowsReturned) AS RootRowsReturned,
					MIN(searchRow.SearchResultOrdinal) AS SearchResultOrdinal,
					MAX(searchRow.IsSearchBounded) AS IsSearchBounded,
					MAX(CONVERT(int, searchRow.IsSearchMatch)) AS IsSearchMatch
			FROM	SearchRowsWithAncestors searchRow
			GROUP BY searchRow.SessionID,
					 searchRow.RootSessionID
		)
		SELECT	sessionRow.SessionID,
				sessionRow.SessionKey,
				sessionRow.ParentSessionID,
				parent.SessionKey AS ParentSessionKey,
				sessionRow.SessionName,
				sessionRow.AgentName,
				sessionRow.ProjectName,
				sessionRow.ProjectFilePath,
				sessionRow.Provider,
				sessionRow.ModelName,
				sessionRow.ReasoningLevel,
				CONVERT(nvarchar(max), N'') AS PromptContext,
				sessionRow.CompactionProvider,
				CONVERT(nvarchar(max), N'') AS Data,
				sessionRow.DateCreated,
				sessionRow.LastUpdated AS OwnLastUpdated,
				CASE WHEN deduped.HierarchyDepth = 1 THEN deduped.RootEffectiveLastUpdated ELSE sessionRow.LastUpdated END AS EffectiveLastUpdated,
				deduped.RootSessionID,
				CONVERT(int, deduped.RootOrdinal) AS RootOrdinal,
				deduped.HierarchyDepth,
				CONVERT(int, deduped.RootRowsReturned) AS RootRowsReturned,
				CONVERT(bit, CASE WHEN deduped.TotalRootRows > @SkipRoots + @NumRoots THEN 1 ELSE 0 END) AS HasMoreRootRows,
				CONVERT(bit, MAX(deduped.IsSearchBounded) OVER ()) AS IsSearchBounded
		FROM	DedupedSearchRows deduped
		JOIN	SearchableSessions sessionRow
		ON		sessionRow.SessionID = deduped.SessionID
		LEFT JOIN SearchableSessions parent
		ON		parent.SessionID = sessionRow.ParentSessionID
		ORDER BY deduped.RootOrdinal,
				deduped.HierarchyDepth,
				deduped.SearchResultOrdinal,
				deduped.LastUpdated DESC,
				sessionRow.SessionID DESC
		OPTION (MAXRECURSION 100);
		RETURN;
	END

	;WITH RootActivity AS
	(
		SELECT	root.SessionID AS RootSessionID,
				CASE
					WHEN MAX(child.LastUpdated) IS NOT NULL AND MAX(child.LastUpdated) > root.LastUpdated THEN MAX(child.LastUpdated)
					ELSE root.LastUpdated
				END AS EffectiveLastUpdated,
				COUNT(child.SessionID) AS DirectChildCount
		FROM	dbo.Sessions root WITH (NOLOCK)
		LEFT JOIN dbo.Sessions child WITH (NOLOCK)
		ON		child.ParentSessionID = root.SessionID
				AND child.IsArchived = 0
		WHERE	root.ParentSessionID IS NULL
				AND root.IsArchived = 0
		GROUP BY root.SessionID,
				 root.LastUpdated
	),
	RankedRoots AS
	(
		SELECT	RootSessionID,
				EffectiveLastUpdated,
				CONVERT(int, DirectChildCount + 1) AS FamilyRowCount,
				ROW_NUMBER() OVER (ORDER BY EffectiveLastUpdated DESC, RootSessionID DESC) AS RootOrdinal,
				COUNT(*) OVER () AS TotalRootRows
		FROM	RootActivity
	),
	RequestedRoots AS
	(
		SELECT	RootSessionID,
				EffectiveLastUpdated,
				FamilyRowCount,
				RootOrdinal,
				TotalRootRows,
				SUM(FamilyRowCount) OVER (ORDER BY RootOrdinal ROWS UNBOUNDED PRECEDING) AS CumulativeFamilyRows
		FROM	RankedRoots
		WHERE	RootOrdinal BETWEEN @SkipRoots + 1 AND @SkipRoots + @NumRoots
	),
	BudgetedRoots AS
	(
		SELECT	RootSessionID,
				EffectiveLastUpdated,
				RootOrdinal,
				TotalRootRows
		FROM	RequestedRoots
		WHERE	RootOrdinal = @SkipRoots + 1
				OR CumulativeFamilyRows <= 500
	),
	PagedRoots AS
	(
		SELECT	RootSessionID,
				EffectiveLastUpdated,
				RootOrdinal,
				TotalRootRows,
				COUNT(*) OVER () AS RootRowsReturned,
				CONVERT(bit, CASE WHEN MAX(RootOrdinal) OVER () < TotalRootRows THEN 1 ELSE 0 END) AS HasMoreRootRows
		FROM	BudgetedRoots
	),
	SidebarRows AS
	(
		SELECT	root.SessionID,
				root.SessionKey,
				root.ParentSessionID,
				CONVERT(nvarchar(255), NULL) AS ParentSessionKey,
				root.SessionName,
				root.AgentName,
				root.ProjectName,
				root.ProjectFilePath,
				root.Provider,
				root.ModelName,
				root.ReasoningLevel,
				CONVERT(nvarchar(max), N'') AS PromptContext,
				root.CompactionProvider,
				CONVERT(nvarchar(max), N'') AS Data,
				root.DateCreated,
				root.LastUpdated AS OwnLastUpdated,
				pagedRoot.EffectiveLastUpdated,
				pagedRoot.RootSessionID,
				CONVERT(int, pagedRoot.RootOrdinal) AS RootOrdinal,
				1 AS HierarchyDepth,
				CONVERT(int, pagedRoot.RootRowsReturned) AS RootRowsReturned,
				pagedRoot.HasMoreRootRows,
				CONVERT(bit, 0) AS IsSearchBounded
		FROM	PagedRoots pagedRoot
		JOIN	dbo.Sessions root WITH (NOLOCK)
		ON		root.SessionID = pagedRoot.RootSessionID

		UNION ALL

		SELECT	child.SessionID,
				child.SessionKey,
				child.ParentSessionID,
				parent.SessionKey AS ParentSessionKey,
				child.SessionName,
				child.AgentName,
				child.ProjectName,
				child.ProjectFilePath,
				child.Provider,
				child.ModelName,
				child.ReasoningLevel,
				CONVERT(nvarchar(max), N'') AS PromptContext,
				child.CompactionProvider,
				CONVERT(nvarchar(max), N'') AS Data,
				child.DateCreated,
				child.LastUpdated AS OwnLastUpdated,
				child.LastUpdated AS EffectiveLastUpdated,
				pagedRoot.RootSessionID,
				CONVERT(int, pagedRoot.RootOrdinal) AS RootOrdinal,
				2 AS HierarchyDepth,
				CONVERT(int, pagedRoot.RootRowsReturned) AS RootRowsReturned,
				pagedRoot.HasMoreRootRows,
				CONVERT(bit, 0) AS IsSearchBounded
		FROM	PagedRoots pagedRoot
		JOIN	dbo.Sessions parent WITH (NOLOCK)
		ON		parent.SessionID = pagedRoot.RootSessionID
		JOIN	dbo.Sessions child WITH (NOLOCK)
		ON		child.ParentSessionID = pagedRoot.RootSessionID
				AND child.IsArchived = 0
	)
	SELECT	SessionID,
			SessionKey,
			ParentSessionID,
			ParentSessionKey,
			SessionName,
			AgentName,
			ProjectName,
			ProjectFilePath,
			Provider,
			ModelName,
			ReasoningLevel,
			PromptContext,
			CompactionProvider,
			Data,
			DateCreated,
			OwnLastUpdated,
			EffectiveLastUpdated,
			RootSessionID,
			RootOrdinal,
			HierarchyDepth,
			RootRowsReturned,
			HasMoreRootRows,
			IsSearchBounded
	FROM	SidebarRows
	ORDER BY RootOrdinal,
			HierarchyDepth,
			OwnLastUpdated DESC,
			SessionID DESC
	OPTION (MAXDOP 1);
GO
