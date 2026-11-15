-- Additive one-time wake contract; no historical routine is replaced.
ALTER TABLE processes ADD COLUMN IF NOT EXISTS due_at_utc timestamp NULL;
ALTER TABLE processes ADD COLUMN IF NOT EXISTS one_time_state varchar(255) NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS pending_wake_process_id integer NULL;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_index i JOIN pg_class c ON c.oid=i.indexrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=current_schema() AND c.relname='ix_sessions_pending_wake' AND (i.indisunique OR i.indpred IS NOT NULL)) THEN DROP INDEX ix_sessions_pending_wake; END IF;
END $$;
CREATE INDEX IF NOT EXISTS ix_sessions_pending_wake ON sessions(pending_wake_process_id);
CREATE INDEX IF NOT EXISTS ix_processes_one_time_due ON processes(one_time_state,due_at_utc,process_id) WHERE action='OneTimeProcess';
CREATE INDEX IF NOT EXISTS ix_processes_one_time_state ON processes(one_time_state,due_at_utc,process_id) INCLUDE(action,process_name);

CREATE OR REPLACE FUNCTION "Process_GetByProcessNameSessionWake_Sp"(p_process_name text)
RETURNS TABLE("ProcessID" integer,"ProcessName" text,"SessionID" integer,"DueAtUtc" timestamp,"OneTimeState" text,"RunData" text,"DateCreated" timestamp) LANGUAGE sql AS $$
 SELECT p.process_id,p.process_name,s.session_id,p.due_at_utc,p.one_time_state::text,p.run_data,p.date_created FROM processes p JOIN sessions s ON s.session_key=(CASE WHEN p.action='OneTimeProcess' THEN p.run_data::jsonb END)->>'SessionKey' WHERE p.process_name=p_process_name AND p.action='OneTimeProcess';
$$;
CREATE OR REPLACE FUNCTION "Process_GetByProcessIDSessionWake_Sp"(p_process_id integer)
RETURNS TABLE("ProcessID" integer,"ProcessName" text,"SessionID" integer,"DueAtUtc" timestamp,"OneTimeState" text,"RunData" text,"DateCreated" timestamp) LANGUAGE plpgsql AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM sessions WHERE pending_wake_process_id=p_process_id) THEN
 RETURN QUERY SELECT p.process_id,p.process_name,s.session_id,p.due_at_utc,p.one_time_state::text,p.run_data,p.date_created FROM processes p JOIN sessions s ON s.pending_wake_process_id=p.process_id WHERE p.process_id=p_process_id AND p.action='OneTimeProcess';
 RETURN; END IF;
 RETURN QUERY SELECT p.process_id,p.process_name,s.session_id,p.due_at_utc,p.one_time_state::text,p.run_data,p.date_created FROM processes p JOIN sessions s ON s.session_key=(CASE WHEN p.action='OneTimeProcess' THEN p.run_data::jsonb END)->>'SessionKey' WHERE p.process_id=p_process_id AND p.action='OneTimeProcess';
END $$;
CREATE OR REPLACE FUNCTION "Process_GetAdmittingSessionWakeByName_Sp"(p_process_name text)
RETURNS TABLE("ProcessID" integer,"ProcessName" text,"SessionID" integer,"DueAtUtc" timestamp,"OneTimeState" text,"RunData" text,"DateCreated" timestamp) LANGUAGE sql AS $$
 SELECT p.process_id,p.process_name,s.session_id,p.due_at_utc,p.one_time_state::text,p.run_data,p.date_created FROM processes p JOIN sessions s ON s.pending_wake_process_id=p.process_id WHERE p.process_name=p_process_name AND p.one_time_state='Admitting' AND p.action='OneTimeProcess';
