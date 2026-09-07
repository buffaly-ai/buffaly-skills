
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkSessionAsNotArchivedSp')
BEGIN
    DROP PROCEDURE MarkSessionAsNotArchivedSp
END
GO

CREATE PROCEDURE dbo.MarkSessionAsNotArchivedSp (
	@SessionID int
)
AS

    UPDATE Sessions SET IsArchived = 0 ,
    LastUpdated = getdate()
    WHERE SessionID = @SessionID	

GO
	