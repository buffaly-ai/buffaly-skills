IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'RemoveFeatureSp')
BEGIN
	DROP PROCEDURE RemoveFeatureSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RemoveFeatureSp]
	@FeatureID [int]
AS
    
    -- Automatically generated on 4/21/2026 3:28:05 AM.
    
    DELETE FROM Features WHERE FeatureID = @FeatureID

GO
