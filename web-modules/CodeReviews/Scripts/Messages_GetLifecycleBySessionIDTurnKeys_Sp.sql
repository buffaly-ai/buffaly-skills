IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Messages_GetLifecycleBySessionIDTurnKeys_Sp')
BEGIN
	DROP PROCEDURE Messages_GetLifecycleBySessionIDTurnKeys_Sp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[Messages_GetLifecycleBySessionIDTurnKeys_Sp]
	@SessionID [int],
	@TurnKeysCsv [nvarchar](max)
AS
BEGIN
	SET NOCOUNT ON

	;WITH RequestedTurnKeys AS
	(
		SELECT DISTINCT
			LTRIM(RTRIM([value])) AS TurnKey
		FROM STRING_SPLIT(@TurnKeysCsv, ',')
		WHERE NULLIF(LTRIM(RTRIM([value])), '') IS NOT NULL
	)
	SELECT
		m.*
	FROM Messages m WITH (NOLOCK)
	INNER JOIN RequestedTurnKeys r
		ON r.TurnKey = m.TurnID
	WHERE
		m.SessionID = @SessionID
		AND m.Role = 'Lifecycle'
	ORDER BY
		m.DateCreated ASC,
		m.MessageID ASC
END
GO
