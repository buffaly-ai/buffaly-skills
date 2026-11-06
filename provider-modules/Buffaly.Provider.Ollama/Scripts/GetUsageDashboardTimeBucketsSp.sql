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
	@BucketGranularity [nvarchar](32),
	@TimeZoneID [nvarchar](128) = 'UTC'
AS

	SET NOCOUNT ON

	-- Bucket by the browser's calendar date; convert the local boundary back to UTC for the typed result.
	SELECT
		BucketStartUtc = CONVERT(datetime, b.BucketStartUtc),
		Provider = ISNULL(Provider, ''),
		Requests = CONVERT(bigint, COUNT_BIG(*)),
		CachedTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, CachedTokens)), 0)),
		TotalTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, TotalTokens)), 0)),
		AverageLatencyMs = CONVERT(decimal(18, 2), ISNULL(AVG(CONVERT(decimal(18, 2), LatencyMs)), 0))
	FROM dbo.UsageEvents WITH (NOLOCK)
	CROSS APPLY (SELECT LocalCreated = DateCreated AT TIME ZONE 'UTC' AT TIME ZONE @TimeZoneID) local
	CROSS APPLY (SELECT BucketStartUtc = CASE WHEN @BucketGranularity = 'hour'
		THEN TODATETIMEOFFSET(DATEADD(minute, -DATEPART(tzoffset, local.LocalCreated), DATEADD(hour, DATEDIFF(hour, 0, CONVERT(datetime2, local.LocalCreated)), CONVERT(datetime2, '19000101'))), '+00:00')
		ELSE CONVERT(datetime2, CONVERT(date, DateCreated AT TIME ZONE 'UTC' AT TIME ZONE @TimeZoneID)) AT TIME ZONE @TimeZoneID AT TIME ZONE 'UTC'
		END) b
	WHERE UsageOperation = 'completion'
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR Transport = @Transport)
		AND (@SessionID IS NULL OR SessionID = @SessionID)
	GROUP BY b.BucketStartUtc, ISNULL(Provider, '')
	ORDER BY BucketStartUtc ASC, Provider ASC

GO
