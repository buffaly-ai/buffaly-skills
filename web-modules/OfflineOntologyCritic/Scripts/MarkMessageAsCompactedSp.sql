
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkMessageAsCompactedSp')
BEGIN
    DROP PROCEDURE MarkMessageAsCompactedSp
END
GO

CREATE PROCEDURE dbo.MarkMessageAsCompactedSp (
	@MessageID int
)
AS

    UPDATE Messages SET IsCompacted = 1 ,
    LastUpdated = getdate()
    WHERE MessageID = @MessageID	

GO

	