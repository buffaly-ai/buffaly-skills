
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateMessageToolArgumentsSp')
BEGIN
    DROP PROCEDURE UpdateMessageToolArgumentsSp
END
GO

CREATE PROCEDURE dbo.UpdateMessageToolArgumentsSp (
	@MessageID int,
	@ToolArguments nvarchar(max)
)
AS

    UPDATE Messages SET ToolArguments = @ToolArguments ,
    LastUpdated = getdate()
    WHERE MessageID = @MessageID	

GO
	