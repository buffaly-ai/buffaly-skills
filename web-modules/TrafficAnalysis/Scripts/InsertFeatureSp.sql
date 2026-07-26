IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'InsertFeatureSp')
BEGIN
	DROP PROCEDURE InsertFeatureSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertFeatureSp]
	@FeatureName [nvarchar](255),
	@Version [nvarchar](255),
	@IsEnabled [bit],
	@SettingsAssembly [nvarchar](255),
	@SettingsClass [nvarchar](255),
	@Settings [nvarchar](max),
	@Data [nvarchar](max)
AS
    
    -- Automatically generated on 4/21/2026 3:28:05 AM.
    
    INSERT INTO Features
    (
            [FeatureName], 
            [Version], 
            [IsEnabled], 
            [SettingsAssembly], 
            [SettingsClass], 
            [Settings], 
            [DateCreated], 
            [LastUpdated], 
            [Data]
    )
    VALUES
    (
            @FeatureName, 
            @Version, 
            @IsEnabled, 
            @SettingsAssembly, 
            @SettingsClass, 
            @Settings, 
            getdate(), 
            getdate(), 
            @Data
    )
    SELECT scope_identity() as FeatureID

GO
