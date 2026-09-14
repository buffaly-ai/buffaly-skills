-- Registered forward-only runtime capability. Never reset existing repository routines or historical data.
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS result_history_generation bigint NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS result_state text NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS result_writer_token uuid NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS result_sequence_number integer NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS result_message_date_created_utc timestamp NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS handoff_project_name text NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS handoff_agent_name text NULL;
ALTER TABLE turn_mutation_receipts DROP CONSTRAINT IF EXISTS ck_turn_receipt_kind;
ALTER TABLE turn_mutation_receipts ADD CONSTRAINT ck_turn_receipt_kind CHECK (mutation_kind IN ('Begin','Append','UpdateExistingMessage','Pause','Resume','Handoff','Finish','Interrupt','Compaction','Clear','HistoricalImport','MoveMessageEpoch','MoveToolPairEpoch'));

CREATE OR REPLACE VIEW authoritative_turn_rows AS
SELECT session_id AS "SessionID",turn_key AS "TurnKey",order_key AS "OrderKey",display_order_at_utc AS "DisplayOrderAtUtc",
	started_at_utc AS "StartedAtUtc",completed_at_utc AS "CompletedAtUtc",state AS "State",kind AS "Kind",terminal_reason AS "TerminalReason",
	user_message_id AS "UserMessageID",assistant_message_id AS "AssistantMessageID",first_message_id AS "FirstMessageID",
	last_error_message_id AS "LastErrorMessageID",terminal_message_id AS "TerminalMessageID",mutation_version AS "MutationVersion",
	change_revision AS "ChangeRevision",writer_token AS "WriterToken",is_deleted AS "IsDeleted"
FROM turns;

CREATE OR REPLACE FUNCTION "Turns_RequireAuthority"(p_session_id integer) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
	IF p_session_id <= 0 OR NOT EXISTS (SELECT 1 FROM session_turn_state WHERE session_id=p_session_id AND authority_status='Authoritative' AND authority_contract_version=1 AND writer_fence=false) THEN
		RAISE EXCEPTION 'Session is not ready for authoritative turn reads.';
	END IF;
END $$;

CREATE OR REPLACE FUNCTION "Turns_ReadOne"(p_session_id integer,p_turn_key text)
RETURNS SETOF authoritative_turn_rows LANGUAGE plpgsql AS $$
BEGIN
	PERFORM "Turns_RequireAuthority"(p_session_id);
	RETURN QUERY SELECT * FROM authoritative_turn_rows WHERE "SessionID"=p_session_id AND "TurnKey" COLLATE "C"=p_turn_key COLLATE "C" AND "IsDeleted"=false;
END $$;

CREATE OR REPLACE FUNCTION "Turns_ReadActive"(p_session_id integer)
RETURNS SETOF authoritative_turn_rows LANGUAGE plpgsql AS $$
BEGIN
	PERFORM "Turns_RequireAuthority"(p_session_id);
	RETURN QUERY SELECT t.* FROM authoritative_turn_rows t JOIN session_turn_state s ON s.session_id=t."SessionID" AND s.active_turn_key COLLATE "C"=t."TurnKey" COLLATE "C"
	WHERE t."SessionID"=p_session_id AND t."IsDeleted"=false;
END $$;

SELECT record_schema_migration('022_authoritative_turns_runtime');

DROP FUNCTION IF EXISTS "Turns_ReadPageRows"(integer,integer,integer,boolean);
CREATE OR REPLACE FUNCTION "Turns_ReadPageRows"(p_session_id integer,p_skip_rows integer,p_num_rows integer,p_user_only boolean,p_page_generation bigint DEFAULT NULL,p_as_of_revision bigint DEFAULT NULL,p_before_display_order_at_utc timestamp DEFAULT NULL,p_before_order_key bigint DEFAULT NULL)
RETURNS SETOF authoritative_turn_rows LANGUAGE plpgsql AS $$
BEGIN
	PERFORM "Turns_RequireAuthority"(p_session_id);
	IF p_skip_rows<0 OR p_num_rows<1 OR p_num_rows>5000 THEN RAISE EXCEPTION 'Invalid turn page bounds.'; END IF;
	IF p_page_generation IS NOT NULL AND (p_page_generation<>(SELECT history_generation FROM session_turn_state WHERE session_id=p_session_id) OR p_as_of_revision IS NULL OR p_as_of_revision<0 OR p_as_of_revision>(SELECT committed_revision FROM session_turn_state WHERE session_id=p_session_id) OR p_before_display_order_at_utc IS NULL OR p_before_order_key IS NULL OR p_before_order_key<1 OR p_skip_rows<>0) THEN RAISE EXCEPTION 'Invalid or stale older-page cursor: bootstrap is required.'; END IF;
	RETURN QUERY SELECT * FROM authoritative_turn_rows WHERE "SessionID"=p_session_id AND "IsDeleted"=false AND (NOT p_user_only OR "UserMessageID" IS NOT NULL)
	AND (p_page_generation IS NULL OR (EXISTS(SELECT 1 FROM turns t JOIN turn_mutation_receipts r ON r.session_id=t.session_id AND r.operation_key=t.admission_operation_key WHERE t.session_id=p_session_id AND t.order_key="OrderKey" AND r.change_revision<=p_as_of_revision)
	AND ("DisplayOrderAtUtc"<p_before_display_order_at_utc OR ("DisplayOrderAtUtc"=p_before_display_order_at_utc AND "OrderKey"<p_before_order_key))))
	ORDER BY "DisplayOrderAtUtc" DESC,"OrderKey" DESC OFFSET p_skip_rows LIMIT p_num_rows;
