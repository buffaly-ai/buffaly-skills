CREATE OR ALTER PROCEDURE dbo.InsertSessionSp
 @SessionKey nvarchar(255),@AgentName nvarchar(255),@ProjectName nvarchar(255),@ProjectFilePath nvarchar(255),
 @Provider nvarchar(255),@ModelName nvarchar(255),@ReasoningLevel nvarchar(255),@PromptContext nvarchar(max),
 @Data nvarchar(max),@SessionName nvarchar(255),@ParentSessionID int,@IsArchived bit,
 @State nvarchar(255),@SessionKind nvarchar(255),@Transport nvarchar(255)
AS
BEGIN
 SET NOCOUNT ON;
 IF @State NOT IN(N'Unknown',N'Unloaded',N'Loaded',N'Stopped',N'Completed',N'Errored') OR @State IS NULL
  THROW 51121,'Creation requires explicit nonrunning State; admission uses runtime owner.',1;
 IF @SessionKind IS NULL OR NULLIF(@Transport,N'') IS NULL OR @SessionName IS NULL
  THROW 51121,'Session classification and identity are required.',1;
 INSERT dbo.Sessions(SessionKey,AgentName,ProjectName,ProjectFilePath,Provider,ModelName,ReasoningLevel,PromptContext,Data,SessionName,ParentSessionID,IsArchived,State,SessionKind,Transport,NeedsAttention,DateCreated,LastUpdated)
 VALUES(@SessionKey,@AgentName,@ProjectName,@ProjectFilePath,@Provider,@ModelName,@ReasoningLevel,@PromptContext,@Data,@SessionName,@ParentSessionID,@IsArchived,@State,@SessionKind,@Transport,0,GETDATE(),GETDATE());
 SELECT CONVERT(int,SCOPE_IDENTITY()) AS SessionID;
END
GO
