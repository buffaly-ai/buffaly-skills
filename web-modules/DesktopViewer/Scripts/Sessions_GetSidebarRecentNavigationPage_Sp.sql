SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[Sessions_GetSidebarRecentNavigationPage_Sp]
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

	CREATE TABLE #HiddenNavigationSessions (SessionID int NOT NULL PRIMARY KEY);
	INSERT #HiddenNavigationSessions
	SELECT SessionID FROM dbo.Sessions WHERE IsArchived=0 AND SidebarShowInSessionList=0 OPTION(MAXDOP 1);
	-- Expand only visible descendants. Hidden children are already in the seed.
	DECLARE @NavigationDepth int = 0;
	WHILE 1=1
	BEGIN
		INSERT #HiddenNavigationSessions
		SELECT child.SessionID FROM dbo.Sessions child
		JOIN #HiddenNavigationSessions parent ON child.ParentSessionID=parent.SessionID
		WHERE child.IsArchived=0 AND child.SidebarShowInSessionList=1
		AND NOT EXISTS(SELECT 1 FROM #HiddenNavigationSessions seen WHERE seen.SessionID=child.SessionID) OPTION(MAXDOP 1);
		IF @@ROWCOUNT=0 BREAK;
		SET @NavigationDepth+=1;
		IF @NavigationDepth>=100 THROW 50003,'Navigation hierarchy exceeds 100 levels.',1;
	END;


	;WITH CandidateRows AS
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
				sessionRow.PromptContext,
				sessionRow.CompactionProvider,
				sessionRow.State, sessionRow.SessionKind, sessionRow.Transport,
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
				-- Eligibility precedes ranking and lookahead; a display name is not agent identity.
				AND NOT EXISTS (SELECT 1 FROM #HiddenNavigationSessions hidden WHERE hidden.SessionID = sessionRow.SessionID)
				AND
				(
					ISNULL(@Search, '') = ''
					OR sessionRow.SessionKey LIKE @SearchPattern
					OR sessionRow.SessionName LIKE @SearchPattern
				)
	)
	SELECT * INTO #NavigationPageRows FROM CandidateRows WHERE RowOrdinal BETWEEN @SkipRows + 1 AND @SkipRows + @NumRows + 1 OPTION(MAXDOP 1);
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
			State, SessionKind, Transport,
			DateCreated,
			OwnLastUpdated,
			OwnLastUpdated AS EffectiveLastUpdated,
			CONVERT(int, NULL) AS RootSessionID,
			CONVERT(int, NULL) AS RootOrdinal,
			CONVERT(int, NULL) AS HierarchyDepth,
			CONVERT(bit, 1) AS ShowInSessionList
	FROM #NavigationPageRows
 UNION ALL
 SELECT context.SessionID, context.SessionKey, context.ParentSessionID, context.ParentSessionKey,
 context.SessionName, context.AgentName, context.ProjectName, context.ProjectFilePath, context.Provider,
 context.ModelName, context.ReasoningLevel, context.PromptContext, context.CompactionProvider,
 context.State, context.SessionKind, context.Transport, context.DateCreated, context.LastUpdated,
 context.LastUpdated, CONVERT(int,NULL),CONVERT(int,NULL),CONVERT(int,NULL),CONVERT(bit,0)
 FROM (SELECT TOP (220) child.*, parent.SessionKey AS ParentSessionKey
 FROM dbo.Sessions child JOIN #NavigationPageRows parent ON child.ParentSessionID=parent.SessionID
 WHERE parent.RowOrdinal <= @SkipRows + @NumRows AND child.IsArchived=0
 AND child.SidebarShowInSessionList=0
 AND NULLIF(JSON_VALUE(child.Data,'$.SidebarProfile.ObservedSessionUserStateKey'),N'') IS NOT NULL
 ORDER BY child.LastUpdated DESC,child.SessionID DESC) context
 ORDER BY OwnLastUpdated DESC,SessionID DESC OPTION(MAXDOP 1);
GO
