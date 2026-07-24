
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkProcessAsRunningSp')
BEGIN
    DROP PROCEDURE MarkProcessAsRunningSp
END
GO

CREATE PROCEDURE dbo.MarkProcessAsRunningSp (
	@ProcessID int
)
AS

    UPDATE Processes SET IsRunning = 1,
    RunStarted = getdate(),
    LastUpdated = getdate()
    WHERE ProcessID = @ProcessID
        AND IsRunning = 0

    SELECT CONVERT(int, @@ROWCOUNT) AS Claimed

GO

