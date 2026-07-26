SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID(N'[dbo].[Fragments]', N'U') IS NULL
BEGIN
CREATE TABLE [dbo].[Fragments](
    [FragmentID] int IDENTITY(1,1) NOT NULL,
    [Fragment] nvarchar(max) NOT NULL,
    [ParentFragmentID] int NULL,
    [FragmentKey] nvarchar(255) NOT NULL,
    [Data] nvarchar(max) NULL,
    [DateCreated] datetime NOT NULL CONSTRAINT [DF_Fragments_DateCreated] DEFAULT (getdate()),
    [LastUpdated] datetime NOT NULL CONSTRAINT [DF_Fragments_LastUpdated] DEFAULT (getdate()),
    CONSTRAINT [PK_Fragments] PRIMARY KEY CLUSTERED ([FragmentID] ASC)
) ON [PRIMARY]
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Fragments_FragmentKey' AND object_id = OBJECT_ID(N'[dbo].[Fragments]'))
    CREATE NONCLUSTERED INDEX [IX_Fragments_FragmentKey] ON [dbo].[Fragments]([FragmentKey] ASC)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Fragments_ParentFragmentID' AND object_id = OBJECT_ID(N'[dbo].[Fragments]'))
    CREATE NONCLUSTERED INDEX [IX_Fragments_ParentFragmentID] ON [dbo].[Fragments]([ParentFragmentID] ASC)
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Fragments_ParentFragmentID')
    ALTER TABLE [dbo].[Fragments] ADD CONSTRAINT [FK_Fragments_ParentFragmentID] FOREIGN KEY([ParentFragmentID]) REFERENCES [dbo].[Fragments]([FragmentID])
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetFragmentSp') DROP PROCEDURE [dbo].[GetFragmentSp]
GO
CREATE PROCEDURE [dbo].[GetFragmentSp]
    @FragmentID int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
    FROM [dbo].[Fragments] WITH (NOLOCK)
    WHERE [FragmentID] = @FragmentID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetFragmentsSp') DROP PROCEDURE [dbo].[GetFragmentsSp]
GO
CREATE PROCEDURE [dbo].[GetFragmentsSp]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
    FROM [dbo].[Fragments] WITH (NOLOCK)
    ORDER BY [FragmentID] ASC;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetFragmentsSp_PagingSp') DROP PROCEDURE [dbo].[GetFragmentsSp_PagingSp]
