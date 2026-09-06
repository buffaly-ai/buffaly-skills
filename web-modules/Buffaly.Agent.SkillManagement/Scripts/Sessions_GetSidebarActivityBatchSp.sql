IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_GetSidebarActivityBatchSp')
BEGIN
	DROP PROCEDURE Sessions_GetSidebarActivityBatchSp
END
GO
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Sessions_GetSidebarActivityBatchSp]
	@SessionKeysJson [nvarchar](max)
AS
	SET NOCOUNT ON;

	IF ISJSON(@SessionKeysJson) <> 1
		THROW 50001, 'SessionKeysJson must be a JSON array.', 1;

	DECLARE @RequestedSessionKeys TABLE
	(
		RequestOrdinal int NOT NULL PRIMARY KEY,
		SessionKey nvarchar(450) NOT NULL
	);

	INSERT INTO @RequestedSessionKeys (RequestOrdinal, SessionKey)
	SELECT CONVERT(int, requested.[key]) AS RequestOrdinal,
		CONVERT(nvarchar(450), requested.[value]) AS SessionKey
	FROM OPENJSON(@SessionKeysJson) requested;

	;WITH RequestedSessions AS
	(
		SELECT requested.RequestOrdinal,
			sessionRow.SessionID,
			sessionRow.SessionKey,
			sessionRow.ParentSessionID,
			sessionRow.SessionName,
			sessionRow.AgentName,
			sessionRow.Data,
			sessionRow.LastUpdated
		FROM @RequestedSessionKeys requested
		JOIN dbo.Sessions sessionRow WITH (NOLOCK)
		ON sessionRow.SessionKey = requested.SessionKey
		WHERE sessionRow.IsArchived = 0
	),
	RootActivity AS
	(
		SELECT root.SessionID AS RootSessionID,
			CASE
				WHEN MAX(child.LastUpdated) IS NOT NULL AND MAX(child.LastUpdated) > root.LastUpdated THEN MAX(child.LastUpdated)
				ELSE root.LastUpdated
			END AS EffectiveLastUpdated
		FROM RequestedSessions root
		LEFT JOIN dbo.Sessions child WITH (NOLOCK)
		ON child.ParentSessionID = root.SessionID
			AND child.IsArchived = 0
		WHERE root.ParentSessionID IS NULL
		GROUP BY root.SessionID,
			root.LastUpdated
	)
	SELECT requested.SessionID,
		requested.SessionKey,
		requested.SessionName,
		requested.AgentName,
		requested.Data,
		requested.LastUpdated AS OwnLastUpdated,
		CASE WHEN requested.ParentSessionID IS NULL THEN rootActivity.EffectiveLastUpdated ELSE requested.LastUpdated END AS EffectiveLastUpdated
	FROM RequestedSessions requested
	LEFT JOIN RootActivity rootActivity
	ON rootActivity.RootSessionID = requested.SessionID
	ORDER BY requested.RequestOrdinal
GO
