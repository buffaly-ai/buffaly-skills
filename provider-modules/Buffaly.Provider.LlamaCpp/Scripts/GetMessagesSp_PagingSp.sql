IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesSp_PagingSp')
BEGIN
	DROP PROCEDURE GetMessagesSp_PagingSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesSp_PagingSp]
	@Search [nvarchar](255),
	@SortColumn [nvarchar](255),
	@SortAscending [bit],
	@SkipRows [int],
	@NumRows [int]
AS


	SET NOCOUNT ON

	DECLARE	@FirstRow INT,
	@LastRow INT
	DECLARE @SearchPattern nvarchar(260) = '%' + @Search + '%'
	DECLARE @SearchMessageID int = TRY_CONVERT(int, @Search)

	set @FirstRow = @SkipRows + 1;
	set @LastRow = @SkipRows + @NumRows;
	
	with SearchTable as
	(
	
		SELECT		ROW_NUMBER() OVER (
					ORDER BY
					
			
						case when @SortColumn = 'MessageID' and @SortAscending = 1 then 
							[MessageID]
						end ASC,
						case when @SortColumn = 'MessageID' and @SortAscending = 0 then 
							[MessageID]
						end DESC,
			
						case when @SortColumn = 'SessionID' and @SortAscending = 1 then 
							[SessionID]
						end ASC,
						case when @SortColumn = 'SessionID' and @SortAscending = 0 then 
							[SessionID]
						end DESC,
			
						case when @SortColumn = 'SequenceNumber' and @SortAscending = 1 then 
							[SequenceNumber]
						end ASC,
						case when @SortColumn = 'SequenceNumber' and @SortAscending = 0 then 
							[SequenceNumber]
						end DESC,
			
						case when @SortColumn = 'Role' and @SortAscending = 1 then 
							[Role]
						end ASC,
						case when @SortColumn = 'Role' and @SortAscending = 0 then 
							[Role]
						end DESC,
			
						case when @SortColumn = 'ToolName' and @SortAscending = 1 then 
							[ToolName]
						end ASC,
						case when @SortColumn = 'ToolName' and @SortAscending = 0 then 
							[ToolName]
						end DESC,
			
						case when @SortColumn = 'ToolArguments' and @SortAscending = 1 then 
							[ToolArguments]
						end ASC,
						case when @SortColumn = 'ToolArguments' and @SortAscending = 0 then 
							[ToolArguments]
						end DESC,
			
						case when @SortColumn = 'CallID' and @SortAscending = 1 then 
							[CallID]
						end ASC,
						case when @SortColumn = 'CallID' and @SortAscending = 0 then 
							[CallID]
						end DESC,
			
						case when @SortColumn = 'DateCreated' and @SortAscending = 1 then 
							[DateCreated]
						end ASC,
						case when @SortColumn = 'DateCreated' and @SortAscending = 0 then 
							[DateCreated]
						end DESC,
			
						case when @SortColumn = 'LastUpdated' and @SortAscending = 1 then 
							[LastUpdated]
						end ASC,
						case when @SortColumn = 'LastUpdated' and @SortAscending = 0 then 
							[LastUpdated]
						end DESC,
			
						case when @SortColumn = 'Data' and @SortAscending = 1 then 
							[Data]
						end ASC,
						case when @SortColumn = 'Data' and @SortAscending = 0 then 
							[Data]
						end DESC,
			
						case when @SortColumn = 'IsCompacted' and @SortAscending = 1 then 
							[IsCompacted]
						end ASC,
						case when @SortColumn = 'IsCompacted' and @SortAscending = 0 then 
							[IsCompacted]
						end DESC,
			
						case when @SortColumn = 'CompactionEpoch' and @SortAscending = 1 then 
							[CompactionEpoch]
						end ASC,
						case when @SortColumn = 'CompactionEpoch' and @SortAscending = 0 then 
							[CompactionEpoch]
						end DESC,
			
						case when @SortColumn = 'MessageKey' and @SortAscending = 1 then 
							[MessageKey]
						end ASC,
						case when @SortColumn = 'MessageKey' and @SortAscending = 0 then 
							[MessageKey]
						end DESC,
			
						case when @SortColumn = 'CompactionEpochKey' and @SortAscending = 1 then 
							[CompactionEpochKey]
						end ASC,
						case when @SortColumn = 'CompactionEpochKey' and @SortAscending = 0 then 
							[CompactionEpochKey]
						end DESC,
			
						case when @SortColumn = 'TurnID' and @SortAscending = 1 then 
							[TurnID]
						end ASC,
						case when @SortColumn = 'TurnID' and @SortAscending = 0 then 
							[TurnID]
						end DESC									
					) AS RowNumber,
					*
		FROM		(
					-- Automatically generated on 4/10/2026 7:48:51 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
					) sub
		where		
					@Search IS NULL or LTRIM(RTRIM(@Search)) = '' or
					(@SearchMessageID IS NOT NULL AND [MessageID] = @SearchMessageID) or
					[Role] like @SearchPattern or
					[ToolName] like @SearchPattern or
					[CallID] like @SearchPattern or
					[MessageKey] like @SearchPattern or
					[CompactionEpochKey] like @SearchPattern or
					[TurnID] like @SearchPattern 
	)
			
	SELECT	*
	FROM	SearchTable
	WHERE	RowNumber BETWEEN @FirstRow AND @LastRow
	ORDER BY RowNumber ASC
	OPTION (recompile);
	
	
		
GO
