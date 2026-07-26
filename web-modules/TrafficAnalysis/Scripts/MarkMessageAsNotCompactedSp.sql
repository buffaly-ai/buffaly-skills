
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkMessageAsNotCompactedSp')
BEGIN
    DROP PROCEDURE MarkMessageAsNotCompactedSp
END
GO

CREATE PROCEDURE dbo.MarkMessageAsNotCompactedSp (
	@MessageID int
)
AS

    UPDATE Messages SET IsCompacted = 0 ,
    LastUpdated = getdate()
    WHERE MessageID = @MessageID	

GO
	