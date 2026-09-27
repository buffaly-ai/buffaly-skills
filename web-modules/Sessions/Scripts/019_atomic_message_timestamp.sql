-- Remove the old arity explicitly before adding a defaulted timestamp; otherwise old and new overloads are ambiguous.
-- Script 009 recreates the exact-name wrapper after this family script.
DROP FUNCTION IF EXISTS "InsertMessageSp"(integer,integer,text,text,text,text,text,text,boolean,integer,text,text,text);
DROP FUNCTION IF EXISTS insert_message_sp(integer,integer,text,text,text,text,text,text,boolean,integer,text,text,text);
CREATE OR REPLACE FUNCTION insert_message_sp(p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_turn_id text,p_compaction_epoch_key text,p_date_created timestamp DEFAULT NULL)
RETURNS TABLE ("MessageID" integer) LANGUAGE sql AS $$
	INSERT INTO messages(session_id,sequence_number,role,content,tool_name,tool_arguments,call_id,date_created,last_updated,data,is_compacted,compaction_epoch,message_key,turn_id,compaction_epoch_key)
	VALUES(p_session_id,p_sequence_number,p_role,p_content,p_tool_name,p_tool_arguments,p_call_id,COALESCE(p_date_created,now()),now(),p_data,p_is_compacted,p_compaction_epoch,p_message_key,p_turn_id,p_compaction_epoch_key)
	RETURNING message_id;
$$;

CREATE OR REPLACE FUNCTION "InsertMessageSp"(p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_turn_id text,p_compaction_epoch_key text,p_date_created timestamp DEFAULT NULL) RETURNS TABLE ("MessageID" integer) LANGUAGE sql AS $$ SELECT * FROM insert_message_sp(p_session_id,p_sequence_number,p_role,p_content,p_tool_name,p_tool_arguments,p_call_id,p_data,p_is_compacted,p_compaction_epoch,p_message_key,p_turn_id,p_compaction_epoch_key,p_date_created); $$;
