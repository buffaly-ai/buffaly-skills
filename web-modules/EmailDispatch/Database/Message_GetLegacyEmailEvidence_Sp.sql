-- Email Dispatch owns the distinction between legacy handling and its own read-only Hold research.
-- This is an additive read in buffaly_sessions; core message search remains generic and unchanged.
CREATE OR ALTER PROCEDURE dbo.Message_GetLegacyEmailEvidence_Sp
    @SessionKey nvarchar(255), @Text nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON;
    IF @SessionKey NOT IN (N'Email Dispatcher', N'Scheduled-Alarms', N'OpenAi Scheduled') OR NULLIF(@Text, N'') IS NULL
        THROW 51000, 'A verified legacy email owner and source identity are required.', 1;
    SELECT TOP (1) m.MessageID, s.SessionKey, m.MessageKey, m.Role, m.DateCreated
    FROM dbo.Sessions s
    JOIN dbo.Messages m ON m.SessionID = s.SessionID
    WHERE s.SessionKey = @SessionKey
      AND (CHARINDEX(@Text, m.Content) > 0 OR CHARINDEX(@Text, m.ToolArguments) > 0)
      -- Hold inputs and every message from the same Hold turn are research, never handling receipts.
      -- Apply this exclusion BEFORE TOP, so a later genuine legacy occurrence still blocks delivery.
      AND NOT (s.SessionKey = N'Email Dispatcher' AND
          ((m.MessageKey IS NOT NULL AND LEFT(m.MessageKey, 11) = N'email-hold-') OR EXISTS (
              SELECT 1 FROM dbo.Messages holdInput
              WHERE holdInput.SessionID = m.SessionID AND holdInput.TurnID = m.TurnID
                AND LEFT(holdInput.MessageKey, 11) = N'email-hold-'
          )))
    ORDER BY m.MessageID;
END;
GO
