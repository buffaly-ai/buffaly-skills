IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_GetSidebarRecentPageSp')
BEGIN
	DROP PROCEDURE Sessions_GetSidebarRecentPageSp
END
GO
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Sessions_GetSidebarRecentPageSp]
	@Search [nvarchar](255),
	@SkipRows [int],
	@NumRows [int]
AS
	SET NOCOUNT ON;

	IF @SkipRows < 0
		THROW 50001, 'SkipRows must be nonnegative.', 1;
	IF @NumRows < 1 OR @NumRows > 5000
		THROW 50002, 'NumRows must be between 1 and 5000.', 1;

	DECLARE @SearchPattern nvarchar(257) = '%' + ISNULL(@Search, '') + '%';

	;WITH EligibleRows AS
	(
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
				ROW_NUMBER() OVER
				(
					ORDER BY sessionRow.LastUpdated DESC,
							sessionRow.SessionID DESC
				) AS RowOrdinal
		FROM	dbo.Sessions sessionRow
		LEFT JOIN dbo.Sessions parent
		ON		parent.SessionID = sessionRow.ParentSessionID
		WHERE	ISNULL(sessionRow.IsArchived, 0) = 0
				AND sessionRow.SessionKey NOT IN (N'Browser Profiles', N'browser-profiles')
				AND
				(
					sessionRow.SessionKey = N'Buffaly.CodeReviews.Global'
					OR
					(
						ISNULL(sessionRow.AgentName, N'') NOT IN
						(
							N'level-2',
							N'online-session-memory-critic',
							N'online-action-critic',
							N'code-review-agent',
							N'code-review-agent-v3'
						)
						AND sessionRow.SessionKey NOT LIKE N'%-online-memory-critic'
						AND sessionRow.SessionKey NOT LIKE N'%-online-action-critic'
						AND sessionRow.SessionKey NOT LIKE N'%.CodeReviewAgentV3'
					)
				)
				AND
				(
					ISNULL(@Search, '') = ''
					OR sessionRow.SessionKey LIKE @SearchPattern
					OR sessionRow.SessionName LIKE @SearchPattern
				)
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
			OwnLastUpdated AS EffectiveLastUpdated,
			CONVERT(int, NULL) AS RootSessionID,
			CONVERT(int, NULL) AS RootOrdinal,
			CONVERT(int, NULL) AS HierarchyDepth
	FROM	EligibleRows
	WHERE	RowOrdinal BETWEEN @SkipRows + 1 AND @SkipRows + @NumRows + 1
	ORDER BY RowOrdinal
	OPTION (MAXDOP 2);
GO
