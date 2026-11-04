CREATE OR ALTER PROCEDURE dbo.EmailWork_ClaimRepeatDelivery_Sp
    @WorkKey nvarchar(255),
    @ExpectedState nvarchar(255),
    @SourceRevision nvarchar(255),
    @PolicyRevision nvarchar(255),
    @DestinationSessionKey nvarchar(255),
    @ApprovedInstruction nvarchar(max),
    @PreviousMessageKey nvarchar(255),
    @MessageKey nvarchar(255),
    @Data nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    IF @ExpectedState NOT IN (N'PreviouslyHandled',N'Accepted',N'Rejected') THROW 51000, 'Invalid repeat admission state.', 1;
    IF NULLIF(@ApprovedInstruction,N'') IS NULL OR NULLIF(@DestinationSessionKey,N'') IS NULL OR NULLIF(@MessageKey,N'') IS NULL
        THROW 51000, 'Approval instruction, destination and message key are required.', 1;
    DECLARE @Claimed TABLE (EmailWorkID int NOT NULL);
    UPDATE dbo.EmailWorks
       SET State=N'Sending', MessageKey=@MessageKey, Data=@Data, LastUpdated=GETUTCDATE()
       OUTPUT inserted.EmailWorkID INTO @Claimed
     WHERE WorkKey=@WorkKey AND State=@ExpectedState AND LocalDisposition IS NULL
       AND SourceRevision=@SourceRevision AND PolicyRevision=@PolicyRevision
       AND DestinationSessionKey=@DestinationSessionKey AND ApprovedInstruction=@ApprovedInstruction
       AND (MessageKey=@PreviousMessageKey OR (MessageKey IS NULL AND @PreviousMessageKey IS NULL))
       AND NOT EXISTS (SELECT 1 FROM dbo.EmailDeliveries WHERE MessageKey=@MessageKey);
    SELECT w.* FROM dbo.EmailWorks AS w INNER JOIN @Claimed AS c ON c.EmailWorkID=w.EmailWorkID;
END
