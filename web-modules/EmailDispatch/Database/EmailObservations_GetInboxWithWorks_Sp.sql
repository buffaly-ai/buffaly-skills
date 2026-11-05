CREATE OR ALTER PROCEDURE dbo.EmailObservations_GetInboxWithWorks_Sp
 @AccountKey nvarchar(255), @State nvarchar(255), @Search nvarchar(255), @SkipRows int, @NumRows int
AS
BEGIN
 SET NOCOUNT ON;
 IF @SkipRows<0 OR @NumRows<1 OR @NumRows>51 THROW 51000,'Invalid page bounds.',1;
 -- Exclude Gmail spam before search, status and paging; retain observations for direct evidence/history.
 SELECT o.* INTO #Page FROM dbo.EmailObservations o
 WHERE (@AccountKey=N'' OR o.AccountKey=@AccountKey)
 AND NOT EXISTS(SELECT 1 FROM OPENJSON(o.Data,'$.Frame.Labels') label WHERE label.[value]=N'SPAM')
 AND (@Search=N'' OR o.MessageId=@Search OR o.ThreadId=@Search
      OR JSON_VALUE(o.Data,'$.Frame.Subject') LIKE N'%'+@Search+N'%'
      OR JSON_VALUE(o.Data,'$.Frame.Sender') LIKE N'%'+@Search+N'%')
 AND (@State=N'' OR EXISTS(SELECT 1 FROM dbo.EmailWorks w WHERE w.ObservationKey=o.ObservationKey AND
   ((@State=N'NeedsAttention' AND w.LocalDisposition IS NULL AND w.State IN(N'Suggested',N'AutomaticReady',N'NeedsDestination',N'NeedsReview',N'Unclassified',N'Prepared',N'AgentEvaluationRequired',N'PreparationFailed',N'Disabled',N'Failed',N'Rejected',N'DeliveryUnknown',N'Conflict',N'Error'))
   OR (@State=N'Reviewed' AND (w.LocalDisposition IS NOT NULL OR w.State IN(N'Accepted',N'NoAction',N'Notice',N'WakeRecorded')))
   OR w.State=@State)))
 ORDER BY o.InternalDateUnixMs DESC,o.EmailObservationID DESC
 OFFSET @SkipRows ROWS FETCH NEXT @NumRows ROWS ONLY;
 SELECT * FROM #Page ORDER BY InternalDateUnixMs DESC,EmailObservationID DESC;
 SELECT w.* FROM dbo.EmailWorks w INNER JOIN #Page p ON p.ObservationKey=w.ObservationKey;
END
