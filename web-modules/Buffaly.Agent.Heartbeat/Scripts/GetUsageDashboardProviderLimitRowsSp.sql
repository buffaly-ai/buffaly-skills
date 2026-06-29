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
	@SessionID [int]
AS

	SET NOCOUNT ON

	SELECT TOP 25
		CompletionUsageEventID = c.UsageEventID,
		c.ProviderLimitSnapshotUsageEventID,
		SnapshotUsageEventID = s.UsageEventID,
		Provider = ISNULL(c.Provider, ''),
		ModelName = ISNULL(c.ModelName, ''),
		Transport = ISNULL(c.Transport, ''),
		s.ProviderResponseID,
		s.Data,
		SnapshotDateCreatedUtc = s.DateCreated
	FROM dbo.UsageEvents c WITH (NOLOCK)
	LEFT JOIN dbo.UsageEvents s WITH (NOLOCK) ON s.UsageEventID = c.ProviderLimitSnapshotUsageEventID
	WHERE c.UsageOperation = 'completion'
		AND c.ProviderLimitSnapshotUsageEventID IS NOT NULL
		AND (@StartUtc IS NULL OR c.DateCreated >= @StartUtc)
		AND (ISNULL(@Provider, '') = '' OR c.Provider = @Provider)
		AND (ISNULL(@ModelName, '') = '' OR c.ModelName = @ModelName)
		AND (ISNULL(@Transport, '') = '' OR c.Transport = @Transport)
		AND (@SessionID IS NULL OR c.SessionID = @SessionID)
	ORDER BY c.DateCreated DESC, c.UsageEventID DESC

GO
