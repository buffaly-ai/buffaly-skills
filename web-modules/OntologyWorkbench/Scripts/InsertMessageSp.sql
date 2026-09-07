IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'InsertMessageSp')
BEGIN
	DROP PROCEDURE InsertMessageSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertMessageSp]
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
    
    INSERT INTO Messages
    (
            [SessionID], 
            [SequenceNumber], 
            [Role], 
            [Content], 
            [ToolName], 
            [ToolArguments], 
            [CallID], 
            [DateCreated], 
            [LastUpdated], 
            [Data], 
            [IsCompacted], 
            [CompactionEpoch], 
            [MessageKey], 
            [ThreadKey], 
            [CompactionEpochKey]
    )
    VALUES
    (
            @SessionID, 
            @SequenceNumber, 
            @Role, 
            @Content, 
            @ToolName, 
            @ToolArguments, 
            @CallID, 
            getdate(), 
            getdate(), 
            @Data, 
            @IsCompacted, 
            @CompactionEpoch, 
            @MessageKey, 
            @TurnID, 
            @CompactionEpochKey
    )
    SELECT scope_identity() as MessageID

GO
