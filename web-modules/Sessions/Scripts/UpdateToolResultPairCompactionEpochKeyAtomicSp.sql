IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateToolResultPairCompactionEpochKeyAtomicSp')
BEGIN
	DROP PROCEDURE UpdateToolResultPairCompactionEpochKeyAtomicSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateToolResultPairCompactionEpochKeyAtomicSp]
	@SessionID [int],
	@ToolCallMessageKey [nvarchar](255),
	@ToolResultMessageKey [nvarchar](255),
	@SourceCompactionEpoch [int],
	@SourceCompactionEpochKey [nvarchar](255),
	@TargetCompactionEpochKey [nvarchar](255)
AS
BEGIN
	SET NOCOUNT ON

	UPDATE Messages
	SET CompactionEpochKey = @TargetCompactionEpochKey,
		LastUpdated = GETDATE()
	WHERE SessionID = @SessionID
		AND CompactionEpoch = @SourceCompactionEpoch
		AND CompactionEpochKey = @SourceCompactionEpochKey
		AND ((MessageKey = @ToolCallMessageKey AND Role = 'ToolCall')
			OR (MessageKey = @ToolResultMessageKey AND Role = 'Tools'))
		AND 2 =
		(
			SELECT COUNT(*)
			FROM Messages
			WHERE SessionID = @SessionID
				AND CompactionEpoch = @SourceCompactionEpoch
				AND CompactionEpochKey = @SourceCompactionEpochKey
				AND ((MessageKey = @ToolCallMessageKey AND Role = 'ToolCall')
					OR (MessageKey = @ToolResultMessageKey AND Role = 'Tools'))
		)

	SELECT @@ROWCOUNT AS UpdatedRows
END
GO
