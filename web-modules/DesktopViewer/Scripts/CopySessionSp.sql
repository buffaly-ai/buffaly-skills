IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'CopySessionSp')
BEGIN
	DROP PROCEDURE CopySessionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CopySessionSp]
	@SessionID [int]
AS
    
    -- Automatically generated on 4/9/2026 2:12:03 PM.
    
    INSERT INTO Sessions
    (
            [SessionKey], 
            [AgentName], 
            [ProjectName], 
            [ProjectFilePath], 
            [Provider], 
            [ModelName], 
            [ReasoningLevel], 
            [PromptContext], 
            [DateCreated], 
            [LastUpdated], 
            [Data], 
            [SessionName], 
            [ParentSessionID], 
            [IsArchived]
    )
    SELECT
            [SessionKey] + ' - Copy', 
            [AgentName], 
            [ProjectName], 
            [ProjectFilePath], 
            [Provider], 
            [ModelName], 
            [ReasoningLevel], 
            [PromptContext], 
            getdate(), 
            getdate(), 
            [Data], 
            [SessionName], 
            [ParentSessionID], 
            [IsArchived]
    FROM [Sessions]
    WHERE SessionID = @SessionID
    SELECT scope_identity() as SessionID

GO
