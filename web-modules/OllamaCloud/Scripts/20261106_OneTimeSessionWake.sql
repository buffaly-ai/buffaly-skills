SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
-- Additive one-time wake storage. Existing interval rows remain unchanged.
IF COL_LENGTH('dbo.Processes','DueAtUtc') IS NULL ALTER TABLE dbo.Processes ADD DueAtUtc datetime NULL;
IF COL_LENGTH('dbo.Processes','OneTimeState') IS NULL ALTER TABLE dbo.Processes ADD OneTimeState nvarchar(255) NULL;
IF COL_LENGTH('dbo.Sessions','PendingWakeProcessID') IS NULL ALTER TABLE dbo.Sessions ADD PendingWakeProcessID int NULL;
GO
IF EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Sessions') AND name='IX_Sessions_PendingWake' AND (is_unique=1 OR has_filter=1)) DROP INDEX IX_Sessions_PendingWake ON dbo.Sessions;
GO
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Sessions') AND name='IX_Sessions_PendingWake') CREATE INDEX IX_Sessions_PendingWake ON dbo.Sessions(PendingWakeProcessID);
GO
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Processes') AND name='IX_Processes_OneTimeState') CREATE INDEX IX_Processes_OneTimeState ON dbo.Processes(OneTimeState,DueAtUtc,ProcessID) INCLUDE(ProcessName,Action);
GO
CREATE OR ALTER PROCEDURE dbo.Process_GetByProcessNameSessionWake_Sp @ProcessName nvarchar(255) AS
BEGIN
 SET NOCOUNT ON;
 SELECT p.ProcessID,p.ProcessName,s.SessionID,p.DueAtUtc,p.OneTimeState,p.RunData,p.DateCreated FROM dbo.Processes p JOIN dbo.Sessions s ON s.SessionKey=JSON_VALUE(CASE WHEN p.Action='OneTimeProcess' THEN p.RunData END,'$.SessionKey') WHERE p.ProcessName=@ProcessName AND p.Action='OneTimeProcess';
END
GO
CREATE OR ALTER PROCEDURE dbo.Process_GetByProcessIDSessionWake_Sp @ProcessID int AS
BEGIN
 SET NOCOUNT ON;
 IF EXISTS(SELECT 1 FROM dbo.Sessions WHERE PendingWakeProcessID=@ProcessID)
 BEGIN
  SELECT p.ProcessID,p.ProcessName,s.SessionID,p.DueAtUtc,p.OneTimeState,p.RunData,p.DateCreated FROM dbo.Processes p JOIN dbo.Sessions s ON s.PendingWakeProcessID=p.ProcessID WHERE p.ProcessID=@ProcessID AND p.Action='OneTimeProcess';
  RETURN;
 END;
 SELECT p.ProcessID,p.ProcessName,s.SessionID,p.DueAtUtc,p.OneTimeState,p.RunData,p.DateCreated FROM dbo.Processes p JOIN dbo.Sessions s ON s.SessionKey=JSON_VALUE(CASE WHEN p.Action='OneTimeProcess' THEN p.RunData END,'$.SessionKey') WHERE p.ProcessID=@ProcessID AND p.Action='OneTimeProcess';
END
GO
CREATE OR ALTER PROCEDURE dbo.Process_GetAdmittingSessionWakeByName_Sp @ProcessName nvarchar(255) AS
BEGIN
 SET NOCOUNT ON;
 SELECT p.ProcessID,p.ProcessName,s.SessionID,p.DueAtUtc,p.OneTimeState,p.RunData,p.DateCreated FROM dbo.Processes p JOIN dbo.Sessions s ON s.PendingWakeProcessID=p.ProcessID WHERE p.ProcessName=@ProcessName AND p.OneTimeState='Admitting' AND p.Action='OneTimeProcess';
