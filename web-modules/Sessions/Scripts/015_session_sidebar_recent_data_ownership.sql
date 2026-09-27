CREATE OR REPLACE FUNCTION sessions_get_sidebar_recent_page_sp(p_search text, p_skip_rows integer, p_num_rows integer)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"Data" text,
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
		candidate.compaction_provider, candidate.data, candidate.date_created, candidate.last_updated, candidate.last_updated,
		NULL::integer, NULL::integer, NULL::integer
	FROM candidate_rows candidate
	WHERE candidate.row_ordinal BETWEEN p_skip_rows + 1 AND p_skip_rows + p_num_rows + 1
	ORDER BY candidate.row_ordinal;
END;
$$;

DROP FUNCTION IF EXISTS "Sessions_GetSidebarRecentPageSp"(varchar, integer, integer);
CREATE FUNCTION "Sessions_GetSidebarRecentPageSp"(p_search varchar, p_skip_rows integer, p_num_rows integer)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"Data" text,
	"DateCreated" timestamp,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer)
LANGUAGE sql AS $$ SELECT * FROM sessions_get_sidebar_recent_page_sp(p_search::text, p_skip_rows, p_num_rows); $$;

SELECT record_schema_migration('015_session_sidebar_recent_data_ownership');
