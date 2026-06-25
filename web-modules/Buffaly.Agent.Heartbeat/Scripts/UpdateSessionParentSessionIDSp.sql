IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionParentSessionIDSp')
BEGIN
	DROP PROCEDURE UpdateSessionParentSessionIDSp
END
GO

CREATE PROCEDURE [dbo].[UpdateSessionParentSessionIDSp]
	@SessionID int,
	@ParentSessionID int = NULL
AS
BEGIN
	UPDATE Sessions
	SET ParentSessionID = @ParentSessionID,
		LastUpdated = getdate()
	WHERE SessionID = @SessionID
END
GO