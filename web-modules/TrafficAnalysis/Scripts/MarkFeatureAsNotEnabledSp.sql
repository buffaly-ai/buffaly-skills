
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkFeatureAsNotEnabledSp')
BEGIN
    DROP PROCEDURE MarkFeatureAsNotEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkFeatureAsNotEnabledSp (
	@FeatureID int
)
AS

    UPDATE Features SET IsEnabled = 0 ,
    LastUpdated = getdate()
    WHERE FeatureID = @FeatureID	

GO
	