$$;
CREATE OR REPLACE FUNCTION "Process_ScheduleSessionWake_Sp"(p_session_id integer,p_expected_process_id integer,p_process_name text,p_due_at_utc timestamp with time zone,p_run_data text)
RETURNS TABLE("ProcessID" integer,"ProcessName" text,"SessionID" integer,"DueAtUtc" timestamp,"OneTimeState" text,"RunData" text,"DateCreated" timestamp) LANGUAGE plpgsql AS $$
DECLARE target_key text; pointer integer; old_process processes%ROWTYPE; new_id integer; affected integer;
BEGIN
 SELECT s.session_key,s.pending_wake_process_id INTO target_key,pointer FROM sessions s WHERE s.session_id=p_session_id;
 IF target_key IS NULL OR p_run_data::jsonb->>'SessionKey' IS NULL OR p_run_data::jsonb->>'SessionKey'<>target_key THEN RAISE EXCEPTION 'Wake target differs'; END IF;
 SELECT * INTO old_process FROM processes p WHERE p.process_name=p_process_name;
 IF FOUND THEN
  IF old_process.action IS DISTINCT FROM 'OneTimeProcess' OR old_process.run_data IS DISTINCT FROM p_run_data THEN RAISE EXCEPTION 'Request identity payload conflict'; END IF;
  RETURN QUERY SELECT * FROM "Process_GetByProcessIDSessionWake_Sp"(old_process.process_id); RETURN;
 END IF;
 IF (p_expected_process_id IS NULL AND pointer IS NOT NULL) OR (p_expected_process_id IS NOT NULL AND pointer IS DISTINCT FROM p_expected_process_id) THEN RAISE EXCEPTION 'Wake changed or is in progress'; END IF;
 IF p_expected_process_id IS NOT NULL THEN
  UPDATE processes p SET one_time_state='Superseded',last_updated=timezone('utc',clock_timestamp()) WHERE p.process_id=p_expected_process_id AND p.action='OneTimeProcess' AND p.one_time_state IN('Pending','NeedsAttention') AND (CASE WHEN p.action='OneTimeProcess' THEN p.run_data::jsonb END)->>'SessionKey'=target_key;
  GET DIAGNOSTICS affected=ROW_COUNT; IF affected<>1 THEN RAISE EXCEPTION 'Wake changed or is in progress'; END IF;
 END IF;
 INSERT INTO processes(process_name,action,run_data,due_at_utc,one_time_state,is_running,is_enabled,is_timed_out,date_created,last_updated) VALUES(p_process_name,'OneTimeProcess',p_run_data,timezone('utc',p_due_at_utc),'Pending',false,true,false,timezone('utc',clock_timestamp()),timezone('utc',clock_timestamp())) RETURNING process_id INTO new_id;
 UPDATE sessions SET pending_wake_process_id=new_id WHERE session_id=p_session_id AND pending_wake_process_id IS NOT DISTINCT FROM p_expected_process_id;
 GET DIAGNOSTICS affected=ROW_COUNT; IF affected<>1 THEN RAISE EXCEPTION 'Wake changed or is in progress'; END IF;
 RETURN QUERY SELECT * FROM "Process_GetByProcessIDSessionWake_Sp"(new_id);
EXCEPTION WHEN unique_violation THEN
 SELECT * INTO old_process FROM processes p WHERE p.process_name=p_process_name;
 IF NOT FOUND OR old_process.action IS DISTINCT FROM 'OneTimeProcess' OR old_process.run_data IS DISTINCT FROM p_run_data THEN RAISE EXCEPTION 'Request identity payload conflict'; END IF;
 RETURN QUERY SELECT * FROM "Process_GetByProcessIDSessionWake_Sp"(old_process.process_id);