END $$;

CREATE OR REPLACE FUNCTION "Turns_ReadPageMetadata"(p_session_id integer,p_user_only boolean)
RETURNS TABLE("TotalTurns" bigint,"ChangeRevision" bigint,"HistoryGeneration" bigint) LANGUAGE plpgsql AS $$
BEGIN
	PERFORM "Turns_RequireAuthority"(p_session_id);
	RETURN QUERY SELECT (SELECT count(*) FROM turns WHERE session_id=p_session_id AND is_deleted=false AND (NOT p_user_only OR user_message_id IS NOT NULL)),s.committed_revision,s.history_generation
	FROM session_turn_state s WHERE s.session_id=p_session_id;
END $$;

CREATE OR REPLACE FUNCTION "Turns_ReadChangesRows"(p_session_id integer,p_history_generation bigint,p_after_revision bigint,p_num_rows integer)
RETURNS SETOF authoritative_turn_rows LANGUAGE plpgsql AS $$
DECLARE current_revision bigint; current_generation bigint;
BEGIN
	PERFORM "Turns_RequireAuthority"(p_session_id);
	SELECT committed_revision,history_generation INTO current_revision,current_generation FROM session_turn_state WHERE session_id=p_session_id;
	IF p_history_generation<>current_generation OR p_after_revision<0 OR p_after_revision>current_revision OR p_num_rows<1 OR p_num_rows>5000 THEN RAISE EXCEPTION 'Invalid turn changes cursor or bounds.'; END IF;
	RETURN QUERY SELECT * FROM authoritative_turn_rows WHERE "SessionID"=p_session_id AND "ChangeRevision">p_after_revision ORDER BY "ChangeRevision" LIMIT p_num_rows;
END $$;

CREATE OR REPLACE FUNCTION "Turns_ReadChangesMetadata"(p_session_id integer,p_history_generation bigint,p_after_revision bigint,p_num_rows integer)
RETURNS TABLE("TotalTurns" bigint,"ChangeRevision" bigint,"HistoryGeneration" bigint,"HasMoreChanges" boolean) LANGUAGE plpgsql AS $$
DECLARE current_revision bigint; current_generation bigint; last_revision bigint; more boolean;
BEGIN
	PERFORM "Turns_RequireAuthority"(p_session_id);
	SELECT committed_revision,history_generation INTO current_revision,current_generation FROM session_turn_state WHERE session_id=p_session_id;
	IF p_history_generation<>current_generation OR p_after_revision<0 OR p_after_revision>current_revision OR p_num_rows<1 OR p_num_rows>5000 THEN RAISE EXCEPTION 'Invalid turn changes cursor or bounds.'; END IF;
	SELECT max(changed."ChangeRevision") INTO last_revision FROM "Turns_ReadChangesRows"(p_session_id,p_history_generation,p_after_revision,p_num_rows) changed;
	more := EXISTS(SELECT 1 FROM turns WHERE session_id=p_session_id AND change_revision>coalesce(last_revision,current_revision));
	RETURN QUERY SELECT (SELECT count(*) FROM turns WHERE session_id=p_session_id AND is_deleted=false),CASE WHEN more THEN last_revision ELSE current_revision END,current_generation,more;
END $$;

