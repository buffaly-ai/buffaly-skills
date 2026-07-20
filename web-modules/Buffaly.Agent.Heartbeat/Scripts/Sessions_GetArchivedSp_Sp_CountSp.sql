IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_GetArchivedSp_Sp_CountSp')
BEGIN
	DROP PROCEDURE Sessions_GetArchivedSp_Sp_CountSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Sessions_GetArchivedSp_Sp_CountSp]
	@Search [nvarchar](255)
AS

	SET NOCOUNT ON

	SELECT COUNT(*) as Total
	FROM Sessions WITH (NOLOCK)
	where ISNULL(IsArchived, 0) = 1 AND (
					[SessionID] like '%' + @Search + '%' or
					[SessionKey] like '%' + @Search + '%' or
					[AgentName] like '%' + @Search + '%' or
					[ProjectName] like '%' + @Search + '%' or
					[ProjectFilePath] like '%' + @Search + '%' or
					[Provider] like '%' + @Search + '%' or
					[ModelName] like '%' + @Search + '%' or
					[ReasoningLevel] like '%' + @Search + '%' or
					[SessionName] like '%' + @Search + '%')
GO
