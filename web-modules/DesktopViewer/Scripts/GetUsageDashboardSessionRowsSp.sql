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

	-- Rank ten sessions across the selected providers/models, not ten session/model combinations.
	SELECT TOP 10
		s.SessionID,
		s.SessionKey,
		SessionName = ISNULL(NULLIF(s.SessionName, ''), s.SessionKey),
		Provider = CASE WHEN COUNT(DISTINCT ISNULL(ue.Provider, '')) = 1 THEN MIN(ISNULL(ue.Provider, '')) ELSE '(multiple)' END,
		ModelName = CASE WHEN COUNT(DISTINCT ISNULL(ue.ModelName, '')) = 1 THEN MIN(ISNULL(ue.ModelName, '')) ELSE '(multiple)' END,
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
	GROUP BY s.SessionID, s.SessionKey, ISNULL(NULLIF(s.SessionName, ''), s.SessionKey)
	ORDER BY TotalTokens DESC, Requests DESC, LastUsedUtc DESC, s.SessionID ASC

GO
