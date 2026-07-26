IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetUsageDashboardProviderLimitRowsSp')
BEGIN
	DROP PROCEDURE GetUsageDashboardProviderLimitRowsSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetUsageDashboardProviderLimitRowsSp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int],
	@BucketGranularity [nvarchar](32) = 'hour'
AS

	SET NOCOUNT ON

	;WITH SnapshotRows AS (
		SELECT
			s.UsageEventID,
			s.Provider,
			s.ModelName,
			s.Transport,
			s.ProviderResponseID,
			s.Data,
			s.DateCreated,
			BucketStartUtc = CASE
				WHEN @BucketGranularity = 'hour' THEN DATEADD(hour, DATEDIFF(hour, 0, s.DateCreated), 0)
				WHEN @BucketGranularity = 'day' THEN DATEADD(day, DATEDIFF(day, 0, s.DateCreated), 0)
				ELSE DATEADD(day, DATEDIFF(day, 0, s.DateCreated), 0)
			END
		FROM dbo.UsageEvents s WITH (NOLOCK)
		WHERE s.UsageOperation = 'provider_limit_snapshot'
			AND (@StartUtc IS NULL OR s.DateCreated >= @StartUtc)
			AND (ISNULL(@Provider, '') = '' OR s.Provider = @Provider)
			AND (ISNULL(@ModelName, '') = '' OR s.ModelName = @ModelName)
			AND (ISNULL(@Transport, '') = '' OR s.Transport = @Transport)
			AND (@SessionID IS NULL OR s.SessionID = @SessionID)
	), RankedRows AS (
		SELECT *, RowNumber = ROW_NUMBER() OVER (PARTITION BY BucketStartUtc ORDER BY DateCreated DESC, UsageEventID DESC)
		FROM SnapshotRows
	)
	SELECT
		CompletionUsageEventID = UsageEventID,
		ProviderLimitSnapshotUsageEventID = NULL,
		SnapshotUsageEventID = UsageEventID,
		Provider = ISNULL(Provider, ''),
		ModelName = ISNULL(ModelName, ''),
		Transport = ISNULL(Transport, ''),
		ProviderResponseID,
		Data,
		SnapshotDateCreatedUtc = BucketStartUtc
	FROM RankedRows
	WHERE RowNumber = 1
	ORDER BY BucketStartUtc DESC, UsageEventID DESC

GO