GO
CREATE PROCEDURE [dbo].[GetFragmentsSp_PagingSp]
    @Search nvarchar(255),
    @SortColumn nvarchar(255),
    @SortAscending bit,
    @SkipRows int,
    @NumRows int
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FirstRow int = @SkipRows + 1;
    DECLARE @LastRow int = @SkipRows + @NumRows;

    WITH SearchTable AS
    (
        SELECT
            ROW_NUMBER() OVER
            (
                ORDER BY
                    CASE WHEN @SortColumn = 'FragmentID' AND @SortAscending = 1 THEN [FragmentID] END ASC,
                    CASE WHEN @SortColumn = 'FragmentID' AND @SortAscending = 0 THEN [FragmentID] END DESC,
                    CASE WHEN @SortColumn = 'ParentFragmentID' AND @SortAscending = 1 THEN [ParentFragmentID] END ASC,
                    CASE WHEN @SortColumn = 'ParentFragmentID' AND @SortAscending = 0 THEN [ParentFragmentID] END DESC,
                    CASE WHEN @SortColumn = 'FragmentKey' AND @SortAscending = 1 THEN [FragmentKey] END ASC,
                    CASE WHEN @SortColumn = 'FragmentKey' AND @SortAscending = 0 THEN [FragmentKey] END DESC,
                    CASE WHEN @SortColumn = 'Data' AND @SortAscending = 1 THEN [Data] END ASC,
                    CASE WHEN @SortColumn = 'Data' AND @SortAscending = 0 THEN [Data] END DESC,
                    CASE WHEN @SortColumn = 'DateCreated' AND @SortAscending = 1 THEN [DateCreated] END ASC,
                    CASE WHEN @SortColumn = 'DateCreated' AND @SortAscending = 0 THEN [DateCreated] END DESC,
                    CASE WHEN @SortColumn = 'LastUpdated' AND @SortAscending = 1 THEN [LastUpdated] END ASC,
                    CASE WHEN @SortColumn = 'LastUpdated' AND @SortAscending = 0 THEN [LastUpdated] END DESC
            ) AS RowNumber,
            [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
        FROM [dbo].[Fragments] WITH (NOLOCK)
        WHERE
            [Fragment] LIKE '%' + @Search + '%'
            OR [FragmentKey] LIKE '%' + @Search + '%'
            OR CONVERT(nvarchar(50), [FragmentID]) LIKE '%' + @Search + '%'
    )
    SELECT [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
    FROM SearchTable
    WHERE RowNumber BETWEEN @FirstRow AND @LastRow
    ORDER BY RowNumber ASC
    OPTION (RECOMPILE);
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetFragmentsSp_PagingByDateRangeSp') DROP PROCEDURE [dbo].[GetFragmentsSp_PagingByDateRangeSp]
GO
CREATE PROCEDURE [dbo].[GetFragmentsSp_PagingByDateRangeSp]
    @Search nvarchar(255),
    @SortColumn nvarchar(255),
    @SortAscending bit,
    @SkipRows int,
    @NumRows int,
    @StartUtc datetime = NULL,
    @EndUtc datetime = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FirstRow int = @SkipRows + 1;
    DECLARE @LastRow int = @SkipRows + @NumRows;

    WITH SearchTable AS
    (
        SELECT
            ROW_NUMBER() OVER
            (
                ORDER BY
                    CASE WHEN @SortColumn = 'FragmentID' AND @SortAscending = 1 THEN [FragmentID] END ASC,
                    CASE WHEN @SortColumn = 'FragmentID' AND @SortAscending = 0 THEN [FragmentID] END DESC,
                    CASE WHEN @SortColumn = 'ParentFragmentID' AND @SortAscending = 1 THEN [ParentFragmentID] END ASC,
                    CASE WHEN @SortColumn = 'ParentFragmentID' AND @SortAscending = 0 THEN [ParentFragmentID] END DESC,
                    CASE WHEN @SortColumn = 'FragmentKey' AND @SortAscending = 1 THEN [FragmentKey] END ASC,
                    CASE WHEN @SortColumn = 'FragmentKey' AND @SortAscending = 0 THEN [FragmentKey] END DESC,
                    CASE WHEN @SortColumn = 'Data' AND @SortAscending = 1 THEN [Data] END ASC,
                    CASE WHEN @SortColumn = 'Data' AND @SortAscending = 0 THEN [Data] END DESC,
                    CASE WHEN @SortColumn = 'DateCreated' AND @SortAscending = 1 THEN [DateCreated] END ASC,
                    CASE WHEN @SortColumn = 'DateCreated' AND @SortAscending = 0 THEN [DateCreated] END DESC,
                    CASE WHEN @SortColumn = 'LastUpdated' AND @SortAscending = 1 THEN [LastUpdated] END ASC,
                    CASE WHEN @SortColumn = 'LastUpdated' AND @SortAscending = 0 THEN [LastUpdated] END DESC
            ) AS RowNumber,
            [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
        FROM [dbo].[Fragments] WITH (NOLOCK)
        WHERE
            (@StartUtc IS NULL OR [DateCreated] >= @StartUtc)
            AND (@EndUtc IS NULL OR [DateCreated] <= @EndUtc)
            AND (
                [Fragment] LIKE '%' + @Search + '%'
                OR [FragmentKey] LIKE '%' + @Search + '%'
                OR CONVERT(nvarchar(50), [FragmentID]) LIKE '%' + @Search + '%'
            )
    )
    SELECT [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
    FROM SearchTable
    WHERE RowNumber BETWEEN @FirstRow AND @LastRow
    ORDER BY RowNumber ASC
    OPTION (RECOMPILE);
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetFragmentByFragmentKeySp') DROP PROCEDURE [dbo].[GetFragmentByFragmentKeySp]
GO
CREATE PROCEDURE [dbo].[GetFragmentByFragmentKeySp]
    @FragmentKey nvarchar(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
    FROM [dbo].[Fragments] WITH (NOLOCK)
    WHERE [FragmentKey] = @FragmentKey;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetFragmentsByParentFragmentIDSp') DROP PROCEDURE [dbo].[GetFragmentsByParentFragmentIDSp]
GO
CREATE PROCEDURE [dbo].[GetFragmentsByParentFragmentIDSp]
    @ParentFragmentID int = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
    FROM [dbo].[Fragments] WITH (NOLOCK)
    WHERE ((@ParentFragmentID IS NULL AND [ParentFragmentID] IS NULL) OR [ParentFragmentID] = @ParentFragmentID)
    ORDER BY [FragmentID] ASC;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'InsertFragmentSp') DROP PROCEDURE [dbo].[InsertFragmentSp]
GO
CREATE PROCEDURE [dbo].[InsertFragmentSp]
    @Fragment nvarchar(max),
    @ParentFragmentID int = NULL,
    @FragmentKey nvarchar(255),
    @Data nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[Fragments]([Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated])
    VALUES(@Fragment,@ParentFragmentID,@FragmentKey,@Data,getdate(),getdate());
    SELECT scope_identity() AS FragmentID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'UpdateFragmentSp') DROP PROCEDURE [dbo].[UpdateFragmentSp]
GO
CREATE PROCEDURE [dbo].[UpdateFragmentSp]
    @FragmentID int,
    @Fragment nvarchar(max),
    @ParentFragmentID int = NULL,
    @FragmentKey nvarchar(255),
    @Data nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Fragments]
    SET [Fragment] = @Fragment,
        [ParentFragmentID] = @ParentFragmentID,
        [FragmentKey] = @FragmentKey,
        [Data] = @Data,
        [LastUpdated] = getdate()
    WHERE [FragmentID] = @FragmentID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'UpdateFragmentDataSp') DROP PROCEDURE [dbo].[UpdateFragmentDataSp]
GO
CREATE PROCEDURE [dbo].[UpdateFragmentDataSp]
    @FragmentID int,
    @Data nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Fragments]
    SET [Data] = @Data,
        [LastUpdated] = getdate()
    WHERE [FragmentID] = @FragmentID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'RemoveFragmentSp') DROP PROCEDURE [dbo].[RemoveFragmentSp]
