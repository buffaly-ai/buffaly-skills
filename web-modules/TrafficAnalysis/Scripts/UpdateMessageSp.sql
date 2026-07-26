IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateMessageSp')
BEGIN
	DROP PROCEDURE UpdateMessageSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateMessageSp]
	@MessageID [int],
	@SessionID [int],
	@SequenceNumber [int],
	@Role [nvarchar](255),
	@Content [nvarchar](max),
	@ToolName [nvarchar](255),
	@ToolArguments [nvarchar](max),
	@CallID [nvarchar](255),
	@Data [nvarchar](max),
	@IsCompacted [bit],
	@CompactionEpoch [int],
	@MessageKey [nvarchar](255),
	@TurnID [nvarchar](255),
	@CompactionEpochKey [nvarchar](255)
AS
    
    -- Automatically generated on 4/15/2026 2:56:22 AM.
    
    UPDATE Messages SET 
            [SessionID] = @SessionID, 
            [SequenceNumber] = @SequenceNumber, 
            [Role] = @Role, 
            [Content] = @Content, 
            [ToolName] = @ToolName, 
            [ToolArguments] = @ToolArguments, 
            [CallID] = @CallID, 
            [LastUpdated] = getdate(), 
            [Data] = @Data, 
            [IsCompacted] = @IsCompacted, 
            [CompactionEpoch] = @CompactionEpoch, 
            [MessageKey] = @MessageKey, 
            [TurnID] = @TurnID, 
            [CompactionEpochKey] = @CompactionEpochKey
    WHERE MessageID = @MessageID

GO
