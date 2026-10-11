CREATE OR ALTER PROCEDURE dbo.CopySessionSp @SessionID int
AS
BEGIN
 SET NOCOUNT ON;
 -- A copy creates a new identity, not a cloned active lease or pending completion.
 INSERT dbo.Sessions(SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,SessionName,ParentSessionID,IsArchived,CompactionProvider,State,SessionKind,Transport,NeedsAttention,DateCreated,LastUpdated)
 SELECT SessionKey+N' - Copy',AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,SessionName,ParentSessionID,IsArchived,CompactionProvider,N'Unloaded',SessionKind,Transport,0,GETDATE(),GETDATE()
 FROM dbo.Sessions WHERE SessionID=@SessionID;
 SELECT CONVERT(int,SCOPE_IDENTITY()) AS SessionID;
END
GO
