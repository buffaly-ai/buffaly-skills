
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkProcessAsEnabledSp')
BEGIN
    DROP PROCEDURE MarkProcessAsEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkProcessAsEnabledSp (
	@ProcessID int
)
AS

    UPDATE Processes SET IsEnabled = 1 ,
    LastUpdated = getdate()
    WHERE ProcessID = @ProcessID	

GO

	