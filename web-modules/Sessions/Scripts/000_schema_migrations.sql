CREATE TABLE IF NOT EXISTS schema_migrations (
	migration_name text PRIMARY KEY,
	applied_utc timestamp NOT NULL DEFAULT (now() AT TIME ZONE 'utc')
);

CREATE OR REPLACE FUNCTION record_schema_migration(p_migration_name text)
RETURNS void LANGUAGE sql AS $$
	INSERT INTO schema_migrations(migration_name)
	VALUES(p_migration_name)
	ON CONFLICT (migration_name) DO UPDATE SET applied_utc = EXCLUDED.applied_utc;
$$;

SELECT record_schema_migration('000_schema_migrations');
