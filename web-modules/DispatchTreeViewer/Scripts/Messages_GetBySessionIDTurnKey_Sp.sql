IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Messages_GetBySessionIDTurnKey_Sp')
BEGIN
	DROP PROCEDURE Messages_GetBySessionIDTurnKey_Sp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[Messages_GetBySessionIDTurnKey_Sp]
	@SessionID [int],
	@TurnKey [nvarchar](255)
AS
BEGIN
	SET NOCOUNT ON

	SELECT
		*
	FROM Messages WITH (NOLOCK)
	WHERE
		SessionID = @SessionID
		AND TurnID = @TurnKey
	ORDER BY
		MessageID ASC
END
GO
