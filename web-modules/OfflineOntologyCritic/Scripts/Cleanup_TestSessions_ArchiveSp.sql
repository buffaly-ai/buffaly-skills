IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE SPECIFIC_NAME = 'Cleanup_TestSessions_ArchiveSp')
BEGIN
    DROP PROCEDURE dbo.Cleanup_TestSessions_ArchiveSp
END
GO

CREATE PROCEDURE dbo.Cleanup_TestSessions_ArchiveSp
    @PreviewOnly bit = 1
AS
BEGIN
    SET NOCOUNT ON;

    ;WITH Candidates AS
    (
        SELECT
            s.SessionID,
            s.SessionKey,
            s.SessionName,
            s.AgentName,
            s.ParentSessionID,
            s.DateCreated,
            CASE
                WHEN LEN(s.SessionKey) = 32
                     AND s.SessionKey NOT LIKE '%[^0-9a-f]%' COLLATE Latin1_General_BIN2
                    THEN 'guid_like'
                WHEN s.SessionKey LIKE '%-level-two'
                     AND LEN(LEFT(s.SessionKey, LEN(s.SessionKey) - LEN('-level-two'))) = 32
                     AND LEFT(s.SessionKey, LEN(s.SessionKey) - LEN('-level-two')) NOT LIKE '%[^0-9a-f]%' COLLATE Latin1_General_BIN2
                    THEN 'guid_level_two'
                WHEN s.SessionName LIKE 'CorePath Renamed %'
                     AND LEN(SUBSTRING(s.SessionName, LEN('CorePath Renamed ' ) + 1, 200)) BETWEEN 6 AND 12
                     AND SUBSTRING(s.SessionName, LEN('CorePath Renamed ' ) + 1, 200) NOT LIKE '%[^0-9a-f]%' COLLATE Latin1_General_BIN2
                    THEN 'corepath_renamed_random'
                WHEN s.SessionKey LIKE 'release-validation-%-level-two'
                    THEN 'release_validation_level_two'
                WHEN s.SessionKey LIKE 'release-validation-%'
                    THEN 'release_validation_synthetic'
                WHEN s.SessionKey LIKE 'installer-validation-%-level-two'
                    THEN 'installer_validation_level_two'
                WHEN s.SessionKey LIKE 'installer-validation-%'
                    THEN 'installer_validation_synthetic'
                ELSE NULL
            END AS MatchReason
        FROM dbo.Sessions s
        WHERE ISNULL(s.IsArchived, 0) = 0
    )
    SELECT SessionID, SessionKey, SessionName, AgentName, ParentSessionID, DateCreated, MatchReason
    INTO #Candidates
    FROM Candidates
    WHERE MatchReason IS NOT NULL;

    IF @PreviewOnly = 0
    BEGIN
        UPDATE s
        SET
            s.IsArchived = 1,
            s.LastUpdated = GETDATE()
        FROM dbo.Sessions s
        INNER JOIN #Candidates c ON c.SessionID = s.SessionID;
    END

    SELECT MatchReason, COUNT(*) AS SessionCount
    FROM #Candidates
    GROUP BY MatchReason
    ORDER BY MatchReason;

    SELECT COUNT(*) AS TotalMatched, @PreviewOnly AS PreviewOnly
    FROM #Candidates;

    SELECT SessionID, SessionKey, SessionName, AgentName, ParentSessionID, DateCreated, MatchReason
    FROM #Candidates
    ORDER BY DateCreated DESC, SessionID DESC;
END
GO
