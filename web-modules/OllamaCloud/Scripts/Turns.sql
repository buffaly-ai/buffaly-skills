SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE dbo.Turns
(
	SessionID int NOT NULL,
	TurnKey nvarchar(255) COLLATE Latin1_General_100_BIN2 NOT NULL,
	TurnIdentity AS CONVERT(varbinary(510), TurnKey) PERSISTED,
	OrderKey bigint NOT NULL,
	AdmissionOperationKey uniqueidentifier NOT NULL,
	DisplayOrderAtUtc datetime2(7) NOT NULL,
	StartedAtUtc datetime2(7) NOT NULL,
	CompletedAtUtc datetime2(7) NULL,
	State varchar(24) COLLATE Latin1_General_100_BIN2 NOT NULL,
	Kind varchar(16) COLLATE Latin1_General_100_BIN2 NOT NULL,
	TerminalReason nvarchar(1024) NULL,
	UserMessageID int NULL,
	AssistantMessageID int NULL,
	FirstMessageID int NULL,
	LastErrorMessageID int NULL,
	TerminalMessageID int NULL,
	MutationVersion bigint NOT NULL,
	ChangeRevision bigint NOT NULL,
	WriterToken uniqueidentifier NULL,
	IsDeleted bit NOT NULL,
	HistoricalStateEvidenceVersion int NULL,
	CONSTRAINT PK_Turns PRIMARY KEY CLUSTERED (SessionID, OrderKey),
	CONSTRAINT UQ_Turns_Identity UNIQUE (SessionID, TurnIdentity),
	CONSTRAINT UQ_Turns_Admission UNIQUE (SessionID, AdmissionOperationKey),
	CONSTRAINT FK_Turns_Sessions FOREIGN KEY (SessionID) REFERENCES dbo.Sessions(SessionID),
	CONSTRAINT CK_Turns_Key CHECK (DATALENGTH(TurnKey) > 0 AND DATALENGTH(TurnKey) <= 510),
	CONSTRAINT CK_Turns_Version CHECK (OrderKey > 0 AND MutationVersion > 0 AND ChangeRevision > 0),
	CONSTRAINT CK_Turns_State CHECK (State IN ('InProgress','Paused','Completed','Failed','Cancelled','Interrupted','HistoricalUnresolved')),
	CONSTRAINT CK_Turns_Kind CHECK (Kind IN ('Execution','Scheduled','Historical')),
	CONSTRAINT CK_Turns_TerminalTime CHECK
	(
		(State IN ('Completed','Failed','Cancelled','Interrupted') AND CompletedAtUtc IS NOT NULL)
		OR (State IN ('InProgress','Paused','HistoricalUnresolved') AND CompletedAtUtc IS NULL)
	)
);
GO

CREATE TABLE dbo.SessionTurnState
(
	SessionID int NOT NULL,
	NextOrderKey bigint NOT NULL,
	CommittedRevision bigint NOT NULL,
	HistoryGeneration bigint NOT NULL,
	ActiveTurnKey nvarchar(255) COLLATE Latin1_General_100_BIN2 NULL,
	ActiveTurnIdentity AS CONVERT(varbinary(510), ActiveTurnKey) PERSISTED,
	AuthorityStatus varchar(24) COLLATE Latin1_General_100_BIN2 NOT NULL,
	AuthorityContractVersion int NOT NULL,
	WriterFence bit NOT NULL,
	LastUpdatedAtUtc datetime2(7) NOT NULL,
	CONSTRAINT PK_SessionTurnState PRIMARY KEY CLUSTERED (SessionID),
	CONSTRAINT FK_SessionTurnState_Sessions FOREIGN KEY (SessionID) REFERENCES dbo.Sessions(SessionID),
	CONSTRAINT CK_SessionTurnState_Keys CHECK (NextOrderKey > 0 AND CommittedRevision >= 0 AND HistoryGeneration > 0),
	CONSTRAINT CK_SessionTurnState_Authority CHECK (AuthorityStatus IN ('Pending','Materializing','Verified','Authoritative','Failed')),
	CONSTRAINT CK_SessionTurnState_Active CHECK ((ActiveTurnKey IS NULL) OR (DATALENGTH(ActiveTurnKey) > 0 AND DATALENGTH(ActiveTurnKey) <= 510))
);
GO

