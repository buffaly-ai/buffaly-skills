CREATE OR REPLACE FUNCTION "Sessions_GetParentCandidatesSp"(p_search text, p_environment_user_key text, p_selected_key text)
RETURNS TABLE ("SessionID" integer, "SessionKey" text, "SessionName" text)
LANGUAGE sql STABLE AS $$
    SELECT s.session_id, s.session_key::text, s.session_name::text
    FROM sessions s
    WHERE p_environment_user_key IS NULL AND NOT s.is_archived
      AND (COALESCE(NULLIF(s.data,''),'{}')::jsonb -> 'Environment' IS NULL OR COALESCE(NULLIF(s.data,''),'{}')::jsonb -> 'Environment' ->> 'Mode' = 'Root')
      AND s.agent_name = 'buffaly-agent'
      AND (COALESCE(NULLIF(s.data,''),'{}')::jsonb -> 'Specialization' IS NULL OR COALESCE(NULLIF(s.data,''),'{}')::jsonb -> 'Specialization' = 'null'::jsonb)
      AND ((p_selected_key IS NOT NULL AND lower(s.session_key) = lower(p_selected_key))
        OR (p_selected_key IS NULL AND (p_search = '' OR
          strpos(lower(s.session_name), lower(p_search)) > 0 OR strpos(lower(s.session_key), lower(p_search)) > 0)))
    ORDER BY s.last_updated DESC, s.session_id DESC LIMIT 26;
$$;
