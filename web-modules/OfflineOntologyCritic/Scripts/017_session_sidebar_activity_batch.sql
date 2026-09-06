CREATE OR REPLACE FUNCTION sessions_get_sidebar_activity_batch_sp(p_session_keys_json text)
RETURNS TABLE (
	"SessionID" integer,
	"SessionKey" text,
	"SessionName" text,
	"AgentName" text,
	"Data" text,
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
			session_row.data,
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
		requested.data,
		requested.last_updated,
		CASE WHEN requested.parent_session_id IS NULL THEN root_activity.effective_last_updated ELSE requested.last_updated END
	FROM requested_sessions requested
	LEFT JOIN root_activity
	ON root_activity.root_session_id = requested.session_id
	ORDER BY requested.request_ordinal;
END;
$$;

DROP FUNCTION IF EXISTS "Sessions_GetSidebarActivityBatchSp"(varchar);
CREATE FUNCTION "Sessions_GetSidebarActivityBatchSp"(p_session_keys_json varchar)
RETURNS TABLE (
	"SessionID" integer,
	"SessionKey" text,
	"SessionName" text,
	"AgentName" text,
	"Data" text,
	"OwnLastUpdated" timestamp,
	"EffectiveLastUpdated" timestamp)
LANGUAGE sql AS $$ SELECT * FROM sessions_get_sidebar_activity_batch_sp(p_session_keys_json::text); $$;

SELECT record_schema_migration('017_session_sidebar_activity_batch');
