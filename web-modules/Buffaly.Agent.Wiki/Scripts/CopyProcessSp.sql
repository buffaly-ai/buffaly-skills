IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'CopyProcessSp')
BEGIN
	DROP PROCEDURE CopyProcessSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[CopyProcessSp]
	@ProcessID [int]
AS
    
    -- Automatically generated on 4/8/2026 10:11:10 AM.
    
    INSERT INTO Processes
    (
            [ProcessName], 
            [Url], 
            [Action], 
            [RunData], 
            [IsRunning], 
            [RunStarted], 
            [RunEnded], 
            [RunEvery], 
            [IsEnabled], 
            [DateCreated], 
            [LastUpdated], 
            [MaximumRunTime], 
            [IsTimedOut]
    )
    SELECT
            [ProcessName] + ' - Copy', 
            [Url], 
            [Action], 
            [RunData], 
            [IsRunning], 
            [RunStarted], 
            [RunEnded], 
            [RunEvery], 
            [IsEnabled], 
            getdate(), 
            getdate(), 
            [MaximumRunTime], 
            [IsTimedOut]
    FROM [Processes]
    WHERE ProcessID = @ProcessID
    SELECT scope_identity() as ProcessID

GO