END
GO
CREATE OR ALTER PROCEDURE dbo.Process_ScheduleSessionWake_Sp @SessionID int,@ExpectedProcessID int=NULL,@ProcessName nvarchar(255),@DueAtUtc datetime,@RunData nvarchar(max) AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF ISJSON(@RunData)<>1 THROW 50001,'Invalid immutable wake arguments.',1;
 BEGIN TRY
 BEGIN TRANSACTION;
 DECLARE @Pointer int,@SessionKey nvarchar(255),@ExistingID int,@ExistingData nvarchar(max),@ExistingAction nvarchar(255);
 SELECT @Pointer=PendingWakeProcessID,@SessionKey=SessionKey FROM dbo.Sessions WHERE SessionID=@SessionID;
 IF @SessionKey IS NULL OR JSON_VALUE(@RunData,'$.SessionKey') IS NULL OR JSON_VALUE(@RunData,'$.SessionKey') COLLATE Latin1_General_100_BIN2 <> @SessionKey COLLATE Latin1_General_100_BIN2 THROW 50001,'Wake target differs.',1;
 SELECT @ExistingID=ProcessID,@ExistingData=RunData,@ExistingAction=Action FROM dbo.Processes WHERE ProcessName=@ProcessName;
 IF @ExistingID IS NOT NULL
 BEGIN
   IF @ExistingAction IS NULL OR @ExistingAction<>'OneTimeProcess' OR @ExistingData IS NULL OR DATALENGTH(@ExistingData)<>DATALENGTH(@RunData) OR @ExistingData COLLATE Latin1_General_100_BIN2 <> @RunData COLLATE Latin1_General_100_BIN2 THROW 50001,'Request identity payload conflict.',1;
  COMMIT; EXEC dbo.Process_GetByProcessIDSessionWake_Sp @ExistingID; RETURN;
 END;
 IF (@ExpectedProcessID IS NULL AND @Pointer IS NOT NULL) OR (@ExpectedProcessID IS NOT NULL AND (@Pointer IS NULL OR @Pointer<>@ExpectedProcessID)) THROW 50001,'Wake changed or is in progress.',1;
 IF @ExpectedProcessID IS NOT NULL
 BEGIN
  UPDATE dbo.Processes SET OneTimeState='Superseded',LastUpdated=GETUTCDATE() WHERE ProcessID=@ExpectedProcessID AND Action='OneTimeProcess' AND OneTimeState IN('Pending','NeedsAttention') AND JSON_VALUE(RunData,'$.SessionKey')=@SessionKey;
  IF @@ROWCOUNT<>1 THROW 50001,'Wake changed or is in progress.',1;
 END;
 INSERT dbo.Processes(ProcessName,Action,RunData,DueAtUtc,OneTimeState,IsRunning,IsEnabled,IsTimedOut,DateCreated,LastUpdated) VALUES(@ProcessName,'OneTimeProcess',@RunData,@DueAtUtc,'Pending',0,1,0,GETUTCDATE(),GETUTCDATE());
 DECLARE @NewID int=CONVERT(int,SCOPE_IDENTITY());
 UPDATE dbo.Sessions SET PendingWakeProcessID=@NewID WHERE SessionID=@SessionID AND ((@ExpectedProcessID IS NULL AND PendingWakeProcessID IS NULL) OR PendingWakeProcessID=@ExpectedProcessID);
 IF @@ROWCOUNT<>1 THROW 50001,'Wake changed or is in progress.',1;
 COMMIT; EXEC dbo.Process_GetByProcessIDSessionWake_Sp @NewID;
 END TRY
 BEGIN CATCH
 DECLARE @ErrorNumber int=ERROR_NUMBER();
 IF @@TRANCOUNT>0 ROLLBACK;
 IF @ErrorNumber IN(2601,2627) AND EXISTS(SELECT 1 FROM dbo.Processes WHERE ProcessName=@ProcessName AND Action='OneTimeProcess' AND DATALENGTH(RunData)=DATALENGTH(@RunData) AND RunData COLLATE Latin1_General_100_BIN2=@RunData COLLATE Latin1_General_100_BIN2)
 BEGIN
  EXEC dbo.Process_GetByProcessNameSessionWake_Sp @ProcessName; RETURN;
 END;
 THROW;
 END CATCH
