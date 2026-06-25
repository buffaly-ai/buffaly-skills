IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'RemoveSessionSp')
BEGIN
	DROP PROCEDURE RemoveSessionSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RemoveSessionSp]
	@SessionID [int]
AS
    
    -- Automatically generated on 4/9/2026 2:12:03 PM.
    
    DELETE FROM Sessions WHERE SessionID = @SessionID

GO
