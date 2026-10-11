IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'CopyFeatureSp')
BEGIN
	DROP PROCEDURE CopyFeatureSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CopyFeatureSp]
	@FeatureID [int]
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
    SELECT
            [FeatureName] + ' - Copy', 
            [Version], 
            [IsEnabled], 
            [SettingsAssembly], 
            [SettingsClass], 
            [Settings], 
            getdate(), 
            getdate(), 
            [Data]
    FROM [Features]
    WHERE FeatureID = @FeatureID
    SELECT scope_identity() as FeatureID

GO
