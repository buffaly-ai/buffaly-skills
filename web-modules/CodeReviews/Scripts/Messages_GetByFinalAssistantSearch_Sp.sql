CREATE OR ALTER PROCEDURE [dbo].[Messages_GetByFinalAssistantSearch_Sp]
    @Search nvarchar(255),
    @MaxRows int = 25,
    @SearchScope nvarchar(20) = N'recent',
    @MaxMessageScanCount int = 2500
AS
BEGIN
    SET NOCOUNT ON;

    IF @Search IS NULL OR LTRIM(RTRIM(@Search)) = N''
        THROW 50011, 'Search is required.', 1;

    IF @MaxRows IS NULL OR @MaxRows < 1 OR @MaxRows > 200
        THROW 50012, 'MaxRows must be between 1 and 200.', 1;

    IF @SearchScope IS NULL OR LTRIM(RTRIM(@SearchScope)) = N''
        SET @SearchScope = N'recent';

    SET @SearchScope = LOWER(LTRIM(RTRIM(@SearchScope)));

    IF @SearchScope NOT IN (N'recent', N'deep', N'all')
        THROW 50013, 'SearchScope must be recent, deep, or all.', 1;

    IF @SearchScope = N'recent'
    BEGIN
        IF @MaxMessageScanCount IS NULL OR @MaxMessageScanCount <= 0
            SET @MaxMessageScanCount = 2500;

        IF @MaxMessageScanCount > 25000
            THROW 50014, 'Recent final-answer search cannot scan more than 25000 messages.', 1;
    END;

    IF @SearchScope = N'deep'
    BEGIN
        IF @MaxMessageScanCount IS NULL OR @MaxMessageScanCount <= 0
            SET @MaxMessageScanCount = 1000000;

        IF @MaxMessageScanCount > 2000000
            THROW 50015, 'Deep final-answer search cannot scan more than 2000000 messages.', 1;
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
            m.Role = N'assistant'
            AND m.Content LIKE N'%' + @Search + N'%'
            AND s.SessionKey NOT LIKE N'%level-two%'
            AND m.MessageKind = N'final_answer'
        ORDER BY
            m.MessageID DESC;

        RETURN;
    END;

    ;WITH RecentCandidates AS
    (
        SELECT TOP (@MaxMessageScanCount)
            m.MessageID
        FROM dbo.Messages m WITH (NOLOCK, INDEX(IX_Messages_Role_MessageID_Desc))
        WHERE
            m.Role = N'assistant'
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
        m.Content LIKE N'%' + @Search + N'%'
        AND s.SessionKey NOT LIKE N'%level-two%'
        AND m.MessageKind = N'final_answer'
    ORDER BY
        m.MessageID DESC
    OPTION (RECOMPILE);
END;
GO
