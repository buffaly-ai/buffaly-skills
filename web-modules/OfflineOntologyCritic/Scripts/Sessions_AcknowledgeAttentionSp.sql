CREATE OR ALTER PROCEDURE dbo.Sessions_AcknowledgeAttentionSp
 @SessionKey nvarchar(255),@ObservedStopStamp nvarchar(50)
AS
BEGIN
 SET NOCOUNT ON;
 IF @ObservedStopStamp IS NULL OR LEN(@ObservedStopStamp)=0 THROW 51000,'ObservedStopStamp is required.',1;
 UPDATE dbo.Sessions SET NeedsAttention=0
 WHERE SessionKey=@SessionKey AND IsArchived=0 AND NeedsAttention=1
  AND LastNonRunningUtc COLLATE Latin1_General_100_BIN2=@ObservedStopStamp COLLATE Latin1_General_100_BIN2
  AND DATALENGTH(LastNonRunningUtc)=DATALENGTH(@ObservedStopStamp);
 SELECT SessionKey,NeedsAttention,LastNonRunningUtc AS StopStamp FROM dbo.Sessions WHERE SessionKey=@SessionKey AND IsArchived=0;
END
GO
