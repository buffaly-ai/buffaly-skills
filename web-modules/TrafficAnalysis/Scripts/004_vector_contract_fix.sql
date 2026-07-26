DROP FUNCTION IF EXISTS fragments_get_most_similar1_by_date_range_native(text,double precision,timestamptz,timestamptz,character varying);
DROP FUNCTION IF EXISTS fragments_get_most_similar1_by_date_range_native(text,double precision,timestamp,timestamp,character varying);
DROP FUNCTION IF EXISTS fragments_get_most_similar1_native(text,double precision,character varying);

CREATE OR REPLACE FUNCTION fragments_get_most_similar1_native(
	p_embeddings text,
	p_threshold double precision,
	p_embedding_model varchar(255) DEFAULT 'text-embedding-3-small'
)
RETURNS TABLE (
	"FragmentID" integer,
	"Fragment" text,
	"ParentFragmentID" integer,
	"FragmentKey" varchar(255),
	"Data" text,
	"DateCreated" timestamp,
	"LastUpdated" timestamp,
	"Similarity" double precision
)
LANGUAGE plpgsql
AS $$
DECLARE
	v_embedding_id integer;
	v_query_vector vector(1536);
BEGIN
	SELECT e.embedding_id INTO v_embedding_id
	FROM embeddings e
	WHERE e.embedding_model = p_embedding_model
	   OR (p_embedding_model = 'text-embedding-3-small' AND e.embedding_model = 'OpenAI3Small')
	ORDER BY CASE WHEN e.embedding_model = p_embedding_model THEN 0 ELSE 1 END, e.embedding_id ASC
	LIMIT 1;

	IF v_embedding_id IS NULL THEN
		RAISE EXCEPTION 'No supported embedding model was found for native session semantic search.';
	END IF;

	v_query_vector := p_embeddings::vector(1536);

	RETURN QUERY
	SELECT f.fragment_id AS "FragmentID",
		f.fragment AS "Fragment",
		f.parent_fragment_id AS "ParentFragmentID",
		f.fragment_key AS "FragmentKey",
		f.data AS "Data",
		f.date_created AS "DateCreated",
		f.last_updated AS "LastUpdated",
		(1 - (v.vector_value <=> v_query_vector))::double precision AS "Similarity"
	FROM fragments f
	JOIN fragment_vectors_native v ON v.fragment_id = f.fragment_id AND v.embedding_id = v_embedding_id
	WHERE (1 - (v.vector_value <=> v_query_vector)) >= p_threshold
	ORDER BY v.vector_value <=> v_query_vector, f.fragment_id ASC;
END;
$$;

CREATE OR REPLACE FUNCTION fragments_get_most_similar1_by_date_range_native(
	p_embeddings text,
	p_threshold double precision,
	p_start_utc timestamptz DEFAULT NULL,
	p_end_utc timestamptz DEFAULT NULL,
	p_embedding_model varchar(255) DEFAULT 'text-embedding-3-small'
)
RETURNS TABLE (
	"FragmentID" integer,
	"Fragment" text,
	"ParentFragmentID" integer,
	"FragmentKey" varchar(255),
	"Data" text,
	"DateCreated" timestamp,
	"LastUpdated" timestamp,
	"Similarity" double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
	RETURN QUERY
	SELECT result."FragmentID",
		result."Fragment",
		result."ParentFragmentID",
		result."FragmentKey",
		result."Data",
		result."DateCreated",
		result."LastUpdated",
		result."Similarity"
	FROM fragments_get_most_similar1_native(p_embeddings, p_threshold, p_embedding_model) result
	WHERE (p_start_utc IS NULL OR result."DateCreated" >= (p_start_utc AT TIME ZONE 'utc'))
	  AND (p_end_utc IS NULL OR result."DateCreated" <= (p_end_utc AT TIME ZONE 'utc'))
	ORDER BY result."Similarity" DESC, result."FragmentID" ASC;
END;
$$;


DROP FUNCTION IF EXISTS fragments_get_most_similar1_native_sp(text,double precision,character varying);
CREATE OR REPLACE FUNCTION fragments_get_most_similar1_native_sp(p_embeddings text,p_threshold double precision,p_embedding_model varchar(255) DEFAULT 'text-embedding-3-small')
RETURNS TABLE ("FragmentID" integer,"Fragment" text,"ParentFragmentID" integer,"FragmentKey" varchar(255),"Data" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Similarity" double precision)
LANGUAGE sql AS $$ SELECT * FROM fragments_get_most_similar1_native(p_embeddings,p_threshold,p_embedding_model); $$;

DROP FUNCTION IF EXISTS fragments_get_most_similar1_by_date_range_native_sp(text,double precision,timestamp,timestamp,character varying);
DROP FUNCTION IF EXISTS fragments_get_most_similar1_by_date_range_native_sp(text,double precision,timestamptz,timestamptz,character varying);
CREATE OR REPLACE FUNCTION fragments_get_most_similar1_by_date_range_native_sp(p_embeddings text,p_threshold double precision,p_start_utc timestamp DEFAULT NULL,p_end_utc timestamp DEFAULT NULL,p_embedding_model varchar(255) DEFAULT 'text-embedding-3-small')
RETURNS TABLE ("FragmentID" integer,"Fragment" text,"ParentFragmentID" integer,"FragmentKey" varchar(255),"Data" text,"DateCreated" timestamp,"LastUpdated" timestamp,"Similarity" double precision)
LANGUAGE sql AS $$ SELECT * FROM fragments_get_most_similar1_by_date_range_native(p_embeddings,p_threshold,p_start_utc AT TIME ZONE 'utc',p_end_utc AT TIME ZONE 'utc',p_embedding_model); $$;

SELECT record_schema_migration('004_vector_contract_fix');