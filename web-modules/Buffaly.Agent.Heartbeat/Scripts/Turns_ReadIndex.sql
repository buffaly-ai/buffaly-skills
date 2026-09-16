CREATE OR ALTER PROCEDURE dbo.Turns_PopulateUnlinked
	@SessionID int,
	@MaxMessages int,
	@LockTimeoutMilliseconds int=250
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;
	IF @SessionID<=0 OR @MaxMessages<1 OR @MaxMessages>1000 OR @LockTimeoutMilliseconds<1 OR @LockTimeoutMilliseconds>30000 THROW 51092,'Invalid Turns populate bounds.',1;
	-- SET LOCK_TIMEOUT requires a literal and a dynamic SET is scoped away when sp_executesql returns.
	IF @LockTimeoutMilliseconds<10 SET LOCK_TIMEOUT 1 ELSE IF @LockTimeoutMilliseconds<25 SET LOCK_TIMEOUT 10 ELSE IF @LockTimeoutMilliseconds<50 SET LOCK_TIMEOUT 25 ELSE IF @LockTimeoutMilliseconds<100 SET LOCK_TIMEOUT 50 ELSE IF @LockTimeoutMilliseconds<250 SET LOCK_TIMEOUT 100 ELSE IF @LockTimeoutMilliseconds<500 SET LOCK_TIMEOUT 250 ELSE IF @LockTimeoutMilliseconds<1000 SET LOCK_TIMEOUT 500 ELSE IF @LockTimeoutMilliseconds<2000 SET LOCK_TIMEOUT 1000 ELSE IF @LockTimeoutMilliseconds<5000 SET LOCK_TIMEOUT 2000 ELSE IF @LockTimeoutMilliseconds<10000 SET LOCK_TIMEOUT 5000 ELSE IF @LockTimeoutMilliseconds<30000 SET LOCK_TIMEOUT 10000 ELSE SET LOCK_TIMEOUT 30000;
	CREATE TABLE #Populate(MessageID int NOT NULL PRIMARY KEY,TurnKey nvarchar(255) NOT NULL);
	INSERT #Populate(MessageID,TurnKey)
	SELECT TOP (@MaxMessages) MessageID,TurnID FROM dbo.Messages
	WHERE SessionID=@SessionID AND TurnRowID IS NULL AND TurnID IS NOT NULL AND TurnID<>N'' ORDER BY MessageID;
	IF EXISTS(SELECT 1 FROM #Populate)
	BEGIN
		DECLARE @Attempt int=0,@Retry bit=1,@OwnTransaction bit=CASE WHEN @@TRANCOUNT=0 THEN 1 ELSE 0 END;
		WHILE @Retry=1
		BEGIN
			SET @Attempt+=1; SET @Retry=0;
			BEGIN TRY
				IF @OwnTransaction=1 BEGIN TRANSACTION; ELSE SAVE TRANSACTION TurnsPopulateUnlinked;
				INSERT dbo.Turns(SessionID,TurnKey,DisplayOrderAtUtc)
				SELECT @SessionID,p.TurnKey,MIN(m.DateCreated)
				FROM (SELECT DISTINCT TurnKey FROM #Populate) p JOIN dbo.Messages m ON m.SessionID=@SessionID AND m.TurnID=p.TurnKey
				WHERE NOT EXISTS(SELECT 1 FROM dbo.Turns t WHERE t.SessionID=@SessionID AND t.TurnKey=p.TurnKey) GROUP BY p.TurnKey;
				UPDATE m SET TurnRowID=t.TurnID FROM dbo.Messages m JOIN #Populate p ON p.MessageID=m.MessageID AND p.TurnKey=m.TurnID JOIN dbo.Turns t ON t.SessionID=m.SessionID AND t.TurnKey=m.TurnID
				WHERE m.SessionID=@SessionID AND m.TurnRowID IS NULL;
				UPDATE t SET DisplayOrderAtUtc=COALESCE(u.DateCreated,f.DateCreated),FirstMessageID=f.MessageID,UserMessageID=u.MessageID,AssistantMessageID=a.MessageID,LastErrorMessageID=e.MessageID,TerminalMessageID=z.MessageID
				FROM dbo.Turns t JOIN (SELECT DISTINCT TurnKey FROM #Populate) p ON p.TurnKey=t.TurnKey
				OUTER APPLY (SELECT TOP (1) m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=p.TurnKey ORDER BY m.DateCreated,m.MessageID) f
				OUTER APPLY (SELECT TOP (1) m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=p.TurnKey AND m.Role=N'User' ORDER BY m.DateCreated,m.MessageID) u
				OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=p.TurnKey AND m.Role=N'Assistant' ORDER BY m.DateCreated DESC,m.MessageID DESC) a
				OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=p.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State'))=N'failed') OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N''))=N'error' OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N''))=N'error'))) ORDER BY m.DateCreated DESC,m.MessageID DESC) e
				OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=p.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State')) IN(N'completed',N'failed',N'cancelled')) OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N'')) IN(N'error',N'turncomplete',N'turncompleted') OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N'')) IN(N'error',N'turncomplete',N'turncompleted')))) ORDER BY m.DateCreated DESC,m.MessageID DESC) z
				WHERE t.SessionID=@SessionID;
				IF @OwnTransaction=1 COMMIT;
			END TRY
			BEGIN CATCH
				IF @OwnTransaction=1 AND XACT_STATE()<>0 ROLLBACK;
				ELSE IF @OwnTransaction=0 AND XACT_STATE()=1 ROLLBACK TRANSACTION TurnsPopulateUnlinked;
				IF ERROR_NUMBER() IN(2601,2627) AND ERROR_MESSAGE() LIKE N'%UQ_Turns_SessionKey%' AND @Attempt<3 SET @Retry=1; ELSE THROW;
			END CATCH
		END
	END
	SELECT (SELECT COUNT(*) FROM #Populate) AS ProcessedMessages,CAST(CASE WHEN EXISTS(SELECT 1 FROM dbo.Messages WHERE SessionID=@SessionID AND TurnRowID IS NULL AND TurnID IS NOT NULL AND TurnID<>N'') THEN 1 ELSE 0 END AS bit) AS HasMore;
END
GO

CREATE OR ALTER PROCEDURE dbo.Turns_MaintainIndex
 @SessionID int,@TurnKeysJson nvarchar(max),@MaxUnlinkedMessages int,@LockTimeoutMilliseconds int
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @SessionID<=0 OR ISJSON(@TurnKeysJson)<>1 OR @MaxUnlinkedMessages<0 OR @MaxUnlinkedMessages>1000 OR @LockTimeoutMilliseconds<1 OR @LockTimeoutMilliseconds>30000 THROW 51092,'Invalid Turns maintenance bounds.',1;
 IF @LockTimeoutMilliseconds<10 SET LOCK_TIMEOUT 1 ELSE IF @LockTimeoutMilliseconds<25 SET LOCK_TIMEOUT 10 ELSE IF @LockTimeoutMilliseconds<50 SET LOCK_TIMEOUT 25 ELSE IF @LockTimeoutMilliseconds<100 SET LOCK_TIMEOUT 50 ELSE IF @LockTimeoutMilliseconds<250 SET LOCK_TIMEOUT 100 ELSE IF @LockTimeoutMilliseconds<500 SET LOCK_TIMEOUT 250 ELSE IF @LockTimeoutMilliseconds<1000 SET LOCK_TIMEOUT 500 ELSE IF @LockTimeoutMilliseconds<2000 SET LOCK_TIMEOUT 1000 ELSE IF @LockTimeoutMilliseconds<5000 SET LOCK_TIMEOUT 2000 ELSE IF @LockTimeoutMilliseconds<10000 SET LOCK_TIMEOUT 5000 ELSE IF @LockTimeoutMilliseconds<30000 SET LOCK_TIMEOUT 10000 ELSE SET LOCK_TIMEOUT 30000;
 DECLARE @Processed int=0,@HasMore bit=0,@Repaired int=0;
 IF DATABASEPROPERTYEX(DB_NAME(),N'Updateability')<>N'READ_WRITE'
    OR HAS_PERMS_BY_NAME(N'dbo.Messages',N'OBJECT',N'UPDATE')<>1
    OR HAS_PERMS_BY_NAME(N'dbo.Turns',N'OBJECT',N'INSERT')<>1
    OR HAS_PERMS_BY_NAME(N'dbo.Turns',N'OBJECT',N'UPDATE')<>1
    OR HAS_PERMS_BY_NAME(N'dbo.Turns',N'OBJECT',N'DELETE')<>1
 BEGIN
  SET @HasMore=CASE WHEN EXISTS(SELECT 1 FROM dbo.Messages WHERE SessionID=@SessionID AND TurnRowID IS NULL AND TurnID IS NOT NULL AND TurnID<>N'')THEN 1 ELSE 0 END;
  SELECT @Processed ProcessedMessages,@Repaired RepairedTurns,@HasMore HasMoreUnlinked;
  RETURN;
 END
 IF @MaxUnlinkedMessages>0 BEGIN DECLARE @P TABLE(ProcessedMessages int,HasMore bit);INSERT @P EXEC dbo.Turns_PopulateUnlinked @SessionID,@MaxUnlinkedMessages,@LockTimeoutMilliseconds;SELECT @Processed=ProcessedMessages,@HasMore=HasMore FROM @P;END
 ELSE SET @HasMore=CASE WHEN EXISTS(SELECT 1 FROM dbo.Messages WHERE SessionID=@SessionID AND TurnRowID IS NULL AND TurnID IS NOT NULL AND TurnID<>N'')THEN 1 ELSE 0 END;
 CREATE TABLE #Keys(TurnKey nvarchar(255) NOT NULL PRIMARY KEY);INSERT #Keys SELECT DISTINCT CONVERT(nvarchar(255),[value]) FROM OPENJSON(@TurnKeysJson) WHERE [type]=1 AND NULLIF(CONVERT(nvarchar(255),[value]),N'') IS NOT NULL;
 IF(SELECT COUNT(*)FROM #Keys)>200 THROW 51092,'Too many Turns maintenance keys.',1;
 BEGIN TRY
  BEGIN TRANSACTION;
  DELETE t FROM dbo.Turns t JOIN #Keys k ON k.TurnKey=t.TurnKey WHERE t.SessionID=@SessionID AND NOT EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey);
  UPDATE t SET DisplayOrderAtUtc=COALESCE(u.DateCreated,f.DateCreated),FirstMessageID=f.MessageID,UserMessageID=u.MessageID,AssistantMessageID=a.MessageID,LastErrorMessageID=e.MessageID,TerminalMessageID=z.MessageID
  FROM dbo.Turns t JOIN #Keys k ON k.TurnKey=t.TurnKey
  OUTER APPLY(SELECT TOP(1)m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey ORDER BY m.DateCreated,m.MessageID)f
  OUTER APPLY(SELECT TOP(1)m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'User' ORDER BY m.DateCreated,m.MessageID)u
  OUTER APPLY(SELECT TOP(1)m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'Assistant' ORDER BY m.DateCreated DESC,m.MessageID DESC)a
  OUTER APPLY(SELECT TOP(1)m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State'))=N'failed')OR(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND(LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N''))=N'error' OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N''))=N'error')))ORDER BY m.DateCreated DESC,m.MessageID DESC)e
  OUTER APPLY(SELECT TOP(1)m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State'))IN(N'completed',N'failed',N'cancelled'))OR(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND(LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N''))IN(N'error',N'turncomplete',N'turncompleted') OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N''))IN(N'error',N'turncomplete',N'turncompleted'))))ORDER BY m.DateCreated DESC,m.MessageID DESC)z WHERE t.SessionID=@SessionID;
  SET @Repaired=@@ROWCOUNT;
  COMMIT;
 END TRY
 BEGIN CATCH
  IF XACT_STATE()<>0 ROLLBACK;
  THROW;
 END CATCH
 SELECT @Processed ProcessedMessages,@Repaired RepairedTurns,@HasMore HasMoreUnlinked;
 END
GO
CREATE OR ALTER PROCEDURE dbo.Turns_RepairPage
	@SessionID int,
	@AfterTurnID bigint,
	@NumRows int,
	@LockTimeoutMilliseconds int=1000
AS
BEGIN
	SET NOCOUNT ON; SET XACT_ABORT ON;
	IF @SessionID<=0 OR @AfterTurnID<0 OR @NumRows<1 OR @NumRows>1000 OR @LockTimeoutMilliseconds<1 OR @LockTimeoutMilliseconds>30000 THROW 51092,'Invalid Turns repair bounds.',1;
	IF @LockTimeoutMilliseconds<10 SET LOCK_TIMEOUT 1 ELSE IF @LockTimeoutMilliseconds<25 SET LOCK_TIMEOUT 10 ELSE IF @LockTimeoutMilliseconds<50 SET LOCK_TIMEOUT 25 ELSE IF @LockTimeoutMilliseconds<100 SET LOCK_TIMEOUT 50 ELSE IF @LockTimeoutMilliseconds<250 SET LOCK_TIMEOUT 100 ELSE IF @LockTimeoutMilliseconds<500 SET LOCK_TIMEOUT 250 ELSE IF @LockTimeoutMilliseconds<1000 SET LOCK_TIMEOUT 500 ELSE IF @LockTimeoutMilliseconds<2000 SET LOCK_TIMEOUT 1000 ELSE IF @LockTimeoutMilliseconds<5000 SET LOCK_TIMEOUT 2000 ELSE IF @LockTimeoutMilliseconds<10000 SET LOCK_TIMEOUT 5000 ELSE IF @LockTimeoutMilliseconds<30000 SET LOCK_TIMEOUT 10000 ELSE SET LOCK_TIMEOUT 30000;
	CREATE TABLE #Repair(TurnID bigint NOT NULL PRIMARY KEY,TurnKey nvarchar(255) NOT NULL);
	INSERT #Repair SELECT TOP (@NumRows) TurnID,TurnKey FROM dbo.Turns WHERE SessionID=@SessionID AND TurnID>@AfterTurnID ORDER BY TurnID;
	BEGIN TRY
	 BEGIN TRANSACTION;
	 DELETE t FROM dbo.Turns t JOIN #Repair r ON r.TurnID=t.TurnID WHERE NOT EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=r.TurnKey);
	 UPDATE t SET DisplayOrderAtUtc=COALESCE(u.DateCreated,f.DateCreated),FirstMessageID=f.MessageID,UserMessageID=u.MessageID,AssistantMessageID=a.MessageID,LastErrorMessageID=e.MessageID,TerminalMessageID=z.MessageID
	FROM dbo.Turns t JOIN #Repair r ON r.TurnID=t.TurnID
	OUTER APPLY (SELECT TOP (1) m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=r.TurnKey ORDER BY m.DateCreated,m.MessageID) f
	OUTER APPLY (SELECT TOP (1) m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=r.TurnKey AND m.Role=N'User' ORDER BY m.DateCreated,m.MessageID) u
	OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=r.TurnKey AND m.Role=N'Assistant' ORDER BY m.DateCreated DESC,m.MessageID DESC) a
	OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=r.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State'))=N'failed') OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N''))=N'error' OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N''))=N'error'))) ORDER BY m.DateCreated DESC,m.MessageID DESC) e
	OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=r.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State')) IN(N'completed',N'failed',N'cancelled')) OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N'')) IN(N'error',N'turncomplete',N'turncompleted') OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N'')) IN(N'error',N'turncomplete',N'turncompleted')))) ORDER BY m.DateCreated DESC,m.MessageID DESC) z;
	 COMMIT;
	END TRY
	BEGIN CATCH
	 IF XACT_STATE()<>0 ROLLBACK;
	 THROW;
	END CATCH
	DECLARE @LastTurnID bigint=COALESCE((SELECT MAX(TurnID) FROM #Repair),@AfterTurnID);
	SELECT (SELECT COUNT(*) FROM #Repair) AS RepairedTurns,@LastTurnID AS LastTurnID,CAST(CASE WHEN EXISTS(SELECT 1 FROM dbo.Turns WHERE SessionID=@SessionID AND TurnID>@LastTurnID) THEN 1 ELSE 0 END AS bit) AS HasMore;
END
GO

CREATE OR ALTER PROCEDURE dbo.Turns_ReadIndexPage
	@SessionID int,@SkipRows int,@NumRows int,@BeforeTime datetime2(7)=NULL,@BeforeMessageID int=NULL,@UserOnly bit=0,@ForceMessageProjection bit=0
AS
BEGIN
	SET NOCOUNT ON;
	IF @SkipRows<0 OR @NumRows<1 OR @NumRows>5000 THROW 51092,'Invalid Turns index page bounds.',1;
	IF (@BeforeTime IS NULL AND @BeforeMessageID IS NOT NULL) OR (@BeforeTime IS NOT NULL AND @BeforeMessageID IS NULL) THROW 51092,'Both Turns index page boundary values are required.',1;
	IF @ForceMessageProjection=0 AND NOT EXISTS(SELECT 1 FROM dbo.Messages WHERE SessionID=@SessionID AND TurnRowID IS NULL AND TurnID IS NOT NULL AND TurnID<>N'')
	BEGIN
		DECLARE @Total bigint=(SELECT COUNT_BIG(*) FROM dbo.Turns t WHERE SessionID=@SessionID AND (@UserOnly=0 OR UserMessageID IS NOT NULL) AND EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=t.TurnKey));
		DECLARE @Filtered bigint=(SELECT COUNT_BIG(*) FROM dbo.Turns t WHERE SessionID=@SessionID AND (@UserOnly=0 OR UserMessageID IS NOT NULL) AND EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=t.TurnKey) AND (@BeforeTime IS NULL OR DisplayOrderAtUtc<@BeforeTime OR(DisplayOrderAtUtc=@BeforeTime AND FirstMessageID<@BeforeMessageID)));
		SELECT @Total AS TotalTurns,CAST(CASE WHEN @SkipRows+@NumRows<@Filtered THEN 1 ELSE 0 END AS bit) AS HasMore;
		SELECT TurnID,SessionID,TurnKey,DisplayOrderAtUtc,FirstMessageID,UserMessageID,AssistantMessageID,LastErrorMessageID,TerminalMessageID FROM dbo.Turns t
		WHERE SessionID=@SessionID AND (@UserOnly=0 OR UserMessageID IS NOT NULL) AND EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=t.TurnKey)
		AND (@BeforeTime IS NULL OR DisplayOrderAtUtc<@BeforeTime OR(DisplayOrderAtUtc=@BeforeTime AND FirstMessageID<@BeforeMessageID)) ORDER BY DisplayOrderAtUtc DESC,FirstMessageID DESC OFFSET @SkipRows ROWS FETCH NEXT @NumRows ROWS ONLY;
		RETURN;
	END
	CREATE TABLE #Complete(TurnID bigint NOT NULL,SessionID int NOT NULL,TurnKey nvarchar(255) NOT NULL,DisplayOrderAtUtc datetime2(7) NOT NULL,FirstMessageID int NULL,UserMessageID int NULL,AssistantMessageID int NULL,LastErrorMessageID int NULL,TerminalMessageID int NULL);
	INSERT #Complete
	SELECT CASE WHEN @ForceMessageProjection=1 OR EXISTS(SELECT 1 FROM dbo.Messages x WHERE x.SessionID=@SessionID AND x.TurnID=k.TurnKey AND x.TurnRowID IS NULL) THEN CONVERT(bigint,0) ELSE COALESCE(t.TurnID,CONVERT(bigint,0)) END,@SessionID,k.TurnKey,COALESCE(u.DateCreated,f.DateCreated),f.MessageID,u.MessageID,a.MessageID,e.MessageID,z.MessageID
	FROM (SELECT DISTINCT TurnID AS TurnKey FROM dbo.Messages WHERE SessionID=@SessionID AND TurnID IS NOT NULL AND TurnID<>N'') k LEFT JOIN dbo.Turns t ON t.SessionID=@SessionID AND t.TurnKey=k.TurnKey
	OUTER APPLY (SELECT TOP (1) m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey ORDER BY m.DateCreated,m.MessageID) f
	OUTER APPLY (SELECT TOP (1) m.MessageID,m.DateCreated FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'User' ORDER BY m.DateCreated,m.MessageID) u
	OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'Assistant' ORDER BY m.DateCreated DESC,m.MessageID DESC) a
	OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State'))=N'failed') OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N''))=N'error' OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N''))=N'error'))) ORDER BY m.DateCreated DESC,m.MessageID DESC) e
	OUTER APPLY (SELECT TOP (1) m.MessageID FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=k.TurnKey AND m.Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State')) IN(N'completed',N'failed',N'cancelled')) OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N'')) IN(N'error',N'turncomplete',N'turncompleted') OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N'')) IN(N'error',N'turncomplete',N'turncompleted')))) ORDER BY m.DateCreated DESC,m.MessageID DESC) z WHERE @UserOnly=0 OR u.MessageID IS NOT NULL;
	DECLARE @ColdTotal bigint=(SELECT COUNT_BIG(*) FROM #Complete),@ColdFiltered bigint=(SELECT COUNT_BIG(*) FROM #Complete WHERE @BeforeTime IS NULL OR DisplayOrderAtUtc<@BeforeTime OR(DisplayOrderAtUtc=@BeforeTime AND FirstMessageID<@BeforeMessageID));
	SELECT @ColdTotal AS TotalTurns,CAST(CASE WHEN @SkipRows+@NumRows<@ColdFiltered THEN 1 ELSE 0 END AS bit) AS HasMore;
	SELECT * FROM #Complete WHERE @BeforeTime IS NULL OR DisplayOrderAtUtc<@BeforeTime OR(DisplayOrderAtUtc=@BeforeTime AND FirstMessageID<@BeforeMessageID) ORDER BY DisplayOrderAtUtc DESC,FirstMessageID DESC OFFSET @SkipRows ROWS FETCH NEXT @NumRows ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE dbo.Turns_ReadIndexTurn @SessionID int,@TurnKey nvarchar(255),@ForceMessageProjection bit=0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT q.TurnID,q.SessionID,q.TurnKey,q.DisplayOrderAtUtc,q.FirstMessageID,q.UserMessageID,q.AssistantMessageID,q.LastErrorMessageID,q.TerminalMessageID
	FROM (SELECT t.TurnID,t.SessionID,t.TurnKey,t.DisplayOrderAtUtc,t.FirstMessageID,t.UserMessageID,t.AssistantMessageID,t.LastErrorMessageID,t.TerminalMessageID,0 AS Priority FROM dbo.Turns t
		WHERE @ForceMessageProjection=0 AND t.SessionID=@SessionID AND t.TurnKey=@TurnKey
		AND EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=@TurnKey)
		AND NOT EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=@TurnKey AND m.TurnRowID IS NULL)
		AND NOT EXISTS(SELECT 1 FROM (VALUES(t.FirstMessageID),(t.UserMessageID),(t.AssistantMessageID),(t.LastErrorMessageID),(t.TerminalMessageID)) anchor(MessageID) WHERE anchor.MessageID IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.MessageID=anchor.MessageID AND m.SessionID=@SessionID AND m.TurnID=@TurnKey AND m.TurnRowID=t.TurnID))
		UNION ALL
		SELECT CONVERT(bigint,0),@SessionID,@TurnKey,COALESCE(u.DateCreated,f.DateCreated),f.MessageID,u.MessageID,a.MessageID,e.MessageID,z.MessageID,1
		FROM (SELECT 1 AS Present WHERE EXISTS(SELECT 1 FROM dbo.Messages WHERE SessionID=@SessionID AND TurnID=@TurnKey)) p
		OUTER APPLY (SELECT TOP (1) MessageID,DateCreated FROM dbo.Messages WHERE SessionID=@SessionID AND TurnID=@TurnKey ORDER BY DateCreated,MessageID) f
		OUTER APPLY (SELECT TOP (1) MessageID,DateCreated FROM dbo.Messages WHERE SessionID=@SessionID AND TurnID=@TurnKey AND Role=N'User' ORDER BY DateCreated,MessageID) u
		OUTER APPLY (SELECT TOP (1) MessageID FROM dbo.Messages WHERE SessionID=@SessionID AND TurnID=@TurnKey AND Role=N'Assistant' ORDER BY DateCreated DESC,MessageID DESC) a
		OUTER APPLY (SELECT TOP (1) MessageID FROM dbo.Messages m WHERE SessionID=@SessionID AND TurnID=@TurnKey AND Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State'))=N'failed') OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N''))=N'error' OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N''))=N'error'))) ORDER BY DateCreated DESC,MessageID DESC) e
		OUTER APPLY (SELECT TOP (1) MessageID FROM dbo.Messages m WHERE SessionID=@SessionID AND TurnID=@TurnKey AND Role=N'Lifecycle' AND ((JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NOT NULL AND LOWER(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State')) IN(N'completed',N'failed',N'cancelled')) OR (JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.TerminalOutcome.State') IS NULL AND (LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Name'),N'')) IN(N'error',N'turncomplete',N'turncompleted') OR LOWER(COALESCE(JSON_VALUE(CASE WHEN ISJSON(m.Data)=1 THEN m.Data ELSE N'{}' END,'$.Phase'),N'')) IN(N'error',N'turncomplete',N'turncompleted')))) ORDER BY DateCreated DESC,MessageID DESC) z
		WHERE @ForceMessageProjection=1 OR NOT EXISTS(SELECT 1 FROM dbo.Turns t WHERE t.SessionID=@SessionID AND t.TurnKey=@TurnKey AND EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=@TurnKey) AND NOT EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.SessionID=@SessionID AND m.TurnID=@TurnKey AND m.TurnRowID IS NULL) AND NOT EXISTS(SELECT 1 FROM (VALUES(t.FirstMessageID),(t.UserMessageID),(t.AssistantMessageID),(t.LastErrorMessageID),(t.TerminalMessageID)) anchor(MessageID) WHERE anchor.MessageID IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.Messages m WHERE m.MessageID=anchor.MessageID AND m.SessionID=@SessionID AND m.TurnID=@TurnKey AND m.TurnRowID=t.TurnID)))) q
	ORDER BY q.Priority;
END
GO

CREATE OR ALTER PROCEDURE dbo.Turns_ReadIndexDetailRows @SessionID int,@TurnKey nvarchar(255),@NumRows int
AS
BEGIN
	SET NOCOUNT ON;
	IF @NumRows<1 OR @NumRows>5001 THROW 51092,'Invalid Turns detail bound.',1;
	-- The logical session/key owns history. TurnRowID is only a provider-local index and may be stale.
	SELECT * FROM (SELECT TOP (@NumRows) m.* FROM dbo.Messages m
	WHERE m.SessionID=@SessionID AND m.TurnID=@TurnKey ORDER BY m.DateCreated DESC,m.MessageID DESC) newest ORDER BY DateCreated,MessageID;
END
GO
