
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkSessionSubscriptionAsEnabledSp')
BEGIN
    DROP PROCEDURE MarkSessionSubscriptionAsEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkSessionSubscriptionAsEnabledSp (
	@SessionSubscriptionID int
)
AS

    UPDATE SessionSubscriptions SET IsEnabled = 1 ,
    LastUpdated = getdate()
    WHERE SessionSubscriptionID = @SessionSubscriptionID	

GO

	