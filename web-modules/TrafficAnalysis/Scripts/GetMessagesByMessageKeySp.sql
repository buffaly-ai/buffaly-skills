IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesByMessageKeySp')
BEGIN
	DROP PROCEDURE GetMessagesByMessageKeySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesByMessageKeySp]
	@MessageKey [nvarchar](255)
AS
    
    -- Automatically generated on 4/15/2026 2:56:22 AM.
    
    SELECT *
    FROM Messages WITH (NOLOCK) 
    WHERE [MessageKey] = @MessageKey
GO
