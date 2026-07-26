IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetFeaturesSp_PagingSp')
BEGIN
	DROP PROCEDURE GetFeaturesSp_PagingSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetFeaturesSp_PagingSp]
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
					
			
						case when @SortColumn = 'FeatureID' and @SortAscending = 1 then 
							[FeatureID]
						end ASC,
						case when @SortColumn = 'FeatureID' and @SortAscending = 0 then 
							[FeatureID]
						end DESC,
			
						case when @SortColumn = 'FeatureName' and @SortAscending = 1 then 
							[FeatureName]
						end ASC,
						case when @SortColumn = 'FeatureName' and @SortAscending = 0 then 
							[FeatureName]
						end DESC,
			
						case when @SortColumn = 'Version' and @SortAscending = 1 then 
							[Version]
						end ASC,
						case when @SortColumn = 'Version' and @SortAscending = 0 then 
							[Version]
						end DESC,
			
						case when @SortColumn = 'IsEnabled' and @SortAscending = 1 then 
							[IsEnabled]
						end ASC,
						case when @SortColumn = 'IsEnabled' and @SortAscending = 0 then 
							[IsEnabled]
						end DESC,
			
						case when @SortColumn = 'SettingsAssembly' and @SortAscending = 1 then 
							[SettingsAssembly]
						end ASC,
						case when @SortColumn = 'SettingsAssembly' and @SortAscending = 0 then 
							[SettingsAssembly]
						end DESC,
			
						case when @SortColumn = 'SettingsClass' and @SortAscending = 1 then 
							[SettingsClass]
						end ASC,
						case when @SortColumn = 'SettingsClass' and @SortAscending = 0 then 
							[SettingsClass]
						end DESC,
			
						case when @SortColumn = 'Settings' and @SortAscending = 1 then 
							[Settings]
						end ASC,
						case when @SortColumn = 'Settings' and @SortAscending = 0 then 
							[Settings]
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
						end DESC									
					) AS RowNumber,
					*
		FROM		(
					-- Automatically generated on 4/18/2026 2:47:32 PM.
    
    SELECT *
    FROM Features WITH (NOLOCK) 
					) sub
		where		
					[FeatureID] like '%' + @Search + '%' or
					[FeatureName] like '%' + @Search + '%' or
					[Version] like '%' + @Search + '%' or
					[SettingsAssembly] like '%' + @Search + '%' or
					[SettingsClass] like '%' + @Search + '%' 
	)
			
	SELECT	*
	FROM	SearchTable
	WHERE	RowNumber BETWEEN @FirstRow AND @LastRow
	ORDER BY RowNumber ASC
	OPTION (recompile);
	
	
		
GO
