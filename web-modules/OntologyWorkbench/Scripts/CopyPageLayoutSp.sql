IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'CopyPageLayoutSp')
BEGIN
	DROP PROCEDURE CopyPageLayoutSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CopyPageLayoutSp]
	@PageLayoutID [int]
AS
    
    -- Automatically generated on 4/13/2026 2:48:40 PM.
    
    INSERT INTO PageLayouts
    (
            [Url], 
            [Handler], 
            [IsEnabled], 
            [DateCreated], 
            [LastUpdated], 
            [PageTitle], 
            [SiteID]
    )
    SELECT
            [Url] + ' - Copy', 
            [Handler], 
            [IsEnabled], 
            getdate(), 
            getdate(), 
            [PageTitle], 
            [SiteID]
    FROM [PageLayouts]
    WHERE PageLayoutID = @PageLayoutID
    SELECT scope_identity() as PageLayoutID

GO
