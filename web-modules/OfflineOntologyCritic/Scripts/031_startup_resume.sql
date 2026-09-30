CREATE OR REPLACE FUNCTION "Sessions_ResetRunningForResumeSp"(p_capture_candidates boolean)
RETURNS TABLE("UpdatedCount" integer,"SessionKey" text,"TurnKey" text)
LANGUAGE plpgsql AS $$
DECLARE v_count integer;
BEGIN
 IF NOT p_capture_candidates THEN
  UPDATE sessions SET data=(data::jsonb || jsonb_build_object('RuntimeStatus','Loaded','IsRunning',false,'ActiveTurnKey','','CurrentTurnStartedUtc','','LastNonRunningUtc',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'LastRuntimeStateUpdatedUtc',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')))::text,last_updated=clock_timestamp() AT TIME ZONE 'UTC'
  WHERE data::jsonb->>'RuntimeStatus'='Running';
  GET DIAGNOSTICS v_count=ROW_COUNT;
  RETURN QUERY SELECT v_count,NULL::text,NULL::text;
 ELSE
  RETURN QUERY
  WITH old AS MATERIALIZED (
   SELECT session_id,session_key,data::jsonb->>'ActiveTurnKey' AS turn_key,is_archived
   FROM sessions WHERE data::jsonb->>'RuntimeStatus'='Running'
  ), changed AS (
   UPDATE sessions s SET data=(s.data::jsonb || jsonb_build_object('RuntimeStatus','Loaded','IsRunning',false,'ActiveTurnKey','','CurrentTurnStartedUtc','','LastNonRunningUtc',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'LastRuntimeStateUpdatedUtc',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')))::text,last_updated=clock_timestamp() AT TIME ZONE 'UTC'
   FROM old WHERE s.session_id=old.session_id AND s.data::jsonb->>'RuntimeStatus'='Running'
   RETURNING old.session_key,old.turn_key,old.is_archived
  ) SELECT totals.n,c.session_key,c.turn_key FROM (SELECT count(*)::integer n FROM changed) totals
  LEFT JOIN changed c ON NOT c.is_archived AND nullif(c.turn_key,'') IS NOT NULL;
 END IF;
END $$;
