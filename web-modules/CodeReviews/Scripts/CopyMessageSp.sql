CREATE OR ALTER PROCEDURE [dbo].[CopyMessageSp] @MessageID int
AS
BEGIN
	SET NOCOUNT ON;
	-- Keep Copy, but never manufacture another message in an execution turn.
	INSERT dbo.Messages(SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,DateCreated,LastUpdated,Data,IsCompacted,CompactionEpoch,MessageKey,TurnID,TurnRowID,CompactionEpochKey,MessageKind,TerminalOutcomeState,SavedWorkResume)
	SELECT SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,GETDATE(),GETDATE(),Data,IsCompacted,CompactionEpoch,MessageKey+N' - Copy',TurnID,NULL,CompactionEpochKey,MessageKind,TerminalOutcomeState,SavedWorkResume
	FROM dbo.Messages
	WHERE MessageID=@MessageID AND Role=N'Lifecycle' AND (TurnID IS NULL OR DATALENGTH(TurnID)=0) AND TurnRowID IS NULL
	  AND TerminalOutcomeState IS NULL AND SavedWorkResume IS NULL;
	IF @@ROWCOUNT=0
	BEGIN
		IF EXISTS(SELECT 1 FROM dbo.Messages WHERE MessageID=@MessageID)
			THROW 51443,'Only a turnless Lifecycle message without execution outcome can be copied.',1;
		SELECT CONVERT(int,NULL) AS MessageID;
		RETURN;
	END
	SELECT CONVERT(int,SCOPE_IDENTITY()) AS MessageID;
END
GO
