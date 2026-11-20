SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
-- Proposed SQL Server-only full-row custom selection. Ownership precedes paging.
CREATE OR ALTER PROCEDURE dbo.Sessions_GetByEnvironmentUserKeyPage_Sp
    @EnvironmentUserKey nvarchar(64), @AfterSessionID int, @NumRows int
AS
BEGIN
    SET NOCOUNT ON;
    IF NULLIF(@EnvironmentUserKey, N'') IS NULL OR @AfterSessionID IS NULL OR @AfterSessionID < 0
        OR @NumRows IS NULL OR @NumRows NOT BETWEEN 1 AND 200
        THROW 50000, 'A User key and bounded cursor are required.', 1;
    SELECT TOP (@NumRows)
        SessionID, SessionKey, AgentName, ProjectName, ProjectFilePath, Provider, ModelName,
        ReasoningLevel, PromptContext, DateCreated, LastUpdated, Data, SessionName, ParentSessionID,
        IsArchived, State, SessionKind, Transport, ActiveTurnKey, CurrentTurnStartedUtc,
        LastRunPulseUtc, LastNonRunningUtc, EvaluateAdmissionToken, CompactionProvider, NeedsAttention
    FROM dbo.Sessions
    WHERE EnvironmentUserKey = @EnvironmentUserKey COLLATE Latin1_General_100_BIN2
      AND SessionID > @AfterSessionID
    ORDER BY SessionID;
END;
GO
