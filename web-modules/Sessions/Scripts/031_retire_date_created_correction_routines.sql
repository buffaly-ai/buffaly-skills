DROP FUNCTION IF EXISTS "UpdateSessionDateCreatedSp"(integer,timestamp);
DROP FUNCTION IF EXISTS update_session_date_created_sp(integer,timestamp);
DROP FUNCTION IF EXISTS "UpdateMessageDateCreatedSp"(integer,timestamp);
DROP FUNCTION IF EXISTS update_message_date_created_sp(integer,timestamp);

SELECT record_schema_migration('031_retire_date_created_correction_routines');
