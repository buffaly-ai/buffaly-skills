SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
-- Proposed SQL Server-only bounded recent selection; ownership is applied before paging.
CREATE OR ALTER PROCEDURE dbo.Sessions_GetRecentByEnvironmentUserKey_Sp
	@EnvironmentUserKey nvarchar(64), @Skip int, @NumRows int, @Search nvarchar(255)
AS
BEGIN
	SET NOCOUNT ON;
	IF NULLIF(@EnvironmentUserKey, N'') IS NULL OR @Skip IS NULL OR @Skip NOT BETWEEN 0 AND 1000 OR @NumRows IS NULL OR @NumRows NOT BETWEEN 1 AND 200 OR @Search IS NULL
		THROW 50000, 'A User key and bounded page are required.', 1;
	SELECT SessionID, SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName,
		ReasoningLevel, PromptContext, DateCreated, LastUpdated, Data, SessionName, ParentSessionID,
		IsArchived, State, SessionKind, Transport, ActiveTurnKey, CurrentTurnStartedUtc,
		LastRunPulseUtc, LastNonRunningUtc, EvaluateAdmissionToken, CompactionProvider, NeedsAttention
	FROM dbo.Sessions
	WHERE EnvironmentUserKey = @EnvironmentUserKey COLLATE Latin1_General_100_BIN2
		AND IsArchived = 0
		AND (@Search = N'' OR CHARINDEX(@Search, SessionKey) > 0 OR CHARINDEX(@Search, SessionName) > 0)
	ORDER BY LastUpdated DESC, SessionID DESC
	OFFSET @Skip ROWS FETCH NEXT @NumRows ROWS ONLY;
END;
GO
