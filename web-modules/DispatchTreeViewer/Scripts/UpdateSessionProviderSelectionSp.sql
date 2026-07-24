IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionProviderSelectionSp')
BEGIN
	DROP PROCEDURE UpdateSessionProviderSelectionSp
END
GO

CREATE PROCEDURE [dbo].[UpdateSessionProviderSelectionSp]
	@SessionID int,
	@Provider nvarchar(255),
	@ModelName nvarchar(255),
	@ReasoningLevel nvarchar(255),
	@Data nvarchar(max)
AS

	UPDATE Sessions
	SET Provider = @Provider,
		ModelName = @ModelName,
		ReasoningLevel = @ReasoningLevel,
		Data = @Data,
		LastUpdated = getdate()
	WHERE SessionID = @SessionID

GO
