CREATE OR REPLACE FUNCTION insert_session_sp(p_session_key text,p_agent_name text,p_project_name text,p_project_file_path text,p_provider text,p_model_name text,p_reasoning_level text,p_prompt_context text,p_data text,p_session_name text,p_parent_session_id integer,p_is_archived boolean,p_state text,p_session_kind text,p_transport text)
RETURNS TABLE ("SessionID" integer) LANGUAGE plpgsql AS $$ BEGIN IF p_state IS NULL OR p_state NOT IN('Unknown','Unloaded','Loaded','Stopped','Completed','Errored') OR p_session_kind IS NULL OR NULLIF(p_transport,'') IS NULL OR p_session_name IS NULL THEN RAISE EXCEPTION 'Explicit nonrunning session classification required'; END IF; RETURN QUERY INSERT INTO sessions(session_key,agent_name,project_name,project_file_path,provider,model_name,reasoning_level,prompt_context,date_created,last_updated,data,session_name,parent_session_id,is_archived,state,session_kind,transport,needs_attention) VALUES(p_session_key,p_agent_name,p_project_name,p_project_file_path,p_provider,p_model_name,p_reasoning_level,p_prompt_context,now(),now(),p_data,p_session_name,p_parent_session_id,p_is_archived,p_state,p_session_kind,p_transport,false) RETURNING sessions.session_id; END $$;

CREATE OR REPLACE FUNCTION update_session_sp(p_session_id integer,p_session_key text,p_agent_name text,p_project_name text,p_project_file_path text,p_provider text,p_model_name text,p_reasoning_level text,p_prompt_context text,p_data text,p_session_name text,p_parent_session_id integer,p_is_archived boolean) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET session_key=p_session_key,agent_name=p_agent_name,project_name=p_project_name,project_file_path=p_project_file_path,provider=p_provider,model_name=p_model_name,reasoning_level=p_reasoning_level,prompt_context=p_prompt_context,last_updated=now(),data=p_data,session_name=p_session_name,parent_session_id=p_parent_session_id,is_archived=p_is_archived WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION remove_session_sp(p_session_id integer) RETURNS void LANGUAGE sql AS $$ DELETE FROM sessions WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION copy_session_sp(p_session_id integer) RETURNS TABLE ("SessionID" integer) LANGUAGE sql AS $$ INSERT INTO sessions(session_key,agent_name,project_name,project_file_path,provider,model_name,reasoning_level,prompt_context,date_created,last_updated,data,session_name,parent_session_id,is_archived,state,session_kind,transport,needs_attention) SELECT session_key || ' - Copy',agent_name,project_name,project_file_path,provider,model_name,reasoning_level,prompt_context,now(),now(),data,session_name,parent_session_id,is_archived,'Unloaded',session_kind,transport,false FROM sessions WHERE session_id=p_session_id RETURNING session_id; $$;

CREATE OR REPLACE FUNCTION get_session_rows() RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$ SELECT session_id,session_key,agent_name,project_name,project_file_path,provider,model_name,reasoning_level,prompt_context,date_created,last_updated,data,session_name,parent_session_id,is_archived,compaction_provider,state,session_kind,transport,active_turn_key,current_turn_started_utc,last_run_pulse_utc,last_non_running_utc,evaluate_admission_token,needs_attention FROM sessions; $$;

CREATE OR REPLACE FUNCTION get_session_sp(p_session_id integer) RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$ SELECT * FROM get_session_rows() WHERE "SessionID"=p_session_id; $$;

CREATE OR REPLACE FUNCTION get_session_by_session_key_sp(p_session_key text) RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$ SELECT * FROM get_session_rows() WHERE "SessionKey"=p_session_key; $$;

CREATE OR REPLACE FUNCTION get_sessions_sp() RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$ SELECT * FROM get_session_rows(); $$;

CREATE OR REPLACE FUNCTION get_sessions_by_parent_session_id_sp(p_parent_session_id integer) RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$ SELECT * FROM get_session_rows() WHERE ((p_parent_session_id IS NULL AND "ParentSessionID" IS NULL) OR "ParentSessionID"=p_parent_session_id); $$;

CREATE OR REPLACE FUNCTION get_sessions_sp_count_sp(p_search text) RETURNS TABLE ("Total" integer) LANGUAGE sql AS $$ SELECT COUNT(*)::integer FROM sessions WHERE session_id::text LIKE '%'||COALESCE(p_search,'')||'%' OR session_key LIKE '%'||COALESCE(p_search,'')||'%' OR agent_name LIKE '%'||COALESCE(p_search,'')||'%' OR project_name LIKE '%'||COALESCE(p_search,'')||'%' OR provider LIKE '%'||COALESCE(p_search,'')||'%' OR model_name LIKE '%'||COALESCE(p_search,'')||'%' OR session_name LIKE '%'||COALESCE(p_search,'')||'%'; $$;

CREATE OR REPLACE FUNCTION get_sessions_sp_paging_sp(p_search text,p_sort_column text,p_sort_ascending boolean,p_skip_rows integer,p_num_rows integer) RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$ SELECT * FROM get_session_rows() WHERE "SessionKey" LIKE '%'||COALESCE(p_search,'')||'%' OR "AgentName" LIKE '%'||COALESCE(p_search,'')||'%' OR "SessionName" LIKE '%'||COALESCE(p_search,'')||'%' ORDER BY CASE WHEN p_sort_column='SessionID' AND p_sort_ascending THEN "SessionID" END ASC, CASE WHEN p_sort_column='SessionID' AND NOT p_sort_ascending THEN "SessionID" END DESC, CASE WHEN p_sort_column='SessionKey' AND p_sort_ascending THEN "SessionKey" END ASC, CASE WHEN p_sort_column='SessionKey' AND NOT p_sort_ascending THEN "SessionKey" END DESC OFFSET p_skip_rows LIMIT p_num_rows; $$;

CREATE OR REPLACE FUNCTION mark_session_as_archived_sp(p_session_id integer) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET is_archived=true,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION mark_session_as_not_archived_sp(p_session_id integer) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET is_archived=false,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION update_session_data_sp(p_session_id integer,p_data text) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET data=p_data,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION try_update_session_data_sp(p_session_id integer,p_expected_data text,p_data text) RETURNS TABLE ("UpdatedRows" integer) LANGUAGE sql AS $$ WITH updated AS (UPDATE sessions SET data=p_data,last_updated=now() WHERE session_id=p_session_id AND data IS NOT DISTINCT FROM p_expected_data RETURNING 1) SELECT COUNT(*)::integer AS "UpdatedRows" FROM updated; $$;

CREATE OR REPLACE FUNCTION update_session_name_sp(p_session_id integer,p_session_name text) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET session_name=p_session_name,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION update_session_parent_session_id_sp(p_session_id integer,p_parent_session_id integer) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET parent_session_id=p_parent_session_id,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION update_session_provider_selection_sp(p_session_id integer,p_provider text,p_model_name text,p_reasoning_level text,p_transport text) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET provider=p_provider,model_name=p_model_name,reasoning_level=p_reasoning_level,transport=p_transport,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION update_session_prompt_context_sp(p_session_id integer,p_prompt_context text) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET prompt_context=p_prompt_context,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION update_session_compaction_provider_sp(p_session_id integer,p_compaction_provider text) RETURNS void LANGUAGE sql AS $$ UPDATE sessions SET compaction_provider=p_compaction_provider,last_updated=now() WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION session_matches_search(p_session sessions,p_search text)
RETURNS boolean LANGUAGE sql AS $$
	SELECT COALESCE(p_search,'') = ''
		OR p_session.session_id::text ILIKE '%' || COALESCE(p_search,'') || '%'
		OR p_session.session_key ILIKE '%' || COALESCE(p_search,'') || '%'
		OR p_session.agent_name ILIKE '%' || COALESCE(p_search,'') || '%'
		OR COALESCE(p_session.project_name,'') ILIKE '%' || COALESCE(p_search,'') || '%'
		OR COALESCE(p_session.project_file_path,'') ILIKE '%' || COALESCE(p_search,'') || '%'
		OR p_session.provider ILIKE '%' || COALESCE(p_search,'') || '%'
		OR p_session.model_name ILIKE '%' || COALESCE(p_search,'') || '%'
		OR COALESCE(p_session.reasoning_level,'') ILIKE '%' || COALESCE(p_search,'') || '%'
		OR COALESCE(p_session.session_name,'') ILIKE '%' || COALESCE(p_search,'') || '%';
$$;

CREATE OR REPLACE FUNCTION sessions_get_effective_last_updated(p_session_id integer,p_archived boolean)
RETURNS timestamp LANGUAGE sql AS $$
	SELECT GREATEST(p.last_updated, COALESCE(MAX(c.last_updated), p.last_updated))
	FROM sessions p
	LEFT JOIN sessions c ON c.parent_session_id = p.session_id AND c.is_archived = p_archived
	WHERE p.session_id = p_session_id
	GROUP BY p.last_updated;
$$;

CREATE OR REPLACE FUNCTION sessions_get_all_sp()
RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$
	SELECT * FROM get_session_rows() WHERE "IsArchived" = false;
$$;

CREATE OR REPLACE FUNCTION sessions_get_all_sp_count_sp(p_search text)
RETURNS TABLE ("Total" integer) LANGUAGE sql AS $$
	SELECT COUNT(*)::integer FROM sessions s WHERE s.is_archived = false AND session_matches_search(s, p_search);
$$;

CREATE OR REPLACE FUNCTION sessions_get_all_sp_paging_sp(p_search text,p_sort_column text,p_sort_ascending boolean,p_skip_rows integer,p_num_rows integer)
RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$
	SELECT s.session_id,s.session_key,s.agent_name,s.project_name,s.project_file_path,s.provider,s.model_name,s.reasoning_level,s.prompt_context,s.date_created,sessions_get_effective_last_updated(s.session_id,false),s.data,s.session_name,s.parent_session_id,s.is_archived,s.compaction_provider,state,session_kind,transport,active_turn_key,current_turn_started_utc,last_run_pulse_utc,last_non_running_utc,evaluate_admission_token,needs_attention
	FROM sessions s
	WHERE s.is_archived = false AND session_matches_search(s, p_search)
	ORDER BY
		CASE WHEN p_sort_column='LastUpdated' AND p_sort_ascending THEN sessions_get_effective_last_updated(s.session_id,false) END ASC,
		CASE WHEN p_sort_column='LastUpdated' AND NOT p_sort_ascending THEN sessions_get_effective_last_updated(s.session_id,false) END DESC,
		CASE WHEN p_sort_column='SessionID' AND p_sort_ascending THEN s.session_id END ASC,
		CASE WHEN p_sort_column='SessionID' AND NOT p_sort_ascending THEN s.session_id END DESC,
		CASE WHEN p_sort_column='SessionKey' AND p_sort_ascending THEN s.session_key END ASC,
		CASE WHEN p_sort_column='SessionKey' AND NOT p_sort_ascending THEN s.session_key END DESC,
		sessions_get_effective_last_updated(s.session_id,false) DESC,
		s.session_id DESC
	OFFSET p_skip_rows LIMIT p_num_rows;
