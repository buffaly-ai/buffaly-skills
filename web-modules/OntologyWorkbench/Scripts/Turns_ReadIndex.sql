-- Historical population and repair are completed offline; no runtime compatibility routines survive.
DROP PROCEDURE IF EXISTS dbo.Turns_MaintainIndex;
DROP PROCEDURE IF EXISTS dbo.Turns_PopulateUnlinked;
DROP PROCEDURE IF EXISTS dbo.Turns_RepairPage;
GO
CREATE OR ALTER PROCEDURE dbo.Turns_ReadIndexPage
 @SessionID int,@SkipRows int,@NumRows int,@BeforeTime datetime2(7)=NULL,@BeforeMessageID int=NULL,@UserOnly bit=0
AS
BEGIN
 SET NOCOUNT ON;
 IF @SkipRows<0 OR @NumRows<1 OR @NumRows>5000 THROW 51092,'Invalid Turns index page bounds.',1;
 IF (@BeforeTime IS NULL AND @BeforeMessageID IS NOT NULL) OR (@BeforeTime IS NOT NULL AND @BeforeMessageID IS NULL) THROW 51092,'Both Turns index page boundary values are required.',1;
 -- Persisted Turns owns summary metadata; message history is never a paging fallback.
 DECLARE @Total bigint=(SELECT COUNT_BIG(*) FROM dbo.Turns WHERE SessionID=@SessionID AND (@UserOnly=0 OR UserMessageID IS NOT NULL));
 DECLARE @Filtered bigint=(SELECT COUNT_BIG(*) FROM dbo.Turns WHERE SessionID=@SessionID AND (@UserOnly=0 OR UserMessageID IS NOT NULL) AND (@BeforeTime IS NULL OR DisplayOrderAtUtc<@BeforeTime OR(DisplayOrderAtUtc=@BeforeTime AND FirstMessageID<@BeforeMessageID)));
 SELECT @Total AS TotalTurns,CAST(CASE WHEN @SkipRows+@NumRows<@Filtered THEN 1 ELSE 0 END AS bit) AS HasMore;
 SELECT TurnID,SessionID,TurnKey,DisplayOrderAtUtc,FirstMessageID,UserMessageID,AssistantMessageID,LastErrorMessageID,TerminalMessageID FROM dbo.Turns
 WHERE SessionID=@SessionID AND (@UserOnly=0 OR UserMessageID IS NOT NULL)
 AND (@BeforeTime IS NULL OR DisplayOrderAtUtc<@BeforeTime OR(DisplayOrderAtUtc=@BeforeTime AND FirstMessageID<@BeforeMessageID))
 ORDER BY DisplayOrderAtUtc DESC,FirstMessageID DESC OFFSET @SkipRows ROWS FETCH NEXT @NumRows ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE dbo.Turns_ReadIndexTurn @SessionID int,@TurnKey nvarchar(255)
AS
BEGIN
 SET NOCOUNT ON;
 SELECT TurnID,SessionID,TurnKey,DisplayOrderAtUtc,FirstMessageID,UserMessageID,AssistantMessageID,LastErrorMessageID,TerminalMessageID
 FROM dbo.Turns WHERE SessionID=@SessionID AND TurnKey=@TurnKey;
END
GO
CREATE OR ALTER PROCEDURE dbo.Turns_ReadIndexDetailRows @SessionID int,@TurnKey nvarchar(255),@NumRows int
AS
BEGIN
	SET NOCOUNT ON;
	IF @NumRows<1 OR @NumRows>5001 THROW 51092,'Invalid Turns detail bound.',1;
	-- The logical session/key owns history. TurnRowID is only a provider-local index and may be stale.
	SELECT * FROM (SELECT TOP (@NumRows) m.* FROM dbo.Messages m
	WHERE m.SessionID=@SessionID AND m.TurnID=@TurnKey ORDER BY m.DateCreated DESC,m.MessageID DESC) newest ORDER BY DateCreated,MessageID;
END
GO
