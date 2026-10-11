IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionsSp_CountSp')
BEGIN
	DROP PROCEDURE GetSessionsSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionsSp_CountSp]
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/9/2026 2:12:03 PM.
    
    SELECT *
    FROM Sessions WITH (NOLOCK) 

				) sub
	where		
					[SessionID] like '%' + @Search + '%' or
					[SessionKey] like '%' + @Search + '%' or
					[AgentName] like '%' + @Search + '%' or
					[ProjectName] like '%' + @Search + '%' or
					[ProjectFilePath] like '%' + @Search + '%' or
					[Provider] like '%' + @Search + '%' or
					[ModelName] like '%' + @Search + '%' or
					[ReasoningLevel] like '%' + @Search + '%' or
					[SessionName] like '%' + @Search + '%' 
		
GO
