
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateMessageDataSp')
BEGIN
    DROP PROCEDURE UpdateMessageDataSp
END
GO

CREATE PROCEDURE dbo.UpdateMessageDataSp (
	@MessageID int,
	@Data nvarchar(max)
)
AS

    UPDATE Messages SET Data = @Data ,
    LastUpdated = getdate()
    WHERE MessageID = @MessageID	

GO
	