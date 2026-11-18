SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
-- Read only the owned message identity, preserving legacy MessageKey equality and isolation.
CREATE OR ALTER PROCEDURE dbo.Messages_GetMessageIDBySessionIDAndMessageKey_Sp
	@SessionID int,
	@MessageKey nvarchar(255)
AS
BEGIN
	SET NOCOUNT ON;
	SELECT TOP (1) MessageID
	FROM Messages WITH (NOLOCK)
	WHERE SessionID = @SessionID
		AND MessageKey = @MessageKey;
END;
GO
