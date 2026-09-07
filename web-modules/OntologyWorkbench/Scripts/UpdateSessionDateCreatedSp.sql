IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionDateCreatedSp')
BEGIN
	DROP PROCEDURE UpdateSessionDateCreatedSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[UpdateSessionDateCreatedSp]
	@SessionID [int],
	@DateCreated [datetime]
AS

	SET NOCOUNT ON

	UPDATE Sessions
	SET DateCreated = @DateCreated
	WHERE SessionID = @SessionID

GO
