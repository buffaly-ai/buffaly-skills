
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateProcessRunDataSp')
BEGIN
    DROP PROCEDURE UpdateProcessRunDataSp
END
GO

CREATE PROCEDURE dbo.UpdateProcessRunDataSp (
	@ProcessID int,
	@RunData nvarchar(max)
)
AS

    UPDATE Processes SET RunData = @RunData ,
    LastUpdated = getdate()
    WHERE ProcessID = @ProcessID	

GO
	