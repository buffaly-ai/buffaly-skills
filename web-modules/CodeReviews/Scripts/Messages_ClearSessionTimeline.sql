CREATE OR ALTER PROCEDURE dbo.Messages_ClearSessionTimeline
	@SessionID int
AS
BEGIN
	SET NOCOUNT ON;
	SET XACT_ABORT ON;
	DECLARE @DeletedMessages int,@DeletedTurns int;
	BEGIN TRANSACTION;
	DELETE dbo.Messages WHERE SessionID=@SessionID;
	SET @DeletedMessages=@@ROWCOUNT;
	DELETE dbo.Turns WHERE SessionID=@SessionID;
	SET @DeletedTurns=@@ROWCOUNT;
	COMMIT;
	SELECT @DeletedMessages AS DeletedMessages,@DeletedTurns AS DeletedTurns;
END
GO
