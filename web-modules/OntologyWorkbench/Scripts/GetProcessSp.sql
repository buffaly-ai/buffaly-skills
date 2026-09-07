IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetProcessSp')
BEGIN
	DROP PROCEDURE GetProcessSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetProcessSp]
	@ProcessID [int]
AS
    
    -- Automatically generated on 4/8/2026 10:11:10 AM.
    
    SELECT *
    FROM Processes WITH (NOLOCK) 
     WHERE ProcessID = @ProcessID

GO
