-- Derived expression index; no second policy owner or application-maintained column.
CREATE INDEX IF NOT EXISTS ix_sessions_navigation_visibility ON sessions
 ((COALESCE(COALESCE(NULLIF(data,''),'{}')::jsonb #>> '{SidebarProfile,ShowInSessionList}','true')),is_archived,parent_session_id,session_id);
-- Additive sidebar readers; historical sealed functions remain unchanged.
CREATE OR REPLACE FUNCTION "Sessions_GetSidebarRootNavigationPage_Sp"(p_search text, p_skip_roots integer, p_num_roots integer)
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
		-- Configured hidden branches are excluded before LIMIT, retaining ordinary ancestors.
		hidden_branches AS
		(
			SELECT session_row.session_id FROM searchable_sessions session_row
			WHERE COALESCE(COALESCE(NULLIF(session_row.data,''),'{}')::jsonb #>> '{SidebarProfile,ShowInSessionList}','true') = 'false'
			UNION
			SELECT child.session_id FROM searchable_sessions child
			JOIN hidden_branches parent ON child.parent_session_id = parent.session_id
		),
		matching_sessions AS
		(
			SELECT session_row.session_id, session_row.parent_session_id, session_row.last_updated
			FROM searchable_sessions session_row
			WHERE (COALESCE(session_row.session_key, '') ILIKE '%' || p_search || '%'
				OR COALESCE(session_row.session_name, '') ILIKE '%' || p_search || '%')
				AND NOT EXISTS (SELECT 1 FROM hidden_branches hidden WHERE hidden.session_id = session_row.session_id)
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
	),
	root_activity AS
	(
		SELECT root.session_id AS root_session_id,
			GREATEST(root.last_updated, COALESCE(MAX(child.last_updated), root.last_updated)) AS effective_last_updated,
			COUNT(child.session_id)::integer AS direct_child_count
		FROM navigable_sessions root
		LEFT JOIN navigable_sessions child ON child.parent_session_id = root.session_id
		WHERE root.parent_session_id IS NULL
			AND COALESCE(COALESCE(NULLIF(root.data,''),'{}')::jsonb #>> '{SidebarProfile,ShowInSessionList}', 'true') <> 'false'
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

CREATE OR REPLACE FUNCTION "Sessions_GetSidebarRecentNavigationPage_Sp"(p_search text, p_skip_rows integer, p_num_rows integer)
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


-- Additive navigation projection; do not edit guarded historical routines.
CREATE OR REPLACE FUNCTION "Sessions_GetPendingAttentionNavigationSp"()
RETURNS TABLE("SessionID" integer,"SessionKey" text,"SessionName" text,"AgentName" text,"SessionKind" text,"Specialization" text,"NeedsAttention" boolean,"StopStamp" text,"AttentionGroup" text,"ShowInNextUpdate" boolean) LANGUAGE plpgsql AS $$
BEGIN
 IF EXISTS(SELECT 1 FROM sessions WHERE needs_attention AND NOT is_archived AND NULLIF(last_non_running_utc,'') IS NULL) THEN RAISE EXCEPTION 'Pending attention requires stop stamp'; END IF;
 RETURN QUERY SELECT s.session_id,s.session_key,s.session_name,s.agent_name,s.session_kind,(COALESCE(NULLIF(s.data,''),'{}')::jsonb->'Specialization')::text,s.needs_attention,s.last_non_running_utc,
 CASE WHEN NULLIF(t.turn_key,'') IS NOT NULL AND t.terminal_message_id IS NULL AND s.state NOT IN('Running','Unknown') THEN 'Interrupted'
 ELSE CASE m.terminal_outcome_state WHEN 'Failed' THEN 'Errors' WHEN 'Completed' THEN CASE WHEN m.saved_work_resume THEN 'Resumed' ELSE 'Completed' END ELSE '' END END,
  COALESCE(COALESCE(NULLIF(s.data,''),'{}')::jsonb#>>'{SidebarProfile,ShowInNextUpdate}','true') <> 'false'
 FROM sessions s LEFT JOIN LATERAL(SELECT turn_key,terminal_message_id FROM turns WHERE session_id=s.session_id ORDER BY display_order_at_utc DESC,first_message_id DESC LIMIT 1)t ON true
 LEFT JOIN messages m ON m.message_id=t.terminal_message_id WHERE s.needs_attention AND NOT s.is_archived ORDER BY s.last_non_running_utc::timestamptz,s.session_id;
END $$;
