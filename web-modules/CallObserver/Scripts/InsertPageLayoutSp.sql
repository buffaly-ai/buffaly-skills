IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'InsertPageLayoutSp')
BEGIN
	DROP PROCEDURE InsertPageLayoutSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertPageLayoutSp]
	@Url [nvarchar](512),
	@Handler [nvarchar](512),
	@IsEnabled [bit],
	@PageTitle [nvarchar](255),
	@SiteID [int]
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
    VALUES
    (
            @Url, 
            @Handler, 
            @IsEnabled, 
            getdate(), 
            getdate(), 
            @PageTitle, 
            @SiteID
    )
    SELECT scope_identity() as PageLayoutID

GO
