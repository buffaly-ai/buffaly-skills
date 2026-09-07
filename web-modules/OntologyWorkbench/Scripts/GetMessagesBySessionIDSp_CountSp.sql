IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesBySessionIDSp_CountSp')
BEGIN
	DROP PROCEDURE GetMessagesBySessionIDSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesBySessionIDSp_CountSp]
	@SessionID [int],
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/10/2026 7:48:51 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
    WHERE [SessionID] = @SessionID
				) sub
	where		
					[MessageID] like '%' + @Search + '%' or
					[Role] like '%' + @Search + '%' or
					[ToolName] like '%' + @Search + '%' or
					[CallID] like '%' + @Search + '%' or
					[MessageKey] like '%' + @Search + '%' or
					[CompactionEpochKey] like '%' + @Search + '%' or
					[TurnID] like '%' + @Search + '%' 
		
GO
