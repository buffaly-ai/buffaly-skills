IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesBeforeBySessionIDAndMessageKeySp')
BEGIN
	DROP PROCEDURE GetMessagesBeforeBySessionIDAndMessageKeySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesBeforeBySessionIDAndMessageKeySp]
	@SessionID [int],
	@MessageKey [nvarchar](255),
	@NumRows [int]
AS
	SET NOCOUNT ON

	DECLARE @BoundedNumRows INT
	SET @BoundedNumRows = CASE
		WHEN @NumRows IS NULL OR @NumRows < 0 THEN 0
		ELSE @NumRows
	END

	;WITH Anchor AS
	(
		SELECT TOP 1 MessageID
		FROM Messages WITH (NOLOCK)
		WHERE SessionID = @SessionID
			AND MessageKey = @MessageKey
	),
	WindowRows AS
	(
		SELECT TOP (@BoundedNumRows) m.*
		FROM Messages m WITH (NOLOCK)
		CROSS JOIN Anchor a
		WHERE m.SessionID = @SessionID
			AND m.MessageID < a.MessageID
		ORDER BY m.MessageID DESC
	)
	SELECT *
	FROM WindowRows
	ORDER BY MessageID ASC
GO
