CREATE OR ALTER PROCEDURE dbo.UpdateSessionSp
 @SessionID int,@SessionKey nvarchar(255),@AgentName nvarchar(255),@ProjectName nvarchar(255),@ProjectFilePath nvarchar(255),
 @Provider nvarchar(255),@ModelName nvarchar(255),@ReasoningLevel nvarchar(255),@PromptContext nvarchar(max),@Data nvarchar(max),
 @SessionName nvarchar(255),@ParentSessionID int,@IsArchived bit
AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.Sessions SET SessionKey=@SessionKey,AgentName=@AgentName,ProjectName=@ProjectName,ProjectFilePath=@ProjectFilePath,
  Provider=@Provider,ModelName=@ModelName,ReasoningLevel=@ReasoningLevel,PromptContext=@PromptContext,Data=@Data,
  SessionName=@SessionName,ParentSessionID=@ParentSessionID,IsArchived=@IsArchived,LastUpdated=GETDATE()
 WHERE SessionID=@SessionID;
END
GO
