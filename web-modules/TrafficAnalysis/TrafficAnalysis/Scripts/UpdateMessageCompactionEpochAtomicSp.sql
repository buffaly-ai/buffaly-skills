IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateMessageCompactionEpochAtomicSp')
BEGIN
	DROP PROCEDURE UpdateMessageCompactionEpochAtomicSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[UpdateMessageCompactionEpochAtomicSp]
	@SessionID [int],
	@MessageKey [nvarchar](255),
	@CompactionEpoch [int],
	@CompactionEpochKey [nvarchar](255)
AS

	SET NOCOUNT ON

	DECLARE @MessageID [int]

	SELECT TOP 1 @MessageID = MessageID FROM Messages
	WHERE SessionID = @SessionID AND MessageKey = @MessageKey

	IF @MessageID IS NULL
	BEGIN
		SELECT 0 AS UpdatedRows
		RETURN
	END

	UPDATE Messages
	SET CompactionEpoch = @CompactionEpoch,
		CompactionEpochKey = @CompactionEpochKey,
		LastUpdated = GETDATE()
	WHERE MessageID = @MessageID

	SELECT @@ROWCOUNT AS UpdatedRows

GO
