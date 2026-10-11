CREATE OR ALTER PROCEDURE dbo.Message_UpdateDataGuarded_Sp @MessageID int,@Data nvarchar(max)
AS
BEGIN
	SET NOCOUNT ON;
	UPDATE dbo.Messages SET Data=@Data,LastUpdated=GETDATE()
	WHERE MessageID=@MessageID
	  AND (Role<>N'Lifecycle' OR ((TurnID IS NULL OR DATALENGTH(TurnID)=0) AND TurnRowID IS NULL)
		OR NOT EXISTS (SELECT CONVERT(varbinary(max),Data) EXCEPT SELECT CONVERT(varbinary(max),@Data)));
	IF @@ROWCOUNT=0 AND EXISTS(SELECT 1 FROM dbo.Messages WHERE MessageID=@MessageID)
		THROW 51442,'Linked Lifecycle execution evidence cannot be changed through UpdateMessageData.',1;
END
GO
