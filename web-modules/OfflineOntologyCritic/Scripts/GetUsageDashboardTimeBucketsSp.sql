IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetUsageDashboardTimeBucketsSp')
BEGIN
	DROP PROCEDURE GetUsageDashboardTimeBucketsSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetUsageDashboardTimeBucketsSp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int],
	@BucketGranularity [nvarchar](32)
AS

	SET NOCOUNT ON

	SELECT
		BucketStartUtc = CASE
			WHEN @BucketGranularity = 'hour' THEN DATEADD(hour, DATEDIFF(hour, 0, DateCreated), 0)
			WHEN @BucketGranularity = 'day' THEN DATEADD(day, DATEDIFF(day, 0, DateCreated), 0)
			ELSE DATEADD(day, DATEDIFF(day, 0, DateCreated), 0)
		END,
		Provider = ISNULL(Provider, ''),
		Requests = CONVERT(bigint, COUNT_BIG(*)),
		TotalTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, TotalTokens)), 0))
	FROM dbo.UsageEvents WITH (NOLOCK)
	WHERE UsageOperation = 'completion'
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR Transport = @Transport)
		AND (@SessionID IS NULL OR SessionID = @SessionID)
	GROUP BY
		CASE
			WHEN @BucketGranularity = 'hour' THEN DATEADD(hour, DATEDIFF(hour, 0, DateCreated), 0)
			WHEN @BucketGranularity = 'day' THEN DATEADD(day, DATEDIFF(day, 0, DateCreated), 0)
			ELSE DATEADD(day, DATEDIFF(day, 0, DateCreated), 0)
		END,
		ISNULL(Provider, '')
	ORDER BY BucketStartUtc ASC, Provider ASC

GO
