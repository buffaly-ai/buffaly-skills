-- Additive scalar reader. Preserve the sealed scalar baseline and lifecycle writers.
CREATE OR REPLACE FUNCTION "Sessions_GetBySessionKeysSidebarStatus_Sp"(p_session_keys_json text)
RETURNS TABLE ("SessionKey" text, "State" text, "CurrentTurnStartedUtc" text)
LANGUAGE plpgsql AS $$
DECLARE keys jsonb := p_session_keys_json::jsonb;
BEGIN
    IF keys IS NULL OR jsonb_typeof(keys) <> 'array' THEN
        RAISE EXCEPTION 'Session keys must be a JSON array';
    END IF;
    IF EXISTS (SELECT 1 FROM jsonb_array_elements(keys) AS k(value)
        WHERE jsonb_typeof(k.value) <> 'string' OR length(k.value #>> '{}') NOT BETWEEN 1 AND 255) THEN
        RAISE EXCEPTION 'Session keys must be nonempty strings of at most 255 characters';
    END IF;
    RETURN QUERY SELECT s.session_key, s.state, s.current_turn_started_utc
        FROM sessions AS s WHERE NOT s.is_archived AND EXISTS
        (SELECT 1 FROM jsonb_array_elements_text(keys) AS k(value) WHERE s.session_key = k.value);
END;
$$;
