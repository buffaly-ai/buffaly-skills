IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesByCompactionEpochKeySp')
BEGIN
	DROP PROCEDURE GetMessagesByCompactionEpochKeySp
END
GO

IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesByCompactionEpochKeySessionIDSp')
BEGIN
	DROP PROCEDURE GetMessagesByCompactionEpochKeySessionIDSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesByCompactionEpochKeySessionIDSp]
	@CompactionEpochKey [nvarchar](255), @SessionID int
AS
    
    -- Automatically generated on 4/10/2026 7:48:51 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
    WHERE [CompactionEpochKey] = @CompactionEpochKey
		AND [SessionID] = @SessionID
	ORDER BY [MessageID] ASC
GO
