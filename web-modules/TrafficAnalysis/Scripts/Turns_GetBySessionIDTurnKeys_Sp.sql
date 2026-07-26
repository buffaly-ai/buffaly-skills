IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Turns_GetBySessionIDTurnKeys_Sp')
BEGIN
	DROP PROCEDURE Turns_GetBySessionIDTurnKeys_Sp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[Turns_GetBySessionIDTurnKeys_Sp]
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
	),
	TurnRows AS
	(
		SELECT
			m.TurnID AS TurnKey,
			MIN(CASE WHEN m.Role = 'User' THEN m.MessageID END) AS UserMessageID,
			MAX(CASE WHEN m.Role = 'Assistant' THEN m.MessageID END) AS AssistantMessageID
		FROM Messages m WITH (NOLOCK)
		INNER JOIN RequestedTurnKeys r
			ON r.TurnKey = m.TurnID
		WHERE
			m.SessionID = @SessionID
			AND NULLIF(LTRIM(RTRIM(m.TurnID)), '') IS NOT NULL
		GROUP BY
			m.TurnID
	)
	SELECT
		TurnKey,
		UserMessageID,
		AssistantMessageID
	FROM TurnRows
	WHERE
		UserMessageID IS NOT NULL
	ORDER BY
		UserMessageID ASC
END
GO
