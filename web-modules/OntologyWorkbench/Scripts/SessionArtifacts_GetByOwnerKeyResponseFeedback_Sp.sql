CREATE OR ALTER PROCEDURE dbo.SessionArtifacts_GetByOwnerKeyResponseFeedback_Sp
 @OwnerKey nvarchar(255), @SessionID int, @MessageKey nvarchar(255),
 @Mode nvarchar(255), @Vote nvarchar(255), @SinceUtc nvarchar(255), @BeforeID int, @NumRows int
AS
BEGIN
 SET NOCOUNT ON;
 IF @OwnerKey IS NULL OR @Mode IS NULL OR @Mode NOT IN ('current','events') OR @BeforeID < 0 OR @NumRows NOT BETWEEN 1 AND 201
  THROW 51000, 'Invalid feedback page.', 1;
 ;WITH Owned AS (
  SELECT a.*,
   ROW_NUMBER() OVER (PARTITION BY a.ArtifactName ORDER BY a.SessionArtifactID DESC) AS FeedbackRank
  FROM dbo.SessionArtifacts a
  WHERE a.ArtifactType = 'ResponseFeedback.v1'
   AND JSON_VALUE(a.ContentData, '$.OwnerKey') COLLATE Latin1_General_100_BIN2 = @OwnerKey COLLATE Latin1_General_100_BIN2
   AND (@SessionID IS NULL OR a.SessionID = @SessionID)
   AND (@MessageKey IS NULL OR JSON_VALUE(a.ContentData, '$.MessageKey') COLLATE Latin1_General_100_BIN2 = @MessageKey COLLATE Latin1_General_100_BIN2)
 )
 SELECT TOP (@NumRows) SessionArtifactID,SessionID,SourceMessageID,ArtifactType,ArtifactName,FilePath,Summary,
  ContentData,MimeType,DateCreated,LastUpdated,Data
 FROM Owned
 WHERE (@Mode = 'events' OR FeedbackRank = 1)
  AND (@Mode = 'events' OR JSON_VALUE(ContentData, '$.Vote') <> 'clear')
  AND (@Vote IS NULL OR JSON_VALUE(ContentData, '$.Vote') COLLATE Latin1_General_100_BIN2 = @Vote COLLATE Latin1_General_100_BIN2)
  AND (@SinceUtc IS NULL OR JSON_VALUE(ContentData, '$.RecordedUtc') >= @SinceUtc)
  AND (@BeforeID = 0 OR SessionArtifactID < @BeforeID)
 ORDER BY SessionArtifactID DESC;
END
GO
