IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetProcessesSp_CountSp')
BEGIN
	DROP PROCEDURE GetProcessesSp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetProcessesSp_CountSp]
	@Search [nvarchar](255)
AS


	SET NOCOUNT ON

	
	SELECT		COUNT(*) as Total
	FROM		(
				-- Automatically generated on 4/8/2026 10:11:10 AM.
    
    SELECT *
    FROM Processes WITH (NOLOCK) 
				) sub
	where		
					[ProcessID] like '%' + @Search + '%' or
					[ProcessName] like '%' + @Search + '%' or
					[Url] like '%' + @Search + '%' or
					[Action] like '%' + @Search + '%' 
		
GO
