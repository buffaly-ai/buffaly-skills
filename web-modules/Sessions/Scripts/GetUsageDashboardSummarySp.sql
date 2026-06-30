IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetUsageDashboardSummarySp')
BEGIN
	DROP PROCEDURE GetUsageDashboardSummarySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetUsageDashboardSummarySp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int]
AS

	SET NOCOUNT ON

	SELECT
		Requests = CONVERT(bigint, COUNT_BIG(*)),
		InputTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, InputTokens)), 0)),
		OutputTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, OutputTokens)), 0)),
		CachedTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, CachedTokens)), 0)),
		ReasoningTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, ReasoningTokens)), 0)),
		TotalTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, TotalTokens)), 0)),
		AverageTokensPerRequest = CONVERT(decimal(18, 2), CASE WHEN COUNT_BIG(*) = 0 THEN 0 ELSE CONVERT(decimal(18, 2), ISNULL(SUM(CONVERT(bigint, TotalTokens)), 0)) / COUNT_BIG(*) END),
		AverageLatencyMs = CONVERT(decimal(18, 2), ISNULL(AVG(CONVERT(decimal(18, 2), LatencyMs)), 0))
	FROM dbo.UsageEvents WITH (NOLOCK)
	WHERE UsageOperation = 'completion'
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR Transport = @Transport)
		AND (@SessionID IS NULL OR SessionID = @SessionID)

GO
