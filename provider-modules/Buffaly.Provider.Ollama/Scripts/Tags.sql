SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID(N'[dbo].[Tags]', N'U') IS NULL
BEGIN
CREATE TABLE [dbo].[Tags](
    [TagID] int IDENTITY(1,1) NOT NULL,
    [TagName] nvarchar(255) NOT NULL,
    [DateCreated] datetime NOT NULL CONSTRAINT [DF_Tags_DateCreated] DEFAULT (getdate()),
    [LastUpdated] datetime NOT NULL CONSTRAINT [DF_Tags_LastUpdated] DEFAULT (getdate()),
    CONSTRAINT [PK_Tags] PRIMARY KEY CLUSTERED ([TagID] ASC)
) ON [PRIMARY]
END
GO

IF OBJECT_ID(N'[dbo].[FragmentTags]', N'U') IS NULL
BEGIN
CREATE TABLE [dbo].[FragmentTags](
    [FragmentTagID] int IDENTITY(1,1) NOT NULL,
    [FragmentID] int NOT NULL,
    [TagID] int NOT NULL,
    [Data] nvarchar(max) NULL,
    [DateCreated] datetime NOT NULL CONSTRAINT [DF_FragmentTags_DateCreated] DEFAULT (getdate()),
    [LastUpdated] datetime NOT NULL CONSTRAINT [DF_FragmentTags_LastUpdated] DEFAULT (getdate()),
    CONSTRAINT [PK_FragmentTags] PRIMARY KEY CLUSTERED ([FragmentTagID] ASC)
) ON [PRIMARY]
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_Tags_TagName' AND object_id = OBJECT_ID(N'[dbo].[Tags]'))
    CREATE UNIQUE NONCLUSTERED INDEX [UX_Tags_TagName] ON [dbo].[Tags]([TagName] ASC)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_FragmentTags_FragmentID_TagID' AND object_id = OBJECT_ID(N'[dbo].[FragmentTags]'))
    CREATE UNIQUE NONCLUSTERED INDEX [UX_FragmentTags_FragmentID_TagID] ON [dbo].[FragmentTags]([FragmentID] ASC,[TagID] ASC)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FragmentTags_TagID_FragmentID' AND object_id = OBJECT_ID(N'[dbo].[FragmentTags]'))
    CREATE NONCLUSTERED INDEX [IX_FragmentTags_TagID_FragmentID] ON [dbo].[FragmentTags]([TagID] ASC,[FragmentID] ASC)
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FragmentTags_FragmentID')
    ALTER TABLE [dbo].[FragmentTags] ADD CONSTRAINT [FK_FragmentTags_FragmentID] FOREIGN KEY([FragmentID]) REFERENCES [dbo].[Fragments]([FragmentID])
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FragmentTags_TagID')
    ALTER TABLE [dbo].[FragmentTags] ADD CONSTRAINT [FK_FragmentTags_TagID] FOREIGN KEY([TagID]) REFERENCES [dbo].[Tags]([TagID])
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'GetTagByTagNameSp') DROP PROCEDURE [dbo].[GetTagByTagNameSp]
GO
CREATE PROCEDURE [dbo].[GetTagByTagNameSp]
    @TagName nvarchar(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT [TagID],[TagName],[DateCreated],[LastUpdated]
    FROM [dbo].[Tags] WITH (NOLOCK)
    WHERE [TagName] = @TagName;
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'InsertOrUpdateFragmentTagSp') DROP PROCEDURE [dbo].[InsertOrUpdateFragmentTagSp]
GO
CREATE PROCEDURE [dbo].[InsertOrUpdateFragmentTagSp]
    @FragmentID int,
    @TagName nvarchar(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @TagID int;
    SELECT @TagID = [TagID] FROM [dbo].[Tags] WITH (UPDLOCK, HOLDLOCK) WHERE [TagName] = @TagName;
    IF @TagID IS NULL
    BEGIN
        INSERT INTO [dbo].[Tags]([TagName],[DateCreated],[LastUpdated]) VALUES(@TagName,getdate(),getdate());
        SET @TagID = CONVERT(int, scope_identity());
    END

    IF EXISTS (SELECT 1 FROM [dbo].[FragmentTags] WITH (UPDLOCK, HOLDLOCK) WHERE [FragmentID] = @FragmentID AND [TagID] = @TagID)
        UPDATE [dbo].[FragmentTags]
        SET [LastUpdated] = getdate()
        WHERE [FragmentID] = @FragmentID AND [TagID] = @TagID;
    ELSE
        INSERT INTO [dbo].[FragmentTags]([FragmentID],[TagID],[DateCreated],[LastUpdated]) VALUES(@FragmentID,@TagID,getdate(),getdate());
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'Fragments_GetByTagID_Sp_CountSp') DROP PROCEDURE [dbo].[Fragments_GetByTagID_Sp_CountSp]
GO
CREATE PROCEDURE [dbo].[Fragments_GetByTagID_Sp_CountSp]
    @TagID int,
    @Search nvarchar(255)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS [Total]
    FROM [dbo].[Fragments] [f] WITH (NOLOCK)
    INNER JOIN [dbo].[FragmentTags] [ft] WITH (NOLOCK) ON [ft].[FragmentID] = [f].[FragmentID]
    WHERE [ft].[TagID] = @TagID
      AND ([f].[Fragment] LIKE '%' + @Search + '%' OR [f].[FragmentKey] LIKE '%' + @Search + '%' OR CONVERT(nvarchar(50), [f].[FragmentID]) LIKE '%' + @Search + '%');
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'Fragments_GetByTagID_Sp_PagingSp') DROP PROCEDURE [dbo].[Fragments_GetByTagID_Sp_PagingSp]
GO
CREATE PROCEDURE [dbo].[Fragments_GetByTagID_Sp_PagingSp]
    @TagID int,
    @Search nvarchar(255),
    @SortColumn nvarchar(255),
    @SortAscending bit,
    @SkipRows int,
    @NumRows int
