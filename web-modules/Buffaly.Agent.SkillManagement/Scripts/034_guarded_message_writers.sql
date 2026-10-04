CREATE OR REPLACE FUNCTION update_message_sp(p_message_id integer,p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_turn_id text,p_compaction_epoch_key text,p_message_kind text,p_terminal_outcome_state text,p_saved_work_resume boolean)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 UPDATE messages m SET sequence_number=p_sequence_number,content=p_content,tool_name=p_tool_name,
  tool_arguments=p_tool_arguments,call_id=p_call_id,data=p_data,is_compacted=p_is_compacted,
  compaction_epoch=p_compaction_epoch,compaction_epoch_key=p_compaction_epoch_key,
  last_updated=timezone('utc',clock_timestamp())
 WHERE m.message_id=p_message_id
  AND ROW(m.session_id,m.role,m.message_key,m.turn_id,m.message_kind,m.terminal_outcome_state,m.saved_work_resume)
   IS NOT DISTINCT FROM ROW(p_session_id,p_role,p_message_key,p_turn_id,p_message_kind,p_terminal_outcome_state,p_saved_work_resume)
  AND (m.role<>'Lifecycle' OR (NULLIF(m.turn_id,'') IS NULL AND m.turn_row_id IS NULL) OR m.data IS NOT DISTINCT FROM p_data);
 IF NOT FOUND AND EXISTS(SELECT 1 FROM messages WHERE message_id=p_message_id) THEN
  RAISE EXCEPTION 'Message identity, session, turn, role, classification and linked Lifecycle evidence cannot be changed.';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION copy_message_sp(p_message_id integer) RETURNS TABLE("MessageID" integer)
LANGUAGE plpgsql AS $$
DECLARE copied_id integer;
BEGIN
 INSERT INTO messages(session_id,sequence_number,role,content,tool_name,tool_arguments,call_id,date_created,last_updated,data,is_compacted,compaction_epoch,message_key,turn_id,turn_row_id,compaction_epoch_key,message_kind,terminal_outcome_state,saved_work_resume)
 SELECT session_id,sequence_number,role,content,tool_name,tool_arguments,call_id,timezone('utc',clock_timestamp()),timezone('utc',clock_timestamp()),data,is_compacted,compaction_epoch,
  message_key||'-copy-'||replace(clock_timestamp()::text,' ','-')||'-'||floor(random()*1000000)::integer::text,
  turn_id,NULL,compaction_epoch_key,message_kind,terminal_outcome_state,saved_work_resume
 FROM messages
 WHERE message_id=p_message_id AND role='Lifecycle' AND NULLIF(turn_id,'') IS NULL AND turn_row_id IS NULL
  AND terminal_outcome_state IS NULL AND saved_work_resume IS NULL
 RETURNING message_id INTO copied_id;
 IF NOT FOUND THEN
  IF EXISTS(SELECT 1 FROM messages WHERE message_id=p_message_id) THEN
   RAISE EXCEPTION 'Only a turnless Lifecycle message without execution outcome can be copied.';
  END IF;
  RETURN;
 END IF;
 RETURN QUERY SELECT copied_id;
END $$;

CREATE OR REPLACE FUNCTION "Message_RemoveUnlinked_Sp"(p_message_id integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 DELETE FROM messages WHERE message_id=p_message_id AND NULLIF(turn_id,'') IS NULL AND turn_row_id IS NULL;
 IF NOT FOUND AND EXISTS(SELECT 1 FROM messages WHERE message_id=p_message_id) THEN
  RAISE EXCEPTION 'A message belonging to a turn cannot be removed individually.';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION "Message_UpdateDataGuarded_Sp"(p_message_id integer,p_data text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 UPDATE messages SET data=p_data,last_updated=timezone('utc',clock_timestamp())
 WHERE message_id=p_message_id
  AND (role<>'Lifecycle' OR (NULLIF(turn_id,'') IS NULL AND turn_row_id IS NULL) OR data IS NOT DISTINCT FROM p_data);
 IF NOT FOUND AND EXISTS(SELECT 1 FROM messages WHERE message_id=p_message_id) THEN
  RAISE EXCEPTION 'Linked Lifecycle execution evidence cannot be changed through UpdateMessageData.';
 END IF;
END $$;

CREATE OR REPLACE FUNCTION "Messages_UpdateSessionEventStatusSp"(p_message_id integer,p_session_id integer,p_message_kind text,p_data text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF NULLIF(p_message_kind,'') IS NULL THEN RAISE EXCEPTION 'Callback MessageKind required'; END IF;
 UPDATE messages SET message_kind=p_message_kind,data=p_data,last_updated=timezone('utc',clock_timestamp()) WHERE message_id=p_message_id AND session_id=p_session_id AND role='Lifecycle' AND NULLIF(turn_id,'') IS NULL AND turn_row_id IS NULL AND terminal_outcome_state IS NULL AND saved_work_resume IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Callback lifecycle identity/ownership mismatch'; END IF;
END $$;
CREATE OR REPLACE FUNCTION "UpdateMessageSp"(p_message_id integer,p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_turn_id text,p_compaction_epoch_key text,p_message_kind text,p_terminal_outcome_state text,p_saved_work_resume boolean)
RETURNS void LANGUAGE sql AS $$ SELECT update_message_sp(p_message_id,p_session_id,p_sequence_number,p_role,p_content,p_tool_name,p_tool_arguments,p_call_id,p_data,p_is_compacted,p_compaction_epoch,p_message_key,p_turn_id,p_compaction_epoch_key,p_message_kind,p_terminal_outcome_state,p_saved_work_resume) $$;
CREATE OR REPLACE FUNCTION "CopyMessageSp"(p_message_id integer) RETURNS TABLE("MessageID" integer) LANGUAGE sql AS $$ SELECT * FROM copy_message_sp(p_message_id) $$;
CREATE OR REPLACE FUNCTION "Messages_ClearSessionTimeline"(p_session_id integer) RETURNS TABLE("DeletedMessages" integer,"DeletedTurns" integer) LANGUAGE sql AS $$ SELECT * FROM messages_clear_session_timeline(p_session_id) $$;