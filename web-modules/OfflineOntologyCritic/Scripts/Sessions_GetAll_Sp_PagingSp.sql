IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Sessions_GetAll_Sp_PagingSp')
BEGIN
	DROP PROCEDURE Sessions_GetAll_Sp_PagingSp
END
GO
SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Sessions_GetAll_Sp_PagingSp]
	@Search [nvarchar](255),
	@SortColumn [nvarchar](255),
	@SortAscending [bit],
	@SkipRows [int],
	@NumRows [int]
AS

	SET NOCOUNT ON

	DECLARE	@FirstRow INT,
		@LastRow INT

	set @FirstRow = @SkipRows + 1;
	set @LastRow = @SkipRows + @NumRows;

	DECLARE @SearchPattern NVARCHAR(257)
	set @SearchPattern = '%' + ISNULL(@Search, '') + '%';
	
	with RootSessionActivity as
	(
		SELECT		p.SessionID,
					CASE
						WHEN MAX(c.LastUpdated) IS NOT NULL AND MAX(c.LastUpdated) > p.LastUpdated THEN MAX(c.LastUpdated)
						ELSE p.LastUpdated
					END AS EffectiveLastUpdated
		FROM		Sessions p WITH (NOLOCK)
		LEFT JOIN	Sessions c WITH (NOLOCK)
		ON			c.ParentSessionID = p.SessionID
					AND ISNULL(c.IsArchived, 0) = 0
		WHERE		ISNULL(p.IsArchived, 0) = 0
					AND p.ParentSessionID IS NULL
		GROUP BY	p.SessionID,
					p.LastUpdated
	),
	SearchTable as
	(
		SELECT		ROW_NUMBER() OVER (
					ORDER BY
						case when @SortColumn = 'LastUpdated' and @SortAscending = 1 then ISNULL(a.EffectiveLastUpdated, s.LastUpdated) end ASC,
						case when @SortColumn = 'LastUpdated' and @SortAscending = 0 then ISNULL(a.EffectiveLastUpdated, s.LastUpdated) end DESC,
						case when @SortColumn = 'SessionID' and @SortAscending = 1 then s.[SessionID] end ASC,
						case when @SortColumn = 'SessionID' and @SortAscending = 0 then s.[SessionID] end DESC,
						case when @SortColumn = 'SessionKey' and @SortAscending = 1 then s.[SessionKey] end ASC,
						case when @SortColumn = 'SessionKey' and @SortAscending = 0 then s.[SessionKey] end DESC,
						case when @SortColumn = 'AgentName' and @SortAscending = 1 then s.[AgentName] end ASC,
						case when @SortColumn = 'AgentName' and @SortAscending = 0 then s.[AgentName] end DESC,
						case when @SortColumn = 'ProjectName' and @SortAscending = 1 then s.[ProjectName] end ASC,
						case when @SortColumn = 'ProjectName' and @SortAscending = 0 then s.[ProjectName] end DESC,
						case when @SortColumn = 'ProjectFilePath' and @SortAscending = 1 then s.[ProjectFilePath] end ASC,
						case when @SortColumn = 'ProjectFilePath' and @SortAscending = 0 then s.[ProjectFilePath] end DESC,
						case when @SortColumn = 'Provider' and @SortAscending = 1 then s.[Provider] end ASC,
						case when @SortColumn = 'Provider' and @SortAscending = 0 then s.[Provider] end DESC,
						case when @SortColumn = 'ModelName' and @SortAscending = 1 then s.[ModelName] end ASC,
						case when @SortColumn = 'ModelName' and @SortAscending = 0 then s.[ModelName] end DESC,
						case when @SortColumn = 'ReasoningLevel' and @SortAscending = 1 then s.[ReasoningLevel] end ASC,
						case when @SortColumn = 'ReasoningLevel' and @SortAscending = 0 then s.[ReasoningLevel] end DESC,
						case when @SortColumn = 'DateCreated' and @SortAscending = 1 then s.[DateCreated] end ASC,
						case when @SortColumn = 'DateCreated' and @SortAscending = 0 then s.[DateCreated] end DESC,
						case when @SortColumn = 'Data' and @SortAscending = 1 then s.[Data] end ASC,
						case when @SortColumn = 'Data' and @SortAscending = 0 then s.[Data] end DESC,
						case when @SortColumn = 'SessionName' and @SortAscending = 1 then s.[SessionName] end ASC,
						case when @SortColumn = 'SessionName' and @SortAscending = 0 then s.[SessionName] end DESC,
						case when @SortColumn = 'ParentSessionID' and @SortAscending = 1 then s.[ParentSessionID] end ASC,
						case when @SortColumn = 'ParentSessionID' and @SortAscending = 0 then s.[ParentSessionID] end DESC,
						case when @SortColumn = 'IsArchived' and @SortAscending = 1 then s.[IsArchived] end ASC,
						case when @SortColumn = 'IsArchived' and @SortAscending = 0 then s.[IsArchived] end DESC,
						ISNULL(a.EffectiveLastUpdated, s.LastUpdated) DESC,
						s.SessionID DESC
					) AS RowNumber,
					s.SessionID,
					s.SessionKey,
					s.AgentName,
					s.ProjectName,
					s.ProjectFilePath,
					s.Provider,
					s.ModelName,
					s.ReasoningLevel,
					s.PromptContext,
					-- HACK: this paging projection reuses DateCreated to carry the row's own LastUpdated.
					-- The generated SessionsRow has no spare projection fields; LastUpdated below remains effective activity for ordering compatibility.
					s.LastUpdated AS DateCreated,
					ISNULL(a.EffectiveLastUpdated, s.LastUpdated) AS LastUpdated,
					s.Data,
					s.SessionName,
					s.ParentSessionID,
					s.IsArchived
		FROM		Sessions s WITH (NOLOCK)
		LEFT JOIN	RootSessionActivity a
		ON			s.SessionID = a.SessionID
		where		ISNULL(s.IsArchived, 0) = 0 AND (
					s.[SessionKey] like @SearchPattern or
					s.[SessionName] like @SearchPattern)
	)
			
	SELECT	*
	FROM	SearchTable
	WHERE	RowNumber BETWEEN @FirstRow AND @LastRow
	ORDER BY RowNumber ASC
	OPTION (recompile);
GO
