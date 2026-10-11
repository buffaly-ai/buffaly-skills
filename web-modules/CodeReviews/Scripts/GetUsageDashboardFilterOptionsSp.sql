IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetUsageDashboardFilterOptionsSp')
BEGIN
	DROP PROCEDURE GetUsageDashboardFilterOptionsSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetUsageDashboardFilterOptionsSp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int]
AS

	SET NOCOUNT ON

	SELECT DISTINCT Provider = ISNULL(Provider, '')
	FROM dbo.UsageEvents WITH (NOLOCK)
	WHERE UsageOperation = 'completion'
		AND ISNULL(Provider, '') <> ''
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (ISNULL(@ModelName, '') = '' OR ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR Transport = @Transport)
		AND (@SessionID IS NULL OR SessionID = @SessionID)
	ORDER BY Provider ASC

	SELECT DISTINCT ModelName = ISNULL(ModelName, '')
	FROM dbo.UsageEvents WITH (NOLOCK)
	WHERE UsageOperation = 'completion'
		AND ISNULL(ModelName, '') <> ''
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR Provider = @Provider)
		AND (ISNULL(@Transport, '') = '' OR Transport = @Transport)
		AND (@SessionID IS NULL OR SessionID = @SessionID)
	ORDER BY ModelName ASC

	SELECT DISTINCT Transport = ISNULL(Transport, '')
	FROM dbo.UsageEvents WITH (NOLOCK)
	WHERE UsageOperation = 'completion'
		AND ISNULL(Transport, '') <> ''
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ModelName = @ModelName)
		AND (@SessionID IS NULL OR SessionID = @SessionID)
	ORDER BY Transport ASC

	SELECT DISTINCT
		s.SessionID,
		s.SessionKey,
		SessionName = ISNULL(NULLIF(s.SessionName, ''), s.SessionKey)
	FROM dbo.UsageEvents ue WITH (NOLOCK)
	INNER JOIN dbo.Sessions s WITH (NOLOCK) ON s.SessionID = ue.SessionID
	WHERE ue.UsageOperation = 'completion'
		AND (@StartUtc IS NULL OR ue.DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR ue.Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ue.ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR ue.Transport = @Transport)
	ORDER BY SessionName ASC, s.SessionKey ASC

GO
