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
	DECLARE @TurnRowID bigint = NULL, @PreviousTurnRowID bigint;
	DECLARE @OccurredAt datetime2(7);
	SELECT @OccurredAt = DateCreated, @PreviousTurnRowID = TurnRowID FROM dbo.Messages WHERE MessageID = @MessageID;
	IF @OccurredAt IS NULL RETURN;

	DECLARE @OwnTransaction bit=CASE WHEN @@TRANCOUNT=0 THEN 1 ELSE 0 END;
	BEGIN TRY
	IF @OwnTransaction=1 BEGIN TRANSACTION;
	IF NULLIF(@TurnID, N'') IS NOT NULL
	BEGIN
		SELECT @TurnRowID = TurnID FROM dbo.Turns WHERE SessionID = @SessionID AND TurnKey = @TurnID;
		IF @TurnRowID IS NULL
		BEGIN
			SET XACT_ABORT OFF;
			BEGIN TRY
				INSERT dbo.Turns(SessionID, TurnKey, DisplayOrderAtUtc) VALUES(@SessionID, @TurnID, @OccurredAt);
				SET @TurnRowID = CONVERT(bigint, SCOPE_IDENTITY());
			END TRY
			BEGIN CATCH
				IF ERROR_NUMBER() NOT IN(2601,2627) OR ERROR_MESSAGE() NOT LIKE N'%UQ_Turns_SessionKey%' THROW;
				SELECT @TurnRowID=TurnID FROM dbo.Turns WHERE SessionID=@SessionID AND TurnKey=@TurnID;
				IF @TurnRowID IS NULL THROW;
			END CATCH
			SET XACT_ABORT ON;
		END
	END

	UPDATE dbo.Messages SET
		SessionID=@SessionID, SequenceNumber=@SequenceNumber, Role=@Role, Content=@Content,
		ToolName=@ToolName, ToolArguments=@ToolArguments, CallID=@CallID, LastUpdated=GETDATE(),
		Data=@Data, IsCompacted=@IsCompacted, CompactionEpoch=@CompactionEpoch,
		MessageKey=@MessageKey, TurnID=@TurnID, TurnRowID=@TurnRowID, CompactionEpochKey=@CompactionEpochKey,MessageKind=@MessageKind,TerminalOutcomeState=@TerminalOutcomeState,SavedWorkResume=@SavedWorkResume
	WHERE MessageID=@MessageID;

	-- Broad message edits can move/remove a former anchor; recompute only the affected physical turns.
	UPDATE t SET FirstMessageID=f.MessageID,UserMessageID=u.MessageID,AssistantMessageID=a.MessageID,
	 LastErrorMessageID=e.MessageID,TerminalMessageID=z.MessageID,DisplayOrderAtUtc=COALESCE(u.DateCreated,f.DateCreated,t.DisplayOrderAtUtc)
	FROM dbo.Turns t
	OUTER APPLY(SELECT TOP(1) MessageID,DateCreated FROM dbo.Messages WHERE TurnRowID=t.TurnID ORDER BY DateCreated,MessageID)f
	OUTER APPLY(SELECT TOP(1) MessageID,DateCreated FROM dbo.Messages WHERE TurnRowID=t.TurnID AND Role=N'User' ORDER BY DateCreated,MessageID)u
	OUTER APPLY(SELECT TOP(1) MessageID FROM dbo.Messages WHERE TurnRowID=t.TurnID AND Role=N'Assistant' ORDER BY DateCreated DESC,MessageID DESC)a
	OUTER APPLY(SELECT TOP(1) MessageID FROM dbo.Messages WHERE TurnRowID=t.TurnID AND Role=N'Lifecycle' AND(MessageKind=N'Error' OR TerminalOutcomeState=N'Failed') ORDER BY DateCreated DESC,MessageID DESC)e
	OUTER APPLY(SELECT TOP(1) MessageID FROM dbo.Messages WHERE TurnRowID=t.TurnID AND Role=N'Lifecycle' AND TerminalOutcomeState IN(N'Completed',N'Failed',N'Cancelled') ORDER BY DateCreated DESC,MessageID DESC)z
	WHERE t.TurnID IN(@PreviousTurnRowID,@TurnRowID);
	IF @OwnTransaction=1 COMMIT;
	END TRY
	BEGIN CATCH
		IF @OwnTransaction=1 AND XACT_STATE()<>0 ROLLBACK;
		THROW;
	END CATCH
END
GO
