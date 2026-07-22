
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateFeatureSettingsSp')
BEGIN
    DROP PROCEDURE UpdateFeatureSettingsSp
END
GO

CREATE PROCEDURE dbo.UpdateFeatureSettingsSp (
	@FeatureID int,
	@Settings nvarchar(max)
)
AS

    UPDATE Features SET Settings = @Settings ,
    LastUpdated = getdate()
    WHERE FeatureID = @FeatureID	

GO
	