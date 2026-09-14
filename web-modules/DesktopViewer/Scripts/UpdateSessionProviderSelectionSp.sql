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
		-- Provider edits do not own the runtime state or acknowledgement token.
		Data = JSON_MODIFY(JSON_MODIFY(@Data,
			'$.RuntimeStatus', JSON_VALUE(Data, '$.RuntimeStatus')),
			'$.LastNonRunningUtc', JSON_VALUE(Data, '$.LastNonRunningUtc')),
		LastUpdated = getdate()
	WHERE SessionID = @SessionID

GO
