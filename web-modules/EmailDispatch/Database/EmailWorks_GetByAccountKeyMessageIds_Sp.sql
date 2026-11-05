CREATE OR ALTER PROCEDURE dbo.EmailWorks_GetByAccountKeyMessageIds_Sp
 @AccountKey nvarchar(255), @MessageIds nvarchar(max)
AS
BEGIN
 SET NOCOUNT ON;
 IF ISJSON(@MessageIds)<>1 OR LEFT(@MessageIds,1)<>N'[' THROW 51000,'Message identities must be an array.',1;
 IF (SELECT COUNT(*) FROM OPENJSON(@MessageIds))>25 THROW 51000,'Too many message identities.',1;
 SELECT w.* INTO #Works FROM dbo.EmailWorks w
 INNER JOIN dbo.EmailObservations o ON o.ObservationKey=w.ObservationKey
 WHERE o.AccountKey=@AccountKey AND EXISTS(SELECT 1 FROM OPENJSON(@MessageIds) i WHERE i.[value]=o.MessageId);
 IF (SELECT COUNT(*) FROM #Works)>525 THROW 51000,'Conversation work evidence exceeds limit.',1;
 SELECT * FROM #Works;
 -- The current attempt's exact receipt, not an older message or a prior attempt's success.
 SELECT d.* FROM dbo.EmailDeliveries d INNER JOIN #Works w ON w.MessageKey=d.MessageKey AND w.WorkKey=d.WorkKey;
END
