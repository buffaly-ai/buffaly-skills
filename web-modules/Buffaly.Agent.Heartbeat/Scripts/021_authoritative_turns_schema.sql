-- PostgreSQL authoritative Turns schema. Population and activation are owned by PostgresAuthoritativeTurnsUpgrade.
CREATE TABLE IF NOT EXISTS turns (
	session_id integer NOT NULL REFERENCES sessions(session_id),
	turn_key text COLLATE "C" NOT NULL,
	turn_identity bytea NOT NULL,
	order_key bigint NOT NULL,
	admission_operation_key uuid NOT NULL,
	display_order_at_utc timestamp without time zone NOT NULL,
	started_at_utc timestamp without time zone NOT NULL,
	completed_at_utc timestamp without time zone NULL,
	state text COLLATE "C" NOT NULL,
	kind text COLLATE "C" NOT NULL,
	terminal_reason text NULL,
	user_message_id integer NULL,
	assistant_message_id integer NULL,
	first_message_id integer NULL,
	last_error_message_id integer NULL,
	terminal_message_id integer NULL,
	mutation_version bigint NOT NULL,
	change_revision bigint NOT NULL,
	writer_token uuid NULL,
	is_deleted boolean NOT NULL,
	historical_state_evidence_version integer NULL,
	CONSTRAINT pk_turns PRIMARY KEY (session_id,order_key),
	CONSTRAINT uq_turns_identity UNIQUE (session_id,turn_identity),
	CONSTRAINT uq_turns_admission UNIQUE (session_id,admission_operation_key),
	CONSTRAINT ck_turns_identity CHECK (octet_length(turn_identity)>0 AND octet_length(turn_identity)<=510),
	CONSTRAINT ck_turns_version CHECK (order_key>0 AND mutation_version>0 AND change_revision>0),
	CONSTRAINT ck_turns_state CHECK (state IN ('InProgress','Paused','Completed','Failed','Cancelled','Interrupted','HistoricalUnresolved')),
	CONSTRAINT ck_turns_kind CHECK (kind IN ('Execution','Scheduled','Historical')),
	CONSTRAINT ck_turns_terminal_time CHECK ((state IN ('Completed','Failed','Cancelled','Interrupted') AND completed_at_utc IS NOT NULL) OR (state IN ('InProgress','Paused','HistoricalUnresolved') AND completed_at_utc IS NULL))
);
CREATE INDEX IF NOT EXISTS ix_turns_session_page ON turns(session_id,is_deleted,display_order_at_utc DESC,order_key DESC);
CREATE INDEX IF NOT EXISTS ix_turns_session_changes ON turns(session_id,change_revision);
CREATE INDEX IF NOT EXISTS ix_turns_active_key ON turns(session_id,turn_identity) WHERE is_deleted=false;

CREATE TABLE IF NOT EXISTS session_turn_state (
	session_id integer PRIMARY KEY REFERENCES sessions(session_id),
	next_order_key bigint NOT NULL,
	committed_revision bigint NOT NULL,
	history_generation bigint NOT NULL,
	active_turn_key text COLLATE "C" NULL,
	active_turn_identity bytea NULL,
	authority_status text COLLATE "C" NOT NULL,
	authority_contract_version integer NOT NULL,
	writer_fence boolean NOT NULL,
	last_updated_at_utc timestamp without time zone NOT NULL,
	CONSTRAINT ck_session_turn_state_keys CHECK (next_order_key>0 AND committed_revision>=0 AND history_generation>0),
	CONSTRAINT ck_session_turn_state_authority CHECK (authority_status IN ('Pending','Materializing','Verified','Authoritative','Failed')),
	CONSTRAINT ck_session_turn_state_active CHECK (active_turn_identity IS NULL OR (octet_length(active_turn_identity)>0 AND octet_length(active_turn_identity)<=510))
);

