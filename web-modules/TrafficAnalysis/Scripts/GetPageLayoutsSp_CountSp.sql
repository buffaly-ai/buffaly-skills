IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetPageLayoutsSp_CountSp')
BEGIN
	DROP PROCEDURE GetPageLayoutsSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetPageLayoutsSp_CountSp]
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/13/2026 2:48:40 PM.
    
    SELECT *
    FROM PageLayouts WITH (NOLOCK) 
				) sub
	where		
					[PageLayoutID] like '%' + @Search + '%' or
					[Url] like '%' + @Search + '%' or
					[Handler] like '%' + @Search + '%' or
					[PageTitle] like '%' + @Search + '%' 
		
GO
