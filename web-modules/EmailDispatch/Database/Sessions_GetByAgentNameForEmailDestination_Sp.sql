-- Email Dispatch-owned additive read in buffaly_sessions. No core procedures or session rows are modified.
CREATE OR ALTER PROCEDURE dbo.Sessions_GetByAgentNameForEmailDestination_Sp
    @Search nvarchar(255),
    @AgentName nvarchar(255),
    @ExcludedSessionKey nvarchar(255),
    @SkipRows int,
    @NumRows int
AS
BEGIN
    SET NOCOUNT ON;
    IF @Search IS NULL OR @AgentName IS NULL OR @ExcludedSessionKey IS NULL OR @SkipRows < 0 OR @NumRows < 1 OR @NumRows > 51
        THROW 50001, 'Invalid destination-session page.', 1;
    DECLARE @SearchPattern nvarchar(257) = N'%' + @Search + N'%';
    SELECT s.SessionKey, s.SessionName, s.PromptContext, s.LastUpdated
    FROM dbo.Sessions s
    WHERE s.AgentName = @AgentName
      AND s.IsArchived = 0
      AND s.SessionKey <> @ExcludedSessionKey
      AND (s.SessionKey LIKE @SearchPattern OR s.SessionName LIKE @SearchPattern)
    ORDER BY s.LastUpdated DESC, s.SessionID DESC
    OFFSET @SkipRows ROWS FETCH NEXT @NumRows ROWS ONLY;
END
GO
