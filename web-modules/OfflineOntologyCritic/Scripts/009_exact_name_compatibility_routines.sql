-- Exact-name compatibility wrappers for Buffaly.Sessions.DB.PostGres.
--
-- The provider abstraction preserves canonical SQL Server stored procedure names.
-- The converted PostgreSQL implementation routines are snake_case. This script
-- creates quoted PostgreSQL functions with the exact canonical names and forwards
-- to the converted routines using the catalog-discovered signature/result shape.
--
-- Keep this script after the family routine scripts. It is idempotent.

DO $compat$
DECLARE
    mapping record;
    source_oid oid;
    source_args text;
    source_result text;
    call_args text;
    call_sql text;
BEGIN
    FOR mapping IN
        SELECT *
        FROM (VALUES
    ('CopyFeatureSp', 'copy_feature_sp'),
    ('CopyMessageSp', 'copy_message_sp'),
    ('CopyPageLayoutSp', 'copy_page_layout_sp'),
    ('CopyProcessSp', 'copy_process_sp'),
    ('CopySessionArtifactSp', 'copy_session_artifact_sp'),
    ('CopySessionSp', 'copy_session_sp'),
    ('CopySessionSubscriptionSp', 'copy_session_subscription_sp'),
    ('FragmentVectorsNative_ExistsSp', 'fragment_vectors_native_exists_sp'),
    ('FragmentVectorsNative_GetByFragmentIDSp', 'fragment_vectors_native_get_by_fragment_id_sp'),
    ('FragmentVectorsNative_RemoveByFragmentIDSp', 'fragment_vectors_native_remove_by_fragment_id_sp'),
    ('FragmentVectorsNative_UpsertSp', 'fragment_vectors_native_upsert_sp'),
    ('Fragments_GetMostSimilar1_Native_Sp', 'fragments_get_most_similar1_native_sp'),
    ('Fragments_GetMostSimilar1ByDateRange_Native_Sp', 'fragments_get_most_similar1_by_date_range_native_sp'),
    ('Fragments_GetMostSimilar1ByEmbeddingIDAndTagID_Sp', 'fragments_get_most_similar1_by_embedding_id_and_tag_id'),
    ('GetAllEpochsBySessionIDSp', 'get_all_epochs_by_session_id_sp'),
    ('GetEmbeddingByEmbeddingModelSp', 'get_embedding_by_embedding_model_sp'),
    ('GetEmbeddingSp', 'get_embedding_sp'),
    ('GetFeatureByFeatureNameSp', 'get_feature_by_feature_name_sp'),
    ('GetFeatureSp', 'get_feature_sp'),
    ('GetFeaturesSp', 'get_features_sp'),
    ('GetFeaturesSp_CountSp', 'get_features_sp_count_sp'),
    ('GetFeaturesSp_PagingSp', 'get_features_sp_paging_sp'),
    ('GetTagByTagNameSp', 'get_tag_by_tag_name_sp'),
    ('InsertOrUpdateFragmentTagSp', 'insert_or_update_fragment_tag_sp'),
    ('Fragments_GetByTagID_Sp_CountSp', 'fragments_get_by_tag_id_sp_count_sp'),
    ('Fragments_GetByTagID_Sp_PagingSp', 'fragments_get_by_tag_id_sp_paging_sp'),
    ('GetFragmentByFragmentKeySp', 'get_fragment_by_fragment_key_sp'),
    ('GetFragmentMessageMapByFragmentIDSp', 'get_fragment_message_map_by_fragment_id_sp'),
    ('GetFragmentMessageMapBySessionIDSp', 'get_fragment_message_map_by_session_id_sp'),
    ('GetFragmentsByParentFragmentIDSp', 'get_fragments_by_parent_fragment_id_sp'),
    ('GetFragmentSp', 'get_fragment_sp'),
    ('GetFragmentsSp', 'get_fragments_sp'),
    ('GetFragmentsSp_PagingByDateRangeSp', 'get_fragments_sp_paging_by_date_range_sp'),
    ('GetFragmentsSp_PagingSp', 'get_fragments_sp_paging_sp'),
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
    ('GetPageLayoutByUrlSp', 'get_page_layout_by_url_sp'),
    ('GetPageLayoutSp', 'get_page_layout_sp'),
    ('GetPageLayoutsSp', 'get_page_layouts_sp'),
    ('GetPageLayoutsSp_CountSp', 'get_page_layouts_sp_count_sp'),
    ('GetPageLayoutsSp_PagingSp', 'get_page_layouts_sp_paging_sp'),
    ('GetProcessesSp', 'get_processes_sp'),
    ('GetProcessesSp_CountSp', 'get_processes_sp_count_sp'),
    ('GetProcessesSp_PagingSp', 'get_processes_sp_paging_sp'),
    ('GetProcessSp', 'get_process_sp'),
    ('GetSessionArtifactSp', 'get_session_artifact_sp'),
    ('GetSessionArtifactsSp', 'get_session_artifacts_sp'),
    ('GetSessionBySessionKeySp', 'get_session_by_session_key_sp'),
    ('GetSessionsByParentSessionIDSp', 'get_sessions_by_parent_session_id_sp'),
    ('GetSessionsByParentSessionIDSp_CountSp', 'get_sessions_by_parent_session_idsp_count_sp'),
    ('GetSessionsByParentSessionIDSp_PagingSp', 'get_sessions_by_parent_session_idsp_paging_sp'),
    ('GetSessionSp', 'get_session_sp'),
    ('GetSessionsSp', 'get_sessions_sp'),
    ('GetSessionsSp_CountSp', 'get_sessions_sp_count_sp'),
    ('GetSessionsSp_PagingSp', 'get_sessions_sp_paging_sp'),
    ('GetSessionSubscriptionBySubscriptionIdentitySp', 'get_session_subscription_by_subscription_identity_sp'),
    ('GetSessionSubscriptionsBySessionIDSp', 'get_session_subscriptions_by_session_id_sp'),
    ('GetSessionSubscriptionsBySessionIDSp_CountSp', 'get_session_subscriptions_by_session_idsp_count_sp'),
    ('GetSessionSubscriptionsBySessionIDSp_PagingSp', 'get_session_subscriptions_by_session_idsp_paging_sp'),
    ('GetSessionSubscriptionsBySubscriberSessionKeySp', 'get_session_subscriptions_by_subscriber_session_key_sp'),
    ('GetSessionSubscriptionSp', 'get_session_subscription_sp'),
    ('GetSessionSubscriptionsSp', 'get_session_subscriptions_sp'),
    ('GetSessionSubscriptionsSp_CountSp', 'get_session_subscriptions_sp_count_sp'),
    ('GetSessionSubscriptionsSp_PagingSp', 'get_session_subscriptions_sp_paging_sp'),
    ('InsertEmbeddingSp', 'insert_embedding_sp'),
    ('InsertFeatureSp', 'insert_feature_sp'),
    ('InsertFragmentMessageMapSp', 'insert_fragment_message_map_sp'),
    ('InsertFragmentSp', 'insert_fragment_sp'),
    ('InsertMessageSp', 'insert_message_sp'),
    ('InsertPageLayoutSp', 'insert_page_layout_sp'),
    ('InsertProcessSp', 'insert_process_sp'),
    ('InsertSessionArtifactSp', 'insert_session_artifact_sp'),
    ('InsertSessionSp', 'insert_session_sp'),
    ('InsertSessionSubscriptionSp', 'insert_session_subscription_sp'),
    ('MarkFeatureAsEnabledSp', 'mark_feature_as_enabled_sp'),
    ('MarkFeatureAsNotEnabledSp', 'mark_feature_as_not_enabled_sp'),
    ('MarkMessageAsCompactedSp', 'mark_message_as_compacted_sp'),
    ('MarkMessageAsNotCompactedSp', 'mark_message_as_not_compacted_sp'),
    ('MarkPageLayoutAsEnabledSp', 'mark_page_layout_as_enabled_sp'),
    ('MarkPageLayoutAsNotEnabledSp', 'mark_page_layout_as_not_enabled_sp'),
    ('MarkProcessAsEnabledSp', 'mark_process_as_enabled_sp'),
    ('MarkProcessAsNotEnabledSp', 'mark_process_as_not_enabled_sp'),
    ('MarkProcessAsNotRunningSp', 'mark_process_as_not_running_sp'),
    ('MarkProcessAsNotTimedOutSp', 'mark_process_as_not_timed_out_sp'),
    ('MarkProcessAsRunningSp', 'mark_process_as_running_sp'),
    ('MarkProcessAsTimedOutSp', 'mark_process_as_timed_out_sp'),
    ('MarkSessionAsArchivedSp', 'mark_session_as_archived_sp'),
    ('MarkSessionAsNotArchivedSp', 'mark_session_as_not_archived_sp'),
    ('MarkSessionSubscriptionAsEnabledSp', 'mark_session_subscription_as_enabled_sp'),
    ('MarkSessionSubscriptionAsNotEnabledSp', 'mark_session_subscription_as_not_enabled_sp'),
    ('Messages_GetByFinalAssistantSearch_Sp', 'messages_get_by_final_assistant_search_sp'),
    ('Messages_GetByMessageIDs_Sp', 'messages_get_by_message_ids_sp'),
    ('Messages_GetByMessageSearch_Sp', 'messages_get_by_message_search_sp'),
    ('Messages_GetBySessionID_Sp', 'messages_get_by_session_id_sp'),
    ('Messages_GetBySessionIDDateRangeSp', 'messages_get_by_session_iddate_range_sp'),
    ('Messages_GetBySessionIDTurnKey_Sp', 'messages_get_by_session_idturn_key_sp'),
    ('Messages_GetCountBySessionID_Sp', 'messages_get_count_by_session_id_sp'),
    ('Messages_GetLatestMessageKeyBySessionID_Sp', 'messages_get_latest_message_key_by_session_id_sp'),
    ('RemoveFeatureSp', 'remove_feature_sp'),
    ('RemoveFragmentMessageMapByFragmentIDSp', 'remove_fragment_message_map_by_fragment_id_sp'),
    ('RemoveMessageSp', 'remove_message_sp'),
    ('RemovePageLayoutSp', 'remove_page_layout_sp'),
    ('RemoveProcessSp', 'remove_process_sp'),
    ('RemoveSessionArtifactSp', 'remove_session_artifact_sp'),
    ('RemoveSessionSp', 'remove_session_sp'),
    ('RemoveSessionSubscriptionSp', 'remove_session_subscription_sp'),
    ('Sessions_GetAll_Sp', 'sessions_get_all_sp'),
    ('Sessions_GetAll_Sp_CountSp', 'sessions_get_all_sp_count_sp'),
    ('Sessions_GetAll_Sp_PagingSp', 'sessions_get_all_sp_paging_sp'),
    ('Sessions_GetArchivedSp_Sp', 'sessions_get_archived_sp_sp'),
    ('Sessions_GetArchivedSp_Sp_CountSp', 'sessions_get_archived_sp_sp_count_sp'),
    ('Sessions_GetArchivedSp_Sp_PagingSp', 'sessions_get_archived_sp_sp_paging_sp'),
    ('Sessions_ResetRunningRuntimeStatusOnWebStartupSp', 'sessions_reset_running_runtime_status_on_web_startup_sp'),
    ('StoredProcedureHasParameterSp', 'stored_procedure_has_parameter_sp'),
    ('Turns_GetBySessionID_Sp', 'turns_get_by_session_id_sp'),
    ('Turns_GetBySessionIDTurnKeys_Sp', 'turns_get_by_session_idturn_keys_sp'),
    ('Turns_GetCountBySessionID_Sp', 'turns_get_count_by_session_id_sp'),
    ('Turns_GetPagingSp', 'turns_get_paging_sp'),
    ('UpdateEmbeddingDataSp', 'update_embedding_data_sp'),
    ('UpdateFeatureDataSp', 'update_feature_data_sp'),
    ('UpdateFeatureSettingsSp', 'update_feature_settings_sp'),
    ('UpdateFeatureSp', 'update_feature_sp'),
    ('UpdateFragmentDataSp', 'update_fragment_data_sp'),
    ('UpdateFragmentSp', 'update_fragment_sp'),
    ('UpdateMessageDataSp', 'update_message_data_sp'),
    ('UpdateMessageDateCreatedSp', 'update_message_date_created_sp'),
    ('UpdateMessagesCompactionEpochByMessageKeysJsonSp', 'update_messages_compaction_epoch_by_message_keys_json_sp'),
    ('UpdateMessageSp', 'update_message_sp'),
    ('UpdateMessageToolArgumentsSp', 'update_message_tool_arguments_sp'),
    ('UpdatePageLayoutSp', 'update_page_layout_sp'),
    ('UpdateProcessRunDataSp', 'update_process_run_data_sp'),
    ('UpdateProcessSp', 'update_process_sp'),
    ('UpdateSessionArtifactContentDataSp', 'update_session_artifact_content_data_sp'),
    ('UpdateSessionArtifactDataSp', 'update_session_artifact_data_sp'),
    ('UpdateSessionArtifactSp', 'update_session_artifact_sp'),
    ('UpdateSessionDataSp', 'update_session_data_sp'),
    ('UpdateSessionDateCreatedSp', 'update_session_date_created_sp'),
    ('UpdateSessionNameSp', 'update_session_name_sp'),
    ('UpdateSessionParentSessionIDSp', 'update_session_parent_session_id_sp'),
    ('UpdateSessionProviderSelectionSp', 'update_session_provider_selection_sp'),
    ('UpdateSessionSp', 'update_session_sp'),
    ('UpdateSessionSubscriptionDataSp', 'update_session_subscription_data_sp'),
    ('UpdateSessionSubscriptionSp', 'update_session_subscription_sp')
        ) AS m(canonical_name, source_name)
    LOOP
        SELECT p.oid,
               pg_catalog.pg_get_function_arguments(p.oid),
               pg_catalog.pg_get_function_result(p.oid)
          INTO source_oid, source_args, source_result
          FROM pg_catalog.pg_proc p
          JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public'
           AND p.proname = mapping.source_name
         ORDER BY p.oid DESC
         LIMIT 1;

        IF source_oid IS NULL THEN
            RAISE EXCEPTION 'Missing PostgreSQL source routine % for canonical routine %', mapping.source_name, mapping.canonical_name;
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

        EXECUTE format(
            'CREATE OR REPLACE FUNCTION %I(%s) RETURNS %s LANGUAGE sql AS %L',
            mapping.canonical_name,
            source_args,
            source_result,
            call_sql
        );
    END LOOP;
