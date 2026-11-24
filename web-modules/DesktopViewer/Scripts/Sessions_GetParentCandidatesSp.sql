SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
CREATE OR ALTER PROCEDURE dbo.Sessions_GetParentCandidatesSp
    @Search nvarchar(255), @EnvironmentUserKey nvarchar(64), @SelectedKey nvarchar(255), @Offset int = 0
AS
BEGIN
    SET NOCOUNT ON;
    SELECT s.SessionID, s.SessionKey, s.SessionName
    FROM dbo.Sessions s
    WHERE s.IsArchived = 0
      AND ((@EnvironmentUserKey IS NULL AND s.EnvironmentUserKey IS NULL) OR s.EnvironmentUserKey = @EnvironmentUserKey)
      AND s.AgentName COLLATE Latin1_General_100_BIN2 = N'buffaly-agent'
      AND NOT EXISTS (SELECT 1 FROM OPENJSON(s.Data) p WHERE p.[key] = N'Specialization' AND p.[type] <> 0)
      AND ((@SelectedKey IS NOT NULL AND s.SessionKey = @SelectedKey)
        OR (@SelectedKey IS NULL AND (@Search = N'' OR
          CHARINDEX(@Search COLLATE Latin1_General_100_CI_AS, s.SessionName) > 0 OR
          CHARINDEX(@Search COLLATE Latin1_General_100_CI_AS, s.SessionKey) > 0)))
    ORDER BY CASE WHEN @Search <> N'' AND
        (s.SessionKey COLLATE Latin1_General_100_CI_AS = @Search COLLATE Latin1_General_100_CI_AS OR
         s.SessionName COLLATE Latin1_General_100_CI_AS = @Search COLLATE Latin1_General_100_CI_AS) THEN 0 ELSE 1 END,
        s.LastUpdated DESC, s.SessionID DESC
    OFFSET @Offset ROWS FETCH NEXT 26 ROWS ONLY;
END;
GO
