SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.Sessions_GetPendingAttentionNavigation_Sp
-- Omission is the authorized Root inventory, selected only by the typed backend.
@EnvironmentUserKey nvarchar(64) = NULL
AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM dbo.Sessions WHERE (@EnvironmentUserKey IS NULL OR EnvironmentUserKey=@EnvironmentUserKey) AND NeedsAttention=1 AND IsArchived=0 AND NULLIF(LastNonRunningUtc,N'') IS NULL)
  THROW 51000,'Pending attention requires a stop stamp.',1;
 SELECT s.SessionID,s.SessionKey,s.SessionName,s.AgentName,s.SessionKind,
  JSON_QUERY(s.Data,'$.Specialization') AS Specialization,s.NeedsAttention,s.LastNonRunningUtc AS StopStamp,
  CASE WHEN t.TurnKey IS NOT NULL AND t.TurnKey<>N'' AND t.TerminalMessageID IS NULL AND s.State NOT IN(N'Running',N'Unknown') THEN N'Interrupted'
   ELSE CASE m.TerminalOutcomeState WHEN N'Failed' THEN N'Errors' WHEN N'Completed' THEN CASE WHEN m.SavedWorkResume=1 THEN N'Resumed' ELSE N'Completed' END ELSE N'' END END AS AttentionGroup,
  CONVERT(bit,CASE WHEN JSON_VALUE(s.Data,'$.SidebarProfile.ShowInNextUpdate')=N'false' THEN 0 ELSE 1 END) AS ShowInNextUpdate
 FROM dbo.Sessions s
 OUTER APPLY(SELECT TOP(1) TurnKey,TerminalMessageID FROM dbo.Turns WHERE SessionID=s.SessionID ORDER BY DisplayOrderAtUtc DESC,FirstMessageID DESC)t
 LEFT JOIN dbo.Messages m ON m.MessageID=t.TerminalMessageID AND m.TerminalOutcomeState IS NOT NULL
 WHERE (@EnvironmentUserKey IS NULL OR s.EnvironmentUserKey=@EnvironmentUserKey) AND s.NeedsAttention=1 AND s.IsArchived=0
 ORDER BY CONVERT(datetimeoffset(7),s.LastNonRunningUtc),s.SessionID;
END
GO
