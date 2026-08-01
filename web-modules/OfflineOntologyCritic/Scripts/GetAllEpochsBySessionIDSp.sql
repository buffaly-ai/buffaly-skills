IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetAllEpochsBySessionIDSp')
BEGIN
	DROP PROCEDURE GetAllEpochsBySessionIDSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetAllEpochsBySessionIDSp]
	@SessionID [int]
AS
    
	SELECT [CompactionEpochKey]
	FROM Messages WITH (NOLOCK)
	WHERE [SessionID] = @SessionID
		AND [CompactionEpochKey] IS NOT NULL
		AND LEN([CompactionEpochKey]) > 0
	GROUP BY [CompactionEpochKey]
	ORDER BY MIN([MessageID]) ASC
GO
