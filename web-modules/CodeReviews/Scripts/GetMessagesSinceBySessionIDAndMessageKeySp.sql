IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesSinceBySessionIDAndMessageKeySp')
BEGIN
	DROP PROCEDURE GetMessagesSinceBySessionIDAndMessageKeySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesSinceBySessionIDAndMessageKeySp]
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
	)
	SELECT TOP (@BoundedNumRows) m.*
	FROM Messages m WITH (NOLOCK)
	CROSS JOIN Anchor a
	WHERE m.SessionID = @SessionID
		AND m.MessageID > a.MessageID
	ORDER BY m.MessageID ASC
GO
