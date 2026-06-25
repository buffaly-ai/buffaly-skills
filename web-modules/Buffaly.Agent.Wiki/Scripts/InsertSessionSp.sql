IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'InsertSessionSp')
BEGIN
	DROP PROCEDURE InsertSessionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertSessionSp]
	@SessionKey [nvarchar](255),
	@AgentName [nvarchar](255),
	@ProjectName [nvarchar](255),
	@ProjectFilePath [nvarchar](255),
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@ReasoningLevel [nvarchar](255),
	@PromptContext [nvarchar](max),
	@Data [nvarchar](max),
	@SessionName [nvarchar](255),
	@ParentSessionID [int],
	@IsArchived [bit]
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
    VALUES
    (
            @SessionKey, 
            @AgentName, 
            @ProjectName, 
            @ProjectFilePath, 
            @Provider, 
            @ModelName, 
            @ReasoningLevel, 
            @PromptContext, 
            getdate(), 
            getdate(), 
            @Data, 
            @SessionName, 
            @ParentSessionID, 
            @IsArchived
    )
    SELECT scope_identity() as SessionID

GO