$$;

CREATE OR REPLACE FUNCTION sessions_get_archived_sp_sp()
RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$
	SELECT * FROM get_session_rows() WHERE "IsArchived" = true;
$$;

CREATE OR REPLACE FUNCTION sessions_get_archived_sp_sp_count_sp(p_search text)
RETURNS TABLE ("Total" integer) LANGUAGE sql AS $$
	SELECT COUNT(*)::integer FROM sessions s WHERE s.is_archived = true AND session_matches_search(s, p_search);
$$;

CREATE OR REPLACE FUNCTION sessions_get_archived_sp_sp_paging_sp(p_search text,p_sort_column text,p_sort_ascending boolean,p_skip_rows integer,p_num_rows integer)
RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$
	SELECT s.session_id,s.session_key,s.agent_name,s.project_name,s.project_file_path,s.provider,s.model_name,s.reasoning_level,s.prompt_context,s.date_created,sessions_get_effective_last_updated(s.session_id,true),s.data,s.session_name,s.parent_session_id,s.is_archived,s.compaction_provider,state,session_kind,transport,active_turn_key,current_turn_started_utc,last_run_pulse_utc,last_non_running_utc,evaluate_admission_token,needs_attention
	FROM sessions s
	WHERE s.is_archived = true AND session_matches_search(s, p_search)
	ORDER BY
		CASE WHEN p_sort_column='LastUpdated' AND p_sort_ascending THEN sessions_get_effective_last_updated(s.session_id,true) END ASC,
		CASE WHEN p_sort_column='LastUpdated' AND NOT p_sort_ascending THEN sessions_get_effective_last_updated(s.session_id,true) END DESC,
		CASE WHEN p_sort_column='SessionID' AND p_sort_ascending THEN s.session_id END ASC,
		CASE WHEN p_sort_column='SessionID' AND NOT p_sort_ascending THEN s.session_id END DESC,
		CASE WHEN p_sort_column='SessionKey' AND p_sort_ascending THEN s.session_key END ASC,
		CASE WHEN p_sort_column='SessionKey' AND NOT p_sort_ascending THEN s.session_key END DESC,
		sessions_get_effective_last_updated(s.session_id,true) DESC,
		s.session_id DESC
	OFFSET p_skip_rows LIMIT p_num_rows;
$$;

CREATE OR REPLACE FUNCTION get_sessions_by_parent_session_idsp_count_sp(p_parent_session_id integer,p_search text)
RETURNS TABLE ("Total" integer) LANGUAGE sql AS $$
	SELECT COUNT(*)::integer FROM sessions s WHERE s.parent_session_id = p_parent_session_id AND session_matches_search(s, p_search);
$$;

CREATE OR REPLACE FUNCTION get_sessions_by_parent_session_idsp_paging_sp(p_parent_session_id integer,p_search text,p_sort_column text,p_sort_ascending boolean,p_skip_rows integer,p_num_rows integer)
RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE sql AS $$
	SELECT * FROM get_session_rows() r
	WHERE r."ParentSessionID" = p_parent_session_id AND EXISTS (SELECT 1 FROM sessions s WHERE s.session_id = r."SessionID" AND session_matches_search(s, p_search))
	ORDER BY
		CASE WHEN p_sort_column='SessionID' AND p_sort_ascending THEN r."SessionID" END ASC,
		CASE WHEN p_sort_column='SessionID' AND NOT p_sort_ascending THEN r."SessionID" END DESC,
		CASE WHEN p_sort_column='SessionKey' AND p_sort_ascending THEN r."SessionKey" END ASC,
		CASE WHEN p_sort_column='SessionKey' AND NOT p_sort_ascending THEN r."SessionKey" END DESC,
		r."SessionID" DESC
	OFFSET p_skip_rows LIMIT p_num_rows;
$$;

CREATE OR REPLACE FUNCTION cleanup_test_sessions_archive_sp(p_preview_only boolean DEFAULT true)
RETURNS TABLE ("MatchReason" text,"SessionCount" integer) LANGUAGE plpgsql AS $$
BEGIN
	CREATE TEMP TABLE cleanup_test_session_candidates ON COMMIT DROP AS
	SELECT s.session_id,
		CASE
			WHEN s.session_key ~ '^[0-9a-f]{32}$' THEN 'guid_like'
			WHEN s.session_key ~ '^[0-9a-f]{32}-level-two$' THEN 'guid_level_two'
			WHEN COALESCE(s.session_name,'') ~ '^CorePath Renamed [0-9a-f]{6,12}$' THEN 'corepath_renamed_random'
			ELSE NULL
		END AS match_reason
	FROM sessions s
	WHERE s.is_archived = false;

	DELETE FROM cleanup_test_session_candidates WHERE match_reason IS NULL;

	IF p_preview_only = false THEN
		UPDATE sessions s SET is_archived = true,last_updated = now()
		FROM cleanup_test_session_candidates c
		WHERE c.session_id = s.session_id;
	END IF;

	RETURN QUERY SELECT c.match_reason, COUNT(*)::integer FROM cleanup_test_session_candidates c GROUP BY c.match_reason ORDER BY c.match_reason;
END;
$$;

CREATE OR REPLACE FUNCTION get_message_rows()
RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean)
LANGUAGE sql AS $$
	SELECT message_id,session_id,sequence_number,role,content,tool_name,tool_arguments,call_id,date_created,last_updated,data,is_compacted,compaction_epoch,message_key,turn_id,compaction_epoch_key,turn_row_id,message_kind,terminal_outcome_state,saved_work_resume
	FROM messages;
$$;

CREATE OR REPLACE FUNCTION insert_message_sp(p_session_id integer,p_sequence_number integer,p_role text,p_content text,p_tool_name text,p_tool_arguments text,p_call_id text,p_data text,p_is_compacted boolean,p_compaction_epoch integer,p_message_key text,p_turn_id text,p_compaction_epoch_key text,p_message_kind text,p_terminal_outcome_state text,p_saved_work_resume boolean,p_date_created timestamp DEFAULT NULL)
RETURNS TABLE("MessageID" integer) LANGUAGE plpgsql AS $$
DECLARE resolved_turn_id bigint; inserted_message_id integer; occurred_at timestamp:=COALESCE(p_date_created,timezone('utc',clock_timestamp()));
BEGIN
	IF NULLIF(p_turn_id,'') IS NOT NULL THEN
		SELECT turn_id INTO resolved_turn_id FROM turns WHERE session_id=p_session_id AND turn_key=p_turn_id;
		IF resolved_turn_id IS NULL THEN
			INSERT INTO turns(session_id,turn_key,display_order_at_utc) VALUES(p_session_id,p_turn_id,occurred_at) ON CONFLICT(session_id,turn_key) DO NOTHING RETURNING turn_id INTO resolved_turn_id;
			IF resolved_turn_id IS NULL THEN SELECT turn_id INTO STRICT resolved_turn_id FROM turns WHERE session_id=p_session_id AND turn_key=p_turn_id; END IF;
		END IF;
	END IF;
	INSERT INTO messages(session_id,sequence_number,role,content,tool_name,tool_arguments,call_id,date_created,last_updated,data,is_compacted,compaction_epoch,message_key,turn_id,turn_row_id,compaction_epoch_key,message_kind,terminal_outcome_state,saved_work_resume)
	VALUES(p_session_id,p_sequence_number,p_role,p_content,p_tool_name,p_tool_arguments,p_call_id,occurred_at,timezone('utc',clock_timestamp()),p_data,p_is_compacted,p_compaction_epoch,p_message_key,p_turn_id,resolved_turn_id,p_compaction_epoch_key,p_message_kind,p_terminal_outcome_state,p_saved_work_resume) RETURNING message_id INTO inserted_message_id;
	IF resolved_turn_id IS NOT NULL THEN
		UPDATE turns t SET
			first_message_id=CASE WHEN t.first_message_id IS NULL OR(occurred_at,inserted_message_id)<((SELECT m.date_created FROM messages m WHERE m.message_id=t.first_message_id),t.first_message_id)THEN inserted_message_id ELSE t.first_message_id END,
			user_message_id=CASE WHEN p_role='User' AND(t.user_message_id IS NULL OR(occurred_at,inserted_message_id)<((SELECT m.date_created FROM messages m WHERE m.message_id=t.user_message_id),t.user_message_id))THEN inserted_message_id ELSE t.user_message_id END,
			assistant_message_id=CASE WHEN p_role='Assistant' AND(t.assistant_message_id IS NULL OR(occurred_at,inserted_message_id)>((SELECT m.date_created FROM messages m WHERE m.message_id=t.assistant_message_id),t.assistant_message_id))THEN inserted_message_id ELSE t.assistant_message_id END,
			last_error_message_id=CASE WHEN p_role='Lifecycle' AND (p_message_kind='Error' OR p_terminal_outcome_state='Failed') AND(t.last_error_message_id IS NULL OR(occurred_at,inserted_message_id)>((SELECT m.date_created FROM messages m WHERE m.message_id=t.last_error_message_id),t.last_error_message_id))THEN inserted_message_id ELSE t.last_error_message_id END,
			terminal_message_id=CASE WHEN p_role='Lifecycle' AND p_terminal_outcome_state IN('Completed','Failed','Cancelled') AND(t.terminal_message_id IS NULL OR(occurred_at,inserted_message_id)>((SELECT m.date_created FROM messages m WHERE m.message_id=t.terminal_message_id),t.terminal_message_id))THEN inserted_message_id ELSE t.terminal_message_id END,
			display_order_at_utc=CASE WHEN p_role='User' AND(t.user_message_id IS NULL OR(occurred_at,inserted_message_id)<((SELECT m.date_created FROM messages m WHERE m.message_id=t.user_message_id),t.user_message_id))THEN occurred_at WHEN p_role<>'User' AND t.user_message_id IS NULL AND(t.first_message_id IS NULL OR(occurred_at,inserted_message_id)<((SELECT m.date_created FROM messages m WHERE m.message_id=t.first_message_id),t.first_message_id))THEN occurred_at ELSE t.display_order_at_utc END
		WHERE t.turn_id=resolved_turn_id;
	END IF;
	RETURN QUERY SELECT inserted_message_id;
END $$;

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

CREATE OR REPLACE FUNCTION remove_message_sp(p_message_id integer) RETURNS void LANGUAGE sql AS $$ DELETE FROM messages WHERE message_id=p_message_id $$;

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

