-- New PostgreSQL sessions are authoritative empty histories immediately at creation.
CREATE OR REPLACE FUNCTION insert_session_sp(p_session_key text,p_agent_name text,p_project_name text,p_project_file_path text,p_provider text,p_model_name text,p_reasoning_level text,p_prompt_context text,p_data text,p_session_name text,p_parent_session_id integer,p_is_archived boolean)
RETURNS TABLE ("SessionID" integer) LANGUAGE plpgsql AS $$
DECLARE now_utc timestamp := timezone('utc',clock_timestamp()); created_session_id integer;
BEGIN
	INSERT INTO sessions(session_key,agent_name,project_name,project_file_path,provider,model_name,reasoning_level,prompt_context,date_created,last_updated,data,session_name,parent_session_id,is_archived)
	VALUES(p_session_key,p_agent_name,p_project_name,p_project_file_path,p_provider,p_model_name,p_reasoning_level,p_prompt_context,now_utc,now_utc,p_data,p_session_name,p_parent_session_id,p_is_archived)
	RETURNING session_id INTO created_session_id;
	INSERT INTO session_turn_state(session_id,next_order_key,committed_revision,history_generation,active_turn_key,active_turn_identity,authority_status,authority_contract_version,writer_fence,last_updated_at_utc)
	VALUES(created_session_id,1,0,1,NULL,NULL,'Authoritative',1,false,now_utc);
	RETURN QUERY SELECT created_session_id;
END $$;

CREATE OR REPLACE FUNCTION "InsertSessionSp"(p_session_key text,p_agent_name text,p_project_name text,p_project_file_path text,p_provider text,p_model_name text,p_reasoning_level text,p_prompt_context text,p_data text,p_session_name text,p_parent_session_id integer,p_is_archived boolean)
RETURNS TABLE ("SessionID" integer) LANGUAGE sql AS $$
SELECT * FROM insert_session_sp(p_session_key,p_agent_name,p_project_name,p_project_file_path,p_provider,p_model_name,p_reasoning_level,p_prompt_context,p_data,p_session_name,p_parent_session_id,p_is_archived);
$$;

CREATE TABLE IF NOT EXISTS authoritative_turns_contract_artifacts(contract_name text PRIMARY KEY,definition_hash bytea NOT NULL);
INSERT INTO authoritative_turns_contract_artifacts(contract_name,definition_hash) VALUES
('AuthoritativeSessionCreation',sha256(convert_to(pg_get_functiondef('insert_session_sp(text,text,text,text,text,text,text,text,text,text,integer,boolean)'::regprocedure),'UTF8'))),
('AuthoritativeSessionCreationCanonical',sha256(convert_to(pg_get_functiondef('"InsertSessionSp"(text,text,text,text,text,text,text,text,text,text,integer,boolean)'::regprocedure),'UTF8')))
ON CONFLICT(contract_name) DO UPDATE SET definition_hash=EXCLUDED.definition_hash;

SELECT record_schema_migration('026_authoritative_turns_session_creation');
