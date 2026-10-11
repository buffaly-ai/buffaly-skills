IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessageByMessageIDSp')
BEGIN
	DROP PROCEDURE GetMessageByMessageIDSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessageByMessageIDSp]
	@MessageID [int]
AS
BEGIN
	SET NOCOUNT ON;

	SELECT TOP 1
		MessageID,
		SessionID,
		SequenceNumber,
		Role,
		Content,
		ToolName,
		ToolArguments,
		CallID,
		DateCreated,
		LastUpdated,
		Data
	FROM dbo.Messages WITH (NOLOCK)
	WHERE MessageID = @MessageID;
END
GO
