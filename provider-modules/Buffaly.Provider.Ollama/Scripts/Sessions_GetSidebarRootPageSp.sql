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
		;WITH SessionHierarchy AS
		(
			SELECT	root.SessionID,
					root.ParentSessionID,
					root.SessionID AS RootSessionID,
					1 AS HierarchyDepth
			FROM	dbo.Sessions root WITH (NOLOCK)
			WHERE	root.ParentSessionID IS NULL
					AND ISNULL(root.IsArchived, 0) = 0

			UNION ALL

			SELECT	child.SessionID,
					child.ParentSessionID,
					parent.RootSessionID,
					parent.HierarchyDepth + 1
			FROM	SessionHierarchy parent
			JOIN	dbo.Sessions child WITH (NOLOCK)
			ON		child.ParentSessionID = parent.SessionID
					AND ISNULL(child.IsArchived, 0) = 0
		),
		MatchingRows AS
		(
			SELECT	hierarchy.SessionID,
					hierarchy.ParentSessionID,
					hierarchy.RootSessionID,
					hierarchy.HierarchyDepth,
					sessionRow.LastUpdated
			FROM	SessionHierarchy hierarchy
			JOIN	dbo.Sessions sessionRow WITH (NOLOCK)
			ON		sessionRow.SessionID = hierarchy.SessionID
			WHERE	sessionRow.SessionKey LIKE @SearchPattern
					OR sessionRow.SessionName LIKE @SearchPattern
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
					pagedRoot.RootOrdinal,
					pagedRoot.TotalRootRows,
					pagedRoot.RootRowsReturned,
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
			SELECT	*
			FROM	RankedMatchingRows
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
					matching.RootOrdinal,
					matching.TotalRootRows,
					matching.RootRowsReturned,
					matching.SearchResultOrdinal,
					CONVERT(bit, 1) AS IsSearchMatch
			FROM	CappedMatchingRows matching

			UNION ALL

			SELECT	parent.SessionID,
					parent.ParentSessionID,
					child.RootSessionID,
					child.HierarchyDepth - 1,
					parent.LastUpdated,
					child.RootOrdinal,
					child.TotalRootRows,
					child.RootRowsReturned,
					child.SearchResultOrdinal,
					CONVERT(bit, 0) AS IsSearchMatch
			FROM	SearchRowsWithAncestors child
			JOIN	dbo.Sessions parent WITH (NOLOCK)
			ON		parent.SessionID = child.ParentSessionID
					AND ISNULL(parent.IsArchived, 0) = 0
		),
		DedupedSearchRows AS
		(
			SELECT	searchRow.SessionID,
					searchRow.RootSessionID,
					MIN(searchRow.HierarchyDepth) AS HierarchyDepth,
					MAX(searchRow.LastUpdated) AS LastUpdated,
					MIN(searchRow.RootOrdinal) AS RootOrdinal,
					MAX(searchRow.TotalRootRows) AS TotalRootRows,
					MAX(searchRow.RootRowsReturned) AS RootRowsReturned,
					MIN(searchRow.SearchResultOrdinal) AS SearchResultOrdinal,
					MAX(CONVERT(int, searchRow.IsSearchMatch)) AS IsSearchMatch
			FROM	SearchRowsWithAncestors searchRow
			GROUP BY searchRow.SessionID,
					searchRow.RootSessionID
		)
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
				sessionRow.PromptContext,
				sessionRow.Data,
				sessionRow.DateCreated,
				sessionRow.LastUpdated AS OwnLastUpdated,
				sessionRow.LastUpdated AS EffectiveLastUpdated,
				sessionRow.IsArchived,
				deduped.RootSessionID,
				CONVERT(int, deduped.RootOrdinal) AS RootOrdinal,
				deduped.HierarchyDepth,
				CONVERT(int, deduped.RootRowsReturned) AS RootRowsReturned,
				CONVERT(bit, CASE WHEN deduped.TotalRootRows > @SkipRoots + @NumRoots THEN 1 ELSE 0 END) AS HasMoreRootRows
		FROM	DedupedSearchRows deduped
		JOIN	dbo.Sessions sessionRow WITH (NOLOCK)
		ON		sessionRow.SessionID = deduped.SessionID
		ORDER BY deduped.RootOrdinal,
				deduped.HierarchyDepth,
				deduped.SearchResultOrdinal,
				deduped.LastUpdated DESC,
				sessionRow.SessionID DESC
		OPTION (RECOMPILE, MAXRECURSION 100);
		RETURN;
	END

	;WITH RootActivity AS
	(
		SELECT		root.SessionID AS RootSessionID,
					CASE
						WHEN MAX(child.LastUpdated) IS NOT NULL AND MAX(child.LastUpdated) > root.LastUpdated THEN MAX(child.LastUpdated)
						ELSE root.LastUpdated
					END AS EffectiveLastUpdated
		FROM		dbo.Sessions root WITH (NOLOCK)
		LEFT JOIN	dbo.Sessions child WITH (NOLOCK)
		ON			child.ParentSessionID = root.SessionID
					AND ISNULL(child.IsArchived, 0) = 0
		WHERE		root.ParentSessionID IS NULL
					AND ISNULL(root.IsArchived, 0) = 0
					AND
					(
						root.SessionKey LIKE @SearchPattern
						OR root.SessionName LIKE @SearchPattern
						OR EXISTS
						(
							SELECT 1
							FROM dbo.Sessions matchingChild WITH (NOLOCK)
							WHERE matchingChild.ParentSessionID = root.SessionID
								AND ISNULL(matchingChild.IsArchived, 0) = 0
								AND
								(
									matchingChild.SessionKey LIKE @SearchPattern
									OR matchingChild.SessionName LIKE @SearchPattern
								)
						)
					)
		GROUP BY	root.SessionID,
					root.LastUpdated
	),
	RankedRoots AS
	(
		SELECT	RootSessionID,
				EffectiveLastUpdated,
				ROW_NUMBER() OVER (ORDER BY EffectiveLastUpdated DESC, RootSessionID DESC) AS RootOrdinal,
				COUNT(*) OVER () AS TotalRootRows
		FROM	RootActivity
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
	SidebarRows AS
	(
		SELECT	root.SessionID,
				root.SessionKey,
				root.ParentSessionID,
				root.SessionName,
				root.AgentName,
				root.ProjectName,
				root.ProjectFilePath,
				root.Provider,
				root.ModelName,
				root.ReasoningLevel,
				root.PromptContext,
				root.Data,
				root.DateCreated,
				root.LastUpdated AS OwnLastUpdated,
				pagedRoot.EffectiveLastUpdated,
				root.IsArchived,
				pagedRoot.RootSessionID,
				CONVERT(int, pagedRoot.RootOrdinal) AS RootOrdinal,
				1 AS HierarchyDepth,
				CONVERT(int, pagedRoot.RootRowsReturned) AS RootRowsReturned,
				CONVERT(bit, CASE WHEN pagedRoot.TotalRootRows > @SkipRoots + @NumRoots THEN 1 ELSE 0 END) AS HasMoreRootRows
		FROM	PagedRoots pagedRoot
		JOIN	dbo.Sessions root WITH (NOLOCK)
		ON		root.SessionID = pagedRoot.RootSessionID

		UNION ALL

		SELECT	child.SessionID,
				child.SessionKey,
				child.ParentSessionID,
				child.SessionName,
				child.AgentName,
				child.ProjectName,
				child.ProjectFilePath,
				child.Provider,
				child.ModelName,
				child.ReasoningLevel,
				child.PromptContext,
				child.Data,
				child.DateCreated,
				child.LastUpdated AS OwnLastUpdated,
				child.LastUpdated AS EffectiveLastUpdated,
				child.IsArchived,
				pagedRoot.RootSessionID,
				CONVERT(int, pagedRoot.RootOrdinal) AS RootOrdinal,
				2 AS HierarchyDepth,
				CONVERT(int, pagedRoot.RootRowsReturned) AS RootRowsReturned,
				CONVERT(bit, CASE WHEN pagedRoot.TotalRootRows > @SkipRoots + @NumRoots THEN 1 ELSE 0 END) AS HasMoreRootRows
		FROM	PagedRoots pagedRoot
		JOIN	dbo.Sessions child WITH (NOLOCK)
		ON		child.ParentSessionID = pagedRoot.RootSessionID
				AND ISNULL(child.IsArchived, 0) = 0
				AND
				(
					ISNULL(@Search, '') = ''
					OR child.SessionKey LIKE @SearchPattern
					OR child.SessionName LIKE @SearchPattern
				)
	)
	SELECT	SessionID,
			SessionKey,
			ParentSessionID,
			SessionName,
			AgentName,
			ProjectName,
			ProjectFilePath,
			Provider,
			ModelName,
			ReasoningLevel,
			PromptContext,
			Data,
			DateCreated,
			OwnLastUpdated,
			EffectiveLastUpdated,
			IsArchived,
			RootSessionID,
			RootOrdinal,
			HierarchyDepth,
			RootRowsReturned,
			HasMoreRootRows
	FROM	SidebarRows
	ORDER BY RootOrdinal,
			HierarchyDepth,
			OwnLastUpdated DESC,
			SessionID DESC
	OPTION (RECOMPILE);
GO
