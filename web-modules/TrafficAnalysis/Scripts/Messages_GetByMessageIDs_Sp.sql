IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Messages_GetByMessageIDs_Sp')
BEGIN
	DROP PROCEDURE Messages_GetByMessageIDs_Sp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[Messages_GetByMessageIDs_Sp]
	@MessageIDsCsv [nvarchar](max)
AS
BEGIN
	SET NOCOUNT ON

	;WITH RequestedMessageIDs AS
	(
		SELECT DISTINCT
			TRY_CONVERT(int, LTRIM(RTRIM([value]))) AS MessageID
		FROM STRING_SPLIT(@MessageIDsCsv, ',')
		WHERE NULLIF(LTRIM(RTRIM([value])), '') IS NOT NULL
	)
	SELECT
		m.*
	FROM Messages m WITH (NOLOCK)
	INNER JOIN RequestedMessageIDs r
		ON r.MessageID = m.MessageID
	WHERE
		r.MessageID IS NOT NULL
	ORDER BY
		m.MessageID ASC
END
GO
