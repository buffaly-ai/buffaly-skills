SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[GetUsageDashboardProviderModelRowsSp]
	@StartUtc [datetime],
	@Provider [nvarchar](255),
	@ModelName [nvarchar](255),
	@Transport [nvarchar](255),
	@SessionID [int]
AS

	SET NOCOUNT ON

	-- Classify existing Claude receipts without rewriting the ledger or counting attempts as rows.
	WITH Receipts AS
	(
		SELECT u.*, r.RawUsage
		FROM dbo.UsageEvents u WITH (NOLOCK)
		OUTER APPLY OPENJSON(CASE WHEN u.Provider = 'anthropic' AND u.Transport = 'claude_code' THEN u.Data ELSE N'{}' END)
			WITH (RawUsage nvarchar(max) '$.RawUsage' AS JSON) r
		WHERE UsageOperation = 'completion'
			AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
			AND (ISNULL(@Provider, '') = '' OR Provider = @Provider)
			AND (ISNULL(@ModelName, '') = '' OR ModelName = @ModelName)
			AND (ISNULL(@Transport, '') = '' OR Transport = @Transport)
			AND (@SessionID IS NULL OR SessionID = @SessionID)
	), Classified AS
	(
		SELECT r.*,
			OperationKind = CASE
				WHEN Provider <> 'anthropic' OR Transport <> 'claude_code' THEN 'completion'
				WHEN JSON_VALUE(RawUsage, '$.operation') = 'native_compaction' OR JSON_VALUE(RawUsage, '$.InvocationDiagnostics.Operation') = 'native_compaction' THEN 'native_compaction'
				WHEN JSON_QUERY(RawUsage, '$.attempts') IS NOT NULL THEN 'corrective_attempts'
				WHEN JSON_VALUE(RawUsage, '$.cache_creation_input_tokens') IS NOT NULL THEN 'completion'
				ELSE 'unclassified' END,
			CacheCreationTokens = CASE
				WHEN JSON_VALUE(RawUsage, '$.operation') = 'native_compaction' THEN CONVERT(bigint, JSON_VALUE(RawUsage, '$.delta.cache_creation_tokens'))
				WHEN JSON_QUERY(RawUsage, '$.attempts') IS NOT NULL THEN a.CacheCreationTokens
				ELSE CONVERT(bigint, JSON_VALUE(RawUsage, '$.cache_creation_input_tokens')) END
		FROM Receipts r
		OUTER APPLY
		(
			SELECT CacheCreationTokens = CASE WHEN COUNT_BIG(*) = COUNT_BIG(v.CacheCreationTokens) THEN SUM(v.CacheCreationTokens) END
			FROM OPENJSON(r.RawUsage, '$.attempts') j
			CROSS APPLY OPENJSON(j.value) WITH (usage nvarchar(max) '$.usage') t
			-- A corrective process can fail before returning a receipt; keep that attempt unknown.
			OUTER APPLY OPENJSON(NULLIF(t.usage, N'')) WITH (CacheCreationTokens bigint '$.cache_creation_input_tokens') v
		) a
	)
	SELECT TOP 100
		Provider = ISNULL(Provider, ''),
		ModelName = ISNULL(ModelName, ''),
		Transport = ISNULL(Transport, ''),
		OperationKind,
		CacheCreationTokens = CASE WHEN COUNT_BIG(*) = COUNT_BIG(CacheCreationTokens) THEN SUM(CacheCreationTokens) END,
		Requests = CONVERT(bigint, COUNT_BIG(*)),
		InputTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, InputTokens)), 0)),
		OutputTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, OutputTokens)), 0)),
		CachedTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, CachedTokens)), 0)),
		ReasoningTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, ReasoningTokens)), 0)),
		TotalTokens = CONVERT(bigint, ISNULL(SUM(CONVERT(bigint, TotalTokens)), 0)),
		AverageLatencyMs = CONVERT(decimal(18, 2), ISNULL(AVG(CONVERT(decimal(18, 2), LatencyMs)), 0))
	FROM Classified
	GROUP BY ISNULL(Provider, ''), ISNULL(ModelName, ''), ISNULL(Transport, ''), OperationKind
	ORDER BY TotalTokens DESC, Requests DESC, Provider ASC, ModelName ASC, Transport ASC, OperationKind ASC

GO
