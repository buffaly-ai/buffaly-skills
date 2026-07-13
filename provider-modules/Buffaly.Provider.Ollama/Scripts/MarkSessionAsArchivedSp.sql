
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkSessionAsArchivedSp')
BEGIN
    DROP PROCEDURE MarkSessionAsArchivedSp
END
GO

CREATE PROCEDURE dbo.MarkSessionAsArchivedSp (
	@SessionID int
)
AS

    UPDATE Sessions SET IsArchived = 1 ,
    LastUpdated = getdate()
    WHERE SessionID = @SessionID	

GO

	