DROP FUNCTION IF EXISTS insert_embedding_sp(varchar,text);
DROP FUNCTION IF EXISTS insert_fragment_sp(text,integer,varchar,text);
-- Repository CRUD/paging routines for the Embeddings and Fragments SQL Server procedure batch.
-- These functions preserve SQL Server-facing result column names through quoted aliases.

DROP INDEX IF EXISTS ux_fragments_fragment_key;
CREATE INDEX IF NOT EXISTS ix_fragments_fragment_key ON fragments (fragment_key);

CREATE OR REPLACE FUNCTION get_embedding_sp(p_embedding_id integer)
RETURNS TABLE ("EmbeddingID" integer, "EmbeddingModel" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT embedding_id, embedding_model, data, date_created, last_updated
	FROM embeddings
	WHERE embedding_id = p_embedding_id;
$$;

CREATE OR REPLACE FUNCTION get_embeddings_sp()
RETURNS TABLE ("EmbeddingID" integer, "EmbeddingModel" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT embedding_id, embedding_model, data, date_created, last_updated
	FROM embeddings
	ORDER BY embedding_id ASC;
$$;

CREATE OR REPLACE FUNCTION get_embedding_by_embedding_model_sp(p_embedding_model varchar(255))
RETURNS TABLE ("EmbeddingID" integer, "EmbeddingModel" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT embedding_id, embedding_model, data, date_created, last_updated
	FROM embeddings
	WHERE embedding_model = p_embedding_model;
$$;

DROP FUNCTION IF EXISTS insert_embedding_sp(varchar,text);
CREATE OR REPLACE FUNCTION insert_embedding_sp(p_embedding_model varchar(255), p_data text DEFAULT NULL)
RETURNS TABLE ("EmbeddingID" integer)
LANGUAGE sql
AS $$
	INSERT INTO embeddings (embedding_model, data, date_created, last_updated)
	VALUES (p_embedding_model, p_data, now(), now())
	RETURNING embedding_id;
$$;

CREATE OR REPLACE FUNCTION update_embedding_data_sp(p_embedding_id integer, p_data text DEFAULT NULL)
RETURNS void
LANGUAGE sql
AS $$
	UPDATE embeddings
	SET data = p_data,
		last_updated = now()
	WHERE embedding_id = p_embedding_id;
$$;

CREATE OR REPLACE FUNCTION get_fragment_sp(p_fragment_id integer)
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT fragment_id, fragment, parent_fragment_id, fragment_key, data, date_created, last_updated
	FROM fragments
	WHERE fragment_id = p_fragment_id;
$$;

CREATE OR REPLACE FUNCTION get_fragments_sp()
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT fragment_id, fragment, parent_fragment_id, fragment_key, data, date_created, last_updated
	FROM fragments
	ORDER BY fragment_id ASC;
$$;

CREATE OR REPLACE FUNCTION get_fragment_by_fragment_key_sp(p_fragment_key varchar(255))
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT fragment_id, fragment, parent_fragment_id, fragment_key, data, date_created, last_updated
	FROM fragments
	WHERE fragment_key = p_fragment_key;
$$;

CREATE OR REPLACE FUNCTION get_fragments_by_parent_fragment_id_sp(p_parent_fragment_id integer DEFAULT NULL)
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT fragment_id, fragment, parent_fragment_id, fragment_key, data, date_created, last_updated
	FROM fragments
	WHERE ((p_parent_fragment_id IS NULL AND parent_fragment_id IS NULL) OR parent_fragment_id = p_parent_fragment_id)
	ORDER BY fragment_id ASC;
$$;

CREATE OR REPLACE FUNCTION insert_fragment_sp(p_fragment text, p_parent_fragment_id integer DEFAULT NULL, p_fragment_key varchar(255) DEFAULT NULL, p_data text DEFAULT NULL)
RETURNS TABLE (FragmentID integer)
LANGUAGE sql
AS $$
	INSERT INTO fragments (fragment, parent_fragment_id, fragment_key, data, date_created, last_updated)
	VALUES (p_fragment, p_parent_fragment_id, p_fragment_key, p_data, now(), now())
	RETURNING fragment_id;
$$;

CREATE OR REPLACE FUNCTION update_fragment_sp(p_fragment_id integer, p_fragment text, p_parent_fragment_id integer DEFAULT NULL, p_fragment_key varchar(255) DEFAULT NULL, p_data text DEFAULT NULL)
RETURNS void
LANGUAGE sql
AS $$
	UPDATE fragments
	SET fragment = p_fragment,
		parent_fragment_id = p_parent_fragment_id,
		fragment_key = p_fragment_key,
		data = p_data,
		last_updated = now()
	WHERE fragment_id = p_fragment_id;
$$;

CREATE OR REPLACE FUNCTION update_fragment_data_sp(p_fragment_id integer, p_data text DEFAULT NULL)
RETURNS void
LANGUAGE sql
AS $$
	UPDATE fragments
	SET data = p_data,
		last_updated = now()
	WHERE fragment_id = p_fragment_id;
$$;

CREATE OR REPLACE FUNCTION remove_fragment_sp(p_fragment_id integer)
RETURNS void
LANGUAGE sql
AS $$
	DELETE FROM fragments WHERE fragment_id = p_fragment_id;
$$;

CREATE OR REPLACE FUNCTION get_fragments_sp_paging_sp(p_search varchar(255), p_sort_column varchar(255), p_sort_ascending boolean, p_skip_rows integer, p_num_rows integer)
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT fragment_id, fragment, parent_fragment_id, fragment_key, data, date_created, last_updated
	FROM fragments
	WHERE fragment LIKE '%' || COALESCE(p_search, '') || '%'
	   OR fragment_key LIKE '%' || COALESCE(p_search, '') || '%'
	   OR fragment_id::varchar(50) LIKE '%' || COALESCE(p_search, '') || '%'
	ORDER BY
		CASE WHEN p_sort_column = 'FragmentID' AND p_sort_ascending THEN fragment_id END ASC,
		CASE WHEN p_sort_column = 'FragmentID' AND NOT p_sort_ascending THEN fragment_id END DESC,
		CASE WHEN p_sort_column = 'ParentFragmentID' AND p_sort_ascending THEN parent_fragment_id END ASC,
		CASE WHEN p_sort_column = 'ParentFragmentID' AND NOT p_sort_ascending THEN parent_fragment_id END DESC,
		CASE WHEN p_sort_column = 'FragmentKey' AND p_sort_ascending THEN fragment_key END ASC,
		CASE WHEN p_sort_column = 'FragmentKey' AND NOT p_sort_ascending THEN fragment_key END DESC,
		CASE WHEN p_sort_column = 'Data' AND p_sort_ascending THEN data END ASC,
		CASE WHEN p_sort_column = 'Data' AND NOT p_sort_ascending THEN data END DESC,
		CASE WHEN p_sort_column = 'DateCreated' AND p_sort_ascending THEN date_created END ASC,
		CASE WHEN p_sort_column = 'DateCreated' AND NOT p_sort_ascending THEN date_created END DESC,
		CASE WHEN p_sort_column = 'LastUpdated' AND p_sort_ascending THEN last_updated END ASC,
		CASE WHEN p_sort_column = 'LastUpdated' AND NOT p_sort_ascending THEN last_updated END DESC
	OFFSET p_skip_rows LIMIT p_num_rows;
$$;

CREATE OR REPLACE FUNCTION get_fragments_sp_paging_by_date_range_sp(p_search varchar(255), p_sort_column varchar(255), p_sort_ascending boolean, p_skip_rows integer, p_num_rows integer, p_start_utc timestamptz DEFAULT NULL, p_end_utc timestamptz DEFAULT NULL)
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT fragment_id, fragment, parent_fragment_id, fragment_key, data, date_created, last_updated
	FROM fragments
	WHERE (p_start_utc IS NULL OR date_created >= (p_start_utc AT TIME ZONE 'utc'))
	  AND (p_end_utc IS NULL OR date_created <= (p_end_utc AT TIME ZONE 'utc'))
	  AND (
		fragment LIKE '%' || COALESCE(p_search, '') || '%'
		OR fragment_key LIKE '%' || COALESCE(p_search, '') || '%'
		OR fragment_id::varchar(50) LIKE '%' || COALESCE(p_search, '') || '%'
	  )
	ORDER BY
		CASE WHEN p_sort_column = 'FragmentID' AND p_sort_ascending THEN fragment_id END ASC,
		CASE WHEN p_sort_column = 'FragmentID' AND NOT p_sort_ascending THEN fragment_id END DESC,
		CASE WHEN p_sort_column = 'ParentFragmentID' AND p_sort_ascending THEN parent_fragment_id END ASC,
		CASE WHEN p_sort_column = 'ParentFragmentID' AND NOT p_sort_ascending THEN parent_fragment_id END DESC,
		CASE WHEN p_sort_column = 'FragmentKey' AND p_sort_ascending THEN fragment_key END ASC,
		CASE WHEN p_sort_column = 'FragmentKey' AND NOT p_sort_ascending THEN fragment_key END DESC,
		CASE WHEN p_sort_column = 'Data' AND p_sort_ascending THEN data END ASC,
		CASE WHEN p_sort_column = 'Data' AND NOT p_sort_ascending THEN data END DESC,
		CASE WHEN p_sort_column = 'DateCreated' AND p_sort_ascending THEN date_created END ASC,
		CASE WHEN p_sort_column = 'DateCreated' AND NOT p_sort_ascending THEN date_created END DESC,
		CASE WHEN p_sort_column = 'LastUpdated' AND p_sort_ascending THEN last_updated END ASC,
		CASE WHEN p_sort_column = 'LastUpdated' AND NOT p_sort_ascending THEN last_updated END DESC
	OFFSET p_skip_rows LIMIT p_num_rows;
$$;


CREATE OR REPLACE FUNCTION get_tag_by_tag_name_sp(p_tag_name varchar(255))
RETURNS TABLE ("TagID" integer, "TagName" varchar(255), "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT tag_id, tag_name, date_created, last_updated
	FROM tags
	WHERE tag_name = p_tag_name;
$$;

CREATE OR REPLACE FUNCTION insert_or_update_fragment_tag_sp(p_fragment_id integer, p_tag_name varchar(255))
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
	v_tag_id integer;
BEGIN
	INSERT INTO tags (tag_name, date_created, last_updated)
	VALUES (p_tag_name, now(), now())
	ON CONFLICT (tag_name) DO UPDATE SET last_updated = EXCLUDED.last_updated
	RETURNING tag_id INTO v_tag_id;

	INSERT INTO fragment_tags (fragment_id, tag_id, date_created, last_updated)
	VALUES (p_fragment_id, v_tag_id, now(), now())
	ON CONFLICT (fragment_id, tag_id) DO UPDATE SET last_updated = EXCLUDED.last_updated;
END;
$$;

CREATE OR REPLACE FUNCTION fragments_get_by_tag_id_sp_count_sp(p_tag_id integer, p_search varchar(255))
RETURNS TABLE ("Total" integer)
LANGUAGE sql
AS $$
	SELECT COUNT(*)::integer AS "Total"
	FROM fragments f
	INNER JOIN fragment_tags ft ON ft.fragment_id = f.fragment_id
	WHERE ft.tag_id = p_tag_id
	  AND (
		f.fragment LIKE '%' || COALESCE(p_search, '') || '%'
		OR f.fragment_key LIKE '%' || COALESCE(p_search, '') || '%'
		OR f.fragment_id::varchar(50) LIKE '%' || COALESCE(p_search, '') || '%'
	  );
$$;

CREATE OR REPLACE FUNCTION fragments_get_by_tag_id_sp_paging_sp(p_tag_id integer, p_search varchar(255), p_sort_column varchar(255), p_sort_ascending boolean, p_skip_rows integer, p_num_rows integer)
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp)
LANGUAGE sql
AS $$
	SELECT f.fragment_id, f.fragment, f.parent_fragment_id, f.fragment_key, f.data, f.date_created, f.last_updated
	FROM fragments f
	INNER JOIN fragment_tags ft ON ft.fragment_id = f.fragment_id
	WHERE ft.tag_id = p_tag_id
	  AND (
		f.fragment LIKE '%' || COALESCE(p_search, '') || '%'
		OR f.fragment_key LIKE '%' || COALESCE(p_search, '') || '%'
		OR f.fragment_id::varchar(50) LIKE '%' || COALESCE(p_search, '') || '%'
	  )
	ORDER BY
		CASE WHEN p_sort_column = 'FragmentID' AND p_sort_ascending THEN f.fragment_id END ASC,
		CASE WHEN p_sort_column = 'FragmentID' AND NOT p_sort_ascending THEN f.fragment_id END DESC,
		CASE WHEN p_sort_column = 'FragmentKey' AND p_sort_ascending THEN f.fragment_key END ASC,
		CASE WHEN p_sort_column = 'FragmentKey' AND NOT p_sort_ascending THEN f.fragment_key END DESC,
		f.fragment_id ASC
	OFFSET p_skip_rows LIMIT p_num_rows;
$$;


CREATE OR REPLACE FUNCTION fragments_get_most_similar1_by_embedding_id_and_tag_id(
	p_embeddings text,
	p_embedding_id integer,
	p_tag_id integer,
	p_threshold double precision
)
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp, "Similarity" double precision)
LANGUAGE sql
AS $$
	SELECT f.fragment_id,
		f.fragment,
		f.parent_fragment_id,
		f.fragment_key,
		f.data,
		f.date_created,
		f.last_updated,
		(1 - (v.vector_value <=> p_embeddings::vector(1536)))::double precision AS "Similarity"
	FROM fragments f
	INNER JOIN fragment_tags ft ON ft.fragment_id = f.fragment_id AND ft.tag_id = p_tag_id
	INNER JOIN fragment_vectors_native v ON v.fragment_id = f.fragment_id AND v.embedding_id = p_embedding_id
	WHERE (1 - (v.vector_value <=> p_embeddings::vector(1536))) >= p_threshold
	ORDER BY v.vector_value <=> p_embeddings::vector(1536), f.fragment_id ASC
	LIMIT 100;
$$;

SELECT record_schema_migration('003_embeddings_fragments_repository_routines');
