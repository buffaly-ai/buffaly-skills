IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdatePageLayoutSp')
BEGIN
	DROP PROCEDURE UpdatePageLayoutSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdatePageLayoutSp]
	@PageLayoutID [int],
	@Url [nvarchar](512),
	@Handler [nvarchar](512),
	@IsEnabled [bit],
	@PageTitle [nvarchar](255),
	@SiteID [int]
AS
    
    -- Automatically generated on 4/13/2026 2:48:40 PM.
    
    UPDATE PageLayouts SET 
            [Url] = @Url, 
            [Handler] = @Handler, 
            [IsEnabled] = @IsEnabled, 
            [LastUpdated] = getdate(), 
            [PageTitle] = @PageTitle, 
            [SiteID] = @SiteID
    WHERE PageLayoutID = @PageLayoutID

GO
