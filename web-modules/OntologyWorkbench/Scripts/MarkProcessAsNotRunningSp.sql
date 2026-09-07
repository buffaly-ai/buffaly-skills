
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkProcessAsNotRunningSp')
BEGIN
    DROP PROCEDURE MarkProcessAsNotRunningSp
END
GO

CREATE PROCEDURE dbo.MarkProcessAsNotRunningSp (
	@ProcessID int
)
AS

    UPDATE Processes SET IsRunning = 0 ,
    LastUpdated = getdate()
    WHERE ProcessID = @ProcessID	

GO
	