SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID(N'[dbo].[Embeddings]', N'U') IS NULL
BEGIN
CREATE TABLE [dbo].[Embeddings](
    [EmbeddingID] int IDENTITY(1,1) NOT NULL,
    [EmbeddingModel] nvarchar(255) NOT NULL,
    [Data] nvarchar(max) NULL,
    [DateCreated] datetime NOT NULL CONSTRAINT [DF_Embeddings_DateCreated] DEFAULT (getdate()),
    [LastUpdated] datetime NOT NULL CONSTRAINT [DF_Embeddings_LastUpdated] DEFAULT (getdate()),
    CONSTRAINT [PK_Embeddings] PRIMARY KEY CLUSTERED ([EmbeddingID] ASC)
) ON [PRIMARY]
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Embeddings_EmbeddingModel' AND object_id = OBJECT_ID(N'[dbo].[Embeddings]'))
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Embeddings_EmbeddingModel] ON [dbo].[Embeddings]([EmbeddingModel] ASC)
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetEmbeddingSp') DROP PROCEDURE [dbo].[GetEmbeddingSp]
GO
CREATE PROCEDURE [dbo].[GetEmbeddingSp]
    @EmbeddingID int
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [EmbeddingID],[EmbeddingModel],[Data],[DateCreated],[LastUpdated]
    FROM [dbo].[Embeddings] WITH (NOLOCK)
    WHERE [EmbeddingID] = @EmbeddingID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetEmbeddingsSp') DROP PROCEDURE [dbo].[GetEmbeddingsSp]
GO
CREATE PROCEDURE [dbo].[GetEmbeddingsSp]
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [EmbeddingID],[EmbeddingModel],[Data],[DateCreated],[LastUpdated]
    FROM [dbo].[Embeddings] WITH (NOLOCK)
    ORDER BY [EmbeddingID] ASC;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetEmbeddingByEmbeddingModelSp') DROP PROCEDURE [dbo].[GetEmbeddingByEmbeddingModelSp]
GO
CREATE PROCEDURE [dbo].[GetEmbeddingByEmbeddingModelSp]
    @EmbeddingModel nvarchar(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [EmbeddingID],[EmbeddingModel],[Data],[DateCreated],[LastUpdated]
    FROM [dbo].[Embeddings] WITH (NOLOCK)
    WHERE [EmbeddingModel] = @EmbeddingModel;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'InsertEmbeddingSp') DROP PROCEDURE [dbo].[InsertEmbeddingSp]
GO
CREATE PROCEDURE [dbo].[InsertEmbeddingSp]
    @EmbeddingModel nvarchar(255),
    @Data nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [dbo].[Embeddings]([EmbeddingModel],[Data],[DateCreated],[LastUpdated])
    VALUES(@EmbeddingModel,@Data,getdate(),getdate());
    SELECT scope_identity() AS EmbeddingID;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'UpdateEmbeddingDataSp') DROP PROCEDURE [dbo].[UpdateEmbeddingDataSp]
GO
CREATE PROCEDURE [dbo].[UpdateEmbeddingDataSp]
    @EmbeddingID int,
    @Data nvarchar(max) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Embeddings]
    SET [Data] = @Data,
        [LastUpdated] = getdate()
    WHERE [EmbeddingID] = @EmbeddingID;
END
GO
