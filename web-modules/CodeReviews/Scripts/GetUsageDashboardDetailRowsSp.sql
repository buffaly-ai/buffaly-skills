IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetUsageDashboardDetailRowsSp')
BEGIN
	DROP PROCEDURE GetUsageDashboardDetailRowsSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetUsageDashboardDetailRowsSp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int]
AS

	SET NOCOUNT ON

	SELECT TOP 250
		ue.UsageEventID,
		ue.SessionID,
		s.SessionKey,
		SessionName = ISNULL(NULLIF(s.SessionName, ''), s.SessionKey),
		Provider = ISNULL(ue.Provider, ''),
		ModelName = ISNULL(ue.ModelName, ''),
		Transport = ISNULL(ue.Transport, ''),
		ue.ReasoningLevel,
		ue.ProviderRequestID,
		ue.ProviderResponseID,
		InputTokens = CONVERT(bigint, ue.InputTokens),
		OutputTokens = CONVERT(bigint, ue.OutputTokens),
		CachedTokens = CONVERT(bigint, ue.CachedTokens),
		ReasoningTokens = CONVERT(bigint, ue.ReasoningTokens),
		TotalTokens = CONVERT(bigint, ue.TotalTokens),
		LatencyMs = ue.LatencyMs,
		ue.ProviderLimitSnapshotUsageEventID,
		DateCreatedUtc = ue.DateCreated
	FROM dbo.UsageEvents ue WITH (NOLOCK)
	INNER JOIN dbo.Sessions s WITH (NOLOCK) ON s.SessionID = ue.SessionID
	WHERE ue.UsageOperation = 'completion'
		AND (@StartUtc IS NULL OR ue.DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR ue.Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ue.ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR ue.Transport = @Transport)
		AND (@SessionID IS NULL OR ue.SessionID = @SessionID)
	ORDER BY ue.DateCreated DESC, ue.UsageEventID DESC

GO
