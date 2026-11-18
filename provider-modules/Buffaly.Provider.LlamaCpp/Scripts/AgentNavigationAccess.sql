SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
-- Derived access path only: SidebarProfile remains the sole policy document.
-- Indexed computed columns require compatible writer module settings. Do not rewrite sealed writers.
DECLARE @Module nvarchar(517), @Unsafe nvarchar(max) = N'';
DECLARE NavigationWriterSettings CURSOR LOCAL FAST_FORWARD FOR
 SELECT QUOTENAME(OBJECT_SCHEMA_NAME(m.object_id))+N'.'+QUOTENAME(OBJECT_NAME(m.object_id))
 FROM sys.sql_modules m
 WHERE (m.uses_ansi_nulls=0 OR m.uses_quoted_identifier=0)
 AND EXISTS(SELECT 1 FROM sys.sql_expression_dependencies d WHERE d.referencing_id=m.object_id AND d.referenced_id=OBJECT_ID('dbo.Sessions'));
OPEN NavigationWriterSettings;
FETCH NEXT FROM NavigationWriterSettings INTO @Module;
WHILE @@FETCH_STATUS=0
BEGIN
 BEGIN TRY
  IF EXISTS(SELECT 1 FROM sys.dm_sql_referenced_entities(@Module,'OBJECT') WHERE referenced_id=OBJECT_ID('dbo.Sessions') AND is_updated=1)
   SET @Unsafe+=@Module+N'; ';
 END TRY
 BEGIN CATCH
  SET @Unsafe+=@Module+N' (references could not be verified); ';
 END CATCH;
 FETCH NEXT FROM NavigationWriterSettings INTO @Module;
END;
CLOSE NavigationWriterSettings;
DEALLOCATE NavigationWriterSettings;
IF @Unsafe<>N''
BEGIN
 DECLARE @Error nvarchar(2048)=N'Navigation index requires ANSI_NULLS and QUOTED_IDENTIFIER ON for session writers: '+LEFT(@Unsafe,1800);
 THROW 50004,@Error,1;
END;
GO
IF COL_LENGTH('dbo.Sessions','SidebarShowInSessionList') IS NULL
 ALTER TABLE dbo.Sessions ADD SidebarShowInSessionList AS
 CONVERT(bit,CASE WHEN JSON_VALUE(NULLIF(Data,N''),'$.SidebarProfile.ShowInSessionList')=N'false' THEN 0 ELSE 1 END);
GO
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Sessions') AND name=N'IX_Sessions_NavigationVisibility')
 CREATE INDEX IX_Sessions_NavigationVisibility ON dbo.Sessions(IsArchived,SidebarShowInSessionList,ParentSessionID,SessionID) INCLUDE(LastUpdated);
GO
