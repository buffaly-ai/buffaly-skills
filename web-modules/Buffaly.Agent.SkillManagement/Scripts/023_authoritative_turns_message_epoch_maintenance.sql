-- Registered session-owned epoch maintenance. This routine changes only message epoch coordinates.
DROP TYPE IF EXISTS authoritative_message_epoch_receipt_rows CASCADE;
CREATE TYPE authoritative_message_epoch_receipt_rows AS (
	"OperationKey" uuid,
	"HistoryGeneration" bigint,
	"UpdatedRows" integer,
	"IsReplay" boolean
);

ALTER TABLE turn_mutation_receipts DROP CONSTRAINT IF EXISTS ck_turn_receipt_kind;
ALTER TABLE turn_mutation_receipts ADD CONSTRAINT ck_turn_receipt_kind CHECK (mutation_kind IN ('Begin','Append','UpdateExistingMessage','Pause','Resume','Handoff','Finish','Interrupt','Compaction','Clear','HistoricalImport','MoveMessageEpoch','MoveToolPairEpoch'));

ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS maintenance_owner_turn_key text NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS maintenance_writer_token uuid NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS maintenance_source_epoch integer NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS maintenance_source_epoch_key text NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS maintenance_target_epoch integer NULL;
ALTER TABLE turn_mutation_receipts ADD COLUMN IF NOT EXISTS maintenance_target_epoch_key text NULL;

CREATE OR REPLACE FUNCTION "Turns_MoveMessageEpoch"(
	p_session_id integer,p_operation_key uuid,p_history_generation bigint,p_owner_turn_key text,p_writer_token uuid,
	p_message_key text,p_source_epoch integer,p_source_epoch_key text,p_target_epoch integer,p_target_epoch_key text,p_request_payload bytea)
