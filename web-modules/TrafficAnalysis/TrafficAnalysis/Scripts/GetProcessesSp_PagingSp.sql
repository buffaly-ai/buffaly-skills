IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetProcessesSp_PagingSp')
BEGIN
	DROP PROCEDURE GetProcessesSp_PagingSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetProcessesSp_PagingSp]
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
	
	with SearchTable as
	(
	
		SELECT		ROW_NUMBER() OVER (
					ORDER BY
					
			
						case when @SortColumn = 'ProcessID' and @SortAscending = 1 then 
							[ProcessID]
						end ASC,
						case when @SortColumn = 'ProcessID' and @SortAscending = 0 then 
							[ProcessID]
						end DESC,
			
						case when @SortColumn = 'ProcessName' and @SortAscending = 1 then 
							[ProcessName]
						end ASC,
						case when @SortColumn = 'ProcessName' and @SortAscending = 0 then 
							[ProcessName]
						end DESC,
			
						case when @SortColumn = 'Url' and @SortAscending = 1 then 
							[Url]
						end ASC,
						case when @SortColumn = 'Url' and @SortAscending = 0 then 
							[Url]
						end DESC,
			
						case when @SortColumn = 'Action' and @SortAscending = 1 then 
							[Action]
						end ASC,
						case when @SortColumn = 'Action' and @SortAscending = 0 then 
							[Action]
						end DESC,
			
						case when @SortColumn = 'RunData' and @SortAscending = 1 then 
							[RunData]
						end ASC,
						case when @SortColumn = 'RunData' and @SortAscending = 0 then 
							[RunData]
						end DESC,
			
						case when @SortColumn = 'IsRunning' and @SortAscending = 1 then 
							[IsRunning]
						end ASC,
						case when @SortColumn = 'IsRunning' and @SortAscending = 0 then 
							[IsRunning]
						end DESC,
			
						case when @SortColumn = 'RunStarted' and @SortAscending = 1 then 
							[RunStarted]
						end ASC,
						case when @SortColumn = 'RunStarted' and @SortAscending = 0 then 
							[RunStarted]
						end DESC,
			
						case when @SortColumn = 'RunEnded' and @SortAscending = 1 then 
							[RunEnded]
						end ASC,
						case when @SortColumn = 'RunEnded' and @SortAscending = 0 then 
							[RunEnded]
						end DESC,
			
						case when @SortColumn = 'RunEvery' and @SortAscending = 1 then 
							[RunEvery]
						end ASC,
						case when @SortColumn = 'RunEvery' and @SortAscending = 0 then 
							[RunEvery]
						end DESC,
			
						case when @SortColumn = 'IsEnabled' and @SortAscending = 1 then 
							[IsEnabled]
						end ASC,
						case when @SortColumn = 'IsEnabled' and @SortAscending = 0 then 
							[IsEnabled]
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
			
						case when @SortColumn = 'MaximumRunTime' and @SortAscending = 1 then 
							[MaximumRunTime]
						end ASC,
						case when @SortColumn = 'MaximumRunTime' and @SortAscending = 0 then 
							[MaximumRunTime]
						end DESC,
			
						case when @SortColumn = 'IsTimedOut' and @SortAscending = 1 then 
							[IsTimedOut]
						end ASC,
						case when @SortColumn = 'IsTimedOut' and @SortAscending = 0 then 
							[IsTimedOut]
						end DESC									
					) AS RowNumber,
					*
		FROM		(
					-- Automatically generated on 4/8/2026 10:11:10 AM.
    
    SELECT *
    FROM Processes WITH (NOLOCK) 
					) sub
		where		
					[ProcessID] like '%' + @Search + '%' or
					[ProcessName] like '%' + @Search + '%' or
					[Url] like '%' + @Search + '%' or
					[Action] like '%' + @Search + '%' 
	)
			
	SELECT	*
	FROM	SearchTable
	WHERE	RowNumber BETWEEN @FirstRow AND @LastRow
	ORDER BY RowNumber ASC
	OPTION (recompile);
	
	
		
GO
