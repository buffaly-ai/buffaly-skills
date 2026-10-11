IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetPageLayoutsSp_PagingSp')
BEGIN
	DROP PROCEDURE GetPageLayoutsSp_PagingSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetPageLayoutsSp_PagingSp]
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
					
			
						case when @SortColumn = 'PageLayoutID' and @SortAscending = 1 then 
							[PageLayoutID]
						end ASC,
						case when @SortColumn = 'PageLayoutID' and @SortAscending = 0 then 
							[PageLayoutID]
						end DESC,
			
						case when @SortColumn = 'Url' and @SortAscending = 1 then 
							[Url]
						end ASC,
						case when @SortColumn = 'Url' and @SortAscending = 0 then 
							[Url]
						end DESC,
			
						case when @SortColumn = 'Handler' and @SortAscending = 1 then 
							[Handler]
						end ASC,
						case when @SortColumn = 'Handler' and @SortAscending = 0 then 
							[Handler]
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
			
						case when @SortColumn = 'PageTitle' and @SortAscending = 1 then 
							[PageTitle]
						end ASC,
						case when @SortColumn = 'PageTitle' and @SortAscending = 0 then 
							[PageTitle]
						end DESC,
			
						case when @SortColumn = 'SiteID' and @SortAscending = 1 then 
							[SiteID]
						end ASC,
						case when @SortColumn = 'SiteID' and @SortAscending = 0 then 
							[SiteID]
						end DESC									
					) AS RowNumber,
					*
		FROM		(
					-- Automatically generated on 4/13/2026 2:48:40 PM.
    
    SELECT *
    FROM PageLayouts WITH (NOLOCK) 
					) sub
		where		
					[PageLayoutID] like '%' + @Search + '%' or
					[Url] like '%' + @Search + '%' or
					[Handler] like '%' + @Search + '%' or
					[PageTitle] like '%' + @Search + '%' 
	)
			
	SELECT	*
	FROM	SearchTable
	WHERE	RowNumber BETWEEN @FirstRow AND @LastRow
	ORDER BY RowNumber ASC
	OPTION (recompile);
	
	
		
GO
