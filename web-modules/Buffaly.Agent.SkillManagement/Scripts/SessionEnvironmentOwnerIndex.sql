-- SQL Server-only indexed projection of the immutable whole-document Environment.
-- No alternate per-key writer: existing owning Data saves maintain this computed value.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
-- Fail before DDL: indexed computed columns require compatible stored writer-module settings.
-- SESSION_WRITER_GUARD_BEGIN
-- Bind only incompatible saved-flag modules. ON/ON modules run with their own captured flags.
-- Unknown paths fail closed; unrelated read-only modules are not rewritten.
SET NOCOUNT ON;
IF EXISTS(SELECT 1 FROM sys.assembly_modules) OR EXISTS(SELECT 1 FROM sys.triggers)
    THROW 50000,'Assembly modules or triggers are incompatible with the Sessions indexing prerequisite.',1;
IF ISNULL(HAS_PERMS_BY_NAME(DB_NAME(),'DATABASE','VIEW DEFINITION'),0)<>1
    THROW 50000,'VIEW DEFINITION required for complete Sessions writer inspection.',1;
IF EXISTS(SELECT 1 FROM sys.objects o LEFT JOIN sys.sql_modules m ON m.object_id=o.object_id WHERE o.is_ms_shipped=0 AND o.type IN('P','V','FN','IF','TF','TR','PC','FS','FT') AND (m.definition IS NULL OR o.type IN('PC','FS','FT')))
    THROW 50000,'Unknown, encrypted or CLR modules require a source-owned writer audit before Sessions indexing.',1;
CREATE TABLE #SessionWriterReferences(ModuleID int NOT NULL,ReferencedID int NULL,IsUpdated bit NOT NULL);
DECLARE @id int,@name nvarchar(517),@definition nvarchar(max),@ansi bit,@qi bit;
DECLARE modules CURSOR LOCAL FAST_FORWARD FOR SELECT o.object_id,QUOTENAME(SCHEMA_NAME(o.schema_id))+'.'+QUOTENAME(o.name),m.definition,m.uses_ansi_nulls,m.uses_quoted_identifier FROM sys.objects o JOIN sys.sql_modules m ON m.object_id=o.object_id WHERE o.is_ms_shipped=0 AND (m.uses_ansi_nulls=0 OR m.uses_quoted_identifier=0);
OPEN modules;
FETCH NEXT FROM modules INTO @id,@name,@definition,@ansi,@qi;
WHILE @@FETCH_STATUS=0
BEGIN
    -- Conservative lexical checks also reject comments/literals; this is not a SQL parser.
    IF CHARINDEX('SP_EXECUTESQL',UPPER(@definition))>0
        OR PATINDEX('%[^A-Z0-9_]EXEC[^A-Z0-9_]%',UPPER(@definition) COLLATE Latin1_General_100_BIN2)>0
        OR PATINDEX('%[^A-Z0-9_]EXECUTE[^A-Z0-9_]%',UPPER(@definition) COLLATE Latin1_General_100_BIN2)>0
        OR CHARINDEX('OPENQUERY',UPPER(@definition))>0 OR CHARINDEX('OPENROWSET',UPPER(@definition))>0 OR CHARINDEX('OPENDATASOURCE',UPPER(@definition))>0
    BEGIN
        DECLARE @dynamicMessage nvarchar(2048)=N'Unresolved execution/external path requires source-owned audit: '+@name;
        THROW 50000,@dynamicMessage,1;
    END;
    BEGIN TRY
        INSERT #SessionWriterReferences(ModuleID,ReferencedID,IsUpdated)
        SELECT @id,referenced_id,is_updated FROM sys.dm_sql_referenced_entities(@name,'OBJECT');
    END TRY
    BEGIN CATCH
        DECLARE @bindingMessage nvarchar(2048)=N'Cannot completely bind module for Sessions writer audit: '+@name+N'; '+ERROR_MESSAGE();
        THROW 50000,@bindingMessage,1;
    END CATCH;
    IF EXISTS(SELECT 1 FROM sys.dm_sql_referenced_entities(@name,'OBJECT') WHERE is_caller_dependent=1 OR is_ambiguous=1 OR (referenced_id IS NULL AND referenced_entity_name IS NOT NULL) OR referenced_database_name IS NOT NULL OR referenced_server_name IS NOT NULL OR referenced_id IN(SELECT object_id FROM sys.synonyms) OR referenced_id IN(SELECT object_id FROM sys.objects WHERE type IN('P','PC','FN','IF','TF','FS','FT')))
    BEGIN
        DECLARE @unknownMessage nvarchar(2048)=N'Unresolved, ambiguous or external reference requires source-owned audit: '+@name;
        THROW 50000,@unknownMessage,1;
    END;
    IF EXISTS(SELECT 1 FROM #SessionWriterReferences r WHERE r.ModuleID=@id AND r.IsUpdated=1 AND NOT EXISTS(SELECT 1 FROM sys.tables t WHERE t.object_id=r.ReferencedID))
    BEGIN
        DECLARE @viewMessage nvarchar(2048)=N'Incompatible module writes through a view or non-table target; source-owned audit required: '+@name;
        THROW 50000,@viewMessage,1;
    END;
    IF EXISTS(SELECT 1 FROM #SessionWriterReferences WHERE ModuleID=@id AND ReferencedID=OBJECT_ID(N'dbo.Sessions') AND IsUpdated=1)
    BEGIN
        DECLARE @writerMessage nvarchar(2048)=N'Sessions writer requires captured ANSI_NULLS and QUOTED_IDENTIFIER ON: '+@name;
        THROW 50000,@writerMessage,1;
    END;
    FETCH NEXT FROM modules INTO @id,@name,@definition,@ansi,@qi;
END;
CLOSE modules;
DEALLOCATE modules;
DROP TABLE #SessionWriterReferences;
-- SESSION_WRITER_GUARD_END
IF COL_LENGTH(N'dbo.Sessions', N'EnvironmentUserKey') IS NULL
BEGIN
    ALTER TABLE dbo.Sessions ADD EnvironmentUserKey AS
        CONVERT(nvarchar(64), CASE
            WHEN JSON_VALUE(CASE WHEN ISJSON(Data) = 1 THEN Data ELSE N'{}' END, '$.Environment.Mode') COLLATE Latin1_General_100_BIN2 = N'User'
            AND LEN(JSON_VALUE(CASE WHEN ISJSON(Data) = 1 THEN Data ELSE N'{}' END, '$.Environment.UserKey')) >= 1
            AND LEN(JSON_VALUE(CASE WHEN ISJSON(Data) = 1 THEN Data ELSE N'{}' END, '$.Environment.UserKey')) <= 64
            THEN JSON_VALUE(CASE WHEN ISJSON(Data) = 1 THEN Data ELSE N'{}' END, '$.Environment.UserKey')
            END) COLLATE Latin1_General_100_BIN2 PERSISTED;
END;
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Sessions') AND name = N'IX_Sessions_EnvironmentUserKey_SessionID')
    CREATE INDEX IX_Sessions_EnvironmentUserKey_SessionID ON dbo.Sessions(EnvironmentUserKey, SessionID);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.Sessions') AND name = N'IX_Sessions_EnvironmentUserKey_Recent')
    CREATE INDEX IX_Sessions_EnvironmentUserKey_Recent ON dbo.Sessions(EnvironmentUserKey, IsArchived, LastUpdated DESC, SessionID DESC);
GO
