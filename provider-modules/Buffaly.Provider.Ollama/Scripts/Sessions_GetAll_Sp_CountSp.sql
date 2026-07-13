IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_GetAll_Sp_CountSp')
BEGIN
	DROP PROCEDURE Sessions_GetAll_Sp_CountSp
END
GO
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Sessions_GetAll_Sp_CountSp]
	@Search [nvarchar](255)
AS

	SET NOCOUNT ON

	DECLARE @SearchPattern NVARCHAR(257)
	set @SearchPattern = '%' + ISNULL(@Search, '') + '%';

	SELECT COUNT(*) as Total
	FROM Sessions WITH (NOLOCK)
	where ISNULL(IsArchived, 0) = 0 AND (
					CONVERT(NVARCHAR(50), [SessionID]) like @SearchPattern or
					[SessionKey] like @SearchPattern or
					[AgentName] like @SearchPattern or
					[ProjectName] like @SearchPattern or
					[ProjectFilePath] like @SearchPattern or
					[Provider] like @SearchPattern or
					[ModelName] like @SearchPattern or
					[ReasoningLevel] like @SearchPattern or
					[SessionName] like @SearchPattern)
GO