GO
CREATE PROCEDURE [dbo].[RemoveFragmentSp]
    @FragmentID int
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [dbo].[Fragments] WHERE [FragmentID] = @FragmentID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'Fragments_GetMostSimilar1_Native_Sp') DROP PROCEDURE [dbo].[Fragments_GetMostSimilar1_Native_Sp]
GO
CREATE PROCEDURE [dbo].[Fragments_GetMostSimilar1_Native_Sp]
    @Embeddings nvarchar(max),
    @Threshold float,
    @EmbeddingModel nvarchar(255) = N'text-embedding-3-small'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EmbeddingID int =
    (
        SELECT TOP 1 [EmbeddingID]
        FROM [dbo].[Embeddings] WITH (NOLOCK)
        WHERE [EmbeddingModel] = @EmbeddingModel
           OR (@EmbeddingModel = N'text-embedding-3-small' AND [EmbeddingModel] = N'OpenAI3Small')
        ORDER BY CASE WHEN [EmbeddingModel] = @EmbeddingModel THEN 0 ELSE 1 END, [EmbeddingID] ASC
    );

    IF @EmbeddingID IS NULL
        THROW 50000, 'No supported embedding model was found for native session semantic search.', 1;

    DECLARE @QueryVector vector(1536) = CAST(@Embeddings AS vector(1536));

    SELECT
        [f].[FragmentID],
        [f].[Fragment],
        [f].[ParentFragmentID],
        [f].[FragmentKey],
        [f].[Data],
        [f].[DateCreated],
        [f].[LastUpdated],
        [sim].[Similarity]
    FROM [dbo].[Fragments] [f] WITH (NOLOCK)
    INNER JOIN [dbo].[FragmentVectorsNative] [v] WITH (NOLOCK)
        ON [v].[FragmentID] = [f].[FragmentID]
       AND [v].[EmbeddingID] = @EmbeddingID
    CROSS APPLY (
        SELECT CAST(1 - VECTOR_DISTANCE('cosine', [v].[VectorValue], @QueryVector) AS float) AS [Similarity]
    ) [sim]
    WHERE [sim].[Similarity] >= @Threshold
    ORDER BY [sim].[Similarity] DESC, [f].[FragmentID] ASC;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'Fragments_GetMostSimilar1ByEmbeddingIDAndTagID_Sp') DROP PROCEDURE [dbo].[Fragments_GetMostSimilar1ByEmbeddingIDAndTagID_Sp]
