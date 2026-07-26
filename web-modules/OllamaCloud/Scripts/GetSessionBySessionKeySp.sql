IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetSessionBySessionKeySp')
BEGIN
	DROP PROCEDURE GetSessionBySessionKeySp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetSessionBySessionKeySp]
	@SessionKey [nvarchar](255)
AS
    
    -- Automatically generated on 4/9/2026 2:12:03 PM.
    
    SELECT *
    FROM Sessions WITH (NOLOCK) 
    WHERE [SessionKey] = @SessionKey
GO
