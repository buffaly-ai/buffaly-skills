IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE Specific_Name = 'GetMessagesByTurnIDSp')
BEGIN
	DROP PROCEDURE GetMessagesByTurnIDSp
END
GO

SET ANSI_NULLS OFF
GO
SET QUOTED_IDENTIFIER OFF
GO
CREATE PROCEDURE [dbo].[GetMessagesByTurnIDSp]
	@TurnID [nvarchar](255)
AS

	-- Manually maintained turn reader used by Level2 callback digest loading.

	SELECT *
	FROM Messages WITH (NOLOCK)
	WHERE [TurnID] = @TurnID
GO
