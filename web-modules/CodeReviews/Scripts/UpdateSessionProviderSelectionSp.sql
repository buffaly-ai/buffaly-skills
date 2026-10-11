CREATE OR ALTER PROCEDURE dbo.UpdateSessionProviderSelectionSp
 @SessionID int,@Provider nvarchar(255),@ModelName nvarchar(255),@ReasoningLevel nvarchar(255),@Transport nvarchar(255)
AS
BEGIN
 SET NOCOUNT ON;
 IF NULLIF(@Transport,N'') IS NULL THROW 51120,'Transport is required.',1;
 UPDATE dbo.Sessions SET Provider=@Provider,ModelName=@ModelName,ReasoningLevel=@ReasoningLevel,Transport=@Transport,LastUpdated=GETDATE()
 WHERE SessionID=@SessionID;
END
GO
