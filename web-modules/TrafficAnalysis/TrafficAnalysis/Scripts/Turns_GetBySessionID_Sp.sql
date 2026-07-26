IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Turns_GetBySessionID_Sp')
BEGIN
	DROP PROCEDURE Turns_GetBySessionID_Sp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[Turns_GetBySessionID_Sp]
	@SessionID [int],
	@SkipRows [int],
	@NumRows [int]
AS
BEGIN
	SET NOCOUNT ON

	;WITH TurnRows AS
	(
		SELECT
			m.TurnID AS TurnKey,
			MIN(CASE WHEN m.Role = 'User' THEN m.MessageID END) AS UserMessageID,
			MAX(CASE WHEN m.Role = 'Assistant' THEN m.MessageID END) AS AssistantMessageID
		FROM Messages m WITH (NOLOCK)
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
		UserMessageID DESC
	OFFSET @SkipRows ROWS
	FETCH NEXT @NumRows ROWS ONLY
END
GO
