CREATE OR ALTER PROCEDURE [dbo].[CopyMessageSp] @MessageID int
AS
BEGIN
 SET NOCOUNT ON;
 DECLARE @SessionID int,@SequenceNumber int,@Role nvarchar(255),@Content nvarchar(max),@ToolName nvarchar(255),@ToolArguments nvarchar(max),@CallID nvarchar(255),@Data nvarchar(max),@IsCompacted bit,@CompactionEpoch int,@MessageKey nvarchar(255),@TurnID nvarchar(255),@CompactionEpochKey nvarchar(255),@MessageKind nvarchar(255),@TerminalOutcomeState nvarchar(255),@SavedWorkResume bit;
 SELECT @SessionID=SessionID,@SequenceNumber=SequenceNumber,@Role=Role,@Content=Content,@ToolName=ToolName,@ToolArguments=ToolArguments,@CallID=CallID,@Data=Data,@IsCompacted=IsCompacted,@CompactionEpoch=CompactionEpoch,@MessageKey=MessageKey+N' - Copy',@TurnID=TurnID,@CompactionEpochKey=CompactionEpochKey,@MessageKind=MessageKind,@TerminalOutcomeState=TerminalOutcomeState,@SavedWorkResume=SavedWorkResume FROM dbo.Messages WHERE MessageID=@MessageID;
 IF @SessionID IS NULL BEGIN SELECT CONVERT(int,NULL) AS MessageID; RETURN; END;
 -- One authoritative insert owns chronology, turn identity and scalar anchor maintenance.
 EXEC dbo.InsertMessageSp @SessionID,@SequenceNumber,@Role,@Content,@ToolName,@ToolArguments,@CallID,@Data,@IsCompacted,@CompactionEpoch,@MessageKey,@TurnID,@CompactionEpochKey,@MessageKind,@TerminalOutcomeState,@SavedWorkResume;
END
GO
