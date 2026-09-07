
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkPageLayoutAsNotEnabledSp')
BEGIN
    DROP PROCEDURE MarkPageLayoutAsNotEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkPageLayoutAsNotEnabledSp (
	@PageLayoutID int
)
AS

    UPDATE PageLayouts SET IsEnabled = 0 ,
    LastUpdated = getdate()
    WHERE PageLayoutID = @PageLayoutID	

GO
	