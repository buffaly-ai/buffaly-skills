IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetUsageDashboardProviderModelRowsSp')
BEGIN
	DROP PROCEDURE GetUsageDashboardProviderModelRowsSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetUsageDashboardProviderModelRowsSp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int]
AS

	SET NOCOUNT ON

	SELECT TOP 100
		Provider = ISNULL(Provider, ''),
		ModelName = ISNULL(ModelName, ''),
		Transport = ISNULL(Transport, ''),
		Requests = CONVERT(bigint, COUNT_BIG(*)),
		InputTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, InputTokens)), 0)),
		OutputTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, OutputTokens)), 0)),
		CachedTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, CachedTokens)), 0)),
		ReasoningTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, ReasoningTokens)), 0)),
		TotalTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, TotalTokens)), 0)),
		AverageLatencyMs = CONVERT(decimal(18, 2), ISNULL(AVG(CONVERT(decimal(18, 2), LatencyMs)), 0))
	FROM dbo.UsageEvents WITH (NOLOCK)
	WHERE UsageOperation = 'completion'
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR Transport = @Transport)
		AND (@SessionID IS NULL OR SessionID = @SessionID)
	GROUP BY ISNULL(Provider, ''), ISNULL(ModelName, ''), ISNULL(Transport, '')
	ORDER BY TotalTokens DESC, Requests DESC, Provider ASC, ModelName ASC, Transport ASC

GO