END
GO
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Processes') AND name='IX_Processes_OneTimeResolve') CREATE INDEX IX_Processes_OneTimeResolve ON dbo.Processes(OneTimeState,ProcessID) INCLUDE(Action,DueAtUtc);
GO
CREATE OR ALTER PROCEDURE dbo.Processes_GetDueSessionWakePage_Sp @NumRows int,@NowUtc datetime,@AfterDueAtUtc datetime=NULL,@AfterProcessID int=0 AS
BEGIN
 SET NOCOUNT ON;
 IF @NumRows NOT BETWEEN 1 AND 100 OR @AfterProcessID<0 OR (@AfterDueAtUtc IS NULL AND @AfterProcessID<>0) OR (@AfterDueAtUtc IS NOT NULL AND @AfterProcessID=0) THROW 50001,'Invalid due page.',1;
 DECLARE @Candidates TABLE(ProcessID int PRIMARY KEY,DueAtUtc datetime NOT NULL);
  IF @AfterDueAtUtc IS NULL
  INSERT @Candidates SELECT TOP(@NumRows) ProcessID,DueAtUtc FROM dbo.Processes WHERE OneTimeState='Pending' AND Action='OneTimeProcess' AND DueAtUtc<=@NowUtc ORDER BY DueAtUtc,ProcessID;
 ELSE
 BEGIN
  INSERT @Candidates SELECT TOP(@NumRows) ProcessID,DueAtUtc FROM dbo.Processes WHERE OneTimeState='Pending' AND Action='OneTimeProcess' AND DueAtUtc=@AfterDueAtUtc AND ProcessID>@AfterProcessID AND DueAtUtc<=@NowUtc ORDER BY ProcessID;
  DECLARE @Remaining int=@NumRows-@@ROWCOUNT;
  IF @Remaining>0 INSERT @Candidates SELECT TOP(@Remaining) ProcessID,DueAtUtc FROM dbo.Processes WHERE OneTimeState='Pending' AND Action='OneTimeProcess' AND DueAtUtc>@AfterDueAtUtc AND DueAtUtc<=@NowUtc ORDER BY DueAtUtc,ProcessID;
 END;
 DECLARE @LastID int=0,@LastDue datetime=NULL,@Exhausted bit=CASE WHEN (SELECT COUNT(*) FROM @Candidates)<@NumRows THEN 1 ELSE 0 END;
 SELECT TOP(1) @LastID=ProcessID,@LastDue=DueAtUtc FROM @Candidates ORDER BY DueAtUtc DESC,ProcessID DESC;
 SELECT @LastID ExaminedProcessID,@LastDue ExaminedDueAtUtc,@Exhausted Exhausted,o.* FROM (SELECT 1 seed) seed OUTER APPLY(SELECT p.ProcessID,p.ProcessName,s.SessionID,p.DueAtUtc,p.OneTimeState,p.RunData,p.DateCreated FROM @Candidates c JOIN dbo.Processes p ON p.ProcessID=c.ProcessID JOIN dbo.Sessions s ON s.PendingWakeProcessID=c.ProcessID) o ORDER BY o.DueAtUtc,o.ProcessID;
END
GO
CREATE OR ALTER PROCEDURE dbo.Processes_GetAdmittingSessionWakePage_Sp @NumRows int,@AfterProcessID int=0 AS
BEGIN
 SET NOCOUNT ON;
 IF @NumRows NOT BETWEEN 1 AND 100 OR @AfterProcessID<0 THROW 50001,'Invalid admitting page.',1;
 DECLARE @Candidates TABLE(ProcessID int PRIMARY KEY);
 INSERT @Candidates SELECT TOP(@NumRows) ProcessID FROM dbo.Processes WHERE OneTimeState='Admitting' AND ProcessID>@AfterProcessID AND Action='OneTimeProcess' ORDER BY ProcessID;
 DECLARE @LastID int=COALESCE((SELECT MAX(ProcessID) FROM @Candidates),0),@Exhausted bit=CASE WHEN (SELECT COUNT(*) FROM @Candidates)<@NumRows THEN 1 ELSE 0 END;
 SELECT @LastID ExaminedProcessID,CONVERT(datetime,NULL) ExaminedDueAtUtc,@Exhausted Exhausted,o.* FROM (SELECT 1 seed) seed OUTER APPLY(SELECT p.ProcessID,p.ProcessName,s.SessionID,p.DueAtUtc,p.OneTimeState,p.RunData,p.DateCreated FROM @Candidates c JOIN dbo.Processes p ON p.ProcessID=c.ProcessID JOIN dbo.Sessions s ON s.PendingWakeProcessID=c.ProcessID) o ORDER BY o.ProcessID;
