
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateFeatureDataSp')
BEGIN
    DROP PROCEDURE UpdateFeatureDataSp
END
GO

CREATE PROCEDURE dbo.UpdateFeatureDataSp (
	@FeatureID int,
	@Data nvarchar(max)
)
AS

    UPDATE Features SET Data = @Data ,
    LastUpdated = getdate()
    WHERE FeatureID = @FeatureID	

GO
	