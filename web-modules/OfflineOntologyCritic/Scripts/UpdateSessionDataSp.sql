
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateSessionDataSp')
BEGIN
    DROP PROCEDURE UpdateSessionDataSp
END
GO

CREATE PROCEDURE dbo.UpdateSessionDataSp (
	@SessionID int,
	@Data nvarchar(max)
)
AS

	-- Runtime lifecycle owns status and the observed-stop token, even across stale snapshot saves.
    UPDATE Sessions SET Data = JSON_MODIFY(JSON_MODIFY(@Data,
		'$.RuntimeStatus', JSON_VALUE(Data, '$.RuntimeStatus')),
		'$.LastNonRunningUtc', JSON_VALUE(Data, '$.LastNonRunningUtc')),
    LastUpdated = getdate()
    WHERE SessionID = @SessionID	

GO
	