RETURNS SETOF authoritative_message_epoch_receipt_rows LANGUAGE plpgsql AS $$
DECLARE session_state session_turn_state%ROWTYPE; active_turn turns%ROWTYPE; message_turn turns%ROWTYPE; prior turn_mutation_receipts%ROWTYPE; message_row messages%ROWTYPE; owner_identity bytea; now_utc timestamp := timezone('utc',clock_timestamp());
BEGIN
	IF p_session_id IS NULL OR p_session_id<=0 OR p_operation_key IS NULL OR p_operation_key='00000000-0000-0000-0000-000000000000'::uuid OR p_history_generation IS NULL OR p_history_generation<1 OR p_message_key IS NULL OR p_target_epoch IS NULL OR p_target_epoch<0 OR p_target_epoch_key IS NULL OR length(p_target_epoch_key)=0 OR p_request_payload IS NULL OR octet_length(p_request_payload)=0 THEN RAISE EXCEPTION 'Invalid message epoch mutation coordinates.'; END IF;
	IF (p_owner_turn_key IS NULL)<>(p_writer_token IS NULL) THEN RAISE EXCEPTION 'Epoch maintenance owner identity and token must be supplied together.'; END IF;
	PERFORM authoritative_turn_identity(p_message_key);
	IF p_owner_turn_key IS NOT NULL THEN owner_identity := authoritative_turn_identity(p_owner_turn_key); END IF;
	PERFORM 1 FROM sessions WHERE session_id=p_session_id FOR UPDATE;
	IF NOT FOUND THEN RAISE EXCEPTION 'Session does not exist.'; END IF;
	SELECT * INTO session_state FROM session_turn_state WHERE session_id=p_session_id FOR UPDATE;
	IF NOT FOUND OR session_state.authority_status<>'Authoritative' OR session_state.authority_contract_version<>1 OR session_state.writer_fence THEN RAISE EXCEPTION 'Session is not ready for authoritative epoch maintenance.'; END IF;
	IF session_state.history_generation<>p_history_generation THEN RAISE EXCEPTION 'History generation conflict.'; END IF;
	IF session_state.active_turn_key IS NULL THEN
		IF p_owner_turn_key IS NOT NULL THEN RAISE EXCEPTION 'Idle epoch maintenance must be ownerless.'; END IF;
	ELSE
		IF p_owner_turn_key IS NULL OR session_state.active_turn_identity<>owner_identity THEN RAISE EXCEPTION 'Active epoch maintenance requires current owner.'; END IF;
		SELECT * INTO active_turn FROM turns WHERE session_id=p_session_id AND turn_identity=owner_identity AND is_deleted=false FOR UPDATE;
		IF NOT FOUND OR active_turn.writer_token IS DISTINCT FROM p_writer_token OR active_turn.state NOT IN ('InProgress','Paused') THEN RAISE EXCEPTION 'Turn writer token conflict.'; END IF;
	END IF;
	SELECT * INTO prior FROM turn_mutation_receipts WHERE session_id=p_session_id AND operation_key=p_operation_key;
	IF FOUND THEN
		IF prior.mutation_kind<>'MoveMessageEpoch' OR prior.request_payload<>p_request_payload OR prior.message_key COLLATE "C"<>p_message_key COLLATE "C" OR prior.result_history_generation<>p_history_generation OR prior.maintenance_owner_turn_key IS DISTINCT FROM p_owner_turn_key OR prior.maintenance_writer_token IS DISTINCT FROM p_writer_token OR prior.maintenance_source_epoch IS DISTINCT FROM p_source_epoch OR prior.maintenance_source_epoch_key IS DISTINCT FROM p_source_epoch_key OR prior.maintenance_target_epoch IS DISTINCT FROM p_target_epoch OR prior.maintenance_target_epoch_key IS DISTINCT FROM p_target_epoch_key THEN RAISE EXCEPTION 'OperationKey replay payload or scalar conflict.'; END IF;
		RETURN QUERY SELECT p_operation_key,p_history_generation,1,true;
		RETURN;
	END IF;
	SELECT * INTO message_row FROM messages WHERE session_id=p_session_id AND message_key COLLATE "C"=p_message_key COLLATE "C" FOR UPDATE;
	IF NOT FOUND OR message_row.compaction_epoch IS DISTINCT FROM p_source_epoch OR message_row.compaction_epoch_key IS DISTINCT FROM p_source_epoch_key THEN RAISE EXCEPTION 'Message source epoch conflict.'; END IF;
	SELECT * INTO message_turn FROM turns WHERE session_id=p_session_id AND turn_key COLLATE "C"=message_row.turn_id COLLATE "C" AND is_deleted=false;
	IF NOT FOUND THEN RAISE EXCEPTION 'Message authoritative Turn does not exist.'; END IF;
	UPDATE messages SET compaction_epoch=p_target_epoch,compaction_epoch_key=p_target_epoch_key WHERE message_id=message_row.message_id;
	INSERT INTO turn_mutation_receipts(session_id,operation_key,turn_key,turn_identity,mutation_kind,request_fingerprint,request_payload,message_id,message_key,mutation_version,change_revision,occurred_at_utc,persisted_at_utc,is_tombstone,result_history_generation,maintenance_owner_turn_key,maintenance_writer_token,maintenance_source_epoch,maintenance_source_epoch_key,maintenance_target_epoch,maintenance_target_epoch_key)
	VALUES(p_session_id,p_operation_key,message_turn.turn_key,message_turn.turn_identity,'MoveMessageEpoch',sha256(p_request_payload),p_request_payload,message_row.message_id,p_message_key,message_turn.mutation_version,session_state.committed_revision,now_utc,now_utc,false,p_history_generation,p_owner_turn_key,p_writer_token,p_source_epoch,p_source_epoch_key,p_target_epoch,p_target_epoch_key);
	RETURN QUERY SELECT p_operation_key,p_history_generation,1,false;
END $$;

SELECT record_schema_migration('023_authoritative_turns_message_epoch_maintenance');

-- Primary generation lookup used by idle session maintenance; never derives history from Messages.
CREATE OR REPLACE FUNCTION "Turns_ReadMaintenanceGeneration"(p_session_id integer)
RETURNS TABLE("HistoryGeneration" bigint) LANGUAGE plpgsql AS $$
BEGIN
 IF p_session_id IS NULL OR p_session_id<=0 THEN RAISE EXCEPTION 'Invalid maintenance session identity.'; END IF;
 RETURN QUERY SELECT s.history_generation FROM session_turn_state s WHERE s.session_id=p_session_id AND s.authority_status='Authoritative' AND s.authority_contract_version=1 AND NOT s.writer_fence;
 IF NOT FOUND THEN RAISE EXCEPTION 'Session is not ready for authoritative maintenance.'; END IF;
END $$;
