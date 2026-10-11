CREATE OR ALTER PROCEDURE dbo.Sessions_RequireScalarStorageV3Sp
AS
BEGIN
 SET NOCOUNT ON;
 IF NOT EXISTS(SELECT 1 FROM dbo.ScalarStorageRelease WHERE Version=N'20261003-ScalarStorageV3' AND Ready=1)
  THROW 51112,'Scalar storage hard cutover is incomplete.',1;
 SELECT CONVERT(bit,1) AS Ready;
END
GO