END $$;
CREATE OR REPLACE FUNCTION "Processes_GetDueSessionWakePage_Sp"(p_num_rows integer,p_now_utc timestamptz,p_after_due_at_utc timestamptz,p_after_process_id integer)
RETURNS TABLE("ExaminedProcessID" integer,"ExaminedDueAtUtc" timestamp,"Exhausted" boolean,"ProcessID" integer,"ProcessName" text,"SessionID" integer,"DueAtUtc" timestamp,"OneTimeState" text,"RunData" text,"DateCreated" timestamp) LANGUAGE plpgsql AS $$
BEGIN
 IF p_num_rows NOT BETWEEN 1 AND 100 OR p_after_process_id<0 OR ((p_after_due_at_utc IS NULL)<>(p_after_process_id=0)) THEN RAISE EXCEPTION 'Invalid due page'; END IF;
 RETURN QUERY WITH same_due AS MATERIALIZED(SELECT p.process_id,p.due_at_utc FROM processes p WHERE p.one_time_state='Pending' AND p.action='OneTimeProcess' AND p_after_due_at_utc IS NOT NULL AND p.due_at_utc=timezone('utc',p_after_due_at_utc) AND p.process_id>p_after_process_id AND p.due_at_utc<=timezone('utc',p_now_utc) ORDER BY p.process_id LIMIT p_num_rows),
 later_due AS MATERIALIZED(SELECT p.process_id,p.due_at_utc FROM processes p WHERE p.one_time_state='Pending' AND p.action='OneTimeProcess' AND p.due_at_utc<=timezone('utc',p_now_utc) AND (p_after_due_at_utc IS NULL OR p.due_at_utc>timezone('utc',p_after_due_at_utc)) ORDER BY p.due_at_utc,p.process_id LIMIT (p_num_rows-(SELECT count(*) FROM same_due))),
 candidates AS MATERIALIZED(SELECT * FROM same_due UNION ALL SELECT * FROM later_due),
 metadata AS (SELECT COALESCE((SELECT c.process_id FROM candidates c ORDER BY c.due_at_utc DESC,c.process_id DESC LIMIT 1),0) last_id,(SELECT c.due_at_utc FROM candidates c ORDER BY c.due_at_utc DESC,c.process_id DESC LIMIT 1) last_due,(SELECT count(*) FROM candidates)<p_num_rows exhausted),
 owners AS (SELECT p.process_id,p.process_name,s.session_id,p.due_at_utc,p.one_time_state::text,p.run_data,p.date_created FROM candidates c JOIN processes p ON p.process_id=c.process_id JOIN sessions s ON s.pending_wake_process_id=c.process_id)
 SELECT m.last_id,m.last_due,m.exhausted,o.* FROM metadata m LEFT JOIN owners o ON true ORDER BY o.due_at_utc,o.process_id;
END $$;
CREATE INDEX IF NOT EXISTS ix_processes_one_time_resolve ON processes(one_time_state,process_id) INCLUDE(action,due_at_utc);
CREATE OR REPLACE FUNCTION "Processes_GetAdmittingSessionWakePage_Sp"(p_num_rows integer,p_after_process_id integer)
RETURNS TABLE("ExaminedProcessID" integer,"ExaminedDueAtUtc" timestamp,"Exhausted" boolean,"ProcessID" integer,"ProcessName" text,"SessionID" integer,"DueAtUtc" timestamp,"OneTimeState" text,"RunData" text,"DateCreated" timestamp) LANGUAGE plpgsql AS $$
BEGIN
 IF p_num_rows NOT BETWEEN 1 AND 100 OR p_after_process_id<0 THEN RAISE EXCEPTION 'Invalid admitting page'; END IF;
 RETURN QUERY WITH candidates AS MATERIALIZED(SELECT p.process_id FROM processes p WHERE p.one_time_state='Admitting' AND p.action='OneTimeProcess' AND p.process_id>p_after_process_id ORDER BY p.process_id LIMIT p_num_rows),
 metadata AS (SELECT COALESCE(max(c.process_id),0) last_id,count(*)<p_num_rows exhausted FROM candidates c),
 owners AS (SELECT p.process_id,p.process_name,s.session_id,p.due_at_utc,p.one_time_state::text,p.run_data,p.date_created FROM candidates c JOIN processes p ON p.process_id=c.process_id JOIN sessions s ON s.pending_wake_process_id=c.process_id)
 SELECT m.last_id,NULL::timestamp,m.exhausted,o.* FROM metadata m LEFT JOIN owners o ON true ORDER BY o.process_id;
END $$;
CREATE OR REPLACE FUNCTION "Process_ClaimSessionWake_Sp"(p_expected_process_id integer,p_now_utc timestamp with time zone)
RETURNS TABLE("Changed" integer) LANGUAGE plpgsql AS $$ DECLARE affected integer;
BEGIN
 UPDATE processes p SET one_time_state='Admitting',last_updated=timezone('utc',clock_timestamp()) WHERE p.process_id=p_expected_process_id AND p.action='OneTimeProcess' AND p.one_time_state='Pending' AND p.due_at_utc<=timezone('utc',p_now_utc) AND EXISTS(SELECT 1 FROM sessions s WHERE s.pending_wake_process_id=p.process_id);
 GET DIAGNOSTICS affected=ROW_COUNT; RETURN QUERY SELECT affected;
