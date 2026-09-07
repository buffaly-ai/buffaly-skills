
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'MarkPageLayoutAsEnabledSp')
BEGIN
    DROP PROCEDURE MarkPageLayoutAsEnabledSp
END
GO

CREATE PROCEDURE dbo.MarkPageLayoutAsEnabledSp (
	@PageLayoutID int
)
AS

    UPDATE PageLayouts SET IsEnabled = 1 ,
    LastUpdated = getdate()
    WHERE PageLayoutID = @PageLayoutID	

GO

	