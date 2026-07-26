
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkProcessAsNotEnabledSp')
BEGIN
    DROP PROCEDURE MarkProcessAsNotEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkProcessAsNotEnabledSp (
	@ProcessID int
)
AS

    UPDATE Processes SET IsEnabled = 0 ,
    LastUpdated = getdate()
    WHERE ProcessID = @ProcessID	

GO
	