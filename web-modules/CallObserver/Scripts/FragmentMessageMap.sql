SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

IF OBJECT_ID(N'[dbo].[FragmentMessageMap]', N'U') IS NULL
BEGIN
CREATE TABLE [dbo].[FragmentMessageMap](
    [FragmentMessageMapID] int IDENTITY(1,1) NOT NULL,
    [FragmentID] int NOT NULL,
    [SessionID] int NOT NULL,
    [MessageID] int NULL,
    [MappingType] nvarchar(100) NOT NULL,
    [Ordinal] int NOT NULL CONSTRAINT [DF_FragmentMessageMap_Ordinal] DEFAULT (0),
    [Data] nvarchar(max) NULL,
    [DateCreated] datetime NOT NULL CONSTRAINT [DF_FragmentMessageMap_DateCreated] DEFAULT (getdate()),
    [LastUpdated] datetime NOT NULL CONSTRAINT [DF_FragmentMessageMap_LastUpdated] DEFAULT (getdate()),
    CONSTRAINT [PK_FragmentMessageMap] PRIMARY KEY CLUSTERED ([FragmentMessageMapID] ASC)
) ON [PRIMARY]
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FragmentMessageMap_FragmentID' AND object_id = OBJECT_ID(N'[dbo].[FragmentMessageMap]'))
    CREATE NONCLUSTERED INDEX [IX_FragmentMessageMap_FragmentID] ON [dbo].[FragmentMessageMap]([FragmentID] ASC)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FragmentMessageMap_MessageID' AND object_id = OBJECT_ID(N'[dbo].[FragmentMessageMap]'))
    CREATE NONCLUSTERED INDEX [IX_FragmentMessageMap_MessageID] ON [dbo].[FragmentMessageMap]([MessageID] ASC)
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_FragmentMessageMap_SessionID' AND object_id = OBJECT_ID(N'[dbo].[FragmentMessageMap]'))
    CREATE NONCLUSTERED INDEX [IX_FragmentMessageMap_SessionID] ON [dbo].[FragmentMessageMap]([SessionID] ASC, [MappingType] ASC, [Ordinal] ASC)
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FragmentMessageMap_FragmentID')
    ALTER TABLE [dbo].[FragmentMessageMap] ADD CONSTRAINT [FK_FragmentMessageMap_FragmentID] FOREIGN KEY([FragmentID]) REFERENCES [dbo].[Fragments]([FragmentID])
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FragmentMessageMap_SessionID')
    ALTER TABLE [dbo].[FragmentMessageMap] ADD CONSTRAINT [FK_FragmentMessageMap_SessionID] FOREIGN KEY([SessionID]) REFERENCES [dbo].[Sessions]([SessionID])
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_FragmentMessageMap_MessageID')
    ALTER TABLE [dbo].[FragmentMessageMap] ADD CONSTRAINT [FK_FragmentMessageMap_MessageID] FOREIGN KEY([MessageID]) REFERENCES [dbo].[Messages]([MessageID])
GO
