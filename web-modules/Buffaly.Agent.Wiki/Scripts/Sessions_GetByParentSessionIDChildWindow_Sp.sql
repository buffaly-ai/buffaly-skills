CREATE OR ALTER PROCEDURE dbo.Sessions_GetByParentSessionIDChildWindow_Sp
	@ParentSessionID int,
	@NumRows int
AS
BEGIN
	SET NOCOUNT ON;
	IF @ParentSessionID IS NULL OR @ParentSessionID <= 0 OR @NumRows IS NULL OR @NumRows < 1 OR @NumRows > 201
		THROW 50001, 'A positive parent and child window of 1..201 are required.', 1;
	SELECT TOP (@NumRows) *
	FROM dbo.Sessions
	WHERE ParentSessionID = @ParentSessionID
		AND IsArchived = 0
		AND SessionKey IS NOT NULL
		AND SessionKey LIKE N'%[^' + NCHAR(9) + NCHAR(10) + NCHAR(11) + NCHAR(12) + NCHAR(13) + NCHAR(32) + NCHAR(133) + NCHAR(160) + NCHAR(5760) + NCHAR(8192) + NCHAR(8193) + NCHAR(8194) + NCHAR(8195) + NCHAR(8196) + NCHAR(8197) + NCHAR(8198) + NCHAR(8199) + NCHAR(8200) + NCHAR(8201) + NCHAR(8202) + NCHAR(8232) + NCHAR(8233) + NCHAR(8239) + NCHAR(8287) + NCHAR(12288) + N']%' COLLATE Latin1_General_100_BIN2
	ORDER BY LastUpdated DESC, SessionID DESC;
END;
GO
