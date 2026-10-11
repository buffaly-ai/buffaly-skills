IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_GetSelectedChildWindow_Sp')
BEGIN
	DROP PROCEDURE Sessions_GetSelectedChildWindow_Sp
END
GO
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Sessions_GetSelectedChildWindow_Sp]
	@SessionKey [nvarchar](255)
AS
	SET NOCOUNT ON;

	IF ISNULL(@SessionKey, '') = ''
		THROW 50001, 'SessionKey is required.', 1;
	DECLARE @MaxSelectedBranchRows int = 5000;

	;WITH SelectedSession AS
	(
		SELECT sessionRow.SessionID
		FROM dbo.Sessions sessionRow
		WHERE sessionRow.SessionKey = @SessionKey
			AND ISNULL(sessionRow.IsArchived, 0) = 0
			AND sessionRow.SessionKey NOT IN (N'Browser Profiles', N'browser-profiles')
			AND sessionRow.SessionKey IS NOT NULL AND sessionRow.SessionKey LIKE N'%[^' + NCHAR(9) + NCHAR(10) + NCHAR(11) + NCHAR(12) + NCHAR(13) + NCHAR(32) + NCHAR(133) + NCHAR(160) + NCHAR(5760) + NCHAR(8192) + NCHAR(8193) + NCHAR(8194) + NCHAR(8195) + NCHAR(8196) + NCHAR(8197) + NCHAR(8198) + NCHAR(8199) + NCHAR(8200) + NCHAR(8201) + NCHAR(8202) + NCHAR(8232) + NCHAR(8233) + NCHAR(8239) + NCHAR(8287) + NCHAR(12288) + N']%' COLLATE Latin1_General_100_BIN2
	),
	NavigableSessions AS
	(
		SELECT	sessionRow.*
		FROM	dbo.Sessions sessionRow
		WHERE	ISNULL(sessionRow.IsArchived, 0) = 0
				AND sessionRow.SessionKey NOT IN (N'Browser Profiles', N'browser-profiles')
			AND sessionRow.SessionKey IS NOT NULL AND sessionRow.SessionKey LIKE N'%[^' + NCHAR(9) + NCHAR(10) + NCHAR(11) + NCHAR(12) + NCHAR(13) + NCHAR(32) + NCHAR(133) + NCHAR(160) + NCHAR(5760) + NCHAR(8192) + NCHAR(8193) + NCHAR(8194) + NCHAR(8195) + NCHAR(8196) + NCHAR(8197) + NCHAR(8198) + NCHAR(8199) + NCHAR(8200) + NCHAR(8201) + NCHAR(8202) + NCHAR(8232) + NCHAR(8233) + NCHAR(8239) + NCHAR(8287) + NCHAR(12288) + N']%' COLLATE Latin1_General_100_BIN2
	),
	SelectedChildren AS
	(
		SELECT TOP (201) child.SessionID, child.ParentSessionID,
			ROW_NUMBER() OVER (ORDER BY child.LastUpdated DESC, child.SessionID DESC) AS ChildOrdinal
		FROM dbo.Sessions child
		JOIN SelectedSession selected ON child.ParentSessionID = selected.SessionID
		WHERE child.IsArchived = 0 AND child.SessionKey IS NOT NULL AND child.SessionKey LIKE N'%[^' + NCHAR(9) + NCHAR(10) + NCHAR(11) + NCHAR(12) + NCHAR(13) + NCHAR(32) + NCHAR(133) + NCHAR(160) + NCHAR(5760) + NCHAR(8192) + NCHAR(8193) + NCHAR(8194) + NCHAR(8195) + NCHAR(8196) + NCHAR(8197) + NCHAR(8198) + NCHAR(8199) + NCHAR(8200) + NCHAR(8201) + NCHAR(8202) + NCHAR(8232) + NCHAR(8233) + NCHAR(8239) + NCHAR(8287) + NCHAR(12288) + N']%' COLLATE Latin1_General_100_BIN2
		ORDER BY child.LastUpdated DESC, child.SessionID DESC
	),
	SelectedAncestors AS
	(
		SELECT	selected.SessionID,
				selected.ParentSessionID,
				1 AS DistanceFromSelected,
				CONVERT(nvarchar(max), N'/' + CONVERT(nvarchar(20), selected.SessionID) + N'/') AS VisitedPath
		FROM	NavigableSessions selected
		JOIN	SelectedSession selectedIdentity ON selectedIdentity.SessionID = selected.SessionID

		UNION ALL

		SELECT	parent.SessionID,
				parent.ParentSessionID,
				child.DistanceFromSelected + 1,
				child.VisitedPath + CONVERT(nvarchar(20), parent.SessionID) + N'/'
		FROM	SelectedAncestors child
		JOIN	NavigableSessions parent
		ON		parent.SessionID = child.ParentSessionID
		WHERE	child.DistanceFromSelected < 100
				AND child.VisitedPath NOT LIKE N'%/' + CONVERT(nvarchar(20), parent.SessionID) + N'/%'
	),
	AncestorValidation AS
	(
		SELECT	COUNT(*) AS AncestorCount,
				MAX(CASE WHEN ParentSessionID IS NULL THEN 1 ELSE 0 END) AS HasRoot,
				MAX(CASE WHEN DistanceFromSelected = 100 AND ParentSessionID IS NOT NULL THEN 1 ELSE 0 END) AS HitDepthLimit
		FROM	SelectedAncestors
	),
	SelectedContext AS
	(
		SELECT ancestor.SessionID
		FROM SelectedAncestors ancestor

		UNION

		SELECT child.SessionID
		FROM SelectedAncestors rootPath
		JOIN NavigableSessions child
		ON child.ParentSessionID = rootPath.SessionID
		WHERE rootPath.ParentSessionID IS NULL
			AND child.ParentSessionID NOT IN (SELECT SessionID FROM SelectedSession)
	),
	RootResolution AS
	(
		SELECT TOP (1) ancestor.SessionID AS RootSessionID
		FROM SelectedAncestors ancestor
		WHERE ancestor.ParentSessionID IS NULL
	),
	SelectedDirectChild AS
	(
		SELECT ancestor.SessionID
		FROM SelectedAncestors ancestor
		CROSS JOIN RootResolution resolved
		WHERE ancestor.ParentSessionID = resolved.RootSessionID
	),
	ExpandedContext AS
	(
		SELECT contextRow.SessionID
		FROM SelectedContext contextRow

		UNION

		SELECT child.SessionID
		FROM SelectedDirectChild selectedChild
		JOIN NavigableSessions child ON child.ParentSessionID = selectedChild.SessionID
		WHERE EXISTS
		(
			SELECT 1
			FROM SelectedAncestors selectedPath
			WHERE selectedPath.DistanceFromSelected > 2
		)
		AND child.ParentSessionID NOT IN (SELECT SessionID FROM SelectedSession)

		UNION

		SELECT child.SessionID
		FROM SelectedChildren child
		WHERE child.ChildOrdinal <= 200
	),
	RootActivity AS
	(
		SELECT root.SessionID AS RootSessionID,
			CASE
				WHEN MAX(child.LastUpdated) IS NOT NULL AND MAX(child.LastUpdated) > root.LastUpdated THEN MAX(child.LastUpdated)
				ELSE root.LastUpdated
			END AS EffectiveLastUpdated
		FROM RootResolution resolved
		JOIN NavigableSessions root ON root.SessionID = resolved.RootSessionID
		LEFT JOIN NavigableSessions child ON child.ParentSessionID = root.SessionID
		GROUP BY root.SessionID, root.LastUpdated
	),
	Hierarchy AS
	(
		SELECT root.SessionID, root.ParentSessionID, 1 AS HierarchyDepth
		FROM RootResolution resolved
		JOIN NavigableSessions root ON root.SessionID = resolved.RootSessionID

		UNION ALL

		SELECT child.SessionID, child.ParentSessionID, parent.HierarchyDepth + 1
		FROM Hierarchy parent
		JOIN NavigableSessions child ON child.ParentSessionID = parent.SessionID
		JOIN ExpandedContext contextRow ON contextRow.SessionID = child.SessionID
		WHERE parent.HierarchyDepth < 100
	)
	SELECT TOP (@MaxSelectedBranchRows + 1)
			sessionRow.SessionID,
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
			CASE WHEN hierarchy.HierarchyDepth = 1 THEN rootActivity.EffectiveLastUpdated ELSE sessionRow.LastUpdated END AS EffectiveLastUpdated,
			resolved.RootSessionID,
			CONVERT(int, NULL) AS RootOrdinal,
			hierarchy.HierarchyDepth,
			(SELECT SessionID FROM SelectedSession) AS SelectedSessionID,
			CONVERT(bit, CASE WHEN EXISTS (SELECT 1 FROM SelectedChildren WHERE ChildOrdinal = 201) THEN 1 ELSE 0 END) AS DirectChildrenTruncated
	FROM	Hierarchy hierarchy
	CROSS JOIN AncestorValidation validation
	JOIN	NavigableSessions sessionRow ON sessionRow.SessionID = hierarchy.SessionID
	LEFT JOIN NavigableSessions parent ON parent.SessionID = sessionRow.ParentSessionID
	CROSS JOIN RootResolution resolved
	JOIN RootActivity rootActivity ON rootActivity.RootSessionID = resolved.RootSessionID
	WHERE	validation.AncestorCount > 0
			AND validation.HasRoot = 1
			AND validation.HitDepthLimit = 0
	ORDER BY hierarchy.HierarchyDepth,
			sessionRow.LastUpdated DESC,
			sessionRow.SessionID DESC
	OPTION (MAXRECURSION 100);
GO
