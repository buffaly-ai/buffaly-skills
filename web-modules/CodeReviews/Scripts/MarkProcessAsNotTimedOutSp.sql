
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkProcessAsNotTimedOutSp')
BEGIN
    DROP PROCEDURE MarkProcessAsNotTimedOutSp
END
GO

CREATE PROCEDURE dbo.MarkProcessAsNotTimedOutSp (
	@ProcessID int
)
AS

    UPDATE Processes SET IsTimedOut = 0 ,
    LastUpdated = getdate()
    WHERE ProcessID = @ProcessID	

GO
	