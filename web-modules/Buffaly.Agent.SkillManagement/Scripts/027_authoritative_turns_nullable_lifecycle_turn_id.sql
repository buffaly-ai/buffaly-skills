-- Lifecycle callback/status rows are session events, not execution Turn messages.
ALTER TABLE messages ALTER COLUMN turn_id DROP NOT NULL;
SELECT record_schema_migration('027_authoritative_turns_nullable_lifecycle_turn_id');
