SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID(N'[dbo].[FragmentVectorsNative]', N'U') IS NULL
BEGIN
CREATE TABLE [dbo].[FragmentVectorsNative](
    [FragmentID] int NOT NULL,
    [EmbeddingID] int NOT NULL,
    [VectorDimensions] int NOT NULL,
    [EmbeddingHash] nvarchar(64) NULL,
    [VectorValue] vector(1536) NOT NULL,
    [LastEmbeddedUtc] datetime2(7) NOT NULL CONSTRAINT [DF_FragmentVectorsNative_LastEmbeddedUtc] DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_FragmentVectorsNative] PRIMARY KEY CLUSTERED ([FragmentID] ASC, [EmbeddingID] ASC)
) ON [PRIMARY]
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.columns c
    JOIN sys.types t ON c.user_type_id = t.user_type_id
    WHERE c.object_id = OBJECT_ID(N'[dbo].[FragmentVectorsNative]')
      AND c.name = N'VectorValue'
      AND t.name <> N'vector')
BEGIN
    ALTER TABLE [dbo].[FragmentVectorsNative] ALTER COLUMN [VectorValue] vector(1536) NOT NULL
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FragmentVectorsNative_EmbeddingID' AND object_id = OBJECT_ID(N'[dbo].[FragmentVectorsNative]'))
    CREATE NONCLUSTERED INDEX [IX_FragmentVectorsNative_EmbeddingID] ON [dbo].[FragmentVectorsNative]([EmbeddingID] ASC, [FragmentID] ASC)
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FragmentVectorsNative_FragmentID')
    ALTER TABLE [dbo].[FragmentVectorsNative] ADD CONSTRAINT [FK_FragmentVectorsNative_FragmentID] FOREIGN KEY([FragmentID]) REFERENCES [dbo].[Fragments]([FragmentID])
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FragmentVectorsNative_EmbeddingID')
    ALTER TABLE [dbo].[FragmentVectorsNative] ADD CONSTRAINT [FK_FragmentVectorsNative_EmbeddingID] FOREIGN KEY([EmbeddingID]) REFERENCES [dbo].[Embeddings]([EmbeddingID])
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'FragmentVectorsNative_GetByFragmentIDSp') DROP PROCEDURE [dbo].[FragmentVectorsNative_GetByFragmentIDSp]
GO
CREATE PROCEDURE [dbo].[FragmentVectorsNative_GetByFragmentIDSp]
    @FragmentID int,
    @EmbeddingID int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [FragmentID],[EmbeddingID],[VectorDimensions],[EmbeddingHash],CAST([VectorValue] AS nvarchar(max)) AS [VectorJson],[LastEmbeddedUtc]
    FROM [dbo].[FragmentVectorsNative] WITH (NOLOCK)
    WHERE [FragmentID] = @FragmentID AND [EmbeddingID] = @EmbeddingID;
END
GO

IF OBJECT_ID(N'[dbo].[FragmentVectorsNative_ExistsSp]', N'P') IS NOT NULL DROP PROCEDURE [dbo].[FragmentVectorsNative_ExistsSp]
GO
IF OBJECT_ID(N'[dbo].[FragmentVectorsNative_ExistsSp]', N'FN') IS NOT NULL DROP FUNCTION [dbo].[FragmentVectorsNative_ExistsSp]
GO
CREATE FUNCTION [dbo].[FragmentVectorsNative_ExistsSp]
(
    @FragmentID int,
    @EmbeddingID int
)
RETURNS bit
AS
BEGIN
    RETURN CASE WHEN EXISTS (
        SELECT 1
        FROM [dbo].[FragmentVectorsNative] WITH (NOLOCK)
        WHERE [FragmentID] = @FragmentID AND [EmbeddingID] = @EmbeddingID
    ) THEN CONVERT(bit, 1) ELSE CONVERT(bit, 0) END;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'FragmentVectorsNative_RemoveByFragmentIDSp') DROP PROCEDURE [dbo].[FragmentVectorsNative_RemoveByFragmentIDSp]
GO
CREATE PROCEDURE [dbo].[FragmentVectorsNative_RemoveByFragmentIDSp]
    @FragmentID int,
    @EmbeddingID int
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM [dbo].[FragmentVectorsNative]
    WHERE [FragmentID] = @FragmentID AND [EmbeddingID] = @EmbeddingID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'FragmentVectorsNative_UpsertSp') DROP PROCEDURE [dbo].[FragmentVectorsNative_UpsertSp]
GO
CREATE PROCEDURE [dbo].[FragmentVectorsNative_UpsertSp]
    @FragmentID int,
    @EmbeddingID int,
    @VectorDimensions int,
    @EmbeddingHash nvarchar(64) = NULL,
    @Vector nvarchar(max),
    @LastEmbeddedUtc datetime2(7) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @VectorDimensions <> 1536
        THROW 50000, 'FragmentVectorsNative_UpsertSp requires vector(1536).', 1;

    MERGE [dbo].[FragmentVectorsNative] AS target
    USING (
        SELECT @FragmentID AS FragmentID,
               @EmbeddingID AS EmbeddingID,
               @VectorDimensions AS VectorDimensions,
               @EmbeddingHash AS EmbeddingHash,
               CAST(@Vector AS vector(1536)) AS VectorValue,
               ISNULL(@LastEmbeddedUtc, SYSUTCDATETIME()) AS LastEmbeddedUtc
    ) AS source
    ON target.FragmentID = source.FragmentID AND target.EmbeddingID = source.EmbeddingID
    WHEN MATCHED THEN
        UPDATE SET VectorDimensions = source.VectorDimensions,
                   EmbeddingHash = source.EmbeddingHash,
                   VectorValue = source.VectorValue,
                   LastEmbeddedUtc = source.LastEmbeddedUtc
    WHEN NOT MATCHED THEN
        INSERT (FragmentID, EmbeddingID, VectorDimensions, EmbeddingHash, VectorValue, LastEmbeddedUtc)
        VALUES (source.FragmentID, source.EmbeddingID, source.VectorDimensions, source.EmbeddingHash, source.VectorValue, source.LastEmbeddedUtc);
END
GO
