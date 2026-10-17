SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE dbo.Sessions_GetBySessionKeysSidebarStatus_Sp
    @SessionKeysJson nvarchar(max)
AS
BEGIN
    SET NOCOUNT ON;
    IF @SessionKeysJson IS NULL OR ISJSON(@SessionKeysJson) <> 1 OR LEFT(LTRIM(@SessionKeysJson), 1) <> N'['
        THROW 50001, 'Session keys must be a JSON array.', 1;
    IF EXISTS (SELECT 1 FROM OPENJSON(@SessionKeysJson) WHERE [type] <> 1 OR LEN([value]) = 0 OR DATALENGTH([value]) > 510)
        THROW 50001, 'Session keys must be nonempty strings of at most 255 UTF-16 code units.', 1;
    SELECT s.SessionKey, s.State, s.CurrentTurnStartedUtc
    FROM dbo.Sessions AS s
    WHERE s.IsArchived = 0 AND EXISTS
        (SELECT 1 FROM OPENJSON(@SessionKeysJson) AS k WHERE s.SessionKey = CONVERT(nvarchar(255), k.[value]));
END
GO