CREATE OR REPLACE FUNCTION "Turns_ReadDetailRows"(p_session_id integer,p_turn_key text,p_num_rows integer)
RETURNS TABLE("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text) LANGUAGE plpgsql AS $$
BEGIN
	PERFORM "Turns_RequireAuthority"(p_session_id);
	IF p_num_rows<1 OR p_num_rows>5001 THEN RAISE EXCEPTION 'Invalid turn detail bounds.'; END IF;
	IF NOT EXISTS(SELECT 1 FROM turns WHERE session_id=p_session_id AND turn_key COLLATE "C"=p_turn_key COLLATE "C" AND is_deleted=false) THEN RAISE EXCEPTION 'Visible authoritative turn does not exist.'; END IF;
	RETURN QUERY SELECT selected.* FROM (SELECT m.* FROM message_rows m WHERE m."SessionID"=p_session_id AND m."TurnID" COLLATE "C"=p_turn_key COLLATE "C" ORDER BY m."MessageID" DESC LIMIT p_num_rows) selected ORDER BY selected."MessageID";
END $$;

-- Encode exact UTF-16LE identity, including supplementary Unicode, to match the shared contract.
CREATE OR REPLACE FUNCTION authoritative_turn_identity(p_key text) RETURNS bytea LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE result bytea := ''::bytea; code integer; unit integer; i integer;
BEGIN
	IF length(p_key)=0 OR p_key<>btrim(p_key) THEN RAISE EXCEPTION 'Invalid authoritative identity.'; END IF;
	FOR i IN 1..length(p_key) LOOP
		code := ascii(substr(p_key,i,1));
		IF code<32 OR (code>=127 AND code<=159) THEN RAISE EXCEPTION 'Control character in authoritative identity.'; END IF;
		IF code>65535 THEN
			code := code-65536; unit := 55296+(code/1024);
			result := result || decode(lpad(to_hex(unit%256),2,'0') || lpad(to_hex(unit/256),2,'0'),'hex');
			code := 56320+(code%1024);
		END IF;
		result := result || decode(lpad(to_hex(code%256),2,'0') || lpad(to_hex(code/256),2,'0'),'hex');
	END LOOP;
	IF octet_length(result)>510 THEN RAISE EXCEPTION 'Authoritative identity exceeds 255 UTF-16 units.'; END IF;
	RETURN result;
END $$;

CREATE OR REPLACE VIEW authoritative_turn_receipt_rows AS
SELECT false AS "IsReplay",session_id AS "SessionID",turn_key AS "TurnKey",operation_key AS "OperationKey",
	message_id AS "MessageID",message_key AS "MessageKey",result_sequence_number AS "SequenceNumber",result_message_date_created_utc AS "MessageDateCreatedUtc",
	mutation_version AS "MutationVersion",change_revision AS "ChangeRevision",result_history_generation AS "HistoryGeneration",result_state AS "State",result_writer_token AS "WriterToken"
FROM turn_mutation_receipts;

ALTER TABLE turns ADD COLUMN IF NOT EXISTS owner_machine_name text NULL;
ALTER TABLE turns ADD COLUMN IF NOT EXISTS owner_process_id integer NULL;
ALTER TABLE turns ADD COLUMN IF NOT EXISTS owner_process_start_utc_ticks bigint NULL;
-- Retire the previous exact signature without CASCADE; dependencies must not be silently removed.
DROP FUNCTION IF EXISTS "Turns_ApplyMutation"(integer,text,uuid,bigint,uuid,uuid,text,text,timestamp,bytea,bytea,text,text,text,text,text,text,text,text,boolean,integer,text,timestamp,text,text,text,text,text);
CREATE OR REPLACE FUNCTION "Turns_ApplyMutation"(
	p_session_id integer,p_turn_key text,p_operation_key uuid,p_expected_version bigint,p_writer_token uuid,p_new_writer_token uuid,
	p_mutation_kind text,p_turn_kind text,p_occurred_at_utc timestamp,p_request_fingerprint bytea,p_request_payload bytea,
	p_message_key text,p_message_role text,p_message_content text,p_message_anchor_kind text,p_message_tool_name text,p_message_tool_arguments text,p_message_call_id text,p_message_data text,
	p_message_is_compacted boolean,p_message_compaction_epoch integer,p_message_compaction_epoch_key text,p_message_date_created_utc timestamp,
	p_terminal_state text,p_terminal_reason text,p_terminal_details text,p_handoff_project_name text,p_handoff_agent_name text,
	p_owner_machine_name text,p_owner_process_id integer,p_owner_process_start_utc_ticks bigint)
RETURNS SETOF authoritative_turn_receipt_rows LANGUAGE plpgsql AS $$
DECLARE identity_bytes bytea; current_turn turns%ROWTYPE; session_state session_turn_state%ROWTYPE; prior turn_mutation_receipts%ROWTYPE;
	new_version bigint; new_revision bigint; message_id_value integer; sequence_value integer; now_utc timestamp := timezone('utc',clock_timestamp()); outcome jsonb;
BEGIN
	identity_bytes := authoritative_turn_identity(p_turn_key);
	IF (p_owner_machine_name IS NULL AND (p_owner_process_id IS NOT NULL OR p_owner_process_start_utc_ticks IS NOT NULL)) OR
		(p_owner_machine_name IS NOT NULL AND (length(p_owner_machine_name)=0 OR p_owner_process_id IS NULL OR p_owner_process_id<=0 OR p_owner_process_start_utc_ticks IS NULL OR p_owner_process_start_utc_ticks<=0 OR p_mutation_kind NOT IN ('Begin','Resume'))) THEN
		RAISE EXCEPTION 'Process ownership requires a complete incarnation on Begin or Resume.';
	END IF;
	IF p_session_id<=0 OR p_operation_key IS NULL OR p_operation_key='00000000-0000-0000-0000-000000000000'::uuid OR octet_length(p_request_payload)=0 OR octet_length(p_request_fingerprint)<>32 OR sha256(p_request_payload)<>p_request_fingerprint THEN RAISE EXCEPTION 'Invalid authoritative mutation identity or fingerprint.'; END IF;
	IF p_mutation_kind NOT IN ('Begin','Append','UpdateExistingMessage','Pause','Resume','Handoff','Finish','Interrupt','Compaction','Clear') THEN RAISE EXCEPTION 'Unsupported mutation kind.'; END IF;
	PERFORM 1 FROM sessions WHERE session_id=p_session_id FOR UPDATE;
	IF NOT FOUND THEN RAISE EXCEPTION 'Session does not exist.'; END IF;
	IF NOT EXISTS(SELECT 1 FROM session_turn_state WHERE session_id=p_session_id) THEN
		IF EXISTS(SELECT 1 FROM messages WHERE session_id=p_session_id) OR EXISTS(SELECT 1 FROM turns WHERE session_id=p_session_id) THEN RAISE EXCEPTION 'Historical session requires population.'; END IF;
		INSERT INTO session_turn_state VALUES(p_session_id,1,0,1,NULL,NULL,'Authoritative',1,false,now_utc);
	END IF;
	PERFORM "Turns_RequireAuthority"(p_session_id);
	SELECT * INTO session_state FROM session_turn_state WHERE session_id=p_session_id FOR UPDATE;
	SELECT * INTO prior FROM turn_mutation_receipts WHERE session_id=p_session_id AND operation_key=p_operation_key;
	IF FOUND THEN
		IF prior.turn_identity<>identity_bytes OR prior.mutation_kind<>p_mutation_kind OR prior.request_payload<>p_request_payload THEN RAISE EXCEPTION 'OperationKey replay payload conflict.'; END IF;
		IF prior.result_history_generation IS NULL THEN RAISE EXCEPTION 'Legacy receipt lacks immutable acknowledgment coordinates.'; END IF;
		RETURN QUERY SELECT true,r."SessionID",r."TurnKey",r."OperationKey",r."MessageID",r."MessageKey",r."SequenceNumber",r."MessageDateCreatedUtc",r."MutationVersion",r."ChangeRevision",r."HistoryGeneration",r."State",r."WriterToken" FROM authoritative_turn_receipt_rows r WHERE r."SessionID"=p_session_id AND r."OperationKey"=p_operation_key;
		RETURN;
	END IF;
	-- Match SQL Server clear: retain payloads and immutable receipts, tombstone turns, advance generation.
	IF p_mutation_kind='Clear' THEN
		IF session_state.active_turn_key IS NOT NULL THEN RAISE EXCEPTION 'Cannot clear authoritative history while a turn is active.'; END IF;
		-- Preserve usage accounting while clearing its nullable timeline references and payload rows atomically.
		IF to_regclass('usage_events') IS NOT NULL THEN
			UPDATE usage_events SET message_id=NULL WHERE session_id=p_session_id AND message_id IS NOT NULL;
		END IF;
		DELETE FROM messages WHERE session_id=p_session_id;
		WITH changed AS (SELECT turn_identity,row_number() OVER(ORDER BY order_key) AS n FROM turns WHERE session_id=p_session_id AND is_deleted=false)
		UPDATE turns t SET is_deleted=true,change_revision=session_state.committed_revision+c.n FROM changed c WHERE t.session_id=p_session_id AND t.turn_identity=c.turn_identity;
		GET DIAGNOSTICS new_revision = ROW_COUNT;
		new_revision := session_state.committed_revision+greatest(new_revision,1);
		SELECT coalesce(max(mutation_version),1) INTO new_version FROM turns WHERE session_id=p_session_id;
		UPDATE turn_mutation_receipts SET is_tombstone=true WHERE session_id=p_session_id;
		UPDATE session_turn_state SET committed_revision=new_revision,history_generation=history_generation+1,active_turn_key=NULL,active_turn_identity=NULL,last_updated_at_utc=now_utc WHERE session_id=p_session_id;
		INSERT INTO turn_mutation_receipts(session_id,operation_key,turn_key,turn_identity,mutation_kind,request_fingerprint,request_payload,mutation_version,change_revision,occurred_at_utc,persisted_at_utc,is_tombstone,result_history_generation)
		VALUES(p_session_id,p_operation_key,p_turn_key,identity_bytes,p_mutation_kind,p_request_fingerprint,p_request_payload,new_version,new_revision,p_occurred_at_utc,now_utc,true,session_state.history_generation+1);
		RETURN QUERY SELECT * FROM authoritative_turn_receipt_rows WHERE "SessionID"=p_session_id AND "OperationKey"=p_operation_key;
		RETURN;
	END IF;
	IF p_mutation_kind='Begin' THEN
		IF session_state.active_turn_key IS NOT NULL OR p_writer_token IS NULL THEN RAISE EXCEPTION 'Begin requires exclusive new ownership.'; END IF;
		IF p_turn_kind NOT IN ('Execution','Scheduled') THEN RAISE EXCEPTION 'Invalid turn kind.'; END IF;
		INSERT INTO turns(session_id,turn_key,turn_identity,order_key,admission_operation_key,display_order_at_utc,started_at_utc,state,kind,mutation_version,change_revision,writer_token,is_deleted)
		VALUES(p_session_id,p_turn_key,identity_bytes,session_state.next_order_key,p_operation_key,p_occurred_at_utc,p_occurred_at_utc,'InProgress',p_turn_kind,1,session_state.committed_revision+1,p_writer_token,false) RETURNING * INTO current_turn;
		UPDATE session_turn_state SET next_order_key=next_order_key+1 WHERE session_id=p_session_id;
	ELSE
		SELECT * INTO current_turn FROM turns WHERE session_id=p_session_id AND turn_identity=identity_bytes AND is_deleted=false FOR UPDATE;
		IF NOT FOUND OR p_expected_version IS NULL OR current_turn.mutation_version<>p_expected_version OR p_writer_token IS NULL OR current_turn.writer_token IS DISTINCT FROM p_writer_token THEN RAISE EXCEPTION 'Turn version or writer token conflict.'; END IF;
		IF current_turn.state NOT IN ('InProgress','Paused') THEN RAISE EXCEPTION 'Mutation requires active ownership.'; END IF;
		IF p_mutation_kind='Pause' AND current_turn.state<>'InProgress' THEN RAISE EXCEPTION 'Pause requires InProgress.'; END IF;
		IF p_mutation_kind='Resume' AND current_turn.state<>'Paused' THEN RAISE EXCEPTION 'Resume requires Paused.'; END IF;
	END IF;
	IF p_mutation_kind IN ('Begin','Resume') THEN
		UPDATE turns SET owner_machine_name=p_owner_machine_name,owner_process_id=p_owner_process_id,owner_process_start_utc_ticks=p_owner_process_start_utc_ticks WHERE session_id=p_session_id AND turn_identity=identity_bytes;
	ELSIF p_mutation_kind IN ('Handoff','Finish','Interrupt') THEN
		UPDATE turns SET owner_machine_name=NULL,owner_process_id=NULL,owner_process_start_utc_ticks=NULL WHERE session_id=p_session_id AND turn_identity=identity_bytes;
	END IF;
	IF p_mutation_kind IN ('Finish','Interrupt') THEN
		IF (p_mutation_kind='Finish' AND p_terminal_state NOT IN ('Completed','Failed','Cancelled')) OR (p_mutation_kind='Interrupt' AND p_terminal_state IS DISTINCT FROM 'Interrupted') OR p_message_key IS NULL OR p_message_anchor_kind IS DISTINCT FROM 'Lifecycle' OR p_terminal_reason IS NULL OR p_terminal_details IS NULL THEN RAISE EXCEPTION 'Invalid typed terminal mutation.'; END IF;
		outcome := p_message_data::jsonb->'TerminalOutcome';
		IF outcome IS DISTINCT FROM jsonb_build_object('State',p_terminal_state,'Reason',p_terminal_reason,'Details',p_terminal_details) THEN RAISE EXCEPTION 'Terminal envelope differs from typed outcome.'; END IF;
	ELSIF p_terminal_state IS NOT NULL THEN RAISE EXCEPTION 'Nonterminal mutation has terminal outcome.';
	END IF;
	IF p_mutation_kind='Handoff' AND p_new_writer_token IS NULL THEN RAISE EXCEPTION 'Handoff requires replacement token.'; END IF;
	IF (p_handoff_project_name IS NULL)<>(p_handoff_agent_name IS NULL) OR (p_handoff_project_name IS NOT NULL AND p_mutation_kind<>'Handoff') THEN RAISE EXCEPTION 'Invalid handoff routing.'; END IF;
	IF p_mutation_kind IN ('Append','UpdateExistingMessage','Compaction') AND p_message_key IS NULL THEN RAISE EXCEPTION 'Mutation requires message.'; END IF;
	IF p_message_key IS NOT NULL THEN
		PERFORM authoritative_turn_identity(p_message_key);
		IF p_message_role IS NULL OR p_message_content IS NULL OR p_message_date_created_utc IS NULL THEN RAISE EXCEPTION 'Incomplete message contract.'; END IF;
		IF p_mutation_kind IN ('UpdateExistingMessage','Compaction') THEN
			SELECT message_id,sequence_number INTO message_id_value,sequence_value FROM messages WHERE session_id=p_session_id AND turn_id COLLATE "C"=p_turn_key COLLATE "C" AND message_key COLLATE "C"=p_message_key COLLATE "C" AND date_created=p_message_date_created_utc FOR UPDATE;
			IF NOT FOUND THEN RAISE EXCEPTION 'Message identity or immutable date conflict.'; END IF;
			UPDATE messages SET role=p_message_role,content=p_message_content,tool_name=p_message_tool_name,tool_arguments=p_message_tool_arguments,call_id=p_message_call_id,data=p_message_data,is_compacted=p_message_is_compacted,compaction_epoch=p_message_compaction_epoch,compaction_epoch_key=p_message_compaction_epoch_key,last_updated=now_utc WHERE message_id=message_id_value;
		ELSE
			SELECT coalesce(max(sequence_number),0)+1 INTO sequence_value FROM messages WHERE session_id=p_session_id;
			INSERT INTO messages(session_id,sequence_number,role,content,tool_name,tool_arguments,call_id,data,is_compacted,compaction_epoch,compaction_epoch_key,date_created,last_updated,message_key,turn_id)
			VALUES(p_session_id,sequence_value,p_message_role,p_message_content,p_message_tool_name,p_message_tool_arguments,p_message_call_id,p_message_data,p_message_is_compacted,p_message_compaction_epoch,p_message_compaction_epoch_key,p_message_date_created_utc,now_utc,p_message_key,p_turn_key) RETURNING message_id INTO message_id_value;
		END IF;
	END IF;
	new_version := CASE WHEN p_mutation_kind IN ('Begin','Compaction') THEN current_turn.mutation_version ELSE current_turn.mutation_version+1 END;
	new_revision := CASE WHEN p_mutation_kind='Compaction' THEN session_state.committed_revision ELSE session_state.committed_revision+1 END;
	current_turn.state := CASE WHEN p_mutation_kind IN ('Pause','Handoff') THEN 'Paused' WHEN p_mutation_kind='Resume' THEN 'InProgress' WHEN p_mutation_kind IN ('Finish','Interrupt') THEN p_terminal_state ELSE current_turn.state END;
	current_turn.writer_token := CASE WHEN p_mutation_kind IN ('Finish','Interrupt') THEN NULL WHEN p_mutation_kind='Handoff' THEN p_new_writer_token ELSE current_turn.writer_token END;
	IF p_mutation_kind<>'Compaction' THEN
		UPDATE turns SET state=current_turn.state,writer_token=current_turn.writer_token,mutation_version=new_version,change_revision=new_revision,
		completed_at_utc=CASE WHEN p_mutation_kind IN ('Finish','Interrupt') THEN p_occurred_at_utc ELSE completed_at_utc END,
		terminal_reason=CASE WHEN p_mutation_kind IN ('Finish','Interrupt') THEN p_terminal_reason ELSE terminal_reason END,
		first_message_id=coalesce(first_message_id,message_id_value),user_message_id=CASE WHEN p_message_anchor_kind='User' THEN coalesce(user_message_id,message_id_value) ELSE user_message_id END,
		assistant_message_id=CASE WHEN p_message_anchor_kind='Assistant' THEN message_id_value ELSE assistant_message_id END,
		last_error_message_id=CASE WHEN p_message_anchor_kind='Error' THEN message_id_value ELSE last_error_message_id END,
		terminal_message_id=CASE WHEN p_mutation_kind IN ('Finish','Interrupt') THEN message_id_value ELSE terminal_message_id END
		WHERE session_id=p_session_id AND turn_identity=identity_bytes;
	END IF;
	UPDATE session_turn_state SET committed_revision=new_revision,active_turn_key=CASE WHEN p_mutation_kind IN ('Finish','Interrupt') THEN NULL ELSE p_turn_key END,active_turn_identity=CASE WHEN p_mutation_kind IN ('Finish','Interrupt') THEN NULL ELSE identity_bytes END,last_updated_at_utc=now_utc WHERE session_id=p_session_id;
	INSERT INTO turn_mutation_receipts(session_id,operation_key,turn_key,turn_identity,mutation_kind,request_fingerprint,request_payload,message_id,message_key,mutation_version,change_revision,occurred_at_utc,persisted_at_utc,is_tombstone,result_history_generation,result_state,result_writer_token,result_sequence_number,result_message_date_created_utc,handoff_project_name,handoff_agent_name)
	VALUES(p_session_id,p_operation_key,p_turn_key,identity_bytes,p_mutation_kind,p_request_fingerprint,p_request_payload,message_id_value,p_message_key,new_version,new_revision,p_occurred_at_utc,now_utc,false,session_state.history_generation,current_turn.state,current_turn.writer_token,sequence_value,p_message_date_created_utc,p_handoff_project_name,p_handoff_agent_name);
	RETURN QUERY SELECT * FROM authoritative_turn_receipt_rows WHERE "SessionID"=p_session_id AND "OperationKey"=p_operation_key;
END $$;

-- A committed transfer remains discoverable until a replacement commits Resume; event delivery is not acknowledgment.
CREATE OR REPLACE FUNCTION "Turns_ReadPendingHandoffs"(p_session_id integer DEFAULT NULL,p_after_session_id integer DEFAULT 0,p_max_count integer DEFAULT 100)
RETURNS TABLE("IsReplay" boolean,"SessionID" integer,"TurnKey" text,"OperationKey" uuid,"MessageID" integer,"MessageKey" text,"SequenceNumber" integer,"MessageDateCreatedUtc" timestamp,"MutationVersion" bigint,"ChangeRevision" bigint,"HistoryGeneration" bigint,"State" text,"WriterToken" uuid,"HandoffProjectName" text,"HandoffAgentName" text,"SessionKey" text) LANGUAGE plpgsql AS $$
BEGIN
	IF p_session_id<=0 OR p_after_session_id<0 OR p_max_count<1 OR p_max_count>500 THEN RAISE EXCEPTION 'Invalid pending handoff discovery bounds.'; END IF;
	RETURN QUERY SELECT true,r.session_id,r.turn_key,r.operation_key,r.message_id,r.message_key,r.result_sequence_number,r.result_message_date_created_utc,r.mutation_version,r.change_revision,r.result_history_generation,r.result_state,r.result_writer_token,r.handoff_project_name,r.handoff_agent_name,session_row.session_key
	FROM turn_mutation_receipts r JOIN sessions session_row ON session_row.session_id=r.session_id
	JOIN turns t ON t.session_id=r.session_id AND t.turn_identity=r.turn_identity
	JOIN session_turn_state s ON s.session_id=t.session_id AND s.active_turn_identity=t.turn_identity
	WHERE (p_session_id IS NULL OR r.session_id=p_session_id) AND r.session_id>p_after_session_id AND r.mutation_kind='Handoff' AND NOT r.is_tombstone
		AND NOT t.is_deleted AND t.state='Paused' AND t.mutation_version=r.mutation_version AND t.writer_token=r.result_writer_token AND r.result_state='Paused'
		AND s.authority_status='Authoritative' AND s.authority_contract_version=1 AND NOT s.writer_fence
	ORDER BY r.session_id LIMIT p_max_count;
END $$;

ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS published_at_utc timestamp NULL;
-- Receipt insertion and terminal persistence commit together; delivery acknowledgment never changes the receipt result.
CREATE OR REPLACE FUNCTION "Turns_ReadPendingPublications"(p_max_count integer DEFAULT 100)
RETURNS TABLE("SessionID" integer,"SessionKey" text,"TurnKey" text,"OperationKey" uuid,"MessageKey" text,"SequenceNumber" integer,"OccurredAtUtc" timestamp,"State" text) LANGUAGE plpgsql AS $$
BEGIN
	IF p_max_count<1 OR p_max_count>500 THEN RAISE EXCEPTION 'Invalid publication page bounds.'; END IF;
	RETURN QUERY SELECT r.session_id,s.session_key,r.turn_key,r.operation_key,r.message_key,r.result_sequence_number,r.occurred_at_utc,r.result_state
	FROM turn_mutation_receipts r JOIN sessions s ON s.session_id=r.session_id WHERE r.mutation_kind IN ('Finish','Interrupt') AND r.published_at_utc IS NULL
	ORDER BY r.persisted_at_utc,r.session_id,r.operation_key LIMIT p_max_count;
END $$;
CREATE OR REPLACE FUNCTION "Turns_AcknowledgePublication"(p_session_id integer,p_operation_key uuid) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
	UPDATE turn_mutation_receipts SET published_at_utc=coalesce(published_at_utc,timezone('utc',clock_timestamp())) WHERE session_id=p_session_id AND operation_key=p_operation_key AND mutation_kind IN ('Finish','Interrupt');
	IF NOT FOUND THEN RAISE EXCEPTION 'Terminal publication receipt does not exist.'; END IF;
END $$;

CREATE OR REPLACE FUNCTION "SessionEventStatus_Upsert"(p_session_id integer,p_message_key text,p_data text,p_date_created_utc timestamp)
RETURNS TABLE("MessageID" integer) LANGUAGE plpgsql AS $$
DECLARE existing messages%ROWTYPE; sequence_value integer; inserted_id integer;
BEGIN
	IF p_data::jsonb->>'CreatedUtc' IS NULL OR p_data::jsonb#>>'{SessionEventCorrelation,EventId}' IS NULL OR p_data::jsonb#>>'{SessionEventCorrelation,SourceSessionKey}' IS NULL THEN RAISE EXCEPTION 'Session event status requires source correlation and chronology.'; END IF;
	PERFORM 1 FROM sessions WHERE session_id=p_session_id FOR UPDATE;
	IF NOT FOUND THEN RAISE EXCEPTION 'Session does not exist.'; END IF;
	IF NOT EXISTS(SELECT 1 FROM session_turn_state WHERE session_id=p_session_id) THEN
		IF EXISTS(SELECT 1 FROM messages WHERE session_id=p_session_id) THEN RAISE EXCEPTION 'Historical session requires population.'; END IF;
		INSERT INTO session_turn_state VALUES(p_session_id,1,0,1,NULL,NULL,'Authoritative',1,false,timezone('utc',clock_timestamp()));
	END IF;
	IF EXISTS(SELECT 1 FROM session_turn_state WHERE session_id=p_session_id AND writer_fence) THEN RAISE EXCEPTION 'Session event writes are fenced during population.'; END IF;
	SELECT * INTO existing FROM messages WHERE session_id=p_session_id AND message_key COLLATE "C"=p_message_key COLLATE "C";
	IF FOUND THEN
		IF existing.turn_id IS NOT NULL OR existing.role<>'Lifecycle' OR existing.data::jsonb->'SessionEventCorrelation' IS DISTINCT FROM p_data::jsonb->'SessionEventCorrelation' OR existing.date_created<>p_date_created_utc THEN RAISE EXCEPTION 'Session event identity or chronology conflict.'; END IF;
		UPDATE messages SET data=p_data,last_updated=timezone('utc',clock_timestamp()) WHERE message_id=existing.message_id;
		inserted_id := existing.message_id;
	ELSE
		SELECT coalesce(max(sequence_number),0)+1 INTO sequence_value FROM messages WHERE session_id=p_session_id;
		INSERT INTO messages(session_id,sequence_number,role,content,date_created,last_updated,data,is_compacted,message_key,turn_id) VALUES(p_session_id,sequence_value,'Lifecycle','',p_date_created_utc,timezone('utc',clock_timestamp()),p_data,false,p_message_key,NULL) RETURNING message_id INTO inserted_id;
	END IF;
	RETURN QUERY SELECT inserted_id;
END $$;

-- Bounded primary recovery discovery; an empty worker map is not proof the persisted owner died.
CREATE OR REPLACE FUNCTION "Turns_ReadProcessOwners"(p_after_session_id integer,p_max_count integer)
RETURNS TABLE("SessionID" integer,"TurnKey" text,"MutationVersion" bigint,"WriterToken" uuid,"OwnerMachineName" text,"OwnerProcessID" integer,"OwnerProcessStartUtcTicks" bigint) LANGUAGE plpgsql AS $$
BEGIN
	IF p_after_session_id<0 OR p_max_count<1 OR p_max_count>500 THEN RAISE EXCEPTION 'Invalid process-owner discovery bounds.'; END IF;
	RETURN QUERY SELECT t.session_id,t.turn_key,t.mutation_version,t.writer_token,t.owner_machine_name,t.owner_process_id,t.owner_process_start_utc_ticks
	FROM turns t JOIN session_turn_state s ON s.session_id=t.session_id AND s.active_turn_identity=t.turn_identity
	WHERE t.session_id>p_after_session_id AND NOT t.is_deleted AND t.state IN ('InProgress','Paused') AND t.owner_machine_name IS NOT NULL
		AND s.authority_status='Authoritative' AND s.authority_contract_version=1 AND NOT s.writer_fence
	ORDER BY t.session_id LIMIT p_max_count;
END $$;

-- Fence legacy admission before checkpoint capture; exact-name compatibility wrappers delegate here.
CREATE OR REPLACE FUNCTION insert_message_sp(p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_turn_id text,p_compaction_epoch_key text,p_date_created timestamp DEFAULT NULL)
RETURNS TABLE ("MessageID" integer) LANGUAGE plpgsql AS $$
BEGIN
	RAISE EXCEPTION 'LegacyTurnWriterRejected: use the authoritative turn mutation contract.';
END;
$$;

CREATE TABLE IF NOT EXISTS authoritative_turns_contract_artifacts(contract_name text PRIMARY KEY,definition_hash bytea NOT NULL);
INSERT INTO authoritative_turns_contract_artifacts(contract_name,definition_hash)
VALUES('LegacyInsertRejection',sha256(convert_to(pg_get_functiondef('insert_message_sp(integer,integer,text,text,text,text,text,text,boolean,integer,text,text,text,timestamp)'::regprocedure),'UTF8')))
ON CONFLICT(contract_name) DO UPDATE SET definition_hash=EXCLUDED.definition_hash;
