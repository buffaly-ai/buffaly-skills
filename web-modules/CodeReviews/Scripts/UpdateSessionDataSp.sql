CREATE OR ALTER PROCEDURE dbo.UpdateSessionDataSp @SessionID int,@Data nvarchar(max)
AS
BEGIN
 SET NOCOUNT ON;
 UPDATE dbo.Sessions SET Data=@Data,LastUpdated=GETDATE() WHERE SessionID=@SessionID;
END
GO
