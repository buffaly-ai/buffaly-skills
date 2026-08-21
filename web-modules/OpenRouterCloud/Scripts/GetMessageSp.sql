IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessageSp')
BEGIN
	DROP PROCEDURE GetMessageSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessageSp]
	@MessageID [int]
AS
    
    -- Automatically generated on 4/15/2026 2:56:22 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
     WHERE MessageID = @MessageID

GO
