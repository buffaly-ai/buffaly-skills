-- Combined user/assistant message content search for the Exact Message Search page.
-- Recency windows and NOLOCK hints match 20260604_MessageSearchProcedures.sql.
-- Empty @Search lists newest matching-role rows instead of throwing.
-- Level 2 critic/guidance messages are excluded. SessionKey already skips companion
-- level-two sessions; this also drops source-session rows that start with [label: Level 2].
-- Use CHARINDEX, not LIKE: SQL Server LIKE treats [ as a character class.
CREATE OR ALTER PROCEDURE [dbo].[Messages_GetByUserAndAssistantSearch_Sp]
    @Search nvarchar(255) = N'',
    @RoleFilter nvarchar(20) = N'both',
    @MaxRows int = 25,
    @SearchScope nvarchar(20) = N'recent',
    @MaxMessageScanCount int = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @Search IS NULL
        SET @Search = N'';

    SET @Search = LTRIM(RTRIM(@Search));

    IF @RoleFilter IS NULL OR LTRIM(RTRIM(@RoleFilter)) = N''
        SET @RoleFilter = N'both';

    SET @RoleFilter = LOWER(LTRIM(RTRIM(@RoleFilter)));

    IF @RoleFilter NOT IN (N'both', N'user', N'assistant')
        THROW 50026, 'RoleFilter must be both, user, or assistant.', 1;

    IF @MaxRows IS NULL OR @MaxRows < 1 OR @MaxRows > 200
        THROW 50022, 'MaxRows must be between 1 and 200.', 1;

    IF @SearchScope IS NULL OR LTRIM(RTRIM(@SearchScope)) = N''
        SET @SearchScope = N'recent';

    SET @SearchScope = LOWER(LTRIM(RTRIM(@SearchScope)));

    IF @SearchScope NOT IN (N'recent', N'deep', N'all')
        THROW 50023, 'SearchScope must be recent, deep, or all.', 1;

    IF @SearchScope = N'recent'
    BEGIN
        IF @MaxMessageScanCount IS NULL OR @MaxMessageScanCount <= 0
            SET @MaxMessageScanCount = 2500;

        IF @MaxMessageScanCount > 25000
            THROW 50024, 'Recent message search cannot scan more than 25000 messages.', 1;
    END;

    IF @SearchScope = N'deep'
    BEGIN
        IF @MaxMessageScanCount IS NULL OR @MaxMessageScanCount <= 0
            SET @MaxMessageScanCount = 1000000;

        IF @MaxMessageScanCount > 2000000
            THROW 50025, 'Deep message search cannot scan more than 2000000 messages.', 1;
    END;

    IF @SearchScope = N'all'
    BEGIN
        SELECT TOP (@MaxRows)
            s.SessionKey,
            s.SessionName,
            m.*
        FROM dbo.Messages m WITH (NOLOCK)
        INNER JOIN dbo.Sessions s WITH (NOLOCK)
            ON s.SessionID = m.SessionID
        WHERE
            (
                (@RoleFilter = N'both' AND m.Role IN (N'user', N'assistant'))
                OR (@RoleFilter = N'user' AND m.Role = N'user')
                OR (@RoleFilter = N'assistant' AND m.Role = N'assistant')
            )
            AND (@Search = N'' OR m.Content LIKE N'%' + @Search + N'%')
            AND s.SessionKey NOT LIKE N'%level-two%'
            AND CHARINDEX(N'[label: Level 2]', LTRIM(m.Content)) <> 1
            AND CHARINDEX(N'[timeline-label: Level 2]', LTRIM(m.Content)) <> 1
        ORDER BY
            m.MessageID DESC;

        RETURN;
    END;

    IF @RoleFilter = N'both'
    BEGIN
        ;WITH UserCandidates AS
        (
            SELECT TOP (@MaxMessageScanCount)
                m.MessageID
            FROM dbo.Messages m WITH (NOLOCK, INDEX(IX_Messages_Role_MessageID_Desc))
            WHERE
                m.Role = N'user'
            ORDER BY
                m.MessageID DESC
        ),
        AssistantCandidates AS
        (
            SELECT TOP (@MaxMessageScanCount)
                m.MessageID
            FROM dbo.Messages m WITH (NOLOCK, INDEX(IX_Messages_Role_MessageID_Desc))
            WHERE
                m.Role = N'assistant'
            ORDER BY
                m.MessageID DESC
        ),
        RecentCandidates AS
        (
            SELECT MessageID FROM UserCandidates
            UNION
            SELECT MessageID FROM AssistantCandidates
        )
        SELECT TOP (@MaxRows)
            s.SessionKey,
            s.SessionName,
            m.*
        FROM RecentCandidates rc
        INNER JOIN dbo.Messages m WITH (NOLOCK)
            ON m.MessageID = rc.MessageID
        INNER JOIN dbo.Sessions s WITH (NOLOCK)
            ON s.SessionID = m.SessionID
        WHERE
            (@Search = N'' OR m.Content LIKE N'%' + @Search + N'%')
            AND s.SessionKey NOT LIKE N'%level-two%'
            AND CHARINDEX(N'[label: Level 2]', LTRIM(m.Content)) <> 1
            AND CHARINDEX(N'[timeline-label: Level 2]', LTRIM(m.Content)) <> 1
        ORDER BY
            m.MessageID DESC
        OPTION (RECOMPILE);

        RETURN;
    END;

    ;WITH RecentCandidates AS
    (
        SELECT TOP (@MaxMessageScanCount)
            m.MessageID
        FROM dbo.Messages m WITH (NOLOCK, INDEX(IX_Messages_Role_MessageID_Desc))
        WHERE
            m.Role = @RoleFilter
        ORDER BY
            m.MessageID DESC
    )
    SELECT TOP (@MaxRows)
        s.SessionKey,
        s.SessionName,
        m.*
    FROM RecentCandidates rc
    INNER JOIN dbo.Messages m WITH (NOLOCK)
        ON m.MessageID = rc.MessageID
    INNER JOIN dbo.Sessions s WITH (NOLOCK)
        ON s.SessionID = m.SessionID
        WHERE
            (@Search = N'' OR m.Content LIKE N'%' + @Search + N'%')
            AND s.SessionKey NOT LIKE N'%level-two%'
            AND CHARINDEX(N'[label: Level 2]', LTRIM(m.Content)) <> 1
            AND CHARINDEX(N'[timeline-label: Level 2]', LTRIM(m.Content)) <> 1
        ORDER BY
            m.MessageID DESC
        OPTION (RECOMPILE);
END;
GO