END $$;
CREATE OR REPLACE FUNCTION "Process_CancelSessionWake_Sp"(p_session_id integer,p_expected_process_id integer)
RETURNS TABLE("Changed" integer) LANGUAGE plpgsql AS $$ DECLARE affected integer;
BEGIN
 UPDATE processes p SET one_time_state='Cancelled',last_updated=timezone('utc',clock_timestamp()) WHERE p.process_id=p_expected_process_id AND p.action='OneTimeProcess' AND p.one_time_state IN('Pending','NeedsAttention') AND EXISTS(SELECT 1 FROM sessions s WHERE s.session_id=p_session_id AND s.pending_wake_process_id=p.process_id AND s.session_key=(CASE WHEN p.action='OneTimeProcess' THEN p.run_data::jsonb END)->>'SessionKey');
 GET DIAGNOSTICS affected=ROW_COUNT;
 IF affected=1 THEN UPDATE sessions SET pending_wake_process_id=NULL WHERE session_id=p_session_id AND pending_wake_process_id=p_expected_process_id; END IF;
 RETURN QUERY SELECT affected;
END $$;
CREATE OR REPLACE FUNCTION "Process_FinalizeSessionWake_Sp"(p_session_id integer,p_expected_process_id integer,p_outcome text)
RETURNS TABLE("Changed" integer) LANGUAGE plpgsql AS $$ DECLARE affected integer;
BEGIN
 IF p_outcome IS NULL OR p_outcome NOT IN('WakeAccepted','AlreadyAwake','NeedsAttention') THEN RAISE EXCEPTION 'Invalid wake outcome'; END IF;
 IF p_outcome='NeedsAttention' THEN
 UPDATE processes p SET one_time_state=p_outcome,last_updated=timezone('utc',clock_timestamp()) WHERE p.process_id=p_expected_process_id AND p.action='OneTimeProcess' AND p.one_time_state='Admitting' AND EXISTS(SELECT 1 FROM sessions s WHERE s.session_id=p_session_id AND s.pending_wake_process_id=p.process_id);
 GET DIAGNOSTICS affected=ROW_COUNT;
 ELSE
 UPDATE processes p SET one_time_state=p_outcome,last_updated=timezone('utc',clock_timestamp()) WHERE p.process_id=p_expected_process_id AND p.action='OneTimeProcess' AND p.one_time_state='Admitting' AND EXISTS(SELECT 1 FROM sessions s WHERE s.session_id=p_session_id AND s.pending_wake_process_id=p.process_id AND s.session_key=(CASE WHEN p.action='OneTimeProcess' THEN p.run_data::jsonb END)->>'SessionKey');
 GET DIAGNOSTICS affected=ROW_COUNT;
 END IF;
 IF affected=1 AND p_outcome<>'NeedsAttention' THEN UPDATE sessions SET pending_wake_process_id=NULL WHERE session_id=p_session_id AND pending_wake_process_id=p_expected_process_id; END IF;
 RETURN QUERY SELECT affected;
END $$;
CREATE OR REPLACE FUNCTION "Process_GetByProcessName_Sp"(p_process_name text)
RETURNS TABLE("ProcessID" integer,"ProcessName" text,"Url" text,"Action" text,"RunData" text,"IsRunning" boolean,"RunStarted" timestamp,"RunEnded" timestamp,"RunEvery" numeric,"IsEnabled" boolean,"DateCreated" timestamp,"LastUpdated" timestamp,"MaximumRunTime" integer,"IsTimedOut" boolean,"RunEveryType" text,"Data" text) LANGUAGE sql AS $$ SELECT p.process_id,p.process_name,p.url,p.action,p.run_data,p.is_running,p.run_started,p.run_ended,p.run_every,p.is_enabled,p.date_created,p.last_updated,p.maximum_run_time,p.is_timed_out,p.run_every_type,p.data FROM processes p WHERE p.process_name=p_process_name; $$;
CREATE OR REPLACE FUNCTION "Processes_GetInterval_Sp"(p_num_rows integer)
RETURNS TABLE("ProcessID" integer,"ProcessName" text,"Url" text,"Action" text,"RunData" text,"IsRunning" boolean,"RunStarted" timestamp,"RunEnded" timestamp,"RunEvery" numeric,"IsEnabled" boolean,"DateCreated" timestamp,"LastUpdated" timestamp,"MaximumRunTime" integer,"IsTimedOut" boolean,"RunEveryType" text,"Data" text) LANGUAGE plpgsql AS $$
BEGIN IF p_num_rows NOT BETWEEN 1 AND 1000 THEN RAISE EXCEPTION 'Invalid process bound'; END IF;
 RETURN QUERY SELECT p.process_id,p.process_name,p.url,p.action,p.run_data,p.is_running,p.run_started,p.run_ended,p.run_every,p.is_enabled,p.date_created,p.last_updated,p.maximum_run_time,p.is_timed_out,p.run_every_type,p.data FROM processes p WHERE p.one_time_state IS NULL AND p.due_at_utc IS NULL AND p.action IS DISTINCT FROM 'OneTimeProcess' ORDER BY p.process_id LIMIT p_num_rows; END $$;
