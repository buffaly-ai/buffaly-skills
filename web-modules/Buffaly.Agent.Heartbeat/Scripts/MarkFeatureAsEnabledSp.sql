
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkFeatureAsEnabledSp')
BEGIN
    DROP PROCEDURE MarkFeatureAsEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkFeatureAsEnabledSp (
	@FeatureID int
)
AS

    UPDATE Features SET IsEnabled = 1 ,
    LastUpdated = getdate()
    WHERE FeatureID = @FeatureID	

GO

	