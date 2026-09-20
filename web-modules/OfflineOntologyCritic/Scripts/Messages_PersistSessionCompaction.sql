CREATE OR ALTER PROCEDURE dbo.Messages_PersistSessionCompaction
	@SessionID int,@TargetEpoch int,@TargetEpochKey nvarchar(255),@SessionData nvarchar(max),@RetainedMessagesJson nvarchar(max),@InsertedMessagesJson nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON; SET XACT_ABORT ON;
	IF @SessionID<=0 OR @TargetEpoch<0 OR NULLIF(@TargetEpochKey,N'') IS NULL OR @SessionData IS NULL OR ISJSON(@SessionData)<>1 OR ISJSON(@RetainedMessagesJson)<>1 OR ISJSON(@InsertedMessagesJson)<>1 THROW 51420,'Invalid session compaction request.',1;
	DECLARE @Moved int=0,@Inserted int=0,@Now datetime2(7)=SYSUTCDATETIME(),@NextSequence int;
	DECLARE @Retained TABLE(MessageKey nvarchar(255) NOT NULL,SourceEpoch int NULL,SourceEpochKey nvarchar(255) NULL);
	DECLARE @New TABLE(MessageKey nvarchar(255) NOT NULL,TurnKey nvarchar(255) NULL,Role nvarchar(255) NOT NULL,Content nvarchar(max) NULL,ToolName nvarchar(255) NULL,ToolArguments nvarchar(max) NULL,CallID nvarchar(255) NULL,DateCreatedUtc datetime2(7) NOT NULL,Data nvarchar(max) NULL,IsCompacted bit NOT NULL,Ordinal int NOT NULL);
	INSERT @Retained SELECT MessageKey,SourceEpoch,SourceEpochKey FROM OPENJSON(@RetainedMessagesJson) WITH(MessageKey nvarchar(255),SourceEpoch int,SourceEpochKey nvarchar(255));
	INSERT @New SELECT j.MessageKey,j.TurnKey,j.Role,j.Content,j.ToolName,j.ToolArguments,j.CallID,j.DateCreatedUtc,j.Data,j.IsCompacted,CONVERT(int,o.[key]) FROM OPENJSON(@InsertedMessagesJson)o CROSS APPLY OPENJSON(o.value) WITH(MessageKey nvarchar(255),TurnKey nvarchar(255),Role nvarchar(255),Content nvarchar(max),ToolName nvarchar(255),ToolArguments nvarchar(max),CallID nvarchar(255),DateCreatedUtc datetime2(7),Data nvarchar(max),IsCompacted bit)j;
	IF EXISTS(SELECT 1 FROM @Retained WHERE NULLIF(MessageKey,N'') IS NULL) OR EXISTS(SELECT 1 FROM @New WHERE NULLIF(MessageKey,N'') IS NULL OR NULLIF(Role,N'') IS NULL) THROW 51421,'Invalid compaction message contract.',1;
	BEGIN TRANSACTION;
	BEGIN TRY
		IF NOT EXISTS(SELECT 1 FROM dbo.Sessions WHERE SessionID=@SessionID) THROW 51422,'Session does not exist.',1;
		-- UNKNOWN is a mismatch, not permission to move a retained message.
		IF EXISTS(SELECT 1 FROM @Retained r LEFT JOIN dbo.Messages m ON m.SessionID=@SessionID AND m.MessageKey=r.MessageKey WHERE m.MessageID IS NULL OR CASE WHEN (((m.CompactionEpoch=r.SourceEpoch OR(m.CompactionEpoch IS NULL AND r.SourceEpoch IS NULL))AND(m.CompactionEpochKey=r.SourceEpochKey OR(m.CompactionEpochKey IS NULL AND r.SourceEpochKey IS NULL)))OR(m.CompactionEpoch=@TargetEpoch AND m.CompactionEpochKey=@TargetEpochKey)) THEN 1 ELSE 0 END=0) THROW 51423,'Retained message source conflict.',1;
		UPDATE m SET CompactionEpoch=@TargetEpoch,CompactionEpochKey=@TargetEpochKey FROM dbo.Messages m JOIN @Retained r ON m.SessionID=@SessionID AND m.MessageKey=r.MessageKey WHERE m.CompactionEpoch<>@TargetEpoch OR m.CompactionEpoch IS NULL OR m.CompactionEpochKey<>@TargetEpochKey OR m.CompactionEpochKey IS NULL; SET @Moved=@@ROWCOUNT;
		IF EXISTS(SELECT 1 FROM @New n JOIN dbo.Messages m ON m.SessionID=@SessionID AND m.MessageKey=n.MessageKey WHERE CASE WHEN (m.CompactionEpoch=@TargetEpoch AND m.CompactionEpochKey=@TargetEpochKey AND (m.TurnID=n.TurnKey OR(m.TurnID IS NULL AND n.TurnKey IS NULL)) AND m.Role=n.Role AND ISNULL(m.Content,N'')=ISNULL(n.Content,N'')) THEN 1 ELSE 0 END=0) THROW 51424,'Inserted compaction message replay conflict.',1;
		SELECT @NextSequence=ISNULL(MAX(SequenceNumber),0) FROM dbo.Messages WHERE SessionID=@SessionID;
		DECLARE @MessageKey nvarchar(255),@TurnKey nvarchar(255),@Role nvarchar(255),@Content nvarchar(max),@ToolName nvarchar(255),@ToolArguments nvarchar(max),@CallID nvarchar(255),@DateCreatedUtc datetime2(7),@Data nvarchar(max),@IsCompacted bit,@Ordinal int;
		DECLARE rows_to_insert CURSOR LOCAL FAST_FORWARD FOR SELECT MessageKey,TurnKey,Role,Content,ToolName,ToolArguments,CallID,DateCreatedUtc,Data,IsCompacted,Ordinal FROM @New n WHERE NOT EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.MessageKey=n.MessageKey) ORDER BY Ordinal;
		OPEN rows_to_insert; FETCH NEXT FROM rows_to_insert INTO @MessageKey,@TurnKey,@Role,@Content,@ToolName,@ToolArguments,@CallID,@DateCreatedUtc,@Data,@IsCompacted,@Ordinal;
		WHILE @@FETCH_STATUS=0
		BEGIN
			DECLARE @Result TABLE(MessageID int);
			DECLARE @SequenceNumber int=@NextSequence+@Ordinal+1;
			INSERT @Result EXEC dbo.InsertMessageSp @SessionID,@SequenceNumber,@Role,@Content,@ToolName,@ToolArguments,@CallID,@Data,@IsCompacted,@TargetEpoch,@MessageKey,@TurnKey,@TargetEpochKey,@DateCreatedUtc;
			SET @Inserted+=1;
			FETCH NEXT FROM rows_to_insert INTO @MessageKey,@TurnKey,@Role,@Content,@ToolName,@ToolArguments,@CallID,@DateCreatedUtc,@Data,@IsCompacted,@Ordinal;
		END
		CLOSE rows_to_insert; DEALLOCATE rows_to_insert;
		UPDATE dbo.Sessions SET Data=@SessionData,LastUpdated=@Now WHERE SessionID=@SessionID;
		COMMIT;
		SELECT @Moved AS MovedRows,@Inserted AS InsertedRows;
	END TRY
	BEGIN CATCH
		IF CURSOR_STATUS('local','rows_to_insert')>=-1 BEGIN TRY CLOSE rows_to_insert; DEALLOCATE rows_to_insert; END TRY BEGIN CATCH END CATCH;
		IF XACT_STATE()<>0 ROLLBACK;
		THROW;
	END CATCH
END
GO
