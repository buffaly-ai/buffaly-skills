CREATE OR ALTER PROCEDURE [dbo].[CopyMessageSp]
	@MessageID int
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;
	DECLARE @NewMessageID int;
	DECLARE @TurnRowID bigint;
	DECLARE @SessionID int;
	DECLARE @TurnKey nvarchar(255);
	DECLARE @OccurredAt datetime2(7)=GETDATE();

	DECLARE @OwnTransaction bit=CASE WHEN @@TRANCOUNT=0 THEN 1 ELSE 0 END;
	BEGIN TRY
	IF @OwnTransaction=1 BEGIN TRANSACTION;
	SELECT @SessionID=SessionID,@TurnKey=TurnID,@TurnRowID=TurnRowID FROM dbo.Messages WHERE MessageID=@MessageID;
	-- Preserve the legacy missing-source NULL result. A numeric link is provider-local
	-- cache data, so always resolve it from the source's logical session/key.
	IF @SessionID IS NULL
	BEGIN
		IF @OwnTransaction=1 COMMIT;
		SELECT CONVERT(int,NULL) AS MessageID;
		RETURN;
	END
	SET @TurnRowID=NULL;
	IF NULLIF(@TurnKey,N'') IS NOT NULL
	BEGIN
		SELECT @TurnRowID=TurnID FROM dbo.Turns WHERE SessionID=@SessionID AND TurnKey=@TurnKey;
		IF @TurnRowID IS NULL
		BEGIN
			SET XACT_ABORT OFF;
			BEGIN TRY
				INSERT dbo.Turns(SessionID,TurnKey,DisplayOrderAtUtc) VALUES(@SessionID,@TurnKey,@OccurredAt);
				SET @TurnRowID=CONVERT(bigint,SCOPE_IDENTITY());
			END TRY
			BEGIN CATCH
				IF ERROR_NUMBER() NOT IN(2601,2627) OR ERROR_MESSAGE() NOT LIKE N'%UQ_Turns_SessionKey%' THROW;
				SELECT @TurnRowID=TurnID FROM dbo.Turns WHERE SessionID=@SessionID AND TurnKey=@TurnKey;
				IF @TurnRowID IS NULL THROW;
			END CATCH
			SET XACT_ABORT ON;
		END
	END

	INSERT dbo.Messages(SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,DateCreated,LastUpdated,Data,IsCompacted,CompactionEpoch,MessageKey,TurnID,TurnRowID,CompactionEpochKey)
	SELECT SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,@OccurredAt,GETDATE(),Data,IsCompacted,CompactionEpoch,MessageKey+N' - Copy',TurnID,@TurnRowID,CompactionEpochKey
	FROM dbo.Messages WHERE MessageID=@MessageID;
	SET @NewMessageID=CONVERT(int,SCOPE_IDENTITY());
	IF @TurnRowID IS NOT NULL UPDATE dbo.Turns SET FirstMessageID=COALESCE(FirstMessageID,@NewMessageID) WHERE TurnID=@TurnRowID;
	IF @OwnTransaction=1 COMMIT;
	END TRY
	BEGIN CATCH
		IF @OwnTransaction=1 AND XACT_STATE()<>0 ROLLBACK;
		THROW;
	END CATCH
	SELECT @NewMessageID AS MessageID;
END
GO
