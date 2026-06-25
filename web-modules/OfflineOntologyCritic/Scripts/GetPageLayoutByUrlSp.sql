IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetPageLayoutByUrlSp')
BEGIN
	DROP PROCEDURE GetPageLayoutByUrlSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetPageLayoutByUrlSp]
	@Url [nvarchar](512)
AS
    
    -- Automatically generated on 4/13/2026 2:48:40 PM.
    
    SELECT *
    FROM PageLayouts WITH (NOLOCK) 
    WHERE [Url] = @Url
GO
