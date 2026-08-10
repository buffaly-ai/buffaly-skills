CREATE INDEX IF NOT EXISTS ix_sessions_parent_session_id_is_archived_last_updated_session_id
ON sessions (parent_session_id, is_archived, last_updated DESC, session_id DESC);

CREATE OR REPLACE FUNCTION sessions_get_sidebar_root_page_sp(p_search text, p_skip_roots integer, p_num_roots integer)
RETURNS TABLE (
	"SessionID" integer,
	"SessionKey" text,
	"ParentSessionID" integer,
	"SessionName" text,
	"AgentName" text,
	"ProjectName" text,
	"ProjectFilePath" text,
	"Provider" text,
	"ModelName" text,
	"ReasoningLevel" text,
	"PromptContext" text,
	"Data" text,
	"DateCreated" timestamp,
	"OwnLastUpdated" timestamp,
	"EffectiveLastUpdated" timestamp,
	"IsArchived" boolean,
	"RootSessionID" integer,
	"RootOrdinal" integer,
	"HierarchyDepth" integer,
	"RootRowsReturned" integer,
	"HasMoreRootRows" boolean)
LANGUAGE plpgsql AS $$
BEGIN
	IF p_skip_roots < 0 THEN
		RAISE EXCEPTION 'SkipRoots must be nonnegative.';
	END IF;
	IF p_num_roots < 1 OR p_num_roots > 100 THEN
		RAISE EXCEPTION 'NumRoots must be between 1 and 100.';
	END IF;

	RETURN QUERY
	WITH root_activity AS
	(
		SELECT root.session_id AS root_session_id,
			GREATEST(root.last_updated, COALESCE(MAX(child.last_updated), root.last_updated)) AS effective_last_updated
		FROM sessions root
		LEFT JOIN sessions child
			ON child.parent_session_id = root.session_id
			AND child.is_archived = false
		WHERE root.parent_session_id IS NULL
			AND root.is_archived = false
			AND
			(
				COALESCE(root.session_key, '') ILIKE '%' || COALESCE(p_search, '') || '%'
				OR COALESCE(root.session_name, '') ILIKE '%' || COALESCE(p_search, '') || '%'
				OR EXISTS
				(
					SELECT 1
					FROM sessions matching_child
					WHERE matching_child.parent_session_id = root.session_id
						AND matching_child.is_archived = false
						AND
						(
							COALESCE(matching_child.session_key, '') ILIKE '%' || COALESCE(p_search, '') || '%'
							OR COALESCE(matching_child.session_name, '') ILIKE '%' || COALESCE(p_search, '') || '%'
						)
				)
			)
		GROUP BY root.session_id, root.last_updated
	),
	ranked_roots AS
	(
		SELECT root_session_id,
			effective_last_updated,
			ROW_NUMBER() OVER (ORDER BY effective_last_updated DESC, root_session_id DESC)::integer AS root_ordinal,
			COUNT(*) OVER ()::integer AS total_root_rows
		FROM root_activity
	),
	paged_roots AS
	(
		SELECT root_session_id,
			effective_last_updated,
			root_ordinal,
			total_root_rows,
			COUNT(*) OVER ()::integer AS root_rows_returned
		FROM ranked_roots
		WHERE root_ordinal BETWEEN p_skip_roots + 1 AND p_skip_roots + p_num_roots
	),
	sidebar_rows AS
	(
		SELECT root.session_id, root.session_key, root.parent_session_id, root.session_name,
			root.agent_name, root.project_name, root.project_file_path, root.provider, root.model_name,
			root.reasoning_level, root.prompt_context, root.data, root.date_created,
			root.last_updated AS own_last_updated, paged.effective_last_updated, root.is_archived,
			paged.root_session_id, paged.root_ordinal, 1 AS hierarchy_depth,
			paged.root_rows_returned, paged.total_root_rows > p_skip_roots + p_num_roots AS has_more_root_rows
		FROM paged_roots paged
		JOIN sessions root ON root.session_id = paged.root_session_id

		UNION ALL

		SELECT child.session_id, child.session_key, child.parent_session_id, child.session_name,
			child.agent_name, child.project_name, child.project_file_path, child.provider, child.model_name,
			child.reasoning_level, child.prompt_context, child.data, child.date_created,
			child.last_updated, child.last_updated, child.is_archived,
			paged.root_session_id, paged.root_ordinal, 2,
			paged.root_rows_returned, paged.total_root_rows > p_skip_roots + p_num_roots
		FROM paged_roots paged
		JOIN sessions child
			ON child.parent_session_id = paged.root_session_id
			AND child.is_archived = false
			AND
			(
				COALESCE(p_search, '') = ''
				OR COALESCE(child.session_key, '') ILIKE '%' || COALESCE(p_search, '') || '%'
				OR COALESCE(child.session_name, '') ILIKE '%' || COALESCE(p_search, '') || '%'
			)
	)
	SELECT row.session_id, row.session_key, row.parent_session_id, row.session_name,
		row.agent_name, row.project_name, row.project_file_path, row.provider, row.model_name,
		row.reasoning_level, row.prompt_context, row.data, row.date_created,
		row.own_last_updated, row.effective_last_updated, row.is_archived,
		row.root_session_id, row.root_ordinal, row.hierarchy_depth,
		row.root_rows_returned, row.has_more_root_rows
	FROM sidebar_rows row
	ORDER BY row.root_ordinal, row.hierarchy_depth, row.own_last_updated DESC, row.session_id DESC;
END;
$$;

CREATE OR REPLACE FUNCTION "Sessions_GetSidebarRootPageSp"(p_search varchar, p_skip_roots integer, p_num_roots integer)
RETURNS TABLE (
	"SessionID" integer,"SessionKey" text,"ParentSessionID" integer,"SessionName" text,
	"AgentName" text,"ProjectName" text,"ProjectFilePath" text,"Provider" text,"ModelName" text,
	"ReasoningLevel" text,"PromptContext" text,"Data" text,"DateCreated" timestamp,
	"OwnLastUpdated" timestamp,"EffectiveLastUpdated" timestamp,"IsArchived" boolean,
	"RootSessionID" integer,"RootOrdinal" integer,"HierarchyDepth" integer,
	"RootRowsReturned" integer,"HasMoreRootRows" boolean)
LANGUAGE sql AS $$
	SELECT * FROM sessions_get_sidebar_root_page_sp(p_search::text, p_skip_roots, p_num_roots);
$$;

SELECT record_schema_migration('010_session_sidebar_root_page');