AS
BEGIN
    SET NOCOUNT ON;

    WITH SearchTable AS
    (
        SELECT ROW_NUMBER() OVER
        (
            ORDER BY
                CASE WHEN @SortColumn = 'FragmentID' AND @SortAscending = 1 THEN [f].[FragmentID] END ASC,
                CASE WHEN @SortColumn = 'FragmentID' AND @SortAscending = 0 THEN [f].[FragmentID] END DESC,
                CASE WHEN @SortColumn = 'FragmentKey' AND @SortAscending = 1 THEN [f].[FragmentKey] END ASC,
                CASE WHEN @SortColumn = 'FragmentKey' AND @SortAscending = 0 THEN [f].[FragmentKey] END DESC,
                [f].[FragmentID] ASC
        ) AS RowNumber,
        [f].[FragmentID],[f].[Fragment],[f].[ParentFragmentID],[f].[FragmentKey],[f].[Data],[f].[DateCreated],[f].[LastUpdated]
        FROM [dbo].[Fragments] [f] WITH (NOLOCK)
        INNER JOIN [dbo].[FragmentTags] [ft] WITH (NOLOCK) ON [ft].[FragmentID] = [f].[FragmentID]
        WHERE [ft].[TagID] = @TagID
          AND ([f].[Fragment] LIKE '%' + @Search + '%' OR [f].[FragmentKey] LIKE '%' + @Search + '%' OR CONVERT(nvarchar(50), [f].[FragmentID]) LIKE '%' + @Search + '%')
    )
    SELECT [FragmentID],[Fragment],[ParentFragmentID],[FragmentKey],[Data],[DateCreated],[LastUpdated]
    FROM SearchTable
    WHERE RowNumber BETWEEN @SkipRows + 1 AND @SkipRows + @NumRows
    ORDER BY RowNumber ASC
    OPTION (RECOMPILE);
END
GO
