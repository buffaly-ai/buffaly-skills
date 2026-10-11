SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE dbo.Turns
(
	TurnID bigint IDENTITY(1,1) NOT NULL,
	SessionID int NOT NULL,
	TurnKey nvarchar(255) NOT NULL,
	DisplayOrderAtUtc datetime2(7) NOT NULL,
	FirstMessageID int NULL,
	UserMessageID int NULL,
	AssistantMessageID int NULL,
	LastErrorMessageID int NULL,
	TerminalMessageID int NULL,
	CONSTRAINT PK_Turns PRIMARY KEY CLUSTERED (TurnID),
	CONSTRAINT FK_Turns_Sessions FOREIGN KEY (SessionID) REFERENCES dbo.Sessions(SessionID),
	CONSTRAINT UQ_Turns_SessionKey UNIQUE (SessionID, TurnKey)
);
GO
CREATE INDEX IX_Turns_Page ON dbo.Turns(SessionID, DisplayOrderAtUtc DESC, FirstMessageID DESC)
	INCLUDE(TurnID, TurnKey, UserMessageID, AssistantMessageID, LastErrorMessageID, TerminalMessageID);
GO
