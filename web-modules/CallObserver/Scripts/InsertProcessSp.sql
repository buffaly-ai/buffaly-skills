IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'InsertProcessSp')
BEGIN
	DROP PROCEDURE InsertProcessSp
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[InsertProcessSp]
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
    VALUES
    (
            @ProcessName, 
            @Url, 
            @Action, 
            @RunData, 
            @IsRunning, 
            @RunStarted, 
            @RunEnded, 
            @RunEvery, 
            @IsEnabled, 
            getdate(), 
            getdate(), 
            @MaximumRunTime, 
            @IsTimedOut
    )
    SELECT scope_identity() as ProcessID

GO
