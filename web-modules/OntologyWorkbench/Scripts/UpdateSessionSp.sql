IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionSp')
BEGIN
	DROP PROCEDURE UpdateSessionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateSessionSp]
	@SessionID [int],
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
    
    UPDATE Sessions SET 
            [SessionKey] = @SessionKey, 
            [AgentName] = @AgentName, 
            [ProjectName] = @ProjectName, 
            [ProjectFilePath] = @ProjectFilePath, 
            [Provider] = @Provider, 
            [ModelName] = @ModelName, 
            [ReasoningLevel] = @ReasoningLevel, 
            [PromptContext] = @PromptContext, 
            [LastUpdated] = getdate(), 
            [Data] = @Data, 
            [SessionName] = @SessionName, 
            [ParentSessionID] = @ParentSessionID, 
            [IsArchived] = @IsArchived
    WHERE SessionID = @SessionID

GO
