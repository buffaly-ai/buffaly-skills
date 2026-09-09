IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'TryUpdateFeatureSettingsSp')
BEGIN
    DROP PROCEDURE TryUpdateFeatureSettingsSp
END
GO

CREATE PROCEDURE dbo.TryUpdateFeatureSettingsSp (
    @FeatureID int,
    @ExpectedSettings nvarchar(max),
    @Settings nvarchar(max)
)
AS
    SET NOCOUNT ON

    UPDATE Features
    SET Settings = @Settings,
        LastUpdated = GETDATE()
    WHERE FeatureID = @FeatureID
      AND ((DATALENGTH(Settings) = DATALENGTH(@ExpectedSettings)
            AND Settings COLLATE Latin1_General_100_BIN2 = @ExpectedSettings COLLATE Latin1_General_100_BIN2)
           OR (Settings IS NULL AND @ExpectedSettings IS NULL))

    SELECT CONVERT(int, @@ROWCOUNT) AS UpdatedRows
GO
