IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateMessagesCompactionEpochByMessageKeysJsonSp')
BEGIN
	DROP PROCEDURE UpdateMessagesCompactionEpochByMessageKeysJsonSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[UpdateMessagesCompactionEpochByMessageKeysJsonSp]
	@SessionID [int],
	@MessageKeysJson [nvarchar](max),
	@CompactionEpoch [int],
	@CompactionEpochKey [nvarchar](255)
AS

	SET NOCOUNT ON

	DECLARE @Keys TABLE (MessageKey nvarchar(255) NOT NULL PRIMARY KEY)

	INSERT INTO @Keys (MessageKey)
	SELECT DISTINCT LTRIM(RTRIM([value]))
	FROM OPENJSON(@MessageKeysJson)
	WHERE LEN(LTRIM(RTRIM([value]))) > 0

	UPDATE m
	SET CompactionEpoch = @CompactionEpoch,
		CompactionEpochKey = @CompactionEpochKey,
		LastUpdated = GETDATE()
	FROM Messages m
	INNER JOIN @Keys k ON k.MessageKey = m.MessageKey
	WHERE m.SessionID = @SessionID

	SELECT m.*
	FROM Messages m WITH (NOLOCK)
	INNER JOIN @Keys k ON k.MessageKey = m.MessageKey
	WHERE m.SessionID = @SessionID
	ORDER BY m.SequenceNumber ASC, m.MessageID ASC

GO