END
GO
CREATE OR ALTER PROCEDURE dbo.Process_ClaimSessionWake_Sp @ExpectedProcessID int,@NowUtc datetime AS
BEGIN
 SET NOCOUNT ON;
 UPDATE p SET OneTimeState='Admitting',LastUpdated=GETUTCDATE() FROM dbo.Processes p WHERE p.ProcessID=@ExpectedProcessID AND p.Action='OneTimeProcess' AND p.OneTimeState='Pending' AND p.DueAtUtc<=@NowUtc AND EXISTS(SELECT 1 FROM dbo.Sessions s WHERE s.PendingWakeProcessID=p.ProcessID);
 SELECT CONVERT(int,@@ROWCOUNT) AS Changed;
END
GO
CREATE OR ALTER PROCEDURE dbo.Process_CancelSessionWake_Sp @SessionID int,@ExpectedProcessID int AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON; BEGIN TRANSACTION;
 UPDATE p SET OneTimeState='Cancelled',LastUpdated=GETUTCDATE() FROM dbo.Processes p WHERE p.ProcessID=@ExpectedProcessID AND p.Action='OneTimeProcess' AND p.OneTimeState IN('Pending','NeedsAttention') AND EXISTS(SELECT 1 FROM dbo.Sessions s WHERE s.SessionID=@SessionID AND s.PendingWakeProcessID=p.ProcessID AND s.SessionKey=JSON_VALUE(CASE WHEN p.Action='OneTimeProcess' THEN p.RunData END,'$.SessionKey'));
 DECLARE @Changed int=@@ROWCOUNT;
 IF @Changed=1 UPDATE dbo.Sessions SET PendingWakeProcessID=NULL WHERE SessionID=@SessionID AND PendingWakeProcessID=@ExpectedProcessID;
 COMMIT; SELECT @Changed AS Changed;
END
GO
CREATE OR ALTER PROCEDURE dbo.Process_FinalizeSessionWake_Sp @SessionID int,@ExpectedProcessID int,@Outcome nvarchar(255) AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 IF @Outcome IS NULL OR @Outcome NOT IN('WakeAccepted','AlreadyAwake','NeedsAttention') THROW 50001,'Invalid wake outcome.',1;
 BEGIN TRANSACTION;
 DECLARE @Changed int;
 IF @Outcome='NeedsAttention'
 BEGIN
  UPDATE p SET OneTimeState=@Outcome,LastUpdated=GETUTCDATE() FROM dbo.Processes p WHERE p.ProcessID=@ExpectedProcessID AND p.Action='OneTimeProcess' AND p.OneTimeState='Admitting' AND EXISTS(SELECT 1 FROM dbo.Sessions s WHERE s.SessionID=@SessionID AND s.PendingWakeProcessID=p.ProcessID);
 SET @Changed=@@ROWCOUNT;
 END
  ELSE
  BEGIN
  UPDATE p SET OneTimeState=@Outcome,LastUpdated=GETUTCDATE() FROM dbo.Processes p WHERE p.ProcessID=@ExpectedProcessID AND p.Action='OneTimeProcess' AND p.OneTimeState='Admitting' AND EXISTS(SELECT 1 FROM dbo.Sessions s WHERE s.SessionID=@SessionID AND s.PendingWakeProcessID=p.ProcessID AND s.SessionKey=JSON_VALUE(CASE WHEN p.Action='OneTimeProcess' THEN p.RunData END,'$.SessionKey'));
 SET @Changed=@@ROWCOUNT;
 END
 IF @Changed=1 AND @Outcome<>'NeedsAttention' UPDATE dbo.Sessions SET PendingWakeProcessID=NULL WHERE SessionID=@SessionID AND PendingWakeProcessID=@ExpectedProcessID;
 COMMIT; SELECT @Changed AS Changed;
END
GO
CREATE OR ALTER PROCEDURE dbo.Process_GetByProcessName_Sp @ProcessName nvarchar(255) AS
BEGIN
 SET NOCOUNT ON; SELECT * FROM dbo.Processes WHERE ProcessName=@ProcessName;
