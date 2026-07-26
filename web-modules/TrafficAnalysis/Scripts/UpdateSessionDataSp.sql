
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionDataSp')
BEGIN
    DROP PROCEDURE UpdateSessionDataSp
END
GO

CREATE PROCEDURE dbo.UpdateSessionDataSp (
	@SessionID int,
	@Data nvarchar(max)
)
AS

    UPDATE Sessions SET Data = @Data ,
    LastUpdated = getdate()
    WHERE SessionID = @SessionID	

GO
	