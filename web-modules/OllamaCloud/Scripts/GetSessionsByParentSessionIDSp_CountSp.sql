IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionsByParentSessionIDSp_CountSp')
BEGIN
	DROP PROCEDURE GetSessionsByParentSessionIDSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionsByParentSessionIDSp_CountSp]
	@ParentSessionID [int],
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/9/2026 2:12:03 PM.
    
    SELECT *
    FROM Sessions WITH (NOLOCK) 
    WHERE [ParentSessionID] = @ParentSessionID
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
