IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetFeaturesSp_CountSp')
BEGIN
	DROP PROCEDURE GetFeaturesSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetFeaturesSp_CountSp]
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/18/2026 2:47:32 PM.
    
    SELECT *
    FROM Features WITH (NOLOCK) 
				) sub
	where		
					[FeatureID] like '%' + @Search + '%' or
					[FeatureName] like '%' + @Search + '%' or
					[Version] like '%' + @Search + '%' or
					[SettingsAssembly] like '%' + @Search + '%' or
					[SettingsClass] like '%' + @Search + '%' 
		
GO