CREATE OR REPLACE FUNCTION "Sessions_GetSidebarMetadataWithWake_Sp"(p_session_i_ds_json text)
RETURNS TABLE("SessionID" integer,"SidebarProfileJson" text,"UserStateJson" text,"PendingWakeProcessID" integer,"PendingWakeAtUtc" timestamp,"PendingWakeState" text) LANGUAGE plpgsql AS $$ DECLARE ids jsonb:=p_session_i_ds_json::jsonb;
BEGIN
 IF ids IS NULL OR jsonb_typeof(ids)<>'array' OR jsonb_array_length(ids)>5000 THEN RAISE EXCEPTION 'Invalid sidebar cohort'; END IF;
 RETURN QUERY SELECT s.session_id,(s.data::jsonb->'SidebarProfile')::text,(s.data::jsonb->'UserState')::text,s.pending_wake_process_id,p.due_at_utc,p.one_time_state::text FROM sessions s LEFT JOIN processes p ON p.process_id=s.pending_wake_process_id WHERE EXISTS(SELECT 1 FROM jsonb_array_elements_text(ids) i(value) WHERE s.session_id=i.value::integer);
END $$;
CREATE OR REPLACE FUNCTION "Sessions_GetSidebarActivityWithWake_Sp"(p_session_keys_json text)
RETURNS TABLE("SessionID" integer,"SessionKey" text,"SessionName" text,"AgentName" text,"SessionKind" text,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,"PendingWakeProcessID" integer,"PendingWakeAtUtc" timestamp,"PendingWakeState" text) LANGUAGE plpgsql AS $$
DECLARE keys jsonb:=p_session_keys_json::jsonb;
BEGIN
 IF keys IS NULL OR jsonb_typeof(keys)<>'array' OR jsonb_array_length(keys)>5000 THEN RAISE EXCEPTION 'Invalid sidebar cohort'; END IF;
 RETURN QUERY WITH requested AS (
 SELECT i.ordinality,s.session_id,s.session_key,s.parent_session_id,s.session_name,s.agent_name,s.session_kind,s.last_updated,s.pending_wake_process_id
 FROM jsonb_array_elements_text(keys) WITH ORDINALITY i(value,ordinality) JOIN sessions s ON s.session_key=i.value WHERE NOT s.is_archived
 ), root_activity AS (
 SELECT r.session_id,CASE WHEN max(c.last_updated)>r.last_updated THEN max(c.last_updated) ELSE r.last_updated END AS effective_last_updated
 FROM requested r LEFT JOIN sessions c ON c.parent_session_id=r.session_id AND NOT c.is_archived WHERE r.parent_session_id IS NULL GROUP BY r.session_id,r.last_updated
 )
 SELECT r.session_id,r.session_key,r.session_name,r.agent_name,r.session_kind,r.last_updated,
 CASE WHEN r.parent_session_id IS NULL THEN a.effective_last_updated ELSE r.last_updated END,
 r.pending_wake_process_id,p.due_at_utc,p.one_time_state::text
 FROM requested r LEFT JOIN root_activity a ON a.session_id=r.session_id LEFT JOIN processes p ON p.process_id=r.pending_wake_process_id ORDER BY r.ordinality;
END $$;
