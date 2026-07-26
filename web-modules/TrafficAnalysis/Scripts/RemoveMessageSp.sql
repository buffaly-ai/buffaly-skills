IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'RemoveMessageSp')
BEGIN
	DROP PROCEDURE RemoveMessageSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RemoveMessageSp]
	@MessageID [int]
AS
    
    -- Automatically generated on 4/15/2026 2:56:22 AM.
    
    DELETE FROM Messages WHERE MessageID = @MessageID

GO
