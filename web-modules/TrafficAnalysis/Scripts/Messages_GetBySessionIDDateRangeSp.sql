IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'Messages_GetBySessionIDDateRangeSp')
BEGIN
	DROP PROCEDURE Messages_GetBySessionIDDateRangeSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[Messages_GetBySessionIDDateRangeSp]
	@SessionID [int],
	@StartUtc [datetime],
	@EndUtc [datetime],
	@NumRows [int]
AS

	SET NOCOUNT ON

	SELECT TOP (@NumRows) *
	FROM Messages WITH (NOLOCK)
	WHERE SessionID = @SessionID
		AND (@StartUtc IS NULL OR DateCreated >= @StartUtc)
		AND (@EndUtc IS NULL OR DateCreated <= @EndUtc)
	ORDER BY MessageID ASC

GO
