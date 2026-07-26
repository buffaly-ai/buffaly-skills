
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkSessionSubscriptionAsNotEnabledSp')
BEGIN
    DROP PROCEDURE MarkSessionSubscriptionAsNotEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkSessionSubscriptionAsNotEnabledSp (
	@SessionSubscriptionID int
)
AS

    UPDATE SessionSubscriptions SET IsEnabled = 0 ,
    LastUpdated = getdate()
    WHERE SessionSubscriptionID = @SessionSubscriptionID	

GO
	