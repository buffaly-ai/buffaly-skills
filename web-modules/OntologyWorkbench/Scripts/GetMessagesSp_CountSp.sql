IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesSp_CountSp')
BEGIN
	DROP PROCEDURE GetMessagesSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesSp_CountSp]
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	DECLARE @SearchPattern nvarchar(260) = '%' + @Search + '%'
	DECLARE @SearchMessageID int = TRY_CONVERT(int, @Search)

	IF @Search IS NULL OR LTRIM(RTRIM(@Search)) = ''
	BEGIN
		SELECT COUNT_BIG(*) as Total
		FROM Messages WITH (NOLOCK)
		RETURN
	END
	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/10/2026 7:48:51 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
				) sub
	where		
					(@SearchMessageID IS NOT NULL AND [MessageID] = @SearchMessageID) or
					[Role] like @SearchPattern or
					[ToolName] like @SearchPattern or
					[CallID] like @SearchPattern or
					[MessageKey] like @SearchPattern or
					[CompactionEpochKey] like @SearchPattern or
					[TurnID] like @SearchPattern 
		
GO
