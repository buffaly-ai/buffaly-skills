IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'TryUpdateSessionDataSp')
BEGIN
    DROP PROCEDURE TryUpdateSessionDataSp
END
GO

CREATE PROCEDURE dbo.TryUpdateSessionDataSp (
    @SessionID int,
    @ExpectedData nvarchar(max),
    @Data nvarchar(max)
)
AS
    SET NOCOUNT ON

    UPDATE Sessions
    SET Data = @Data,
        LastUpdated = GETDATE()
    WHERE SessionID = @SessionID
      AND ((Data = @ExpectedData) OR (Data IS NULL AND @ExpectedData IS NULL))

    SELECT CONVERT(int, @@ROWCOUNT) AS UpdatedRows
GO