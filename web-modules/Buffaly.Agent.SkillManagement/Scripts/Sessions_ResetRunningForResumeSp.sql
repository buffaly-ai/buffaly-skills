CREATE OR ALTER PROCEDURE dbo.Sessions_ResetRunningForResumeSp @CaptureCandidates bit
AS
BEGIN
 SET NOCOUNT ON; SET XACT_ABORT ON;
 DECLARE @now nvarchar(255)=CONVERT(nvarchar(50),SYSUTCDATETIME(),127)+'Z';
 DECLARE @changed TABLE(SessionKey nvarchar(255),TurnKey nvarchar(255),IsArchived bit);
 UPDATE dbo.Sessions SET NeedsAttention=1,State=N'Stopped',ActiveTurnKey=N'',CurrentTurnStartedUtc=N'',LastNonRunningUtc=@now,EvaluateAdmissionToken=NULL,LastUpdated=GETUTCDATE()
 OUTPUT deleted.SessionKey,deleted.ActiveTurnKey,deleted.IsArchived INTO @changed
 WHERE State=N'Running';
 DECLARE @count int=@@ROWCOUNT;
 SELECT @count AS UpdatedCount,c.SessionKey,c.TurnKey FROM(VALUES(1))anchor(n)
 LEFT JOIN @changed c ON @CaptureCandidates=1 AND c.IsArchived=0 AND NULLIF(c.TurnKey,N'') IS NOT NULL;
END
GO
