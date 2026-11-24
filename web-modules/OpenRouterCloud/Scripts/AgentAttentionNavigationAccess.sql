SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
-- Derived access path only: whole SidebarProfile saves remain the sole eligibility writer.
-- Existing navigation ownership already requires compatible session-writer SET settings.
IF COL_LENGTH('dbo.Sessions','SidebarShowInNextUpdate') IS NULL
 ALTER TABLE dbo.Sessions ADD SidebarShowInNextUpdate AS
 CONVERT(bit,CASE WHEN JSON_VALUE(NULLIF(Data,N''),'$.SidebarProfile.ShowInNextUpdate')=N'false' THEN 0 ELSE 1 END);
GO
IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE object_id=OBJECT_ID('dbo.Sessions') AND name=N'IX_Sessions_PendingNavigationEligibility')
 CREATE INDEX IX_Sessions_PendingNavigationEligibility ON dbo.Sessions(SidebarShowInNextUpdate,EnvironmentUserKey,SessionID)
 INCLUDE(LastNonRunningUtc) WHERE NeedsAttention=1 AND IsArchived=0;
GO
