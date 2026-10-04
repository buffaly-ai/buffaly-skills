CREATE OR ALTER PROCEDURE dbo.Messages_UpdateSessionEventStatusSp @MessageID int,@SessionID int,@MessageKind nvarchar(255),@Data nvarchar(max)
AS
BEGIN
 SET NOCOUNT ON;
 IF NULLIF(@MessageKind,N'') IS NULL THROW 51125,'Callback MessageKind required.',1;
 UPDATE dbo.Messages SET MessageKind=@MessageKind,Data=@Data,LastUpdated=GETDATE()
 WHERE MessageID=@MessageID AND SessionID=@SessionID AND Role=N'Lifecycle' AND NULLIF(TurnID,N'') IS NULL AND TerminalOutcomeState IS NULL AND SavedWorkResume IS NULL;
 IF @@ROWCOUNT<>1 THROW 51125,'Callback lifecycle identity/ownership mismatch.',1;
END
GO
