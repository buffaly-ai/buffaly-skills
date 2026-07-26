IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionSubscriptionsBySessionIDSp_PagingSp')
BEGIN
	DROP PROCEDURE GetSessionSubscriptionsBySessionIDSp_PagingSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionSubscriptionsBySessionIDSp_PagingSp]
	@SessionID [int],
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
					
			
						case when @SortColumn = 'SessionSubscriptionID' and @SortAscending = 1 then 
							[SessionSubscriptionID]
						end ASC,
						case when @SortColumn = 'SessionSubscriptionID' and @SortAscending = 0 then 
							[SessionSubscriptionID]
						end DESC,
			
						case when @SortColumn = 'SubscriptionIdentity' and @SortAscending = 1 then 
							[SubscriptionIdentity]
						end ASC,
						case when @SortColumn = 'SubscriptionIdentity' and @SortAscending = 0 then 
							[SubscriptionIdentity]
						end DESC,
			
						case when @SortColumn = 'SessionID' and @SortAscending = 1 then 
							[SessionID]
						end ASC,
						case when @SortColumn = 'SessionID' and @SortAscending = 0 then 
							[SessionID]
						end DESC,
			
						case when @SortColumn = 'SubscriberSessionKey' and @SortAscending = 1 then 
							[SubscriberSessionKey]
						end ASC,
						case when @SortColumn = 'SubscriberSessionKey' and @SortAscending = 0 then 
							[SubscriberSessionKey]
						end DESC,
			
						case when @SortColumn = 'EventType' and @SortAscending = 1 then 
							[EventType]
						end ASC,
						case when @SortColumn = 'EventType' and @SortAscending = 0 then 
							[EventType]
						end DESC,
			
						case when @SortColumn = 'DeliveryMode' and @SortAscending = 1 then 
							[DeliveryMode]
						end ASC,
						case when @SortColumn = 'DeliveryMode' and @SortAscending = 0 then 
							[DeliveryMode]
						end DESC,
			
						case when @SortColumn = 'CallbackUrl' and @SortAscending = 1 then 
							[CallbackUrl]
						end ASC,
						case when @SortColumn = 'CallbackUrl' and @SortAscending = 0 then 
							[CallbackUrl]
						end DESC,
			
						case when @SortColumn = 'IsEnabled' and @SortAscending = 1 then 
							[IsEnabled]
						end ASC,
						case when @SortColumn = 'IsEnabled' and @SortAscending = 0 then 
							[IsEnabled]
						end DESC,
			
						case when @SortColumn = 'ExpirationUtc' and @SortAscending = 1 then 
							[ExpirationUtc]
						end ASC,
						case when @SortColumn = 'ExpirationUtc' and @SortAscending = 0 then 
							[ExpirationUtc]
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
					-- Automatically generated on 4/14/2026 3:20:59 AM.
    
    SELECT *
    FROM SessionSubscriptions WITH (NOLOCK) 
    WHERE [SessionID] = @SessionID
					) sub
		where		
					[SessionSubscriptionID] like '%' + @Search + '%' or
					[SubscriptionIdentity] like '%' + @Search + '%' or
					[SubscriberSessionKey] like '%' + @Search + '%' or
					[EventType] like '%' + @Search + '%' or
					[DeliveryMode] like '%' + @Search + '%' or
					[CallbackUrl] like '%' + @Search + '%' 
	)
			
	SELECT	*
	FROM	SearchTable
	WHERE	RowNumber BETWEEN @FirstRow AND @LastRow
	ORDER BY RowNumber ASC
	OPTION (recompile);
	
	
		
GO
