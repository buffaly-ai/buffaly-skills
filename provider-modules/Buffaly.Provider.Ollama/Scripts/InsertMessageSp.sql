SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[InsertMessageSp]
	@SessionID int,@SequenceNumber int,@Role nvarchar(255),@Content nvarchar(max),@ToolName nvarchar(255),@ToolArguments nvarchar(max),@CallID nvarchar(255),@Data nvarchar(max),@IsCompacted bit,@CompactionEpoch int,@MessageKey nvarchar(255),@TurnID nvarchar(255),@CompactionEpochKey nvarchar(255),@DateCreated datetime=NULL
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;
	DECLARE @TurnRowID bigint=NULL,@MessageID int,@OwnTransaction bit=CASE WHEN @@TRANCOUNT=0 THEN 1 ELSE 0 END;
	DECLARE @OccurredAt datetime2(7)=COALESCE(@DateCreated,GETDATE());
	BEGIN TRY
		IF @OwnTransaction=1 BEGIN TRANSACTION;
		IF NULLIF(@TurnID,N'') IS NOT NULL
		BEGIN
			SELECT @TurnRowID=TurnID FROM dbo.Turns WHERE SessionID=@SessionID AND TurnKey=@TurnID;
			IF @TurnRowID IS NULL
			BEGIN
				-- A unique-key race is expected during concurrent first messages. Do not add lock hints or swallow other failures.
				SET XACT_ABORT OFF;
				BEGIN TRY
					INSERT dbo.Turns(SessionID,TurnKey,DisplayOrderAtUtc) VALUES(@SessionID,@TurnID,@OccurredAt);
					SET @TurnRowID=CONVERT(bigint,SCOPE_IDENTITY());
				END TRY
				BEGIN CATCH
					IF ERROR_NUMBER() NOT IN(2601,2627) OR ERROR_MESSAGE() NOT LIKE N'%UQ_Turns_SessionKey%' THROW;
					SELECT @TurnRowID=TurnID FROM dbo.Turns WHERE SessionID=@SessionID AND TurnKey=@TurnID;
					IF @TurnRowID IS NULL THROW;
				END CATCH
				SET XACT_ABORT ON;
			END
		END
		INSERT dbo.Messages(SessionID,SequenceNumber,Role,Content,ToolName,ToolArguments,CallID,DateCreated,LastUpdated,Data,IsCompacted,CompactionEpoch,MessageKey,TurnID,TurnRowID,CompactionEpochKey)
		VALUES(@SessionID,@SequenceNumber,@Role,@Content,@ToolName,@ToolArguments,@CallID,@OccurredAt,GETDATE(),@Data,@IsCompacted,@CompactionEpoch,@MessageKey,@TurnID,@TurnRowID,@CompactionEpochKey);
		SET @MessageID=CONVERT(int,SCOPE_IDENTITY());
		IF @TurnRowID IS NOT NULL
		BEGIN
			DECLARE @IsError bit=CASE WHEN @Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.TerminalOutcome.State'))=N'failed') OR (JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.Name'),N''))=N'error' OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.Phase'),N''))=N'error'))) THEN 1 ELSE 0 END;
			DECLARE @IsTerminal bit=CASE WHEN @Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.TerminalOutcome.State')) IN(N'completed',N'failed',N'cancelled')) OR (JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.Name'),N'')) IN(N'error',N'turncomplete',N'turncompleted') OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(@Data)=1 THEN @Data ELSE N'{}' END,'$.Phase'),N'')) IN(N'error',N'turncomplete',N'turncompleted')))) THEN 1 ELSE 0 END;
			UPDATE t SET
				FirstMessageID=COALESCE(t.FirstMessageID,@MessageID),
				UserMessageID=CASE WHEN @Role=N'User' THEN COALESCE(t.UserMessageID,@MessageID) ELSE t.UserMessageID END,
				AssistantMessageID=CASE WHEN @Role=N'Assistant' THEN @MessageID ELSE t.AssistantMessageID END,
				LastErrorMessageID=CASE WHEN @IsError=1 THEN @MessageID ELSE t.LastErrorMessageID END,
				TerminalMessageID=CASE WHEN @IsTerminal=1 THEN @MessageID ELSE t.TerminalMessageID END,
				DisplayOrderAtUtc=CASE
					WHEN @Role=N'User' AND t.UserMessageID IS NULL THEN @OccurredAt
					WHEN @Role<>N'User' AND t.UserMessageID IS NULL AND t.FirstMessageID IS NULL THEN @OccurredAt
					ELSE t.DisplayOrderAtUtc END
			FROM dbo.Turns t
			WHERE t.TurnID=@TurnRowID;
		END
		IF @OwnTransaction=1 COMMIT;
	END TRY
	BEGIN CATCH
		IF @OwnTransaction=1 AND XACT_STATE()<>0 ROLLBACK;
		THROW;
	END CATCH
	SELECT @MessageID AS MessageID;
END
GO