CREATE OR REPLACE FUNCTION update_message_tool_arguments_sp(p_message_id integer,p_tool_arguments text) RETURNS void LANGUAGE sql AS $$ UPDATE messages SET tool_arguments=p_tool_arguments,last_updated=timezone('utc',clock_timestamp()) WHERE message_id=p_message_id $$;

CREATE OR REPLACE FUNCTION update_message_data_sp(p_message_id integer,p_data text) RETURNS void LANGUAGE sql AS $$ UPDATE messages SET data=p_data,last_updated=timezone('utc',clock_timestamp()) WHERE message_id=p_message_id $$;

CREATE OR REPLACE FUNCTION mark_message_as_compacted_sp(p_message_id integer) RETURNS void LANGUAGE sql AS $$ UPDATE messages SET is_compacted=true,last_updated=timezone('utc',clock_timestamp()) WHERE message_id=p_message_id $$;

CREATE OR REPLACE FUNCTION mark_message_as_not_compacted_sp(p_message_id integer) RETURNS void LANGUAGE sql AS $$ UPDATE messages SET is_compacted=false,last_updated=timezone('utc',clock_timestamp()) WHERE message_id=p_message_id $$;

CREATE OR REPLACE FUNCTION get_message_sp(p_message_id integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "MessageID"=p_message_id; $$;

CREATE OR REPLACE FUNCTION get_messages_sp() RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() ORDER BY "MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION get_messages_by_session_id_sp(p_session_id integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "SessionID"=p_session_id ORDER BY "SequenceNumber" ASC,"MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION get_messages_by_message_key_sp(p_message_key text) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "MessageKey"=p_message_key ORDER BY "MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION get_message_by_message_key_sp(p_message_key text) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "MessageKey"=p_message_key ORDER BY "MessageID" ASC LIMIT 1; $$;

CREATE OR REPLACE FUNCTION get_messages_by_compaction_epoch_key_sp(p_compaction_epoch_key text) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "CompactionEpochKey"=p_compaction_epoch_key ORDER BY "MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION get_messages_by_compaction_epoch_key_session_id_sp(p_compaction_epoch_key text,p_session_id integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM message_rows WHERE "SessionID"=p_session_id AND ((p_compaction_epoch_key IS NULL AND "CompactionEpochKey" IS NULL) OR "CompactionEpochKey"=p_compaction_epoch_key) ORDER BY "MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION get_messages_by_turn_id_sp(p_turn_id text) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "TurnID"=p_turn_id ORDER BY "SequenceNumber" ASC,"MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION messages_get_by_message_search_sp(p_search text,p_max_rows integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "Role"='user' AND "Content" ILIKE '%'||COALESCE(p_search,'')||'%' ORDER BY "MessageID" DESC LIMIT p_max_rows; $$;

CREATE OR REPLACE FUNCTION messages_get_by_final_assistant_search_sp(p_search text,p_max_rows integer DEFAULT 25,p_search_scope text DEFAULT 'recent',p_max_message_scan_count integer DEFAULT 2500)
RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE plpgsql AS $$
BEGIN
 IF p_search IS NULL OR btrim(p_search)='' THEN RAISE EXCEPTION 'Search required'; END IF;
 IF p_max_rows IS NULL OR p_max_rows<1 OR p_max_rows>200 THEN RAISE EXCEPTION 'MaxRows must be 1..200'; END IF;
 IF p_search_scope IS NULL OR btrim(p_search_scope)='' THEN p_search_scope:='recent'; END IF;
 p_search_scope:=lower(btrim(p_search_scope));
 IF p_search_scope NOT IN('recent','deep','all') THEN RAISE EXCEPTION 'Invalid SearchScope'; END IF;
 IF p_search_scope='recent' THEN
  IF p_max_message_scan_count IS NULL OR p_max_message_scan_count<=0 THEN p_max_message_scan_count:=2500; END IF;
  IF p_max_message_scan_count>25000 THEN RAISE EXCEPTION 'Recent scan bound exceeded'; END IF;
 ELSIF p_search_scope='deep' THEN
  IF p_max_message_scan_count IS NULL OR p_max_message_scan_count<=0 THEN p_max_message_scan_count:=1000000; END IF;
  IF p_max_message_scan_count>2000000 THEN RAISE EXCEPTION 'Deep scan bound exceeded'; END IF;
 END IF;
 IF p_search_scope='all' THEN
  RETURN QUERY SELECT m.* FROM get_message_rows() m JOIN sessions s ON s.session_id=m."SessionID" WHERE m."Role"='Assistant' AND m."MessageKind"='final_answer' AND m."Content" ILIKE '%'||p_search||'%' AND s.session_key NOT ILIKE '%level-two%' ORDER BY m."MessageID" DESC LIMIT p_max_rows;
 ELSE
  RETURN QUERY WITH candidates AS MATERIALIZED(SELECT message_id FROM messages WHERE role='Assistant' ORDER BY message_id DESC LIMIT p_max_message_scan_count)
  SELECT m.* FROM candidates c JOIN get_message_rows() m ON m."MessageID"=c.message_id JOIN sessions s ON s.session_id=m."SessionID" WHERE m."MessageKind"='final_answer' AND m."Content" ILIKE '%'||p_search||'%' AND s.session_key NOT ILIKE '%level-two%' ORDER BY m."MessageID" DESC LIMIT p_max_rows;
 END IF;
END $$;

CREATE OR REPLACE FUNCTION get_messages_since_by_session_idand_message_key_sp(p_session_id integer,p_message_key text,p_num_rows integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "SessionID"=p_session_id AND "MessageID" > (SELECT message_id FROM messages WHERE session_id=p_session_id AND message_key=p_message_key LIMIT 1) ORDER BY "MessageID" ASC LIMIT p_num_rows; $$;

CREATE OR REPLACE FUNCTION messages_get_turn_deltas_since_by_session_idand_message_key_sp(p_session_id integer,p_message_key text,p_num_rows integer) RETURNS TABLE ("MessageKey" text,"TurnID" text) LANGUAGE sql AS $$ SELECT message_key, COALESCE(turn_id, '') FROM messages WHERE session_id=p_session_id AND message_id > (SELECT message_id FROM messages WHERE session_id=p_session_id AND message_key=p_message_key LIMIT 1) ORDER BY message_id ASC LIMIT p_num_rows; $$;

CREATE OR REPLACE FUNCTION get_messages_before_by_session_idand_message_key_sp(p_session_id integer,p_message_key text,p_num_rows integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM (SELECT * FROM get_message_rows() WHERE "SessionID"=p_session_id AND "MessageID" < (SELECT message_id FROM messages WHERE session_id=p_session_id AND message_key=p_message_key LIMIT 1) ORDER BY "MessageID" DESC LIMIT p_num_rows) rows ORDER BY "MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION get_all_epochs_by_session_id_sp(p_session_id integer) RETURNS TABLE ("CompactionEpochKey" text) LANGUAGE sql AS $$ SELECT DISTINCT compaction_epoch_key FROM messages WHERE session_id=p_session_id AND compaction_epoch_key IS NOT NULL ORDER BY compaction_epoch_key; $$;

CREATE OR REPLACE FUNCTION messages_get_count_by_session_id_sp(p_session_id integer) RETURNS TABLE ("Total" integer) LANGUAGE sql AS $$ SELECT COUNT(*)::integer FROM messages WHERE session_id=p_session_id; $$;

CREATE OR REPLACE FUNCTION messages_get_by_session_id_sp(p_session_id integer,p_skip_rows integer,p_num_rows integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM message_rows WHERE "SessionID"=p_session_id ORDER BY "MessageID" DESC OFFSET p_skip_rows LIMIT p_num_rows; $$;

CREATE OR REPLACE FUNCTION messages_get_by_session_idturn_key_sp(p_session_id integer,p_turn_key text) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "SessionID"=p_session_id AND "TurnID"=p_turn_key ORDER BY "SequenceNumber" ASC,"MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION messages_get_by_message_ids_sp(p_message_i_ds_csv text) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT r.* FROM message_rows r JOIN regexp_split_to_table(COALESCE(p_message_i_ds_csv,''), ',') ids(id_text) ON r."MessageID"=NULLIF(trim(ids.id_text),'')::integer ORDER BY r."MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION messages_get_lifecycle_by_session_idturn_keys_sp(p_session_id integer, p_turn_keys_csv text) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT r.* FROM message_rows r JOIN regexp_split_to_table(COALESCE(p_turn_keys_csv,''), ',') keys(turn_key) ON r."TurnID"=trim(keys.turn_key) WHERE r."SessionID"=p_session_id AND r."Role"='Lifecycle' ORDER BY r."DateCreated" ASC, r."MessageID" ASC; $$;

CREATE OR REPLACE FUNCTION messages_get_latest_message_key_by_session_id_sp(p_session_id integer) RETURNS TABLE ("MessageKey" text) LANGUAGE sql AS $$ SELECT message_key FROM messages WHERE session_id=p_session_id ORDER BY message_id DESC LIMIT 1; $$;

CREATE OR REPLACE FUNCTION get_messages_by_session_idsp_count_sp(p_session_id integer,p_search text) RETURNS TABLE ("Total" integer) LANGUAGE sql AS $$ SELECT COUNT(*)::integer FROM get_message_rows() WHERE "SessionID"=p_session_id AND ("MessageKey" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Role" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Content" ILIKE '%'||COALESCE(p_search,'')||'%'); $$;

CREATE OR REPLACE FUNCTION get_messages_sp_count_sp(p_search text) RETURNS TABLE ("Total" integer) LANGUAGE sql AS $$ SELECT COUNT(*)::integer FROM get_message_rows() WHERE "MessageKey" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Role" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Content" ILIKE '%'||COALESCE(p_search,'')||'%'; $$;

CREATE OR REPLACE FUNCTION get_messages_by_session_idsp_paging_sp(p_session_id integer,p_search text,p_sort_column text,p_sort_ascending boolean,p_skip_rows integer,p_num_rows integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "SessionID"=p_session_id AND ("MessageKey" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Role" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Content" ILIKE '%'||COALESCE(p_search,'')||'%') ORDER BY CASE WHEN p_sort_column='MessageID' AND p_sort_ascending THEN "MessageID" END ASC, CASE WHEN p_sort_column='MessageID' AND NOT p_sort_ascending THEN "MessageID" END DESC, "MessageID" ASC OFFSET p_skip_rows LIMIT p_num_rows; $$;

CREATE OR REPLACE FUNCTION get_messages_sp_paging_sp(p_search text,p_sort_column text,p_sort_ascending boolean,p_skip_rows integer,p_num_rows integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_message_rows() WHERE "MessageKey" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Role" ILIKE '%'||COALESCE(p_search,'')||'%' OR "Content" ILIKE '%'||COALESCE(p_search,'')||'%' ORDER BY CASE WHEN p_sort_column='MessageID' AND p_sort_ascending THEN "MessageID" END ASC, CASE WHEN p_sort_column='MessageID' AND NOT p_sort_ascending THEN "MessageID" END DESC, "MessageID" ASC OFFSET p_skip_rows LIMIT p_num_rows; $$;

CREATE OR REPLACE FUNCTION get_messages_by_compaction_epoch_key_session_idsp(p_compaction_epoch_key text,p_session_id integer) RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql AS $$ SELECT * FROM get_messages_by_compaction_epoch_key_session_id_sp(p_compaction_epoch_key,p_session_id); $$;

CREATE OR REPLACE FUNCTION messages_get_by_session_iddate_range_sp(p_session_id integer,p_start_utc timestamp,p_end_utc timestamp,p_num_rows integer)
RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean)
LANGUAGE sql AS $$
	SELECT *
	FROM get_message_rows()
	WHERE "SessionID" = p_session_id
		AND (p_start_utc IS NULL OR "DateCreated" >= p_start_utc)
		AND (p_end_utc IS NULL OR "DateCreated" <= p_end_utc)
	ORDER BY "MessageID" ASC
	LIMIT p_num_rows;
$$;

CREATE OR REPLACE FUNCTION update_messages_compaction_epoch_by_message_keys_json_sp(p_session_id integer,p_message_keys_json text,p_compaction_epoch integer,p_compaction_epoch_key text)
RETURNS TABLE ("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean)
LANGUAGE sql AS $$
	WITH keys AS (
		SELECT DISTINCT trim(value) AS message_key
		FROM json_array_elements_text(p_message_keys_json::json) value
		WHERE length(trim(value)) > 0
	), updated AS (
		UPDATE messages m
		SET compaction_epoch = p_compaction_epoch,
			compaction_epoch_key = p_compaction_epoch_key,
			last_updated = now()
		FROM keys k
		WHERE m.session_id = p_session_id
			AND m.message_key = k.message_key
		RETURNING m.message_id
	)
	SELECT r.*
	FROM get_message_rows() r
	INNER JOIN updated u ON u.message_id = r."MessageID"
	ORDER BY r."SequenceNumber" ASC, r."MessageID" ASC;
$$;

CREATE OR REPLACE FUNCTION update_message_compaction_epoch_atomic_sp(p_session_id integer,p_message_key text,p_compaction_epoch integer,p_compaction_epoch_key text) RETURNS TABLE("UpdatedRows" integer) LANGUAGE plpgsql AS $$ DECLARE affected integer; BEGIN UPDATE messages SET compaction_epoch=p_compaction_epoch,compaction_epoch_key=p_compaction_epoch_key,last_updated=timezone('utc',clock_timestamp()) WHERE session_id=p_session_id AND message_key=p_message_key AND (compaction_epoch IS DISTINCT FROM p_compaction_epoch OR compaction_epoch_key IS DISTINCT FROM p_compaction_epoch_key); GET DIAGNOSTICS affected=ROW_COUNT; RETURN QUERY SELECT affected; END $$;

CREATE OR REPLACE FUNCTION "UpdateMessageCompactionEpochAtomicSp"(p_session_id integer,p_message_key text,p_compaction_epoch integer,p_compaction_epoch_key text)
RETURNS TABLE ("UpdatedRows" integer)
LANGUAGE sql AS $$
SELECT * FROM update_message_compaction_epoch_atomic_sp(p_session_id,p_message_key,p_compaction_epoch,p_compaction_epoch_key);
$$;

CREATE OR REPLACE FUNCTION "UpdateToolResultPairCompactionEpochKeyAtomicSp"(p_session_id integer,p_tool_call_message_key text,p_tool_result_message_key text,p_source_compaction_epoch integer,p_source_compaction_epoch_key text,p_target_compaction_epoch_key text)
RETURNS TABLE ("UpdatedRows" integer)
LANGUAGE sql AS $$
	WITH candidates AS MATERIALIZED
	(
		SELECT message_id
		FROM messages
		WHERE session_id = p_session_id
			AND compaction_epoch = p_source_compaction_epoch
			AND compaction_epoch_key = p_source_compaction_epoch_key
			AND ((message_key = p_tool_call_message_key AND role = 'ToolCall')
				OR (message_key = p_tool_result_message_key AND role = 'Tools'))
	), updated AS
	(
		UPDATE messages
	SET compaction_epoch_key = p_target_compaction_epoch_key,
		last_updated = now()
		WHERE message_id IN (SELECT message_id FROM candidates)
			AND (SELECT COUNT(*) FROM candidates) = 2
		RETURNING 1
	)
	SELECT COUNT(*)::integer AS "UpdatedRows" FROM updated;
$$;

CREATE OR REPLACE FUNCTION sessions_get_sidebar_root_page_sp(p_search text, p_skip_roots integer, p_num_roots integer)
RETURNS TABLE (
	"SessionID" integer,
	"SessionKey" text,
	"ParentSessionID" integer,
	"ParentSessionKey" text,
	"SessionName" text,
	"AgentName" text,
	"ProjectName" text,
	"ProjectFilePath" text,
	"Provider" text,
	"ModelName" text,
	"ReasoningLevel" text,
	"PromptContext" text,
	"CompactionProvider" text,
	"State" text,"SessionKind" text,"Transport" text,
	"DateCreated" timestamp,
	"OwnLastUpdated" timestamp,
	"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,
	"RootOrdinal" integer,
	"HierarchyDepth" integer,
	"RootRowsReturned" integer,
	"HasMoreRootRows" boolean,
	"IsSearchBounded" boolean)
LANGUAGE plpgsql AS $$
BEGIN
	IF p_skip_roots < 0 THEN
		RAISE EXCEPTION 'SkipRoots must be nonnegative.';
	END IF;
	IF p_num_roots < 1 OR p_num_roots > 100 THEN
		RAISE EXCEPTION 'NumRoots must be between 1 and 100.';
	END IF;

	IF COALESCE(p_search, '') <> '' THEN
		RETURN QUERY
		WITH RECURSIVE searchable_sessions AS
		(
			SELECT session_row.*
			FROM sessions session_row
			WHERE session_row.is_archived = false
				AND session_row.session_key NOT IN ('Browser Profiles', 'browser-profiles')
		),
		matching_sessions AS
		(
			SELECT session_row.session_id, session_row.parent_session_id, session_row.last_updated
			FROM searchable_sessions session_row
			WHERE COALESCE(session_row.session_key, '') ILIKE '%' || p_search || '%'
				OR COALESCE(session_row.session_name, '') ILIKE '%' || p_search || '%'
		),
		capped_matching_sessions AS
		(
			SELECT session_row.session_id, session_row.parent_session_id, session_row.last_updated
			FROM matching_sessions session_row
			ORDER BY session_row.last_updated DESC, session_row.session_id DESC
			LIMIT 201
		),
		walked_matching_sessions AS
		(
			SELECT session_row.session_id, session_row.parent_session_id, session_row.last_updated,
				((SELECT COUNT(*) FROM capped_matching_sessions) > 200) AS is_match_set_bounded
			FROM capped_matching_sessions session_row
			ORDER BY session_row.last_updated DESC, session_row.session_id DESC
			LIMIT 200
		),
		match_ancestors AS
		(
			SELECT matching.session_id, matching.parent_session_id, matching.session_id AS match_session_id,
				matching.last_updated, 1 AS distance_from_match, ARRAY[matching.session_id]::integer[] AS visited_ids
			FROM walked_matching_sessions matching
			UNION ALL
			SELECT parent.session_id, parent.parent_session_id, child.match_session_id,
				child.last_updated, child.distance_from_match + 1, child.visited_ids || parent.session_id
			FROM match_ancestors child
			JOIN searchable_sessions parent ON parent.session_id = child.parent_session_id
			WHERE child.distance_from_match < 100
				AND NOT parent.session_id = ANY(child.visited_ids)
		),
		matching_rows AS
		(
			SELECT matching.session_id, matching.parent_session_id, root.session_id AS root_session_id,
				root.distance_from_match AS hierarchy_depth, matching.last_updated, matching.is_match_set_bounded
			FROM walked_matching_sessions matching
			JOIN match_ancestors root ON root.match_session_id = matching.session_id AND root.parent_session_id IS NULL
		),
		ranked_roots AS
		(
			SELECT matching.root_session_id, MAX(matching.last_updated) AS effective_last_updated,
				ROW_NUMBER() OVER (ORDER BY MAX(matching.last_updated) DESC, matching.root_session_id DESC)::integer AS root_ordinal,
				COUNT(*) OVER ()::integer AS total_root_rows
			FROM matching_rows matching
			GROUP BY matching.root_session_id
		),
		paged_roots AS
		(
			SELECT ranked.root_session_id, ranked.effective_last_updated, ranked.root_ordinal, ranked.total_root_rows,
				COUNT(*) OVER ()::integer AS root_rows_returned
			FROM ranked_roots ranked
			WHERE ranked.root_ordinal BETWEEN p_skip_roots + 1 AND p_skip_roots + p_num_roots
		),
		ranked_matching_rows AS
		(
			SELECT matching.session_id, matching.parent_session_id, matching.root_session_id, matching.hierarchy_depth,
				matching.last_updated, paged.effective_last_updated AS root_effective_last_updated,
				paged.root_ordinal, paged.total_root_rows, paged.root_rows_returned,
				matching.is_match_set_bounded,
				COUNT(*) OVER (PARTITION BY matching.root_session_id)::integer AS matching_rows_within_root,
				COUNT(*) OVER ()::integer AS total_matching_rows,
				ROW_NUMBER() OVER (PARTITION BY matching.root_session_id ORDER BY matching.last_updated DESC, matching.session_id DESC)::integer AS search_result_ordinal_within_root,
				ROW_NUMBER() OVER (ORDER BY matching.last_updated DESC, matching.session_id DESC)::integer AS search_result_ordinal
			FROM matching_rows matching
			JOIN paged_roots paged ON paged.root_session_id = matching.root_session_id
		),
		capped_matching_rows AS
		(
			SELECT ranked.*,
				(BOOL_OR(ranked.is_match_set_bounded) OVER ()
					OR ranked.total_matching_rows > 200
					OR ranked.matching_rows_within_root > CEIL(200.0 / NULLIF(ranked.root_rows_returned, 0))::integer) AS is_search_bounded
			FROM ranked_matching_rows ranked
			WHERE ranked.search_result_ordinal_within_root <= CEIL(200.0 / NULLIF(ranked.root_rows_returned, 0))::integer
				AND ranked.search_result_ordinal <= 200
		),
		search_rows_with_ancestors AS
		(
			SELECT matching.session_id, matching.parent_session_id, matching.root_session_id, matching.hierarchy_depth,
				matching.last_updated, matching.root_effective_last_updated, matching.root_ordinal,
				matching.total_root_rows, matching.root_rows_returned, matching.search_result_ordinal,
				matching.is_search_bounded, ARRAY[matching.session_id]::integer[] AS visited_ids
			FROM capped_matching_rows matching
			UNION ALL
			SELECT parent.session_id, parent.parent_session_id, child.root_session_id, child.hierarchy_depth - 1,
				parent.last_updated, child.root_effective_last_updated, child.root_ordinal,
				child.total_root_rows, child.root_rows_returned, child.search_result_ordinal,
				child.is_search_bounded, child.visited_ids || parent.session_id
			FROM search_rows_with_ancestors child
			JOIN searchable_sessions parent ON parent.session_id = child.parent_session_id
			WHERE NOT parent.session_id = ANY(child.visited_ids)
		),
		deduped_search_rows AS
		(
			SELECT search_row.session_id, search_row.root_session_id, MIN(search_row.hierarchy_depth)::integer AS hierarchy_depth,
				MAX(search_row.last_updated) AS last_updated, MAX(search_row.root_effective_last_updated) AS root_effective_last_updated,
				MIN(search_row.root_ordinal)::integer AS root_ordinal, MAX(search_row.total_root_rows)::integer AS total_root_rows,
				MAX(search_row.root_rows_returned)::integer AS root_rows_returned,
				MIN(search_row.search_result_ordinal)::integer AS search_result_ordinal,
				BOOL_OR(search_row.is_search_bounded) AS is_search_bounded
			FROM search_rows_with_ancestors search_row
			GROUP BY search_row.session_id, search_row.root_session_id
		)
		SELECT session_row.session_id, session_row.session_key, session_row.parent_session_id, parent.session_key,
			session_row.session_name, session_row.agent_name, session_row.project_name, session_row.project_file_path,
			session_row.provider, session_row.model_name, session_row.reasoning_level, session_row.prompt_context,
			session_row.compaction_provider, session_row.state,session_row.session_kind,session_row.transport, session_row.date_created, session_row.last_updated,
			CASE WHEN deduped.hierarchy_depth = 1 THEN deduped.root_effective_last_updated ELSE session_row.last_updated END,
			deduped.root_session_id, deduped.root_ordinal, deduped.hierarchy_depth, deduped.root_rows_returned,
			deduped.total_root_rows > p_skip_roots + p_num_roots, BOOL_OR(deduped.is_search_bounded) OVER ()
		FROM deduped_search_rows deduped
		JOIN searchable_sessions session_row ON session_row.session_id = deduped.session_id
		LEFT JOIN searchable_sessions parent ON parent.session_id = session_row.parent_session_id
		ORDER BY deduped.root_ordinal, deduped.hierarchy_depth, deduped.search_result_ordinal, deduped.last_updated DESC, session_row.session_id DESC;
		RETURN;
	END IF;

	RETURN QUERY
	WITH navigable_sessions AS
	(
		SELECT session_row.*
		FROM sessions session_row
		WHERE session_row.is_archived = false
			AND session_row.session_key NOT IN ('Browser Profiles', 'browser-profiles')
			AND
			(
				session_row.session_key = 'Buffaly.CodeReviews.Global'
				OR
				(
					COALESCE(session_row.agent_name, '') NOT IN ('code-review-agent', 'code-review-agent-v3')
					AND session_row.session_key NOT LIKE '%.CodeReviewAgentV3'
				)
			)
	),
	root_activity AS
	(
		SELECT root.session_id AS root_session_id,
			GREATEST(root.last_updated, COALESCE(MAX(child.last_updated), root.last_updated)) AS effective_last_updated,
			COUNT(child.session_id)::integer AS direct_child_count
		FROM navigable_sessions root
		LEFT JOIN navigable_sessions child ON child.parent_session_id = root.session_id
		WHERE root.parent_session_id IS NULL
		GROUP BY root.session_id, root.last_updated
	),
	ranked_roots AS
	(
		SELECT activity.root_session_id, activity.effective_last_updated,
			(activity.direct_child_count + 1)::integer AS family_row_count,
			ROW_NUMBER() OVER (ORDER BY activity.effective_last_updated DESC, activity.root_session_id DESC)::integer AS root_ordinal,
			COUNT(*) OVER ()::integer AS total_root_rows
		FROM root_activity activity
	),
	requested_roots AS
	(
		SELECT ranked.*,
			SUM(ranked.family_row_count) OVER (ORDER BY ranked.root_ordinal ROWS UNBOUNDED PRECEDING)::integer AS cumulative_family_rows
		FROM ranked_roots ranked
		WHERE ranked.root_ordinal BETWEEN p_skip_roots + 1 AND p_skip_roots + p_num_roots
	),
	budgeted_roots AS
	(
		SELECT requested.root_session_id, requested.effective_last_updated, requested.root_ordinal, requested.total_root_rows
		FROM requested_roots requested
		WHERE requested.root_ordinal = p_skip_roots + 1
			OR requested.cumulative_family_rows <= 500
	),
	paged_roots AS
	(
		SELECT budgeted.*, COUNT(*) OVER ()::integer AS root_rows_returned,
			MAX(budgeted.root_ordinal) OVER () < budgeted.total_root_rows AS has_more_root_rows
		FROM budgeted_roots budgeted
	),
	sidebar_rows AS
	(
		SELECT root.session_id, root.session_key, root.parent_session_id, NULL::text AS parent_session_key,
			root.session_name, root.agent_name, root.project_name, root.project_file_path,
			root.provider, root.model_name, root.reasoning_level, root.prompt_context, root.compaction_provider,
			root.state,root.session_kind,root.transport, root.date_created, root.last_updated AS own_last_updated, paged.effective_last_updated,
			paged.root_session_id, paged.root_ordinal, 1 AS hierarchy_depth, paged.root_rows_returned,
			paged.has_more_root_rows AS has_more_root_rows, false AS is_search_bounded
		FROM paged_roots paged
		JOIN navigable_sessions root ON root.session_id = paged.root_session_id
		UNION ALL
		SELECT child.session_id, child.session_key, child.parent_session_id, parent.session_key,
			child.session_name, child.agent_name, child.project_name, child.project_file_path,
			child.provider, child.model_name, child.reasoning_level, child.prompt_context, child.compaction_provider,
			child.state,child.session_kind,child.transport, child.date_created, child.last_updated, child.last_updated,
			paged.root_session_id, paged.root_ordinal, 2, paged.root_rows_returned,
			paged.has_more_root_rows, false
		FROM paged_roots paged
		JOIN navigable_sessions parent ON parent.session_id = paged.root_session_id
		JOIN navigable_sessions child ON child.parent_session_id = paged.root_session_id
	)
	SELECT row.session_id, row.session_key, row.parent_session_id, row.parent_session_key,
		row.session_name, row.agent_name, row.project_name, row.project_file_path,
		row.provider, row.model_name, row.reasoning_level, row.prompt_context, row.compaction_provider,
		row.state,row.session_kind,row.transport, row.date_created, row.own_last_updated, row.effective_last_updated,
		row.root_session_id, row.root_ordinal, row.hierarchy_depth, row.root_rows_returned,
		row.has_more_root_rows, row.is_search_bounded
	FROM sidebar_rows row
	ORDER BY row.root_ordinal, row.hierarchy_depth, row.own_last_updated DESC, row.session_id DESC;
END;
$$;

-- Forward the exact typed producer projection; a different OUT order makes SELECT * invalid.
CREATE OR REPLACE FUNCTION "Sessions_GetSidebarRootPageSp"(p_search varchar, p_skip_roots integer, p_num_roots integer)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,"SessionName" text,
	"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,
	"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"DateCreated" timestamp,
	"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer,
	"RootRowsReturned" integer,"HasMoreRootRows" boolean,"IsSearchBounded" boolean)
LANGUAGE sql AS $$
	SELECT * FROM sessions_get_sidebar_root_page_sp(p_search::text, p_skip_roots, p_num_roots);
$$;

CREATE OR REPLACE FUNCTION messages_get_by_user_and_assistant_search_sp(
	p_search text,
	p_role_filter text,
	p_max_rows integer,
	p_search_scope text,
	p_max_message_scan_count integer,
	p_session_key text
)
RETURNS TABLE (
	"SessionKey" text,
	"SessionName" text,
	"MessageID" integer,
	"SessionID" integer,
	"SequenceNumber" integer,
	"Role" text,
	"Content" text,
	"ToolName" text,
	"ToolArguments" text,
	"CallID" text,
	"DateCreated" timestamp,
	"LastUpdated" timestamp,
	"Data" text,
	"IsCompacted" boolean,
	"CompactionEpoch" integer,
	"MessageKey" text,
	"TurnID" text,
	"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
	v_search text := TRIM(COALESCE(p_search, ''));
	v_role text := LOWER(TRIM(COALESCE(p_role_filter, 'both')));
	v_scope text := LOWER(TRIM(COALESCE(p_search_scope, 'recent')));
	v_max_rows integer := COALESCE(p_max_rows, 25);
	v_scan integer := COALESCE(p_max_message_scan_count, 0);
	v_session_key text := TRIM(COALESCE(p_session_key, ''));
BEGIN
	IF v_role NOT IN ('both', 'user', 'assistant') THEN RAISE EXCEPTION 'RoleFilter must be both, user, or assistant.'; END IF;
	IF v_max_rows < 1 OR v_max_rows > 200 THEN RAISE EXCEPTION 'MaxRows must be between 1 and 200.'; END IF;
	IF v_scope NOT IN ('this', 'recent', 'deep', 'all') THEN RAISE EXCEPTION 'SearchScope must be this, recent, deep, or all.'; END IF;
	IF v_scope = 'this' AND v_session_key = '' THEN RAISE EXCEPTION 'SessionKey is required when SearchScope is this.'; END IF;
	IF v_scope = 'recent' THEN
		IF v_scan <= 0 THEN v_scan := 2500; END IF;
		IF v_scan > 25000 THEN RAISE EXCEPTION 'Recent message search cannot scan more than 25000 messages.'; END IF;
	ELSIF v_scope = 'deep' THEN
		IF v_scan <= 0 THEN v_scan := 1000000; END IF;
		IF v_scan > 2000000 THEN RAISE EXCEPTION 'Deep message search cannot scan more than 2000000 messages.'; END IF;
	END IF;

	RETURN QUERY
	WITH user_candidates AS (
		SELECT m.message_id FROM messages m
		WHERE v_scope NOT IN ('this', 'all') AND (v_role = 'both' OR v_role = 'user') AND m.role = 'User'
		ORDER BY m.message_id DESC LIMIT CASE WHEN v_scope IN ('this', 'all') THEN 0 ELSE v_scan END
	),
	assistant_candidates AS (
		SELECT m.message_id FROM messages m
		WHERE v_scope NOT IN ('this', 'all') AND (v_role = 'both' OR v_role = 'assistant') AND m.role = 'Assistant'
		ORDER BY m.message_id DESC LIMIT CASE WHEN v_scope IN ('this', 'all') THEN 0 ELSE v_scan END
	),
	recent_candidates AS (
		SELECT message_id FROM user_candidates UNION SELECT message_id FROM assistant_candidates
	)
	SELECT
		s.session_key, s.session_name, r."MessageID", r."SessionID", r."SequenceNumber", r."Role",
		r."Content", r."ToolName", r."ToolArguments", r."CallID", r."DateCreated", r."LastUpdated",
		r."Data", r."IsCompacted", r."CompactionEpoch", r."MessageKey", r."TurnID", r."CompactionEpochKey", r."TurnRowID", r."MessageKind", r."TerminalOutcomeState", r."SavedWorkResume"
	FROM message_rows r
	INNER JOIN sessions s ON s.session_id = r."SessionID"
	WHERE s.session_key NOT LIKE '%level-two%'
		AND COALESCE(s.agent_name, '') NOT IN ('level-2', 'online-session-memory-critic', 'online-action-critic', 'online-memory-critic')
		AND s.session_key NOT LIKE '%-online-memory-critic'
		AND s.session_key NOT LIKE '%-online-action-critic'
		AND s.session_key NOT LIKE '%-online-session-memory-critic'
		AND (v_scope <> 'this' OR s.session_key = v_session_key)
		AND LTRIM(r."Content") NOT ILIKE '[label: Level 2]%'
		AND LTRIM(r."Content") NOT ILIKE '[timeline-label: Level 2]%'
		AND (
			(v_scope IN ('this', 'all') AND (
				(v_role = 'both' AND r."Role" IN ('User', 'Assistant'))
				OR (v_role = 'user' AND r."Role" = 'User')
				OR (v_role = 'assistant' AND r."Role" = 'Assistant')
			))
			OR (v_scope NOT IN ('this', 'all') AND r."MessageID" IN (SELECT message_id FROM recent_candidates))
		)
		AND (v_search = '' OR r."Content" ILIKE '%' || v_search || '%')
	ORDER BY r."MessageID" DESC
	LIMIT v_max_rows;
END;
$$;

CREATE OR REPLACE FUNCTION sessions_get_sidebar_recent_page_sp(p_search text, p_skip_rows integer, p_num_rows integer)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,
	"DateCreated" timestamp,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer)
LANGUAGE plpgsql AS $$
BEGIN
	IF p_skip_rows < 0 THEN RAISE EXCEPTION 'SkipRows must be nonnegative.'; END IF;
	IF p_num_rows < 1 OR p_num_rows > 5000 THEN RAISE EXCEPTION 'NumRows must be between 1 and 5000.'; END IF;
	RETURN QUERY
	WITH candidate_rows AS
	(
		SELECT session_row.*, parent.session_key AS parent_session_key,
			ROW_NUMBER() OVER (ORDER BY session_row.last_updated DESC, session_row.session_id DESC)::integer AS row_ordinal
		FROM sessions session_row
		LEFT JOIN sessions parent ON parent.session_id = session_row.parent_session_id
		WHERE session_row.is_archived = false
			AND session_row.session_key NOT IN ('Browser Profiles', 'browser-profiles')
			AND (COALESCE(p_search, '') = '' OR COALESCE(session_row.session_key, '') ILIKE '%' || p_search || '%' OR COALESCE(session_row.session_name, '') ILIKE '%' || p_search || '%')
	)
	SELECT candidate.session_id, candidate.session_key, candidate.parent_session_id, candidate.parent_session_key,
		candidate.session_name, candidate.agent_name, candidate.project_name, candidate.project_file_path,
		candidate.provider, candidate.model_name, candidate.reasoning_level, candidate.prompt_context,
		candidate.compaction_provider, candidate.state,candidate.session_kind,candidate.transport, candidate.date_created, candidate.last_updated, candidate.last_updated,
		NULL::integer, NULL::integer, NULL::integer
	FROM candidate_rows candidate
	WHERE candidate.row_ordinal BETWEEN p_skip_rows + 1 AND p_skip_rows + p_num_rows + 1
	ORDER BY candidate.row_ordinal;
END;
$$;

CREATE OR REPLACE FUNCTION sessions_get_sidebar_selected_branch_sp(p_session_key text)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,
	"DateCreated" timestamp,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer)
LANGUAGE plpgsql AS $$
BEGIN
	IF COALESCE(p_session_key, '') = '' THEN RAISE EXCEPTION 'SessionKey is required.'; END IF;
	RETURN QUERY
	WITH RECURSIVE navigable_sessions AS
	(
		SELECT session_row.*
		FROM sessions session_row
		WHERE session_row.is_archived = false
			AND session_row.session_key NOT IN ('Browser Profiles', 'browser-profiles')
			AND (session_row.session_key = 'Buffaly.CodeReviews.Global' OR
				(COALESCE(session_row.agent_name, '') NOT IN ('code-review-agent', 'code-review-agent-v3')
				AND session_row.session_key NOT LIKE '%.CodeReviewAgentV3'))
	),
	selected_ancestors AS
	(
		SELECT selected.session_id, selected.parent_session_id, 1 AS distance_from_selected, ARRAY[selected.session_id]::integer[] AS visited_ids
		FROM navigable_sessions selected WHERE selected.session_key = p_session_key
		UNION ALL
		SELECT parent.session_id, parent.parent_session_id, child.distance_from_selected + 1, child.visited_ids || parent.session_id
		FROM selected_ancestors child JOIN navigable_sessions parent ON parent.session_id = child.parent_session_id
		WHERE child.distance_from_selected < 100 AND NOT parent.session_id = ANY(child.visited_ids)
	),
	root_resolution AS
	(
		SELECT ancestor.session_id AS root_session_id FROM selected_ancestors ancestor WHERE ancestor.parent_session_id IS NULL LIMIT 1
	),
	selected_context AS
	(
		SELECT ancestor.session_id FROM selected_ancestors ancestor
		UNION SELECT child.session_id FROM root_resolution resolved JOIN navigable_sessions child ON child.parent_session_id = resolved.root_session_id
	),
	selected_direct_child AS
	(
		SELECT ancestor.session_id FROM selected_ancestors ancestor CROSS JOIN root_resolution resolved WHERE ancestor.parent_session_id = resolved.root_session_id
	),
	expanded_context AS
	(
		SELECT context_row.session_id FROM selected_context context_row
		UNION SELECT child.session_id FROM selected_direct_child selected_child JOIN navigable_sessions child ON child.parent_session_id = selected_child.session_id
		WHERE EXISTS (SELECT 1 FROM selected_ancestors path_row WHERE path_row.distance_from_selected > 2)
		UNION SELECT child.session_id FROM navigable_sessions child JOIN selected_ancestors selected_identity ON child.parent_session_id = selected_identity.session_id WHERE selected_identity.distance_from_selected = 1
	),
	hierarchy AS
	(
		SELECT root.session_id, root.parent_session_id, 1 AS hierarchy_depth
		FROM root_resolution resolved JOIN navigable_sessions root ON root.session_id = resolved.root_session_id
		UNION ALL
		SELECT child.session_id, child.parent_session_id, parent.hierarchy_depth + 1
		FROM hierarchy parent JOIN navigable_sessions child ON child.parent_session_id = parent.session_id
		JOIN expanded_context context_row ON context_row.session_id = child.session_id
		WHERE parent.hierarchy_depth < 100
	),
	root_activity AS
	(
		SELECT root.session_id AS root_session_id, GREATEST(root.last_updated, COALESCE(MAX(child.last_updated), root.last_updated)) AS effective_last_updated
		FROM root_resolution resolved JOIN navigable_sessions root ON root.session_id = resolved.root_session_id
		LEFT JOIN navigable_sessions child ON child.parent_session_id = root.session_id
		GROUP BY root.session_id, root.last_updated
	)
	SELECT row.session_id, row.session_key, row.parent_session_id, parent.session_key, row.session_name,
		row.agent_name, row.project_name, row.project_file_path, row.provider, row.model_name, row.reasoning_level,
		row.prompt_context, row.compaction_provider, row.state,row.session_kind,row.transport, row.date_created, row.last_updated,
		CASE WHEN hierarchy.hierarchy_depth = 1 THEN activity.effective_last_updated ELSE row.last_updated END,
		resolved.root_session_id, NULL::integer, hierarchy.hierarchy_depth
	FROM hierarchy
	JOIN navigable_sessions row ON row.session_id = hierarchy.session_id
	LEFT JOIN navigable_sessions parent ON parent.session_id = row.parent_session_id
	CROSS JOIN root_resolution resolved
	JOIN root_activity activity ON activity.root_session_id = resolved.root_session_id
	ORDER BY hierarchy.hierarchy_depth, row.last_updated DESC, row.session_id DESC
	LIMIT 5001;
END;
$$;

CREATE OR REPLACE FUNCTION sessions_get_sidebar_activity_batch_sp(p_session_keys_json text)
RETURNS TABLE (
	"SessionID" integer,
	"SessionKey" text,
	"SessionName" text,
	"AgentName" text,
	"State" text,"SessionKind" text,"Transport" text,
	"OwnLastUpdated" timestamp,
	"EffectiveLastUpdated" timestamp)
LANGUAGE plpgsql AS $$
BEGIN
	RETURN QUERY
	WITH requested_session_keys AS
	(
		SELECT requested.value AS session_key,
			requested.ordinality::integer AS request_ordinal
		FROM jsonb_array_elements_text(p_session_keys_json::jsonb) WITH ORDINALITY AS requested(value, ordinality)
	),
	requested_sessions AS
	(
		SELECT requested.request_ordinal,
			session_row.session_id,
			session_row.session_key,
			session_row.parent_session_id,
			session_row.session_name,
			session_row.agent_name,
			session_row.state,session_row.session_kind,session_row.transport,
			session_row.last_updated
		FROM requested_session_keys requested
		JOIN sessions session_row
		ON session_row.session_key = requested.session_key
		WHERE session_row.is_archived = false
	),
	root_activity AS
	(
		SELECT root.session_id AS root_session_id,
			CASE
				WHEN MAX(child.last_updated) IS NOT NULL AND MAX(child.last_updated) > root.last_updated THEN MAX(child.last_updated)
				ELSE root.last_updated
			END AS effective_last_updated
		FROM requested_sessions root
		LEFT JOIN sessions child
		ON child.parent_session_id = root.session_id
			AND child.is_archived = false
		WHERE root.parent_session_id IS NULL
		GROUP BY root.session_id,
			root.last_updated
	)
	SELECT requested.session_id,
		requested.session_key,
		requested.session_name,
		requested.agent_name,
		requested.state,requested.session_kind,requested.transport,
		requested.last_updated,
		CASE WHEN requested.parent_session_id IS NULL THEN root_activity.effective_last_updated ELSE requested.last_updated END
	FROM requested_sessions requested
	LEFT JOIN root_activity
	ON root_activity.root_session_id = requested.session_id
	ORDER BY requested.request_ordinal;
END;
$$;

CREATE OR REPLACE FUNCTION update_tool_result_pair_compaction_epoch_key_atomic_sp(p_session_id integer,p_tool_call_message_key text,p_tool_result_message_key text,p_source_compaction_epoch integer,p_source_compaction_epoch_key text,p_target_compaction_epoch_key text) RETURNS TABLE("UpdatedRows" integer) LANGUAGE plpgsql AS $$ DECLARE affected integer; BEGIN UPDATE messages SET compaction_epoch_key=p_target_compaction_epoch_key,last_updated=timezone('utc',clock_timestamp()) WHERE session_id=p_session_id AND compaction_epoch=p_source_compaction_epoch AND compaction_epoch_key=p_source_compaction_epoch_key AND ((message_key=p_tool_call_message_key AND role='ToolCall') OR(message_key=p_tool_result_message_key AND role='Tools')) AND 2=(SELECT count(*) FROM messages WHERE session_id=p_session_id AND compaction_epoch=p_source_compaction_epoch AND compaction_epoch_key=p_source_compaction_epoch_key AND ((message_key=p_tool_call_message_key AND role='ToolCall') OR(message_key=p_tool_result_message_key AND role='Tools'))); GET DIAGNOSTICS affected=ROW_COUNT; RETURN QUERY SELECT affected; END $$;

CREATE OR REPLACE FUNCTION messages_clear_session_timeline(p_session_id integer) RETURNS TABLE("DeletedMessages" integer,"DeletedTurns" integer) LANGUAGE plpgsql AS $$ DECLARE dm integer;dt integer; BEGIN DELETE FROM messages WHERE session_id=p_session_id;GET DIAGNOSTICS dm=ROW_COUNT;DELETE FROM turns WHERE session_id=p_session_id;GET DIAGNOSTICS dt=ROW_COUNT;RETURN QUERY SELECT dm,dt;END $$;

CREATE OR REPLACE FUNCTION turns_read_index_page(p_session_id integer,p_skip_rows integer,p_num_rows integer,p_before_time timestamp,p_before_message_id integer,p_user_only boolean)
RETURNS TABLE("TotalTurns" bigint,"HasMore" boolean,"TurnID" bigint,"SessionID" integer,"TurnKey" text,"DisplayOrderAtUtc" timestamp,"FirstMessageID" integer,"UserMessageID" integer,"AssistantMessageID" integer,"LastErrorMessageID" integer,"TerminalMessageID" integer) LANGUAGE plpgsql STABLE AS $$
BEGIN
 IF p_skip_rows<0 OR p_num_rows<1 OR p_num_rows>5000 THEN RAISE EXCEPTION 'Invalid Turns index page bounds.'; END IF;
 IF (p_before_time IS NULL)<>(p_before_message_id IS NULL) THEN RAISE EXCEPTION 'Both Turns index page boundary values are required.'; END IF;
 RETURN QUERY WITH eligible AS (SELECT t.* FROM turns t WHERE t.session_id=p_session_id AND (NOT p_user_only OR t.user_message_id IS NOT NULL)),
 filtered AS (SELECT * FROM eligible WHERE p_before_time IS NULL OR display_order_at_utc<p_before_time OR(display_order_at_utc=p_before_time AND first_message_id<p_before_message_id)),
 counts AS (SELECT (SELECT count(*) FROM eligible) total,(SELECT count(*) FROM filtered) available),
 page AS (SELECT * FROM filtered ORDER BY display_order_at_utc DESC,first_message_id DESC OFFSET p_skip_rows LIMIT p_num_rows)
 SELECT counts.total,p_skip_rows+p_num_rows<counts.available,page.* FROM counts LEFT JOIN page ON true;
END $$;

CREATE OR REPLACE FUNCTION turns_read_index_turn(p_session_id integer,p_turn_key text)
RETURNS TABLE("TurnID" bigint,"SessionID" integer,"TurnKey" text,"DisplayOrderAtUtc" timestamp,"FirstMessageID" integer,"UserMessageID" integer,"AssistantMessageID" integer,"LastErrorMessageID" integer,"TerminalMessageID" integer) LANGUAGE sql STABLE AS $$
 SELECT t.turn_id,t.session_id,t.turn_key,t.display_order_at_utc,t.first_message_id,t.user_message_id,t.assistant_message_id,t.last_error_message_id,t.terminal_message_id FROM turns t WHERE t.session_id=p_session_id AND t.turn_key=p_turn_key;
$$;

CREATE OR REPLACE FUNCTION turns_read_index_detail_rows(p_session_id integer,p_turn_key text,p_num_rows integer) RETURNS TABLE("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql STABLE AS $$ SELECT newest.message_id,newest.session_id,newest.sequence_number,newest.role,newest.content,newest.tool_name,newest.tool_arguments,newest.call_id,newest.date_created,newest.last_updated,newest.data,newest.is_compacted,newest.compaction_epoch,newest.message_key,newest.turn_id,newest.compaction_epoch_key,newest.turn_row_id,newest.message_kind,newest.terminal_outcome_state,newest.saved_work_resume FROM(SELECT m.message_id,m.session_id,m.sequence_number,m.role,m.content,m.tool_name,m.tool_arguments,m.call_id,m.date_created,m.last_updated,m.data,m.is_compacted,m.compaction_epoch,m.message_key,m.turn_id,m.compaction_epoch_key,m.turn_row_id,m.message_kind,m.terminal_outcome_state,m.saved_work_resume FROM messages m WHERE m.session_id=p_session_id AND m.turn_id=p_turn_key ORDER BY m.date_created DESC,m.message_id DESC LIMIT p_num_rows)newest ORDER BY newest.date_created,newest.message_id $$;

CREATE OR REPLACE FUNCTION "Turns_ReadIndexPage"(p_session_id integer,p_skip_rows integer,p_num_rows integer,p_before_time timestamp,p_before_message_id integer,p_user_only boolean)
RETURNS TABLE("TotalTurns" bigint,"HasMore" boolean,"TurnID" bigint,"SessionID" integer,"TurnKey" text,"DisplayOrderAtUtc" timestamp,"FirstMessageID" integer,"UserMessageID" integer,"AssistantMessageID" integer,"LastErrorMessageID" integer,"TerminalMessageID" integer) LANGUAGE sql STABLE AS $$ SELECT * FROM turns_read_index_page(p_session_id,p_skip_rows,p_num_rows,p_before_time,p_before_message_id,p_user_only ) $$;

CREATE OR REPLACE FUNCTION "Turns_ReadIndexTurn"(p_session_id integer,p_turn_key text)
RETURNS TABLE("TurnID" bigint,"SessionID" integer,"TurnKey" text,"DisplayOrderAtUtc" timestamp,"FirstMessageID" integer,"UserMessageID" integer,"AssistantMessageID" integer,"LastErrorMessageID" integer,"TerminalMessageID" integer) LANGUAGE sql STABLE AS $$ SELECT * FROM turns_read_index_turn(p_session_id,p_turn_key ) $$;

CREATE OR REPLACE FUNCTION "Turns_ReadIndexDetailRows"(p_session_id integer,p_turn_key text,p_num_rows integer)
RETURNS TABLE("MessageID" integer,"SessionID" integer,"SequenceNumber" integer,"Role" text,"Content" text,"ToolName" text,"ToolArguments" text,"CallID" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"IsCompacted" boolean,"CompactionEpoch" integer,"MessageKey" text,"TurnID" text,"CompactionEpochKey" text,"TurnRowID" bigint,"MessageKind" text,"TerminalOutcomeState" text,"SavedWorkResume" boolean) LANGUAGE sql STABLE AS $$ SELECT * FROM turns_read_index_detail_rows(p_session_id,p_turn_key,p_num_rows) $$;

CREATE OR REPLACE FUNCTION messages_persist_session_compaction(
	p_session_id integer,p_target_epoch integer,p_target_epoch_key text,p_session_data text,
	p_retained_messages_json text,p_inserted_messages_json text)
RETURNS TABLE("MovedRows" integer,"InsertedRows" integer) LANGUAGE plpgsql AS $$
DECLARE
	retained jsonb:=p_retained_messages_json::jsonb;
	inserted jsonb:=p_inserted_messages_json::jsonb;
	row_data jsonb;
	moved integer:=0;
	inserted_count integer:=0;
	next_sequence integer;
	ordinal integer:=0;
BEGIN
	IF p_session_id<=0 OR p_target_epoch<0 OR NULLIF(p_target_epoch_key,'') IS NULL
		OR p_session_data IS NULL OR jsonb_typeof(retained) IS DISTINCT FROM 'array'
		OR jsonb_typeof(inserted) IS DISTINCT FROM 'array' THEN
		RAISE EXCEPTION 'Invalid session compaction request.';
	END IF;
	PERFORM p_session_data::jsonb;
	IF NOT EXISTS(SELECT 1 FROM sessions WHERE session_id=p_session_id) THEN RAISE EXCEPTION 'Session does not exist.'; END IF;
	IF EXISTS(SELECT 1 FROM jsonb_array_elements(retained) r WHERE NULLIF(r->>'MessageKey','') IS NULL)
		OR EXISTS(SELECT 1 FROM jsonb_array_elements(inserted) n WHERE NULLIF(n->>'MessageKey','') IS NULL OR NULLIF(n->>'Role','') IS NULL OR n->>'DateCreatedUtc' IS NULL OR n->>'IsCompacted' IS NULL) THEN
		RAISE EXCEPTION 'Invalid compaction message contract.';
	END IF;
	IF EXISTS(SELECT 1 FROM jsonb_array_elements(retained) r
		LEFT JOIN messages m ON m.session_id=p_session_id AND m.message_key=r->>'MessageKey'
		WHERE m.message_id IS NULL OR NOT(
			(m.compaction_epoch IS NOT DISTINCT FROM (r->>'SourceEpoch')::integer AND m.compaction_epoch_key IS NOT DISTINCT FROM r->>'SourceEpochKey')
			OR(m.compaction_epoch IS NOT DISTINCT FROM p_target_epoch AND m.compaction_epoch_key IS NOT DISTINCT FROM p_target_epoch_key))) THEN
		RAISE EXCEPTION 'Retained message source conflict.';
	END IF;
	UPDATE messages m SET compaction_epoch=p_target_epoch,compaction_epoch_key=p_target_epoch_key
		FROM jsonb_array_elements(retained) r WHERE m.session_id=p_session_id AND m.message_key=r->>'MessageKey'
		AND(m.compaction_epoch IS DISTINCT FROM p_target_epoch OR m.compaction_epoch_key IS DISTINCT FROM p_target_epoch_key);
	GET DIAGNOSTICS moved=ROW_COUNT;
	IF EXISTS(SELECT 1 FROM jsonb_array_elements(inserted) n JOIN messages m ON m.session_id=p_session_id AND m.message_key=n->>'MessageKey'
		WHERE m.compaction_epoch IS DISTINCT FROM p_target_epoch OR m.compaction_epoch_key IS DISTINCT FROM p_target_epoch_key
		OR m.message_kind IS DISTINCT FROM n->>'MessageKind' OR m.terminal_outcome_state IS DISTINCT FROM n->>'TerminalOutcomeState' OR m.saved_work_resume IS DISTINCT FROM (n->>'SavedWorkResume')::boolean OR m.turn_id IS DISTINCT FROM n->>'TurnKey' OR m.role IS DISTINCT FROM n->>'Role' OR COALESCE(m.content,'')<>COALESCE(n->>'Content','')) THEN
		RAISE EXCEPTION 'Inserted compaction message replay conflict.';
	END IF;
	SELECT COALESCE(max(sequence_number),0) INTO next_sequence FROM messages WHERE session_id=p_session_id;
	FOR row_data IN SELECT value FROM jsonb_array_elements(inserted) LOOP
		ordinal:=ordinal+1;
		IF NOT EXISTS(SELECT 1 FROM messages WHERE session_id=p_session_id AND message_key=row_data->>'MessageKey') THEN
			PERFORM * FROM insert_message_sp(p_session_id,next_sequence+ordinal,row_data->>'Role',row_data->>'Content',row_data->>'ToolName',row_data->>'ToolArguments',row_data->>'CallID',row_data->>'Data',(row_data->>'IsCompacted')::boolean,p_target_epoch,row_data->>'MessageKey',row_data->>'TurnKey',p_target_epoch_key,row_data->>'MessageKind',row_data->>'TerminalOutcomeState',(row_data->>'SavedWorkResume')::boolean,(row_data->>'DateCreatedUtc')::timestamp);
			inserted_count:=inserted_count+1;
		END IF;
	END LOOP;
	UPDATE sessions SET data=p_session_data,last_updated=timezone('utc',clock_timestamp()) WHERE session_id=p_session_id;
	RETURN QUERY SELECT moved,inserted_count;
END $$;

CREATE OR REPLACE FUNCTION "Messages_PersistSessionCompaction"(
	p_session_id integer,p_target_epoch integer,p_target_epoch_key text,p_session_data text,
	p_retained_messages_json text,p_inserted_messages_json text)
RETURNS TABLE("MovedRows" integer,"InsertedRows" integer) LANGUAGE sql AS $$
	SELECT * FROM messages_persist_session_compaction(
		p_session_id,p_target_epoch,p_target_epoch_key,p_session_data,
		p_retained_messages_json,p_inserted_messages_json)
$$;

CREATE OR REPLACE FUNCTION "Sessions_UpdateRuntimeStateWithAttentionSp"(p_session_key text,p_state text,p_active_turn_key text,p_current_turn_started_utc text,p_last_run_pulse_utc text,p_last_non_running_utc text,p_evaluate_admission_token text)
RETURNS TABLE("Updated" boolean) LANGUAGE plpgsql AS $$
DECLARE affected integer;
BEGIN
 IF p_state IS NULL OR p_state NOT IN('Unloaded','Loaded','Running','Paused','Stopped','Completed','Errored') THEN RAISE EXCEPTION 'Canonical State required'; END IF;
 IF p_state<>'Running' AND NULLIF(p_last_non_running_utc,'') IS NULL THEN RAISE EXCEPTION 'Nonrunning transition requires exact stop stamp'; END IF;
 UPDATE sessions s SET needs_attention=CASE WHEN p_state='Running' THEN false WHEN s.state='Running' THEN true ELSE s.needs_attention END,
 state=p_state,active_turn_key=CASE WHEN p_active_turn_key<>'' OR p_state<>'Running' THEN p_active_turn_key ELSE s.active_turn_key END,
 current_turn_started_utc=CASE WHEN p_current_turn_started_utc<>'' OR p_state<>'Running' THEN p_current_turn_started_utc ELSE s.current_turn_started_utc END,
 last_run_pulse_utc=p_last_run_pulse_utc,last_non_running_utc=CASE WHEN s.state='Running' AND p_state<>'Running' THEN p_last_non_running_utc ELSE s.last_non_running_utc END,
 evaluate_admission_token=NULLIF(p_evaluate_admission_token,''),last_updated=timezone('utc',clock_timestamp()) WHERE s.session_key=p_session_key;
 GET DIAGNOSTICS affected=ROW_COUNT; RETURN QUERY SELECT affected=1;
END $$;
CREATE OR REPLACE FUNCTION "Sessions_RollbackEvaluateAdmissionWithAttentionSp"(p_session_key text,p_admission_token text)
RETURNS TABLE("Updated" boolean) LANGUAGE plpgsql AS $$
DECLARE affected integer;stamp text:=to_char(timezone('utc',clock_timestamp()),'YYYY-MM-DD"T"HH24:MI:SS.US')||'0Z';
BEGIN
 IF NULLIF(p_admission_token,'') IS NULL THEN RAISE EXCEPTION 'AdmissionToken required'; END IF;
 UPDATE sessions SET needs_attention=true,state='Errored',active_turn_key='',current_turn_started_utc='',last_non_running_utc=stamp,evaluate_admission_token=NULL,last_updated=timezone('utc',clock_timestamp())
 WHERE session_key=p_session_key AND state='Running' AND evaluate_admission_token=p_admission_token;
 GET DIAGNOSTICS affected=ROW_COUNT;RETURN QUERY SELECT affected=1;
END $$;
CREATE OR REPLACE FUNCTION "Sessions_AcknowledgeAttentionSp"(p_session_key text,p_observed_stop_stamp text)
RETURNS TABLE("SessionKey" text,"NeedsAttention" boolean,"StopStamp" text) LANGUAGE plpgsql AS $$
BEGIN
 IF NULLIF(p_observed_stop_stamp,'') IS NULL THEN RAISE EXCEPTION 'ObservedStopStamp required'; END IF;
 UPDATE sessions SET needs_attention=false WHERE session_key=p_session_key AND NOT is_archived AND needs_attention AND last_non_running_utc COLLATE "C"=p_observed_stop_stamp COLLATE "C";
 RETURN QUERY SELECT s.session_key,s.needs_attention,s.last_non_running_utc FROM sessions s WHERE s.session_key=p_session_key AND NOT s.is_archived;
END $$;
CREATE OR REPLACE FUNCTION "Sessions_GetPendingAttentionSp"()
RETURNS TABLE("SessionID" integer,"SessionKey" text,"SessionName" text,"AgentName" text,"SessionKind" text,"Specialization" text,"NeedsAttention" boolean,"StopStamp" text,"AttentionGroup" text) LANGUAGE plpgsql AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM sessions WHERE needs_attention AND NOT is_archived AND NULLIF(last_non_running_utc,'') IS NULL) THEN RAISE EXCEPTION 'Pending attention requires stop stamp'; END IF;
 RETURN QUERY SELECT s.session_id,s.session_key,s.session_name,s.agent_name,s.session_kind,(COALESCE(NULLIF(s.data,''),'{}')::jsonb->'Specialization')::text,s.needs_attention,s.last_non_running_utc,
 CASE WHEN NULLIF(t.turn_key,'') IS NOT NULL AND t.terminal_message_id IS NULL AND s.state NOT IN('Running','Unknown') THEN 'Interrupted'
 ELSE CASE m.terminal_outcome_state WHEN 'Failed' THEN 'Errors' WHEN 'Completed' THEN CASE WHEN m.saved_work_resume THEN 'Resumed' ELSE 'Completed' END ELSE '' END END
 FROM sessions s LEFT JOIN LATERAL(SELECT turn_key,terminal_message_id FROM turns WHERE session_id=s.session_id ORDER BY display_order_at_utc DESC,first_message_id DESC LIMIT 1)t ON true
 LEFT JOIN messages m ON m.message_id=t.terminal_message_id WHERE s.needs_attention AND NOT s.is_archived ORDER BY s.last_non_running_utc::timestamptz,s.session_id;
END $$;
CREATE OR REPLACE FUNCTION "Sessions_ResetRunningForResumeSp"(p_capture_candidates boolean)
RETURNS TABLE("UpdatedCount" integer,"SessionKey" text,"TurnKey" text) LANGUAGE plpgsql AS $$
DECLARE stamp text:=to_char(timezone('utc',clock_timestamp()),'YYYY-MM-DD"T"HH24:MI:SS.US')||'0Z';
BEGIN
 RETURN QUERY WITH old AS MATERIALIZED(SELECT session_id,session_key,active_turn_key,is_archived FROM sessions WHERE state='Running' FOR UPDATE),
 changed AS(UPDATE sessions s SET needs_attention=true,state='Stopped',active_turn_key='',current_turn_started_utc='',last_non_running_utc=stamp,evaluate_admission_token=NULL,last_updated=timezone('utc',clock_timestamp()) FROM old WHERE s.session_id=old.session_id RETURNING old.session_key,old.active_turn_key,old.is_archived),
 total AS(SELECT count(*)::integer n FROM changed)
 SELECT total.n,c.session_key,c.active_turn_key FROM total LEFT JOIN changed c ON p_capture_candidates AND NOT c.is_archived AND NULLIF(c.active_turn_key,'') IS NOT NULL;
END $$;
CREATE OR REPLACE FUNCTION "Sessions_RequireScalarStorageV3Sp"(p_manifest_sha256 text)
RETURNS TABLE("Ready" boolean) LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM scalar_storage_release WHERE version='20261003-ScalarStorageV3' AND manifest_sha256=p_manifest_sha256 AND ready) THEN RAISE EXCEPTION 'ScalarStorageV3 upgrade required'; END IF;
 RETURN QUERY SELECT true;
END $$;

CREATE OR REPLACE FUNCTION "Messages_UpdateSessionEventStatusSp"(p_message_id integer,p_session_id integer,p_message_kind text,p_data text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 IF NULLIF(p_message_kind,'') IS NULL THEN RAISE EXCEPTION 'Callback MessageKind required'; END IF;
 UPDATE messages SET message_kind=p_message_kind,data=p_data,last_updated=timezone('utc',clock_timestamp()) WHERE message_id=p_message_id AND session_id=p_session_id AND role='Lifecycle' AND NULLIF(turn_id,'') IS NULL AND turn_row_id IS NULL AND terminal_outcome_state IS NULL AND saved_work_resume IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Callback lifecycle identity/ownership mismatch'; END IF;
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
