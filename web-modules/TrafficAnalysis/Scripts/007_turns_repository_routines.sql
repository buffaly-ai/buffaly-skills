DROP FUNCTION IF EXISTS turns_get_paging_sp(integer,integer);
DROP FUNCTION IF EXISTS turns_get_by_session_id_sp(integer,integer,integer);
DROP FUNCTION IF EXISTS turns_get_count_by_session_id_sp(integer);
DROP FUNCTION IF EXISTS turns_get_by_session_idturn_keys_sp(integer,text);

CREATE OR REPLACE FUNCTION turns_get_paging_sp(p_skip_rows integer,p_num_rows integer)
RETURNS TABLE ("SessionID" integer,"TurnKey" text,"UserMessageID" integer,"AssistantMessageID" integer)
LANGUAGE sql AS $$
	WITH turn_rows AS
	(
		SELECT
			m.session_id AS session_id,
			m.turn_id AS turn_key,
			MIN(CASE WHEN m.role = 'User' THEN m.message_id END) AS user_message_id,
			MAX(CASE WHEN m.role = 'Assistant' THEN m.message_id END) AS assistant_message_id
		FROM messages m
		WHERE NULLIF(BTRIM(m.turn_id), '') IS NOT NULL
		GROUP BY m.session_id,m.turn_id
	)
	SELECT
		session_id AS "SessionID",
		turn_key AS "TurnKey",
		user_message_id AS "UserMessageID",
		assistant_message_id AS "AssistantMessageID"
	FROM turn_rows
	WHERE user_message_id IS NOT NULL
	ORDER BY user_message_id DESC
	OFFSET p_skip_rows
	LIMIT p_num_rows;
$$;

CREATE OR REPLACE FUNCTION turns_get_by_session_id_sp(p_session_id integer,p_skip_rows integer,p_num_rows integer)
RETURNS TABLE ("TurnKey" text,"UserMessageID" integer,"AssistantMessageID" integer)
LANGUAGE sql AS $$
	WITH turn_rows AS
	(
		SELECT
			m.turn_id AS turn_key,
			MIN(CASE WHEN m.role = 'User' THEN m.message_id END) AS user_message_id,
			MAX(CASE WHEN m.role = 'Assistant' THEN m.message_id END) AS assistant_message_id
		FROM messages m
		WHERE
			m.session_id = p_session_id
			AND NULLIF(BTRIM(m.turn_id), '') IS NOT NULL
		GROUP BY m.turn_id
	)
	SELECT
		turn_key AS "TurnKey",
		user_message_id AS "UserMessageID",
		assistant_message_id AS "AssistantMessageID"
	FROM turn_rows
	WHERE user_message_id IS NOT NULL
	ORDER BY user_message_id DESC
	OFFSET p_skip_rows
	LIMIT p_num_rows;
$$;

CREATE OR REPLACE FUNCTION turns_get_count_by_session_id_sp(p_session_id integer)
RETURNS TABLE ("TotalTurns" integer)
LANGUAGE sql AS $$
	SELECT COUNT(*)::integer AS "TotalTurns"
	FROM
	(
		SELECT m.turn_id
		FROM messages m
		WHERE
			m.session_id = p_session_id
			AND NULLIF(BTRIM(m.turn_id), '') IS NOT NULL
		GROUP BY m.turn_id
		HAVING SUM(CASE WHEN m.role = 'User' THEN 1 ELSE 0 END) > 0
	) t;
$$;

CREATE OR REPLACE FUNCTION turns_get_by_session_idturn_keys_sp(p_session_id integer,p_turn_keys_csv text)
RETURNS TABLE ("TurnKey" text,"UserMessageID" integer,"AssistantMessageID" integer)
LANGUAGE sql AS $$
	WITH requested_turn_keys AS
	(
		SELECT DISTINCT BTRIM(value) AS turn_key
		FROM regexp_split_to_table(COALESCE(p_turn_keys_csv, ''), ',') AS value
		WHERE NULLIF(BTRIM(value), '') IS NOT NULL
	),
	turn_rows AS
	(
		SELECT
			m.turn_id AS turn_key,
			MIN(CASE WHEN m.role = 'User' THEN m.message_id END) AS user_message_id,
			MAX(CASE WHEN m.role = 'Assistant' THEN m.message_id END) AS assistant_message_id
		FROM messages m
		INNER JOIN requested_turn_keys r
			ON r.turn_key = m.turn_id
		WHERE
			m.session_id = p_session_id
			AND NULLIF(BTRIM(m.turn_id), '') IS NOT NULL
		GROUP BY m.turn_id
	)
	SELECT
		turn_key AS "TurnKey",
		user_message_id AS "UserMessageID",
		assistant_message_id AS "AssistantMessageID"
	FROM turn_rows
	WHERE user_message_id IS NOT NULL
	ORDER BY user_message_id ASC;
$$;

SELECT record_schema_migration('007_turns_repository_routines');
