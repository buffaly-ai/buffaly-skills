IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'CopyMessageSp')
BEGIN
	DROP PROCEDURE CopyMessageSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CopyMessageSp]
	@MessageID [int]
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
            [TurnID], 
            [CompactionEpochKey]
    )
    SELECT
            [SessionID], 
            [SequenceNumber], 
            [Role], 
            [Content], 
            [ToolName], 
            [ToolArguments], 
            [CallID], 
            getdate(), 
            getdate(), 
            [Data], 
            [IsCompacted], 
            [CompactionEpoch], 
            [MessageKey] + ' - Copy', 
            [TurnID], 
            [CompactionEpochKey]
    FROM [Messages]
    WHERE MessageID = @MessageID
    SELECT scope_identity() as MessageID

GO
