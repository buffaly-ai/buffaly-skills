CREATE OR REPLACE FUNCTION "SessionArtifacts_GetByOwnerKeyResponseFeedback_Sp"(
 p_owner_key text, p_session_id integer, p_message_key text, p_mode text,
 p_vote text, p_since_utc text, p_before_id integer, p_num_rows integer)
RETURNS TABLE ("SessionArtifactID" integer,"SessionID" integer,"SourceMessageID" integer,"ArtifactType" text,
 "ArtifactName" text,"FilePath" text,"Summary" text,"ContentData" text,"MimeType" text,
 "DateCreated" timestamp,"LastUpdated" timestamp,"Data" text)
LANGUAGE plpgsql AS $$
BEGIN
 IF p_owner_key IS NULL OR p_mode IS NULL OR p_mode NOT IN ('current','events') OR p_before_id < 0 OR p_num_rows NOT BETWEEN 1 AND 201 THEN
  RAISE EXCEPTION 'Invalid feedback page.';
 END IF;
 RETURN QUERY
 WITH owned AS (
  SELECT a.*, row_number() OVER (PARTITION BY a.artifact_name ORDER BY a.session_artifact_id DESC) AS feedback_rank
  FROM session_artifacts a
  WHERE a.artifact_type = 'ResponseFeedback.v1' AND a.content_data::jsonb->>'OwnerKey' = p_owner_key
   AND (p_session_id IS NULL OR a.session_id = p_session_id)
   AND (p_message_key IS NULL OR a.content_data::jsonb->>'MessageKey' = p_message_key)
 )
 SELECT a.session_artifact_id,a.session_id,a.source_message_id,a.artifact_type,a.artifact_name,a.file_path,a.summary,
  a.content_data,a.mime_type,a.date_created,a.last_updated,a.data
 FROM owned a
 WHERE (p_mode = 'events' OR a.feedback_rank = 1)
  AND (p_mode = 'events' OR a.content_data::jsonb->>'Vote' <> 'clear')
  AND (p_vote IS NULL OR a.content_data::jsonb->>'Vote' = p_vote)
  AND (p_since_utc IS NULL OR a.content_data::jsonb->>'RecordedUtc' >= p_since_utc)
  AND (p_before_id = 0 OR a.session_artifact_id < p_before_id)
 ORDER BY a.session_artifact_id DESC LIMIT p_num_rows;
END;
$$;
