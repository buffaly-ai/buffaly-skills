IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesByCompactionEpochKeySp')
BEGIN
	DROP PROCEDURE GetMessagesByCompactionEpochKeySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesByCompactionEpochKeySp]
	@CompactionEpochKey [nvarchar](255)
AS
    
    -- Automatically generated on 4/15/2026 2:56:22 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
    WHERE [CompactionEpochKey] = @CompactionEpochKey
GO
