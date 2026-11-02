CREATE OR ALTER PROCEDURE dbo.GetEmailWorksForObservationSp @ObservationKey nvarchar(255)
AS
BEGIN
 SET NOCOUNT ON;
 SELECT TOP (21) * FROM dbo.EmailWorks WHERE ObservationKey=@ObservationKey ORDER BY EmailWorkID;
END
GO
CREATE OR ALTER PROCEDURE dbo.GetPendingEmailWorksSp @AccountKey nvarchar(255), @NumRows int
AS
BEGIN
 SET NOCOUNT ON;
 IF @NumRows<1 OR @NumRows>100 THROW 51000,'Invalid page size.',1;
 SELECT TOP (@NumRows) w.* FROM dbo.EmailWorks w
 INNER JOIN dbo.EmailObservations o ON o.ObservationKey=w.ObservationKey
 WHERE o.AccountKey=@AccountKey AND o.Presence=N'Present' AND o.IsHistoryOnly=0
 -- Classification owns Pending only; AutomaticReady belongs to the separate delivery workflow.
 AND w.State=N'Pending' AND w.LocalDisposition IS NULL
 ORDER BY w.EmailWorkID;
END
GO
