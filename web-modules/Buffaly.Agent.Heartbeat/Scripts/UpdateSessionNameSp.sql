IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionNameSp')
BEGIN
	DROP PROCEDURE UpdateSessionNameSp
END
GO

CREATE PROCEDURE [dbo].[UpdateSessionNameSp]
	@SessionID int,
	@SessionName nvarchar(255)
AS
BEGIN
	UPDATE Sessions
	SET SessionName = @SessionName,
		LastUpdated = getdate()
	WHERE SessionID = @SessionID
END
GO