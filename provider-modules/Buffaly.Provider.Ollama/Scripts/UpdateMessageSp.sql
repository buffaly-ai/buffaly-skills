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
	@CompactionEpochKey nvarchar(255)
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;
	DECLARE @TurnRowID bigint = NULL;
	DECLARE @OccurredAt datetime2(7);
	SELECT @OccurredAt = DateCreated FROM dbo.Messages WHERE MessageID = @MessageID;
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
		MessageKey=@MessageKey, TurnID=@TurnID, TurnRowID=@TurnRowID, CompactionEpochKey=@CompactionEpochKey
	WHERE MessageID=@MessageID;

	IF @TurnRowID IS NOT NULL
	BEGIN
		UPDATE dbo.Turns SET
			FirstMessageID=COALESCE(FirstMessageID,@MessageID),
			UserMessageID=CASE WHEN @Role=N'User' AND UserMessageID IS NULL THEN @MessageID ELSE UserMessageID END,
			AssistantMessageID=CASE WHEN @Role=N'Assistant' THEN @MessageID ELSE AssistantMessageID END,
			DisplayOrderAtUtc=CASE WHEN @Role=N'User' AND UserMessageID IS NULL THEN @OccurredAt ELSE DisplayOrderAtUtc END
		WHERE TurnID=@TurnRowID;
	END
	IF @OwnTransaction=1 COMMIT;
	END TRY
	BEGIN CATCH
		IF @OwnTransaction=1 AND XACT_STATE()<>0 ROLLBACK;
		THROW;
	END CATCH
END
GO