END
GO
CREATE OR ALTER PROCEDURE dbo.Processes_GetInterval_Sp @NumRows int AS
BEGIN
 SET NOCOUNT ON; IF @NumRows NOT BETWEEN 1 AND 1000 THROW 50001,'Invalid process bound.',1;
 SELECT TOP(@NumRows) * FROM dbo.Processes WHERE OneTimeState IS NULL AND DueAtUtc IS NULL AND (Action IS NULL OR Action<>'OneTimeProcess') ORDER BY ProcessID;
END
GO
CREATE OR ALTER PROCEDURE dbo.Sessions_GetSidebarMetadataWithWake_Sp @SessionIDsJson nvarchar(max) AS
BEGIN
 SET NOCOUNT ON;
 IF ISJSON(@SessionIDsJson)<>1 THROW 50001,'Expected session identities.',1;
 IF (SELECT COUNT(*) FROM OPENJSON(@SessionIDsJson))>5000 THROW 50001,'Sidebar cohort exceeds bound.',1;
 SELECT s.SessionID,JSON_QUERY(s.Data,'$.SidebarProfile') AS SidebarProfileJson,JSON_QUERY(s.Data,'$.UserState') AS UserStateJson,s.PendingWakeProcessID,p.DueAtUtc AS PendingWakeAtUtc,p.OneTimeState AS PendingWakeState FROM dbo.Sessions s LEFT JOIN dbo.Processes p ON p.ProcessID=s.PendingWakeProcessID WHERE EXISTS(SELECT 1 FROM OPENJSON(@SessionIDsJson) i WHERE s.SessionID=CONVERT(int,i.value));
END
GO
-- Omission is the authorized Root inventory, selected only by the typed backend.
CREATE OR ALTER PROCEDURE dbo.Sessions_GetSidebarActivityWithWake_Sp @SessionKeysJson nvarchar(max), @EnvironmentUserKey nvarchar(64) = NULL AS
BEGIN
 SET NOCOUNT ON;
 IF ISJSON(@SessionKeysJson)<>1 THROW 50001,'Expected session keys.',1;
 IF (SELECT COUNT(*) FROM OPENJSON(@SessionKeysJson))>5000 THROW 50001,'Sidebar cohort exceeds bound.',1;
 ;WITH Requested AS
 (
 SELECT CONVERT(int,i.[key]) AS RequestOrdinal,s.SessionID,s.SessionKey,s.ParentSessionID,s.SessionName,s.AgentName,s.SessionKind,s.LastUpdated,s.PendingWakeProcessID
 FROM OPENJSON(@SessionKeysJson) i JOIN dbo.Sessions s WITH (NOLOCK) ON s.SessionKey=CONVERT(nvarchar(450),i.value) WHERE s.IsArchived=0 AND (@EnvironmentUserKey IS NULL OR s.EnvironmentUserKey=@EnvironmentUserKey)
 ), RootActivity AS
 (
 SELECT r.SessionID,CASE WHEN MAX(c.LastUpdated)>r.LastUpdated THEN MAX(c.LastUpdated) ELSE r.LastUpdated END AS EffectiveLastUpdated
 FROM Requested r LEFT JOIN dbo.Sessions c WITH (NOLOCK) ON c.ParentSessionID=r.SessionID AND c.IsArchived=0 AND (@EnvironmentUserKey IS NULL OR c.EnvironmentUserKey=@EnvironmentUserKey) WHERE r.ParentSessionID IS NULL GROUP BY r.SessionID,r.LastUpdated
 )
 SELECT r.SessionID,r.SessionKey,r.SessionName,r.AgentName,r.SessionKind,r.LastUpdated AS OwnLastUpdated,
 CASE WHEN r.ParentSessionID IS NULL THEN a.EffectiveLastUpdated ELSE r.LastUpdated END AS EffectiveLastUpdated,
 r.PendingWakeProcessID,p.DueAtUtc AS PendingWakeAtUtc,p.OneTimeState AS PendingWakeState
 FROM Requested r LEFT JOIN RootActivity a ON a.SessionID=r.SessionID LEFT JOIN dbo.Processes p ON p.ProcessID=r.PendingWakeProcessID ORDER BY r.RequestOrdinal;
END
GO
