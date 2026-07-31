IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'RemovePageLayoutSp')
BEGIN
	DROP PROCEDURE RemovePageLayoutSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RemovePageLayoutSp]
	@PageLayoutID [int]
AS
    
    -- Automatically generated on 4/13/2026 2:48:40 PM.
    
    DELETE FROM PageLayouts WHERE PageLayoutID = @PageLayoutID

GO
