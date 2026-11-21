-- Additive overload: ordinary three-argument Recent calls and sealed navigation payloads remain unchanged.
CREATE OR REPLACE FUNCTION "Sessions_GetSidebarRecentNavigationPage_Sp"(p_search text, p_skip_rows integer, p_num_rows integer, p_snoozed_only boolean)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,
	"DateCreated" timestamp,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer,"ShowInSessionList" boolean)
LANGUAGE plpgsql AS $$
BEGIN
	IF p_skip_rows < 0 THEN RAISE EXCEPTION 'SkipRows must be nonnegative.'; END IF;
	IF p_num_rows < 1 OR p_num_rows > 5000 THEN RAISE EXCEPTION 'NumRows must be between 1 and 5000.'; END IF;
	RETURN QUERY
	WITH RECURSIVE hidden_branches AS
	(
		SELECT session_id FROM sessions
		WHERE is_archived = false
			AND COALESCE(COALESCE(NULLIF(data,''),'{}')::jsonb #>> '{SidebarProfile,ShowInSessionList}','true') = 'false'
		UNION
		SELECT child.session_id FROM sessions child
		JOIN hidden_branches parent ON child.parent_session_id = parent.session_id
		WHERE child.is_archived = false
	), candidate_rows AS
	(
		SELECT session_row.*, parent.session_key AS parent_session_key,
			ROW_NUMBER() OVER (ORDER BY session_row.last_updated DESC, session_row.session_id DESC)::integer AS row_ordinal
		FROM sessions session_row
		LEFT JOIN sessions parent ON parent.session_id = session_row.parent_session_id
		WHERE session_row.is_archived = false
			AND session_row.session_key NOT IN ('Browser Profiles', 'browser-profiles')
			AND NOT EXISTS (SELECT 1 FROM hidden_branches hidden WHERE hidden.session_id = session_row.session_id)
			-- Apply membership before ranking/lookahead, retaining overdue and NeedsAttention pointers.
			AND (NOT p_snoozed_only OR session_row.pending_wake_process_id IS NOT NULL)
			AND (COALESCE(p_search, '') = '' OR COALESCE(session_row.session_key, '') ILIKE '%' || p_search || '%' OR COALESCE(session_row.session_name, '') ILIKE '%' || p_search || '%')
	), page_rows AS (SELECT * FROM candidate_rows WHERE row_ordinal BETWEEN p_skip_rows + 1 AND p_skip_rows + p_num_rows + 1)
	SELECT candidate.session_id, candidate.session_key, candidate.parent_session_id, candidate.parent_session_key,
		candidate.session_name, candidate.agent_name, candidate.project_name, candidate.project_file_path,
		candidate.provider, candidate.model_name, candidate.reasoning_level, candidate.prompt_context,
		candidate.compaction_provider, candidate.state,candidate.session_kind,candidate.transport, candidate.date_created, candidate.last_updated, candidate.last_updated,
		NULL::integer, NULL::integer, NULL::integer,true
	FROM page_rows candidate
	UNION ALL
	SELECT child.session_id,child.session_key,child.parent_session_id,child.parent_session_key,
		child.session_name,child.agent_name,child.project_name,child.project_file_path,
		child.provider,child.model_name,child.reasoning_level,child.prompt_context,child.compaction_provider,
		child.state,child.session_kind,child.transport,child.date_created,child.last_updated,child.last_updated,
		NULL::integer,NULL::integer,NULL::integer,false
	FROM (SELECT child.*,parent.session_key AS parent_session_key FROM sessions child
		JOIN page_rows parent ON child.parent_session_id=parent.session_id
		WHERE parent.row_ordinal <= p_skip_rows+p_num_rows AND child.is_archived=false
		AND COALESCE(COALESCE(NULLIF(child.data,''),'{}')::jsonb #>> '{SidebarProfile,ShowInSessionList}','true') = 'false'
		AND NULLIF(COALESCE(NULLIF(child.data,''),'{}')::jsonb #>> '{SidebarProfile,ObservedSessionUserStateKey}','') IS NOT NULL
		ORDER BY child.last_updated DESC,child.session_id DESC LIMIT 220) child
	ORDER BY 18 DESC,1 DESC;
END;
$$;
