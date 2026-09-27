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
	"Data" text,
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
			session_row.compaction_provider, session_row.data, session_row.date_created, session_row.last_updated,
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
			GREATEST(root.last_updated, COALESCE(MAX(child.last_updated), root.last_updated)) AS effective_last_updated
		FROM navigable_sessions root
		LEFT JOIN navigable_sessions child ON child.parent_session_id = root.session_id
		WHERE root.parent_session_id IS NULL
		GROUP BY root.session_id, root.last_updated
	),
	ranked_roots AS
	(
		SELECT activity.root_session_id, activity.effective_last_updated,
			ROW_NUMBER() OVER (ORDER BY activity.effective_last_updated DESC, activity.root_session_id DESC)::integer AS root_ordinal,
			COUNT(*) OVER ()::integer AS total_root_rows
		FROM root_activity activity
	),
	paged_roots AS
	(
		SELECT ranked.*, COUNT(*) OVER ()::integer AS root_rows_returned
		FROM ranked_roots ranked
		WHERE ranked.root_ordinal BETWEEN p_skip_roots + 1 AND p_skip_roots + p_num_roots
	),
	sidebar_rows AS
	(
		SELECT root.session_id, root.session_key, root.parent_session_id, NULL::text AS parent_session_key,
			root.session_name, root.agent_name, root.project_name, root.project_file_path,
			root.provider, root.model_name, root.reasoning_level, root.prompt_context, root.compaction_provider,
			root.data, root.date_created, root.last_updated AS own_last_updated, paged.effective_last_updated,
			paged.root_session_id, paged.root_ordinal, 1 AS hierarchy_depth, paged.root_rows_returned,
			paged.total_root_rows > p_skip_roots + p_num_roots AS has_more_root_rows, false AS is_search_bounded
		FROM paged_roots paged
		JOIN navigable_sessions root ON root.session_id = paged.root_session_id
		UNION ALL
		SELECT child.session_id, child.session_key, child.parent_session_id, parent.session_key,
			child.session_name, child.agent_name, child.project_name, child.project_file_path,
			child.provider, child.model_name, child.reasoning_level, child.prompt_context, child.compaction_provider,
			child.data, child.date_created, child.last_updated, child.last_updated,
			paged.root_session_id, paged.root_ordinal, 2, paged.root_rows_returned,
			paged.total_root_rows > p_skip_roots + p_num_roots, false
		FROM paged_roots paged
		JOIN navigable_sessions parent ON parent.session_id = paged.root_session_id
		JOIN navigable_sessions child ON child.parent_session_id = paged.root_session_id
	)
	SELECT row.session_id, row.session_key, row.parent_session_id, row.parent_session_key,
		row.session_name, row.agent_name, row.project_name, row.project_file_path,
		row.provider, row.model_name, row.reasoning_level, row.prompt_context, row.compaction_provider,
		row.data, row.date_created, row.own_last_updated, row.effective_last_updated,
		row.root_session_id, row.root_ordinal, row.hierarchy_depth, row.root_rows_returned,
		row.has_more_root_rows, row.is_search_bounded
	FROM sidebar_rows row
	ORDER BY row.root_ordinal, row.hierarchy_depth, row.own_last_updated DESC, row.session_id DESC;
END;
$$;

DROP FUNCTION IF EXISTS "Sessions_GetSidebarRootPageSp"(varchar, integer, integer);
CREATE FUNCTION "Sessions_GetSidebarRootPageSp"(p_search varchar, p_skip_roots integer, p_num_roots integer)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"ParentSessionKey" text,
	"SessionName" text,"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,
	"ModelName" text,"ReasoningLevel" text,"PromptContext" text,"CompactionProvider" text,"Data" text,
	"DateCreated" timestamp,"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer,"RootRowsReturned" integer,
	"HasMoreRootRows" boolean,"IsSearchBounded" boolean)
LANGUAGE sql AS $$ SELECT * FROM sessions_get_sidebar_root_page_sp(p_search::text, p_skip_roots, p_num_roots); $$;

SELECT record_schema_migration('014_session_sidebar_search_match_cap');
