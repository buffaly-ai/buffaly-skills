IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionPromptContextSp')
BEGIN
	DROP PROCEDURE UpdateSessionPromptContextSp
END
GO

CREATE PROCEDURE [dbo].[UpdateSessionPromptContextSp]
	@SessionID int,
	@PromptContext nvarchar(max)
AS
BEGIN
	UPDATE Sessions
	SET PromptContext = @PromptContext,
		LastUpdated = getdate()
	WHERE SessionID = @SessionID
END
GO
