IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateMessageDateCreatedSp')
BEGIN
	DROP PROCEDURE UpdateMessageDateCreatedSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[UpdateMessageDateCreatedSp]
	@MessageID [int],
	@DateCreated [datetime]
AS

	SET NOCOUNT ON

	UPDATE Messages
	SET DateCreated = @DateCreated
	WHERE MessageID = @MessageID

GO
