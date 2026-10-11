
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkProcessAsTimedOutSp')
BEGIN
    DROP PROCEDURE MarkProcessAsTimedOutSp
END
GO

CREATE PROCEDURE dbo.MarkProcessAsTimedOutSp (
	@ProcessID int
)
AS

    UPDATE Processes SET IsTimedOut = 1 ,
    LastUpdated = getdate()
    WHERE ProcessID = @ProcessID	

GO

	