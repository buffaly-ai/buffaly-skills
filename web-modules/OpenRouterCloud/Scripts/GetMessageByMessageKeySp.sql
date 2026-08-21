IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessageByMessageKeySp')
BEGIN
	DROP PROCEDURE GetMessageByMessageKeySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessageByMessageKeySp]
	@MessageKey [nvarchar](255)
AS
    
    -- Automatically generated on 4/15/2026 2:56:22 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
    WHERE [MessageKey] = @MessageKey
GO
