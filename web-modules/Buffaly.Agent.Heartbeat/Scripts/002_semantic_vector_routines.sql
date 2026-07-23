CREATE OR REPLACE FUNCTION fragment_vectors_native_upsert(
	p_embedding_id integer,
	p_fragment_id integer,
	p_vector_dimensions integer,
	p_vector text,
	p_embedding_hash varchar(64) DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
	IF p_vector_dimensions <> 1536 THEN
		RAISE EXCEPTION 'fragment_vectors_native_upsert requires vector(1536).';
	END IF;

	INSERT INTO fragment_vectors_native (fragment_id, embedding_id, vector_dimensions, embedding_hash, vector_value, last_embedded_utc)
	VALUES (p_fragment_id, p_embedding_id, p_vector_dimensions, p_embedding_hash, p_vector::vector(1536), now() AT TIME ZONE 'utc')
	ON CONFLICT (fragment_id, embedding_id) DO UPDATE
	SET vector_dimensions = EXCLUDED.vector_dimensions,
		embedding_hash = EXCLUDED.embedding_hash,
		vector_value = EXCLUDED.vector_value,
		last_embedded_utc = EXCLUDED.last_embedded_utc;
END;
$$;

CREATE OR REPLACE FUNCTION fragment_vectors_native_get_by_fragment_id(
	p_fragment_id integer,
	p_embedding_id integer
)
RETURNS TABLE (
	fragment_id integer,
	embedding_id integer,
	vector_dimensions integer,
	embedding_hash varchar(64),
	vector_json text,
	last_embedded_utc timestamp
)
LANGUAGE sql
AS $$
	SELECT fragment_id, embedding_id, vector_dimensions, embedding_hash, vector_value::text AS vector_json, last_embedded_utc
	FROM fragment_vectors_native
	WHERE fragment_id = p_fragment_id AND embedding_id = p_embedding_id;
$$;

CREATE OR REPLACE FUNCTION fragment_vectors_native_remove_by_fragment_id(
	p_fragment_id integer,
	p_embedding_id integer
)
RETURNS void
LANGUAGE sql
AS $$
	DELETE FROM fragment_vectors_native
	WHERE fragment_id = p_fragment_id AND embedding_id = p_embedding_id;
$$;

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
	SELECT f.fragment_id,
		f.fragment,
		f.parent_fragment_id,
		f.fragment_key,
		f.data,
		f.date_created,
		f.last_updated,
		(1 - (v.vector_value <=> v_query_vector))::double precision AS similarity
	FROM fragments f
	JOIN fragment_vectors_native v ON v.fragment_id = f.fragment_id AND v.embedding_id = v_embedding_id
	WHERE (1 - (v.vector_value <=> v_query_vector)) >= p_threshold
	ORDER BY v.vector_value <=> v_query_vector, f.fragment_id ASC;
END;
$$;

CREATE OR REPLACE FUNCTION fragments_get_most_similar1_by_date_range_native(
	p_embeddings text,
	p_threshold double precision,
	p_start_utc timestamp with time zone DEFAULT NULL,
	p_end_utc timestamp with time zone DEFAULT NULL,
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
	WHERE (p_start_utc IS NULL OR result."DateCreated" >= p_start_utc::timestamp)
	  AND (p_end_utc IS NULL OR result."DateCreated" <= p_end_utc::timestamp)
	ORDER BY result."Similarity" DESC, result."FragmentID" ASC;
END;
$$;


SELECT record_schema_migration('002_semantic_vector_routines');

CREATE OR REPLACE FUNCTION fragment_vectors_native_upsert_sp(
	p_embedding_id integer,
	p_fragment_id integer,
	p_vector_dimensions integer,
	p_vector text,
	p_embedding_hash varchar(64) DEFAULT NULL
)
RETURNS void
LANGUAGE sql
AS $$
	SELECT fragment_vectors_native_upsert(p_embedding_id, p_fragment_id, p_vector_dimensions, p_vector, p_embedding_hash);
$$;

CREATE OR REPLACE FUNCTION fragment_vectors_native_get_by_fragment_id_sp(
	p_fragment_id integer,
	p_embedding_id integer
)
RETURNS TABLE (FragmentID integer, EmbeddingID integer, VectorDimensions integer, EmbeddingHash varchar(64), VectorJson text, LastEmbeddedUtc timestamp)
LANGUAGE sql
AS $$
	SELECT fragment_id, embedding_id, vector_dimensions, embedding_hash, vector_json, last_embedded_utc
	FROM fragment_vectors_native_get_by_fragment_id(p_fragment_id, p_embedding_id);
$$;

CREATE OR REPLACE FUNCTION fragment_vectors_native_remove_by_fragment_id_sp(
	p_fragment_id integer,
	p_embedding_id integer
)
RETURNS void
LANGUAGE sql
AS $$
	SELECT fragment_vectors_native_remove_by_fragment_id(p_fragment_id, p_embedding_id);
$$;

CREATE OR REPLACE FUNCTION fragment_vectors_native_exists_sp(
	p_fragment_id integer,
	p_embedding_id integer
)
RETURNS boolean
LANGUAGE sql
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM fragment_vectors_native
		WHERE fragment_id = p_fragment_id AND embedding_id = p_embedding_id
	);
$$;

