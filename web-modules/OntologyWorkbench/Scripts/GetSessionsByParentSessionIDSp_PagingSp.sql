IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionsByParentSessionIDSp_PagingSp')
BEGIN
	DROP PROCEDURE GetSessionsByParentSessionIDSp_PagingSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionsByParentSessionIDSp_PagingSp]
	@ParentSessionID [int],
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
					
			
						case when @SortColumn = 'SessionID' and @SortAscending = 1 then 
							[SessionID]
						end ASC,
						case when @SortColumn = 'SessionID' and @SortAscending = 0 then 
							[SessionID]
						end DESC,
			
						case when @SortColumn = 'SessionKey' and @SortAscending = 1 then 
							[SessionKey]
						end ASC,
						case when @SortColumn = 'SessionKey' and @SortAscending = 0 then 
							[SessionKey]
						end DESC,
			
						case when @SortColumn = 'AgentName' and @SortAscending = 1 then 
							[AgentName]
						end ASC,
						case when @SortColumn = 'AgentName' and @SortAscending = 0 then 
							[AgentName]
						end DESC,
			
						case when @SortColumn = 'ProjectName' and @SortAscending = 1 then 
							[ProjectName]
						end ASC,
						case when @SortColumn = 'ProjectName' and @SortAscending = 0 then 
							[ProjectName]
						end DESC,
			
						case when @SortColumn = 'ProjectFilePath' and @SortAscending = 1 then 
							[ProjectFilePath]
						end ASC,
						case when @SortColumn = 'ProjectFilePath' and @SortAscending = 0 then 
							[ProjectFilePath]
						end DESC,
			
						case when @SortColumn = 'Provider' and @SortAscending = 1 then 
							[Provider]
						end ASC,
						case when @SortColumn = 'Provider' and @SortAscending = 0 then 
							[Provider]
						end DESC,
			
						case when @SortColumn = 'ModelName' and @SortAscending = 1 then 
							[ModelName]
						end ASC,
						case when @SortColumn = 'ModelName' and @SortAscending = 0 then 
							[ModelName]
						end DESC,
			
						case when @SortColumn = 'ReasoningLevel' and @SortAscending = 1 then 
							[ReasoningLevel]
						end ASC,
						case when @SortColumn = 'ReasoningLevel' and @SortAscending = 0 then 
							[ReasoningLevel]
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
			
						case when @SortColumn = 'SessionName' and @SortAscending = 1 then 
							[SessionName]
						end ASC,
						case when @SortColumn = 'SessionName' and @SortAscending = 0 then 
							[SessionName]
						end DESC,
			
						case when @SortColumn = 'ParentSessionID' and @SortAscending = 1 then 
							[ParentSessionID]
						end ASC,
						case when @SortColumn = 'ParentSessionID' and @SortAscending = 0 then 
							[ParentSessionID]
						end DESC,
			
						case when @SortColumn = 'IsArchived' and @SortAscending = 1 then 
							[IsArchived]
						end ASC,
						case when @SortColumn = 'IsArchived' and @SortAscending = 0 then 
							[IsArchived]
						end DESC									
					) AS RowNumber,
					*
		FROM		(
					-- Automatically generated on 4/9/2026 2:12:03 PM.
    
    SELECT *
    FROM Sessions WITH (NOLOCK) 
    WHERE [ParentSessionID] = @ParentSessionID
		AND ISNULL([IsArchived], 0) = 0
					) sub
		where		
					[SessionID] like '%' + @Search + '%' or
					[SessionKey] like '%' + @Search + '%' or
					[AgentName] like '%' + @Search + '%' or
					[ProjectName] like '%' + @Search + '%' or
					[ProjectFilePath] like '%' + @Search + '%' or
					[Provider] like '%' + @Search + '%' or
					[ModelName] like '%' + @Search + '%' or
					[ReasoningLevel] like '%' + @Search + '%' or
					[SessionName] like '%' + @Search + '%' 
	)
			
	SELECT	*
	FROM	SearchTable
	WHERE	RowNumber BETWEEN @FirstRow AND @LastRow
	ORDER BY RowNumber ASC
	OPTION (recompile);
	
	
		
GO
