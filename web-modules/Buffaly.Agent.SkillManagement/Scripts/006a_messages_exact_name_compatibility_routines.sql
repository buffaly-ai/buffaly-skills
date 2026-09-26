-- Sessions/message-only exact-name compatibility wrappers for installed Turns upgrades.
-- The global compatibility map spans split sessions and semantic databases; this artifact
-- intentionally rebuilds only canonical wrappers whose source routines live in sessions.
DO $compat$
DECLARE
	mapping record;
	source_oid oid;
	source_args text;
	source_identity_args text;
	source_result text;
	call_args text;
	call_sql text;
BEGIN
	FOR mapping IN
		SELECT *
		FROM (VALUES
			('CopyMessageSp', 'copy_message_sp'),
			('GetAllEpochsBySessionIDSp', 'get_all_epochs_by_session_id_sp'),
			('GetMessageByMessageKeySp', 'get_message_by_message_key_sp'),
			('GetMessagesBeforeBySessionIDAndMessageKeySp', 'get_messages_before_by_session_idand_message_key_sp'),
			('GetMessagesByCompactionEpochKeySessionIDSp', 'get_messages_by_compaction_epoch_key_session_id_sp'),
			('GetMessagesByCompactionEpochKeySp', 'get_messages_by_compaction_epoch_key_sp'),
			('GetMessagesByMessageKeySp', 'get_messages_by_message_key_sp'),
			('GetMessagesBySessionIDSp', 'get_messages_by_session_id_sp'),
			('GetMessagesBySessionIDSp_CountSp', 'get_messages_by_session_idsp_count_sp'),
			('GetMessagesBySessionIDSp_PagingSp', 'get_messages_by_session_idsp_paging_sp'),
			('GetMessagesByTurnIDSp', 'get_messages_by_turn_id_sp'),
			('GetMessageSp', 'get_message_sp'),
			('GetMessagesSinceBySessionIDAndMessageKeySp', 'get_messages_since_by_session_idand_message_key_sp'),
			('Messages_GetTurnDeltasSinceBySessionIDAndMessageKey_Sp', 'messages_get_turn_deltas_since_by_session_idand_message_key_sp'),
			('GetMessagesSp', 'get_messages_sp'),
			('GetMessagesSp_CountSp', 'get_messages_sp_count_sp'),
			('GetMessagesSp_PagingSp', 'get_messages_sp_paging_sp'),
			('MarkMessageAsCompactedSp', 'mark_message_as_compacted_sp'),
			('MarkMessageAsNotCompactedSp', 'mark_message_as_not_compacted_sp'),
			('Messages_GetByFinalAssistantSearch_Sp', 'messages_get_by_final_assistant_search_sp'),
			('Messages_GetByMessageIDs_Sp', 'messages_get_by_message_ids_sp'),
			('Messages_GetLifecycleBySessionIDTurnKeys_Sp', 'messages_get_lifecycle_by_session_idturn_keys_sp'),
			('Messages_GetByMessageSearch_Sp', 'messages_get_by_message_search_sp'),
			('Messages_GetBySessionID_Sp', 'messages_get_by_session_id_sp'),
			('Messages_GetBySessionIDDateRangeSp', 'messages_get_by_session_iddate_range_sp'),
			('Messages_GetBySessionIDTurnKey_Sp', 'messages_get_by_session_idturn_key_sp'),
			('Messages_GetCountBySessionID_Sp', 'messages_get_count_by_session_id_sp'),
			('Messages_GetLatestMessageKeyBySessionID_Sp', 'messages_get_latest_message_key_by_session_id_sp'),
			('RemoveMessageSp', 'remove_message_sp'),
			('UpdateMessageDataSp', 'update_message_data_sp'),
			('UpdateMessagesCompactionEpochByMessageKeysJsonSp', 'update_messages_compaction_epoch_by_message_keys_json_sp'),
			('UpdateMessageSp', 'update_message_sp'),
			('UpdateMessageToolArgumentsSp', 'update_message_tool_arguments_sp')
		) AS m(canonical_name, source_name)
	LOOP
		SELECT p.oid,
			pg_catalog.pg_get_function_arguments(p.oid),
			pg_catalog.pg_get_function_identity_arguments(p.oid),
			pg_catalog.pg_get_function_result(p.oid)
		INTO source_oid, source_args, source_identity_args, source_result
		FROM pg_catalog.pg_proc p
		JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
		WHERE n.nspname = current_schema()
			AND p.proname = mapping.source_name
		ORDER BY p.oid DESC
		LIMIT 1;

		IF source_oid IS NULL THEN
			RAISE EXCEPTION 'Missing PostgreSQL sessions source routine % for canonical routine %', mapping.source_name, mapping.canonical_name;
		END IF;

		SELECT COALESCE(string_agg(format('%1$I => %1$I', arg_name), ', ' ORDER BY ord), '')
		INTO call_args
		FROM (
			SELECT ord, arg_name, COALESCE(arg_mode, 'i') AS arg_mode
			FROM unnest(
				COALESCE((SELECT p.proargnames FROM pg_catalog.pg_proc p WHERE p.oid = source_oid), ARRAY[]::text[]),
				COALESCE((SELECT p.proargmodes FROM pg_catalog.pg_proc p WHERE p.oid = source_oid), ARRAY[]::"char"[])
			) WITH ORDINALITY AS a(arg_name, arg_mode, ord)
			WHERE COALESCE(arg_mode, 'i') IN ('i', 'b', 'v')
				AND arg_name IS NOT NULL
		) names;

		IF source_result ILIKE 'TABLE%' OR source_result ILIKE 'SETOF%' THEN
			call_sql := format('SELECT * FROM %I(%s)', mapping.source_name, call_args);
		ELSE
			call_sql := format('SELECT %I(%s)', mapping.source_name, call_args);
		END IF;

		EXECUTE format('DROP FUNCTION IF EXISTS %I(%s)', mapping.canonical_name, source_identity_args);
		EXECUTE format(
			'CREATE FUNCTION %I(%s) RETURNS %s LANGUAGE sql AS %L',
			mapping.canonical_name,
			source_args,
			source_result,
			call_sql
		);
	END LOOP;
END
$compat$;

SELECT record_schema_migration('006a_messages_exact_name_compatibility_routines');