CREATE TABLE IF NOT EXISTS turn_mutation_receipts (
	session_id integer NOT NULL REFERENCES sessions(session_id), operation_key uuid NOT NULL,
	turn_key text COLLATE "C" NOT NULL, turn_identity bytea NOT NULL, mutation_kind text COLLATE "C" NOT NULL,
	request_fingerprint bytea NOT NULL, request_payload bytea NOT NULL, message_id integer NULL, message_key text NULL,
	mutation_version bigint NOT NULL, change_revision bigint NOT NULL, occurred_at_utc timestamp without time zone NOT NULL,
	persisted_at_utc timestamp without time zone NOT NULL, is_tombstone boolean NOT NULL,
	PRIMARY KEY(session_id,operation_key),
	CONSTRAINT ck_turn_receipt_identity CHECK (octet_length(turn_identity)>0 AND octet_length(turn_identity)<=510),
	CONSTRAINT ck_turn_receipt_fingerprint CHECK (octet_length(request_fingerprint)=32),
	CONSTRAINT ck_turn_receipt_version CHECK (mutation_version>0 AND change_revision>0),
	CONSTRAINT ck_turn_receipt_kind CHECK (mutation_kind IN ('Begin','Append','UpdateExistingMessage','Pause','Resume','Handoff','Finish','Interrupt','Clear','HistoricalImport'))
);

CREATE TABLE IF NOT EXISTS authoritative_turns_migration_checkpoint (
	migration_id text COLLATE "C" NOT NULL, session_id integer NOT NULL REFERENCES sessions(session_id), stage text COLLATE "C" NOT NULL,
	schema_contract_version integer NOT NULL, source_upper_message_id integer NOT NULL, source_row_count bigint NOT NULL,
	source_chronology_checksum bytea NULL, session_date_created timestamp without time zone NOT NULL, last_scanned_message_id integer NOT NULL,
	processed_source_rows bigint NOT NULL, materialized_turns bigint NOT NULL, exception_count bigint NOT NULL, last_error text NULL,
	updated_at_utc timestamp without time zone NOT NULL, PRIMARY KEY(migration_id,session_id),
	CONSTRAINT ck_authoritative_turns_checkpoint_stage CHECK(stage IN ('Pending','Materializing','Verified','Authoritative','Failed')),
	CONSTRAINT ck_authoritative_turns_checkpoint_counts CHECK(source_upper_message_id>=0 AND source_row_count>=0 AND last_scanned_message_id>=0 AND processed_source_rows>=0 AND materialized_turns>=0 AND exception_count>=0)
);
CREATE TABLE IF NOT EXISTS authoritative_turns_migration_group (
	migration_id text COLLATE "C" NOT NULL, session_id integer NOT NULL REFERENCES sessions(session_id), turn_key text COLLATE "C" NOT NULL,
	turn_identity bytea NOT NULL, first_message_id integer NOT NULL, last_message_id integer NOT NULL, source_row_count bigint NOT NULL,
	materialized boolean NOT NULL, materialized_order_key bigint NULL, group_checksum bytea NULL,
	PRIMARY KEY(migration_id,session_id,turn_identity),
	CONSTRAINT ck_authoritative_turns_group_identity CHECK(octet_length(turn_identity)>0 AND octet_length(turn_identity)<=510),
	CONSTRAINT ck_authoritative_turns_group_range CHECK(first_message_id>0 AND last_message_id>=first_message_id AND source_row_count>0),
	CONSTRAINT ck_authoritative_turns_group_materialized CHECK((materialized=false AND materialized_order_key IS NULL) OR (materialized=true AND materialized_order_key>0))
);
CREATE INDEX IF NOT EXISTS ix_authoritative_turns_group_pending ON authoritative_turns_migration_group(migration_id,session_id,materialized,first_message_id,turn_identity);
CREATE TABLE IF NOT EXISTS authoritative_turns_migration_exception (
	exception_id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, migration_id text COLLATE "C" NOT NULL,
	session_id integer NOT NULL REFERENCES sessions(session_id), message_id integer NULL, turn_key text COLLATE "C" NULL, turn_identity bytea NULL,
	reason_code text COLLATE "C" NOT NULL, evidence text NOT NULL, is_blocking boolean NOT NULL, evidence_version integer NOT NULL,
	recorded_at_utc timestamp without time zone NOT NULL,
	CONSTRAINT uq_authoritative_turns_exception UNIQUE NULLS NOT DISTINCT(migration_id,session_id,message_id,reason_code,turn_identity),
	CONSTRAINT ck_authoritative_turns_exception CHECK(length(reason_code)>0 AND length(evidence)>0 AND evidence_version>0)
);
SELECT record_schema_migration('021_authoritative_turns_schema');