GO
CREATE PROCEDURE [dbo].[Fragments_GetMostSimilar1ByEmbeddingIDAndTagID_Sp]
    @Embeddings nvarchar(max),
    @EmbeddingID int,
    @TagID int,
	@Threshold float
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @QueryVector vector(1536) = CAST(@Embeddings AS vector(1536));

	SELECT TOP 100
        [f].[FragmentID],
        [f].[Fragment],
        [f].[ParentFragmentID],
        [f].[FragmentKey],
        [f].[Data],
        [f].[DateCreated],
        [f].[LastUpdated],
        [sim].[Similarity]
    FROM [dbo].[Fragments] [f] WITH (NOLOCK)
    INNER JOIN [dbo].[FragmentTags] [ft] WITH (NOLOCK)
        ON [ft].[FragmentID] = [f].[FragmentID]
       AND [ft].[TagID] = @TagID
    INNER JOIN [dbo].[FragmentVectorsNative] [v] WITH (NOLOCK)
        ON [v].[FragmentID] = [f].[FragmentID]
       AND [v].[EmbeddingID] = @EmbeddingID
    CROSS APPLY (
        SELECT CAST(1 - VECTOR_DISTANCE('cosine', [v].[VectorValue], @QueryVector) AS float) AS [Similarity]
    ) [sim]
    WHERE [sim].[Similarity] >= @Threshold
    ORDER BY [sim].[Similarity] DESC, [f].[FragmentID] ASC;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'Fragments_GetMostSimilar1ByDateRange_Native_Sp') DROP PROCEDURE [dbo].[Fragments_GetMostSimilar1ByDateRange_Native_Sp]
GO
CREATE PROCEDURE [dbo].[Fragments_GetMostSimilar1ByDateRange_Native_Sp]
    @Embeddings nvarchar(max),
    @Threshold float,
    @StartUtc datetime = NULL,
    @EndUtc datetime = NULL,
    @EmbeddingModel nvarchar(255) = N'text-embedding-3-small'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EmbeddingID int =
    (
        SELECT TOP 1 [EmbeddingID]
        FROM [dbo].[Embeddings] WITH (NOLOCK)
        WHERE [EmbeddingModel] = @EmbeddingModel
           OR (@EmbeddingModel = N'text-embedding-3-small' AND [EmbeddingModel] = N'OpenAI3Small')
        ORDER BY CASE WHEN [EmbeddingModel] = @EmbeddingModel THEN 0 ELSE 1 END, [EmbeddingID] ASC
    );

    IF @EmbeddingID IS NULL
        THROW 50000, 'No supported embedding model was found for native session semantic search.', 1;

    DECLARE @QueryVector vector(1536) = CAST(@Embeddings AS vector(1536));

    SELECT
        [f].[FragmentID],
        [f].[Fragment],
        [f].[ParentFragmentID],
        [f].[FragmentKey],
        [f].[Data],
        [f].[DateCreated],
        [f].[LastUpdated],
        [sim].[Similarity]
    FROM [dbo].[Fragments] [f] WITH (NOLOCK)
    INNER JOIN [dbo].[FragmentVectorsNative] [v] WITH (NOLOCK)
        ON [v].[FragmentID] = [f].[FragmentID]
       AND [v].[EmbeddingID] = @EmbeddingID
    CROSS APPLY (
        SELECT CAST(1 - VECTOR_DISTANCE('cosine', [v].[VectorValue], @QueryVector) AS float) AS [Similarity]
    ) [sim]
    WHERE [sim].[Similarity] >= @Threshold
        AND (@StartUtc IS NULL OR [f].[DateCreated] >= @StartUtc)
        AND (@EndUtc IS NULL OR [f].[DateCreated] <= @EndUtc)
    ORDER BY [sim].[Similarity] DESC, [f].[FragmentID] ASC;
END
GO
