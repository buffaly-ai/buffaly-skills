IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetUsageDashboardSessionRowsSp')
BEGIN
	DROP PROCEDURE GetUsageDashboardSessionRowsSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetUsageDashboardSessionRowsSp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int]
AS

	SET NOCOUNT ON

	SELECT TOP 100
		s.SessionID,
		s.SessionKey,
		SessionName = ISNULL(NULLIF(s.SessionName, ''), s.SessionKey),
		Provider = ISNULL(ue.Provider, ''),
		ModelName = ISNULL(ue.ModelName, ''),
		Requests = CONVERT(bigint, COUNT_BIG(*)),
		TotalTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, ue.TotalTokens)), 0)),
		LastUsedUtc = MAX(ue.DateCreated)
	FROM dbo.UsageEvents ue WITH (NOLOCK)
	INNER JOIN dbo.Sessions s WITH (NOLOCK) ON s.SessionID = ue.SessionID
	WHERE ue.UsageOperation = 'completion'
		AND (@StartUtc IS NULL OR ue.DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR ue.Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ue.ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR ue.Transport = @Transport)
		AND (@SessionID IS NULL OR ue.SessionID = @SessionID)
	GROUP BY s.SessionID, s.SessionKey, ISNULL(NULLIF(s.SessionName, ''), s.SessionKey), ISNULL(ue.Provider, ''), ISNULL(ue.ModelName, '')
	ORDER BY TotalTokens DESC, Requests DESC, LastUsedUtc DESC

GO
