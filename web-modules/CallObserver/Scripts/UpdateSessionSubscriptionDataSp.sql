
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionSubscriptionDataSp')
BEGIN
    DROP PROCEDURE UpdateSessionSubscriptionDataSp
END
GO

CREATE PROCEDURE dbo.UpdateSessionSubscriptionDataSp (
	@SessionSubscriptionID int,
	@Data nvarchar(max)
)
AS

    UPDATE SessionSubscriptions SET Data = @Data ,
    LastUpdated = getdate()
    WHERE SessionSubscriptionID = @SessionSubscriptionID	

GO
	