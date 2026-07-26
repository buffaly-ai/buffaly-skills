IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetFeatureSp')
BEGIN
	DROP PROCEDURE GetFeatureSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetFeatureSp]
	@FeatureID [int]
AS
    
    -- Automatically generated on 4/21/2026 3:28:05 AM.
    
    SELECT *
    FROM Features WITH (NOLOCK) 
     WHERE FeatureID = @FeatureID

GO