CREATE TABLE dbo.TurnMutationReceipts
(
	SessionID int NOT NULL,
	OperationKey uniqueidentifier NOT NULL,
	TurnKey nvarchar(255) COLLATE Latin1_General_100_BIN2 NOT NULL,
	TurnIdentity AS CONVERT(varbinary(510), TurnKey) PERSISTED,
	MutationKind varchar(32) COLLATE Latin1_General_100_BIN2 NOT NULL,
	RequestFingerprint varbinary(32) NOT NULL,
	RequestPayload varbinary(max) NOT NULL,
	MessageID int NULL,
	MessageKey nvarchar(255) NULL,
	MutationVersion bigint NOT NULL,
	ChangeRevision bigint NOT NULL,
	OccurredAtUtc datetime2(7) NOT NULL,
	PersistedAtUtc datetime2(7) NOT NULL,
	IsTombstone bit NOT NULL,
	CONSTRAINT PK_TurnMutationReceipts PRIMARY KEY CLUSTERED (SessionID, OperationKey),
	CONSTRAINT FK_TurnMutationReceipts_Sessions FOREIGN KEY (SessionID) REFERENCES dbo.Sessions(SessionID),
	CONSTRAINT CK_TurnMutationReceipts_Key CHECK (DATALENGTH(TurnKey) > 0 AND DATALENGTH(TurnKey) <= 510),
	CONSTRAINT CK_TurnMutationReceipts_Version CHECK (MutationVersion > 0 AND ChangeRevision > 0),
	CONSTRAINT CK_TurnMutationReceipts_Kind CHECK (MutationKind IN ('Begin','Append','UpdateExistingMessage','Pause','Resume','Handoff','Finish','Interrupt','Clear','HistoricalImport'))
);
GO

