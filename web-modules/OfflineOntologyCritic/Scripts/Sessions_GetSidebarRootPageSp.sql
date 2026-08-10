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
