IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Messages_GetLatestMessageKeyBySessionID_Sp')
BEGIN
	DROP PROCEDURE Messages_GetLatestMessageKeyBySessionID_Sp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE PROCEDURE [dbo].[Messages_GetLatestMessageKeyBySessionID_Sp]
	@SessionID [int]
AS
BEGIN
	SET NOCOUNT ON

	SELECT TOP 1
		MessageKey
	FROM Messages WITH (NOLOCK)
	WHERE
		SessionID = @SessionID
	ORDER BY
		MessageID DESC
END
GO
