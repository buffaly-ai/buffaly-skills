CREATE OR ALTER PROCEDURE [dbo].[UpdateMessageSp]
	@MessageID int,
	@SessionID int,
	@SequenceNumber int,
	@Role nvarchar(255),
	@Content nvarchar(max),
	@ToolName nvarchar(255),
	@ToolArguments nvarchar(max),
	@CallID nvarchar(255),
	@Data nvarchar(max),
	@IsCompacted bit,
	@CompactionEpoch int,
	@MessageKey nvarchar(255),
	@TurnID nvarchar(255),
	@CompactionEpochKey nvarchar(255),@MessageKind nvarchar(255),@TerminalOutcomeState nvarchar(255),@SavedWorkResume bit
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;
	-- Keep the full method, but never SET identity, ownership, membership or classification.
	UPDATE m SET
		SequenceNumber=@SequenceNumber, Content=@Content,
		ToolName=@ToolName, ToolArguments=@ToolArguments, CallID=@CallID,
		Data=@Data, IsCompacted=@IsCompacted, CompactionEpoch=@CompactionEpoch,
		CompactionEpochKey=@CompactionEpochKey, LastUpdated=GETDATE()
	FROM dbo.Messages m
	WHERE m.MessageID=@MessageID
	  -- NULL-safe byte equality does not equate case changes or trailing spaces.
	  AND NOT EXISTS (
		SELECT m.SessionID,CONVERT(varbinary(max),m.Role),CONVERT(varbinary(max),m.MessageKey),CONVERT(varbinary(max),m.TurnID),
			CONVERT(varbinary(max),m.MessageKind),CONVERT(varbinary(max),m.TerminalOutcomeState),m.SavedWorkResume
		EXCEPT
		SELECT @SessionID,CONVERT(varbinary(max),@Role),CONVERT(varbinary(max),@MessageKey),CONVERT(varbinary(max),@TurnID),
			CONVERT(varbinary(max),@MessageKind),CONVERT(varbinary(max),@TerminalOutcomeState),@SavedWorkResume)
	  -- Execution Lifecycle payload remains immutable; turnless callback status is separate.
	  AND (m.Role<>N'Lifecycle' OR ((m.TurnID IS NULL OR DATALENGTH(m.TurnID)=0) AND m.TurnRowID IS NULL)
		OR NOT EXISTS (SELECT CONVERT(varbinary(max),m.Data) EXCEPT SELECT CONVERT(varbinary(max),@Data)));
	IF @@ROWCOUNT=0 AND EXISTS(SELECT 1 FROM dbo.Messages WHERE MessageID=@MessageID)
		THROW 51440,'Message identity, session, turn, role, classification and linked Lifecycle evidence cannot be changed.',1;
END
GO
