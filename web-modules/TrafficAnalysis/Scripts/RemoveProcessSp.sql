IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'RemoveProcessSp')
BEGIN
	DROP PROCEDURE RemoveProcessSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[RemoveProcessSp]
	@ProcessID [int]
AS
    
    -- Automatically generated on 4/8/2026 10:11:10 AM.
    
    DELETE FROM Processes WHERE ProcessID = @ProcessID

GO
