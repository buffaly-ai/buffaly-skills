-- Preserve legacy PostgreSQL writer signatures but reject non-authoritative message mutation.
-- This compatibility fence is intentionally non-destructive; T47 owns eventual routine retirement.
CREATE OR REPLACE FUNCTION update_message_sp(p_message_id integer,p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_thread_key text,p_compaction_epoch_key text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use the authoritative turn mutation contract.'; END $$;
CREATE OR REPLACE FUNCTION "UpdateMessageSp"(p_message_id integer,p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_turn_id text,p_compaction_epoch_key text)
RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use the authoritative turn mutation contract.'; END $$;

CREATE OR REPLACE FUNCTION update_message_compaction_epoch_atomic_sp(p_session_id integer,p_message_key text,p_compaction_epoch integer,p_compaction_epoch_key text)
RETURNS TABLE ("UpdatedRows" integer) LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative epoch maintenance.'; END $$;
CREATE OR REPLACE FUNCTION "UpdateMessageCompactionEpochAtomicSp"(p_session_id integer,p_message_key text,p_compaction_epoch integer,p_compaction_epoch_key text)
RETURNS TABLE ("UpdatedRows" integer) LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative epoch maintenance.'; END $$;

CREATE OR REPLACE FUNCTION update_tool_result_pair_compaction_epoch_key_atomic_sp(p_session_id integer,p_tool_call_message_key text,p_tool_result_message_key text,p_source_compaction_epoch integer,p_source_compaction_epoch_key text,p_target_compaction_epoch_key text)
RETURNS TABLE ("UpdatedRows" integer) LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative pair maintenance.'; END $$;
CREATE OR REPLACE FUNCTION "UpdateToolResultPairCompactionEpochKeyAtomicSp"(p_session_id integer,p_tool_call_message_key text,p_tool_result_message_key text,p_source_compaction_epoch integer,p_source_compaction_epoch_key text,p_target_compaction_epoch_key text)
RETURNS TABLE ("UpdatedRows" integer) LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative pair maintenance.'; END $$;

CREATE OR REPLACE FUNCTION update_message_data_sp(p_message_id integer,p_data text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use the authoritative turn mutation contract.'; END $$;
CREATE OR REPLACE FUNCTION "UpdateMessageDataSp"(p_message_id integer,p_data text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use the authoritative turn mutation contract.'; END $$;
CREATE OR REPLACE FUNCTION update_message_tool_arguments_sp(p_message_id integer,p_tool_arguments text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use the authoritative turn mutation contract.'; END $$;
CREATE OR REPLACE FUNCTION "UpdateMessageToolArgumentsSp"(p_message_id integer,p_tool_arguments text) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use the authoritative turn mutation contract.'; END $$;
CREATE OR REPLACE FUNCTION update_message_date_created_sp(p_message_id integer,p_date_created timestamp) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: message chronology is immutable.'; END $$;
CREATE OR REPLACE FUNCTION "UpdateMessageDateCreatedSp"(p_message_id integer,p_date_created timestamp) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: message chronology is immutable.'; END $$;
CREATE OR REPLACE FUNCTION remove_message_sp(p_message_id integer) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative clear.'; END $$;
CREATE OR REPLACE FUNCTION "RemoveMessageSp"(p_message_id integer) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative clear.'; END $$;
CREATE OR REPLACE FUNCTION copy_message_sp(p_message_id integer) RETURNS TABLE ("MessageID" integer) LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative import.'; END $$;
CREATE OR REPLACE FUNCTION "CopyMessageSp"(p_message_id integer) RETURNS TABLE ("MessageID" integer) LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative import.'; END $$;
CREATE OR REPLACE FUNCTION mark_message_as_compacted_sp(p_message_id integer) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative compaction.'; END $$;
CREATE OR REPLACE FUNCTION "MarkMessageAsCompactedSp"(p_message_id integer) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative compaction.'; END $$;
CREATE OR REPLACE FUNCTION mark_message_as_not_compacted_sp(p_message_id integer) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative compaction.'; END $$;
CREATE OR REPLACE FUNCTION "MarkMessageAsNotCompactedSp"(p_message_id integer) RETURNS void LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'LegacyTurnWriterRejected: use authoritative compaction.'; END $$;

CREATE TABLE IF NOT EXISTS authoritative_turns_contract_artifacts(contract_name text PRIMARY KEY,definition_hash bytea NOT NULL);
WITH fenced(contract_name,routine) AS (VALUES
 ('LegacyFence:UpdateMessageSp','"UpdateMessageSp"(integer,integer,integer,text,text,text,text,text,text,boolean,integer,text,text,text)'::regprocedure),
 ('LegacyFence:UpdateMessageCompactionEpochAtomicSp','"UpdateMessageCompactionEpochAtomicSp"(integer,text,integer,text)'::regprocedure),
 ('LegacyFence:UpdateToolResultPairCompactionEpochKeyAtomicSp','"UpdateToolResultPairCompactionEpochKeyAtomicSp"(integer,text,text,integer,text,text)'::regprocedure),
 ('LegacyFence:UpdateMessageDataSp','"UpdateMessageDataSp"(integer,text)'::regprocedure),
 ('LegacyFence:UpdateMessageToolArgumentsSp','"UpdateMessageToolArgumentsSp"(integer,text)'::regprocedure),
 ('LegacyFence:UpdateMessageDateCreatedSp','"UpdateMessageDateCreatedSp"(integer,timestamp without time zone)'::regprocedure),
 ('LegacyFence:RemoveMessageSp','"RemoveMessageSp"(integer)'::regprocedure),
 ('LegacyFence:CopyMessageSp','"CopyMessageSp"(integer)'::regprocedure),
 ('LegacyFence:MarkMessageAsCompactedSp','"MarkMessageAsCompactedSp"(integer)'::regprocedure),
 ('LegacyFence:MarkMessageAsNotCompactedSp','"MarkMessageAsNotCompactedSp"(integer)'::regprocedure),
 ('LegacyFenceSnake:update_message_sp','update_message_sp(integer,integer,integer,text,text,text,text,text,text,boolean,integer,text,text,text)'::regprocedure),
 ('LegacyFenceSnake:update_message_compaction_epoch_atomic_sp','update_message_compaction_epoch_atomic_sp(integer,text,integer,text)'::regprocedure),
 ('LegacyFenceSnake:update_tool_result_pair_compaction_epoch_key_atomic_sp','update_tool_result_pair_compaction_epoch_key_atomic_sp(integer,text,text,integer,text,text)'::regprocedure),
 ('LegacyFenceSnake:update_message_data_sp','update_message_data_sp(integer,text)'::regprocedure),
 ('LegacyFenceSnake:update_message_tool_arguments_sp','update_message_tool_arguments_sp(integer,text)'::regprocedure),
 ('LegacyFenceSnake:update_message_date_created_sp','update_message_date_created_sp(integer,timestamp without time zone)'::regprocedure),
 ('LegacyFenceSnake:remove_message_sp','remove_message_sp(integer)'::regprocedure),
 ('LegacyFenceSnake:copy_message_sp','copy_message_sp(integer)'::regprocedure),
 ('LegacyFenceSnake:mark_message_as_compacted_sp','mark_message_as_compacted_sp(integer)'::regprocedure),
 ('LegacyFenceSnake:mark_message_as_not_compacted_sp','mark_message_as_not_compacted_sp(integer)'::regprocedure)
), hashed AS (SELECT contract_name,sha256(convert_to(pg_get_functiondef(routine),'UTF8')) definition_hash FROM fenced)
INSERT INTO authoritative_turns_contract_artifacts(contract_name,definition_hash)
SELECT contract_name,definition_hash FROM hashed ON CONFLICT(contract_name) DO UPDATE SET definition_hash=EXCLUDED.definition_hash;

SELECT record_schema_migration('025_authoritative_turns_legacy_writer_fences');
