CREATE OR ALTER PROCEDURE dbo.Sessions_RollbackEvaluateAdmissionWithAttentionSp
 @SessionKey nvarchar(255),@AdmissionToken nvarchar(255)
AS
BEGIN
 SET NOCOUNT ON;
 IF NULLIF(@AdmissionToken,N'') IS NULL THROW 51000,'AdmissionToken is required.',1;
 DECLARE @now nvarchar(255)=CONVERT(nvarchar(50),SYSUTCDATETIME(),127)+'Z';
 UPDATE dbo.Sessions SET NeedsAttention=1,State=N'Errored',ActiveTurnKey=N'',CurrentTurnStartedUtc=N'',
  LastNonRunningUtc=@now,EvaluateAdmissionToken=NULL,LastUpdated=GETDATE()
 WHERE SessionKey=@SessionKey AND State=N'Running' AND EvaluateAdmissionToken=@AdmissionToken;
 SELECT CONVERT(bit,CASE WHEN @@ROWCOUNT=1 THEN 1 ELSE 0 END) AS Updated;
END
GO
