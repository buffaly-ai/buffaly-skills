IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'UpdateProcessSp')
BEGIN
	DROP PROCEDURE UpdateProcessSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[UpdateProcessSp]
	@ProcessID [int],
	@ProcessName [nvarchar](255),
	@Url [nvarchar](512),
	@Action [nvarchar](255),
	@RunData [nvarchar](max),
	@IsRunning [bit],
	@RunStarted [datetime],
	@RunEnded [datetime],
	@RunEvery [decimal](18, 4),
	@IsEnabled [bit],
	@MaximumRunTime [int],
	@IsTimedOut [bit]
AS
    
    -- Automatically generated on 4/8/2026 10:11:10 AM.
    
    UPDATE Processes SET 
            [ProcessName] = @ProcessName, 
            [Url] = @Url, 
            [Action] = @Action, 
            [RunData] = @RunData, 
            [IsRunning] = @IsRunning, 
            [RunStarted] = @RunStarted, 
            [RunEnded] = @RunEnded, 
            [RunEvery] = @RunEvery, 
            [IsEnabled] = @IsEnabled, 
            [LastUpdated] = getdate(), 
            [MaximumRunTime] = @MaximumRunTime, 
            [IsTimedOut] = @IsTimedOut
    WHERE ProcessID = @ProcessID

GO
