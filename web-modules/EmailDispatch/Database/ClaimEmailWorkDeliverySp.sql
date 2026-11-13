CREATE OR ALTER PROCEDURE dbo.ClaimEmailWorkDeliverySp
    @WorkKey nvarchar(255),
    @ExpectedState nvarchar(255),
    @SourceRevision nvarchar(255),
    @PolicyRevision nvarchar(255),
    @DestinationSessionKey nvarchar(255),
    @ApprovedInstruction nvarchar(max),
    @MessageKey nvarchar(255),
    @Data nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @ExpectedState NOT IN (N'Suggested',N'AutomaticReady',N'GuidedDispatchReady') THROW 51000, 'Invalid admission state.', 1;
    IF NULLIF(@ApprovedInstruction, N'') IS NULL OR NULLIF(@DestinationSessionKey, N'') IS NULL
        THROW 51000, 'Approval instruction and destination are required.', 1;
    DECLARE @Claimed TABLE (EmailWorkID int NOT NULL);
    UPDATE dbo.EmailWorks
       SET State = N'Sending', MessageKey = @MessageKey, Data = @Data, LastUpdated = GETUTCDATE()
       OUTPUT inserted.EmailWorkID INTO @Claimed
     WHERE WorkKey = @WorkKey AND State = @ExpectedState
       AND LocalDisposition IS NULL AND MessageKey IS NULL
       AND SourceRevision = @SourceRevision AND PolicyRevision = @PolicyRevision
       AND DestinationSessionKey = @DestinationSessionKey
       AND ApprovedInstruction = @ApprovedInstruction;
    SELECT w.* FROM dbo.EmailWorks AS w INNER JOIN @Claimed AS c ON c.EmailWorkID = w.EmailWorkID;
END
