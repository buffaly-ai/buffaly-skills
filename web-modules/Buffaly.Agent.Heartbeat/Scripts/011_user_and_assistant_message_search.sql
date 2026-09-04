-- Combined user/assistant message content search for Exact Message Search.
-- Postgres compatibility twin of Messages_GetByUserAndAssistantSearch_Sp.
-- Empty p_search lists newest matching-role rows. Recency scopes bound by message_id DESC.
CREATE OR REPLACE FUNCTION messages_get_by_user_and_assistant_search_sp(
	p_search text,
	p_role_filter text,
	p_max_rows integer,
	p_search_scope text,
	p_max_message_scan_count integer
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
	"CompactionEpochKey" text
)
LANGUAGE plpgsql
AS $$
DECLARE
	v_search text := TRIM(COALESCE(p_search, ''));
	v_role text := LOWER(TRIM(COALESCE(p_role_filter, 'both')));
	v_scope text := LOWER(TRIM(COALESCE(p_search_scope, 'recent')));
	v_max_rows integer := COALESCE(p_max_rows, 25);
	v_scan integer := COALESCE(p_max_message_scan_count, 0);
BEGIN
	IF v_role NOT IN ('both', 'user', 'assistant') THEN
		RAISE EXCEPTION 'RoleFilter must be both, user, or assistant.';
	END IF;
	IF v_max_rows < 1 OR v_max_rows > 200 THEN
		RAISE EXCEPTION 'MaxRows must be between 1 and 200.';
	END IF;
	IF v_scope NOT IN ('recent', 'deep', 'all') THEN
		RAISE EXCEPTION 'SearchScope must be recent, deep, or all.';
	END IF;
	IF v_scope = 'recent' THEN
		IF v_scan <= 0 THEN
			v_scan := 2500;
		END IF;
		IF v_scan > 25000 THEN
			RAISE EXCEPTION 'Recent message search cannot scan more than 25000 messages.';
		END IF;
	ELSIF v_scope = 'deep' THEN
		IF v_scan <= 0 THEN
			v_scan := 1000000;
		END IF;
		IF v_scan > 2000000 THEN
			RAISE EXCEPTION 'Deep message search cannot scan more than 2000000 messages.';
		END IF;
	END IF;

	RETURN QUERY
	WITH user_candidates AS (
		SELECT m.message_id
		FROM messages m
		WHERE v_scope <> 'all'
			AND (v_role = 'both' OR v_role = 'user')
			AND m.role = 'user'
		ORDER BY m.message_id DESC
		LIMIT CASE WHEN v_scope = 'all' THEN 0 ELSE v_scan END
	),
	assistant_candidates AS (
		SELECT m.message_id
		FROM messages m
		WHERE v_scope <> 'all'
			AND (v_role = 'both' OR v_role = 'assistant')
			AND m.role = 'assistant'
		ORDER BY m.message_id DESC
		LIMIT CASE WHEN v_scope = 'all' THEN 0 ELSE v_scan END
	),
	recent_candidates AS (
		SELECT message_id FROM user_candidates
		UNION
		SELECT message_id FROM assistant_candidates
	)
	SELECT
		s.session_key,
		s.session_name,
		r."MessageID",
		r."SessionID",
		r."SequenceNumber",
		r."Role",
		r."Content",
		r."ToolName",
		r."ToolArguments",
		r."CallID",
		r."DateCreated",
		r."LastUpdated",
		r."Data",
		r."IsCompacted",
		r."CompactionEpoch",
		r."MessageKey",
		r."TurnID",
		r."CompactionEpochKey"
	FROM message_rows r
	INNER JOIN sessions s ON s.session_id = r."SessionID"
	WHERE
		s.session_key NOT LIKE '%level-two%'
		AND LTRIM(r."Content") NOT ILIKE '[label: Level 2]%'
		AND LTRIM(r."Content") NOT ILIKE '[timeline-label: Level 2]%'
		AND (
			(v_scope = 'all' AND (
				(v_role = 'both' AND r."Role" IN ('user', 'assistant'))
				OR (v_role = 'user' AND r."Role" = 'user')
				OR (v_role = 'assistant' AND r."Role" = 'assistant')
			))
			OR (v_scope <> 'all' AND r."MessageID" IN (SELECT message_id FROM recent_candidates))
		)
		AND (v_search = '' OR r."Content" ILIKE '%' || v_search || '%')
	ORDER BY r."MessageID" DESC
	LIMIT v_max_rows;
END;
$$;
