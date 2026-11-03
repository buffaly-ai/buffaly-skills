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
 -- Newest first. A pass reaches only rows this page returns, so a backlog of older rows waiting for the agent (such as
 -- the legacy mail EmailLegacyRequeue sends back) must never hide new mail.
 ORDER BY w.EmailWorkID DESC;
END
GO
CREATE OR ALTER PROCEDURE dbo.GetDeliveredEmailWorksSp @AccountKey nvarchar(255), @AfterEmailWorkID int, @NumRows int
AS
BEGIN
 SET NOCOUNT ON;
 IF @NumRows<1 OR @NumRows>25 OR @AfterEmailWorkID<0 THROW 51000,'Invalid delivered-work page.',1;
 -- Keyset page of sent work (MessageKey claimed) for the learning scan. Column predicates only: the learning state
 -- stays inside the whole Data document and is read by the business owner (DATA-01; no per-key procedure).
 SELECT TOP (@NumRows) w.* FROM dbo.EmailWorks w
 INNER JOIN dbo.EmailObservations o ON o.ObservationKey=w.ObservationKey
 WHERE o.AccountKey=@AccountKey AND w.MessageKey IS NOT NULL AND w.EmailWorkID>@AfterEmailWorkID
 ORDER BY w.EmailWorkID;
END
GO
