IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateFeatureSp')
BEGIN
	DROP PROCEDURE UpdateFeatureSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateFeatureSp]
	@FeatureID [int],
	@FeatureName [nvarchar](255),
	@Version [nvarchar](255),
	@IsEnabled [bit],
	@SettingsAssembly [nvarchar](255),
	@SettingsClass [nvarchar](255),
	@Settings [nvarchar](max),
	@Data [nvarchar](max)
AS
    
    -- Automatically generated on 4/21/2026 3:28:05 AM.
    
    UPDATE Features SET 
            [FeatureName] = @FeatureName, 
            [Version] = @Version, 
            [IsEnabled] = @IsEnabled, 
            [SettingsAssembly] = @SettingsAssembly, 
            [SettingsClass] = @SettingsClass, 
            [Settings] = @Settings, 
            [LastUpdated] = getdate(), 
            [Data] = @Data
    WHERE FeatureID = @FeatureID

GO
