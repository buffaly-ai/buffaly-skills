SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE dbo.Message_FindFirstTextMatch_Sp
	@SessionKey nvarchar(255), @Text nvarchar(max), @ExcludeArchived bit
AS
BEGIN
	SET NOCOUNT ON;
	IF NULLIF(@SessionKey, N'') IS NULL OR NULLIF(@Text, N'') IS NULL OR @ExcludeArchived IS NULL
		THROW 51000, 'Session key, search text and archive selection are required.', 1;
	SELECT TOP (1) m.MessageID, s.SessionKey, m.MessageKey, m.Role, m.DateCreated
	FROM dbo.Sessions s
	JOIN dbo.Messages m ON m.SessionID = s.SessionID
	WHERE s.SessionKey = @SessionKey AND (@ExcludeArchived = 0 OR s.IsArchived = 0)
		AND (CHARINDEX(@Text, m.Content) > 0 OR CHARINDEX(@Text, m.ToolArguments) > 0)
	ORDER BY m.MessageID;
END;
GO
