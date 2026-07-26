IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetFeatureByFeatureNameSp')
BEGIN
	DROP PROCEDURE GetFeatureByFeatureNameSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetFeatureByFeatureNameSp]
	@FeatureName [nvarchar](255)
AS
    
    -- Automatically generated on 4/21/2026 3:28:05 AM.
    
    SELECT *
    FROM Features WITH (NOLOCK) 
    WHERE [FeatureName] = @FeatureName
GO
