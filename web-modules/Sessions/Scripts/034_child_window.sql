CREATE OR REPLACE FUNCTION "Sessions_GetByParentSessionIDChildWindow_Sp"(p_parent_session_id integer, p_num_rows integer)
RETURNS TABLE ("SessionID" integer,"SessionKey" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Data" text,"SessionName" text,"ParentSessionID" integer,"IsArchived" boolean,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,"ActiveTurnKey" text,"CurrentTurnStartedUtc" text,"LastRunPulseUtc" text,"LastNonRunningUtc" text,"EvaluateAdmissionToken" text,"NeedsAttention" boolean) LANGUAGE plpgsql AS $$
BEGIN
 IF p_parent_session_id IS NULL OR p_parent_session_id <= 0 OR p_num_rows IS NULL OR p_num_rows < 1 OR p_num_rows > 201 THEN
  RAISE EXCEPTION 'A positive parent and child window of 1..201 are required.';
 END IF;
 RETURN QUERY SELECT r.* FROM get_session_rows() r
 WHERE r."ParentSessionID" = p_parent_session_id AND r."IsArchived" = false
 AND r."SessionKey" IS NOT NULL AND r."SessionKey" ~ U&'[^\0009\000A\000B\000C\000D\0020\0085\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000]'
 ORDER BY r."LastUpdated" DESC, r."SessionID" DESC LIMIT p_num_rows;
END;
$$;


CREATE OR REPLACE FUNCTION sessions_get_selected_child_window_sp(p_session_key text)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,
	"DateCreated" timestamp,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer,"SelectedSessionID" integer,"DirectChildrenTruncated" boolean)
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
			AND session_row.session_key IS NOT NULL AND session_row.session_key ~ U&'[^\0009\000A\000B\000C\000D\0020\0085\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000]'

	),
 selected_children AS
 (
  SELECT child.session_id, row_number() OVER (ORDER BY child.last_updated DESC, child.session_id DESC) AS child_ordinal
  FROM sessions child JOIN navigable_sessions selected ON selected.session_key=p_session_key AND child.parent_session_id=selected.session_id
  WHERE child.is_archived=false AND child.session_key IS NOT NULL AND child.session_key ~ U&'[^\0009\000A\000B\000C\000D\0020\0085\00A0\1680\2000\2001\2002\2003\2004\2005\2006\2007\2008\2009\200A\2028\2029\202F\205F\3000]'
  ORDER BY child.last_updated DESC, child.session_id DESC LIMIT 201
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
	),
	expanded_context AS
	(
		SELECT context_row.session_id FROM selected_context context_row
		UNION SELECT child.session_id FROM selected_children child WHERE child.child_ordinal<=200
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
		resolved.root_session_id, NULL::integer, hierarchy.hierarchy_depth, (SELECT session_id FROM selected_ancestors WHERE distance_from_selected=1), EXISTS(SELECT 1 FROM selected_children WHERE child_ordinal=201)
	FROM hierarchy
	JOIN navigable_sessions row ON row.session_id = hierarchy.session_id
	LEFT JOIN navigable_sessions parent ON parent.session_id = row.parent_session_id
	CROSS JOIN root_resolution resolved
	JOIN root_activity activity ON activity.root_session_id = resolved.root_session_id
	ORDER BY hierarchy.hierarchy_depth, row.last_updated DESC, row.session_id DESC
	LIMIT 5001;
END;
$$;
CREATE OR REPLACE FUNCTION "Sessions_GetSelectedChildWindow_Sp"(p_session_key text)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"State" text,"SessionKind" text,"Transport" text,
	"DateCreated" timestamp,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer,"SelectedSessionID" integer,"DirectChildrenTruncated" boolean)
 LANGUAGE sql AS $$ SELECT * FROM sessions_get_selected_child_window_sp(p_session_key); $$;