END
$compat$;

-- The action/entity semantic runtime sends vector payloads through the generic
-- PostgreSQL executor as jsonb. Keep an explicit exact-name overload so the
-- SQL Server-shaped FragmentVectorsNative repository can upsert vectors without
-- depending on PostgreSQL implicit jsonb-to-text resolution.
CREATE OR REPLACE FUNCTION "FragmentVectorsNative_UpsertSp"(
    p_embedding_id integer,
    p_fragment_id integer,
    p_vector_dimensions integer,
    p_vector jsonb,
    p_embedding_hash varchar DEFAULT NULL
)
RETURNS void
LANGUAGE sql
AS $$
    SELECT fragment_vectors_native_upsert_sp(
        p_embedding_id,
        p_fragment_id,
        p_vector_dimensions,
        p_vector::text,
        p_embedding_hash
    );
$$;

-- Runtime semantic preflight sends embedding vectors as jsonb through Npgsql.
-- Provide a jsonb overload for the SQL Server-shaped exact routine name while
-- keeping the converted implementation text-based for pgvector casting.
CREATE OR REPLACE FUNCTION "Fragments_GetMostSimilar1ByEmbeddingIDAndTagID_Sp"(
    p_embeddings jsonb,
    p_embedding_id integer,
    p_tag_id integer,
	p_threshold double precision
)
RETURNS TABLE ("FragmentID" integer, "Fragment" text, "ParentFragmentID" integer, "FragmentKey" varchar(255), "Data" text, "DateCreated" timestamp, "LastUpdated" timestamp, "Similarity" double precision)
LANGUAGE sql
AS $$
    SELECT *
    FROM fragments_get_most_similar1_by_embedding_id_and_tag_id(
        p_embeddings::text,
        p_embedding_id,
        p_tag_id,
		p_threshold
    );
$$;