CREATE TABLE dbo.AuthoritativeTurnsMigrationCheckpoint
(
	MigrationID varchar(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
	SessionID int NOT NULL,
	Stage varchar(24) COLLATE Latin1_General_100_BIN2 NOT NULL,
	SchemaContractVersion int NOT NULL,
	SourceUpperMessageID int NOT NULL,
	SourceRowCount bigint NOT NULL,
	SourceChronologyChecksum varbinary(32) NULL,
	SessionDateCreated datetime NOT NULL,
	LastScannedMessageID int NOT NULL,
	ProcessedSourceRows bigint NOT NULL,
	MaterializedTurns bigint NOT NULL,
	ExceptionCount bigint NOT NULL,
	LastError nvarchar(4000) NULL,
	UpdatedAtUtc datetime2(7) NOT NULL,
	CONSTRAINT PK_AuthoritativeTurnsMigrationCheckpoint PRIMARY KEY CLUSTERED (MigrationID, SessionID),
	CONSTRAINT FK_AuthoritativeTurnsMigrationCheckpoint_Sessions FOREIGN KEY (SessionID) REFERENCES dbo.Sessions(SessionID),
	CONSTRAINT CK_AuthoritativeTurnsMigrationCheckpoint_Stage CHECK (Stage IN ('Pending','Materializing','Verified','Authoritative','Failed')),
	CONSTRAINT CK_AuthoritativeTurnsMigrationCheckpoint_Counts CHECK (SourceUpperMessageID >= 0 AND SourceRowCount >= 0 AND LastScannedMessageID >= 0 AND ProcessedSourceRows >= 0 AND MaterializedTurns >= 0 AND ExceptionCount >= 0)
);
GO

CREATE TABLE dbo.AuthoritativeTurnsMigrationGroup
(
	MigrationID varchar(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
	SessionID int NOT NULL,
	TurnKey nvarchar(255) COLLATE Latin1_General_100_BIN2 NOT NULL,
	TurnIdentity varbinary(510) NOT NULL,
	FirstMessageID int NOT NULL,
	LastMessageID int NOT NULL,
	SourceRowCount bigint NOT NULL,
	Materialized bit NOT NULL,
	MaterializedOrderKey bigint NULL,
	GroupChecksum varbinary(32) NULL,
	CONSTRAINT PK_AuthoritativeTurnsMigrationGroup PRIMARY KEY CLUSTERED (MigrationID, SessionID, TurnIdentity),
	CONSTRAINT FK_AuthoritativeTurnsMigrationGroup_Sessions FOREIGN KEY (SessionID) REFERENCES dbo.Sessions(SessionID),
	CONSTRAINT CK_AuthoritativeTurnsMigrationGroup_Key CHECK (DATALENGTH(TurnKey) > 0 AND DATALENGTH(TurnKey) <= 510 AND DATALENGTH(TurnIdentity) > 0 AND DATALENGTH(TurnIdentity) <= 510),
	CONSTRAINT CK_AuthoritativeTurnsMigrationGroup_Range CHECK (FirstMessageID > 0 AND LastMessageID >= FirstMessageID AND SourceRowCount > 0),
	CONSTRAINT CK_AuthoritativeTurnsMigrationGroup_Materialized CHECK ((Materialized = 0 AND MaterializedOrderKey IS NULL) OR (Materialized = 1 AND MaterializedOrderKey > 0))
);
GO

CREATE TABLE dbo.AuthoritativeTurnsMigrationException
(
	ExceptionID bigint IDENTITY(1,1) NOT NULL,
	MigrationID varchar(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
	SessionID int NOT NULL,
	MessageID int NULL,
	TurnKey nvarchar(255) COLLATE Latin1_General_100_BIN2 NULL,
	TurnIdentity varbinary(510) NULL,
	ReasonCode varchar(64) COLLATE Latin1_General_100_BIN2 NOT NULL,
	Evidence nvarchar(4000) NOT NULL,
	IsBlocking bit NOT NULL,
	EvidenceVersion int NOT NULL,
	RecordedAtUtc datetime2(7) NOT NULL,
	CONSTRAINT PK_AuthoritativeTurnsMigrationException PRIMARY KEY CLUSTERED (ExceptionID),
	CONSTRAINT FK_AuthoritativeTurnsMigrationException_Sessions FOREIGN KEY (SessionID) REFERENCES dbo.Sessions(SessionID),
	CONSTRAINT UQ_AuthoritativeTurnsMigrationException UNIQUE (MigrationID, SessionID, MessageID, ReasonCode, TurnIdentity),
	CONSTRAINT CK_AuthoritativeTurnsMigrationException_Reason CHECK (DATALENGTH(ReasonCode) > 0 AND DATALENGTH(Evidence) > 0 AND EvidenceVersion > 0)
);
GO

CREATE INDEX IX_Turns_SessionPage ON dbo.Turns (SessionID, IsDeleted, DisplayOrderAtUtc DESC, OrderKey DESC);
CREATE INDEX IX_Turns_SessionChanges ON dbo.Turns (SessionID, ChangeRevision);
CREATE INDEX IX_Turns_ActiveKey ON dbo.Turns (SessionID, TurnIdentity) INCLUDE (State, WriterToken, MutationVersion, ChangeRevision) WHERE IsDeleted = 0;
CREATE INDEX IX_AuthoritativeTurnsMigrationGroup_Pending ON dbo.AuthoritativeTurnsMigrationGroup (MigrationID, SessionID, Materialized, FirstMessageID, TurnIdentity);
CREATE INDEX IX_AuthoritativeTurnsMigrationException_Session ON dbo.AuthoritativeTurnsMigrationException (MigrationID, SessionID, IsBlocking, ExceptionID);
GO
