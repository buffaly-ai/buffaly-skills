CREATE OR ALTER PROCEDURE dbo.Message_RemoveUnlinked_Sp @MessageID int
AS
BEGIN
	SET NOCOUNT ON;
	DELETE FROM dbo.Messages
	WHERE MessageID=@MessageID AND (TurnID IS NULL OR DATALENGTH(TurnID)=0) AND TurnRowID IS NULL;
	IF @@ROWCOUNT=0 AND EXISTS(SELECT 1 FROM dbo.Messages WHERE MessageID=@MessageID)
		THROW 51441,'A message belonging to a turn cannot be removed individually.',1;
END
GO
