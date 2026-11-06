CREATE OR ALTER PROCEDURE dbo.EmailObservations_GetConversationPage_Sp
 @AccountKey nvarchar(255), @State nvarchar(255), @Search nvarchar(255), @SkipRows int, @NumRows int
AS
BEGIN
 SET NOCOUNT ON;
 IF @SkipRows<0 OR @NumRows<1 OR @NumRows>26 THROW 51000,'Invalid conversation page bounds.',1;
 ;WITH Ranked AS
 (SELECT o.*,ROW_NUMBER() OVER(PARTITION BY ThreadId ORDER BY InternalDateUnixMs DESC,EmailObservationID DESC) AS ThreadRank
  FROM dbo.EmailObservations_Visible(@AccountKey,N'',N'') o)
 SELECT o.EmailObservationID INTO #Page FROM Ranked o
 WHERE o.ThreadRank=1 AND EXISTS(SELECT 1 FROM dbo.EmailObservations_Visible(@AccountKey,@State,N'') v WHERE v.EmailObservationID=o.EmailObservationID)
 AND (@Search=N'' OR EXISTS(SELECT 1 FROM dbo.EmailObservations x WHERE x.AccountKey=@AccountKey AND x.ThreadId=o.ThreadId
 AND (x.MessageId=@Search OR x.ThreadId=@Search OR JSON_VALUE(x.Data,'$.Frame.Subject') LIKE N'%'+@Search+N'%' OR JSON_VALUE(x.Data,'$.Frame.Sender') LIKE N'%'+@Search+N'%')))
 ORDER BY o.InternalDateUnixMs DESC,o.EmailObservationID DESC OFFSET @SkipRows ROWS FETCH NEXT @NumRows ROWS ONLY;
 SELECT o.* FROM dbo.EmailObservations o INNER JOIN #Page p ON p.EmailObservationID=o.EmailObservationID ORDER BY o.InternalDateUnixMs DESC,o.EmailObservationID DESC;
 SELECT latest.ThreadId,COUNT(*) AS MessageCount,
  MAX(CASE WHEN x.InternalDateUnixMs>latest.InternalDateUnixMs AND x.Presence=N'Present' AND COALESCE(labels.Excluded,0)=0
  THEN CASE WHEN labels.Sent=1 AND COALESCE(labels.Draft,0)=0 THEN 2
  WHEN labels.Draft=1 THEN 1 ELSE 0 END ELSE 0 END) AS ReplyEvidence
  FROM #Page p INNER JOIN dbo.EmailObservations latest ON latest.EmailObservationID=p.EmailObservationID
  INNER JOIN dbo.EmailObservations x ON x.AccountKey=latest.AccountKey AND x.ThreadId=latest.ThreadId
  OUTER APPLY(SELECT MAX(CASE WHEN l.[value] IN(N'SPAM',N'TRASH') THEN 1 ELSE 0 END) Excluded,
   MAX(CASE WHEN l.[value]=N'SENT' THEN 1 ELSE 0 END) Sent,MAX(CASE WHEN l.[value]=N'DRAFT' THEN 1 ELSE 0 END) Draft
   FROM OPENJSON(x.Data,'$.Frame.Labels') l) labels GROUP BY latest.ThreadId;
END
GO
CREATE OR ALTER PROCEDURE dbo.EmailObservations_GetThread_Sp
 @AccountKey nvarchar(255), @ThreadId nvarchar(255)
AS
BEGIN
 SET NOCOUNT ON;
 SELECT TOP(501) * FROM dbo.EmailObservations WHERE AccountKey=@AccountKey AND ThreadId=@ThreadId ORDER BY InternalDateUnixMs,EmailObservationID;
END
