CREATE OR REPLACE FUNCTION try_update_feature_settings_sp(p_feature_id integer, p_expected_settings text, p_settings text)
RETURNS TABLE(updated_rows integer)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE features
    SET settings = p_settings,
        last_updated = now()
    WHERE feature_id = p_feature_id
      AND settings IS NOT DISTINCT FROM p_expected_settings;
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RETURN NEXT;
END;
$$;
