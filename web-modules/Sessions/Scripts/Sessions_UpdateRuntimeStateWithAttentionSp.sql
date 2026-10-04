CREATE OR ALTER PROCEDURE dbo.Sessions_UpdateRuntimeStateWithAttentionSp
 @SessionKey nvarchar(255), @State nvarchar(255),
 @ActiveTurnKey nvarchar(255), @CurrentTurnStartedUtc nvarchar(255),
 @LastRunPulseUtc nvarchar(255), @LastNonRunningUtc nvarchar(255),
 @EvaluateAdmissionToken nvarchar(255)
AS
BEGIN
 SET NOCOUNT ON;
 IF @State IS NULL OR @State COLLATE Latin1_General_100_BIN2 NOT IN (N'Unloaded',N'Loaded',N'Running',N'Paused',N'Stopped',N'Completed',N'Errored')
  THROW 51000,'An explicit canonical State is required.',1;
 IF @State<>N'Running' AND NULLIF(@LastNonRunningUtc,N'') IS NULL
  THROW 51000,'Nonrunning transition requires the exact stop stamp.',1;
 UPDATE s SET
  NeedsAttention=CASE WHEN @State=N'Running' THEN 0 WHEN s.State=N'Running' THEN 1 ELSE s.NeedsAttention END,
  State=@State,
  ActiveTurnKey=CASE WHEN @ActiveTurnKey<>N'' OR @State<>N'Running' THEN @ActiveTurnKey ELSE s.ActiveTurnKey END,
  CurrentTurnStartedUtc=CASE WHEN @CurrentTurnStartedUtc<>N'' OR @State<>N'Running' THEN @CurrentTurnStartedUtc ELSE s.CurrentTurnStartedUtc END,
  LastRunPulseUtc=@LastRunPulseUtc,
  LastNonRunningUtc=CASE WHEN s.State=N'Running' AND @State<>N'Running' THEN @LastNonRunningUtc ELSE s.LastNonRunningUtc END,
  EvaluateAdmissionToken=NULLIF(@EvaluateAdmissionToken,N''),
  LastUpdated=GETDATE()
 FROM dbo.Sessions s WHERE SessionKey=@SessionKey;
 SELECT CONVERT(bit,CASE WHEN @@ROWCOUNT=1 THEN 1 ELSE 0 END) AS Updated;
END
GO
