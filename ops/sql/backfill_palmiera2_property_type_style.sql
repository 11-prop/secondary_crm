BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM projects
        WHERE project_name = 'The Oasis'
    ) THEN
        RAISE EXCEPTION 'Project "The Oasis" was not found.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM communities c
        JOIN projects p ON p.project_id = c.project_id
        WHERE p.project_name = 'The Oasis'
          AND c.community_name = 'Palmiera 2'
    ) THEN
        RAISE EXCEPTION 'Community "Palmiera 2" under project "The Oasis" was not found.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM property_attribute_definitions
        WHERE key = 'property_type'
    ) THEN
        RAISE EXCEPTION 'Required property attribute definition "property_type" is missing.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM property_attribute_definitions
        WHERE key = 'property_style'
    ) THEN
        RAISE EXCEPTION 'Required property attribute definition "property_style" is missing.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM properties pr
        JOIN communities c
          ON c.community_id = pr.community_id
        JOIN projects p
          ON p.project_id = c.project_id
        JOIN floor_plans fp
          ON fp.plan_id = pr.plan_id
        WHERE p.project_name = 'The Oasis'
          AND c.community_name = 'Palmiera 2'
          AND (
              fp.plan_name ILIKE '4 Bedroom Contemporary%'
              OR fp.plan_name ILIKE '4 Bedroom Classic%'
              OR fp.plan_name ILIKE '4 Bedroom Chamfer%'
          )
    ) THEN
        RAISE EXCEPTION 'No matching Palmiera 2 properties with expected floor plan names were found.';
    END IF;
END $$;

WITH attribute_defs AS (
    SELECT
        MAX(attribute_definition_id) FILTER (WHERE key = 'property_type') AS property_type_definition_id,
        MAX(attribute_definition_id) FILTER (WHERE key = 'property_style') AS property_style_definition_id
    FROM property_attribute_definitions
),
target_properties AS (
    SELECT
        pr.property_id,
        pr.villa_number,
        fp.plan_name,
        '4 BR Villa'::text AS property_type_value,
        CASE
            WHEN fp.plan_name ILIKE '4 Bedroom Contemporary%' THEN 'Contemporary'
            WHEN fp.plan_name ILIKE '4 Bedroom Classic%' THEN 'Classical'
            WHEN fp.plan_name ILIKE '4 Bedroom Chamfer%' THEN 'Chamfered'
            ELSE NULL
        END AS property_style_value
    FROM properties pr
    JOIN communities c
      ON c.community_id = pr.community_id
    JOIN projects p
      ON p.project_id = c.project_id
    JOIN floor_plans fp
      ON fp.plan_id = pr.plan_id
    WHERE p.project_name = 'The Oasis'
      AND c.community_name = 'Palmiera 2'
      AND (
          fp.plan_name ILIKE '4 Bedroom Contemporary%'
          OR fp.plan_name ILIKE '4 Bedroom Classic%'
          OR fp.plan_name ILIKE '4 Bedroom Chamfer%'
      )
),
upsert_type AS (
    INSERT INTO property_attribute_values (
        property_id,
        attribute_definition_id,
        value_boolean,
        value_text,
        value_number,
        created_at
    )
    SELECT
        tp.property_id,
        defs.property_type_definition_id,
        NULL::boolean,
        tp.property_type_value,
        NULL::numeric,
        CURRENT_TIMESTAMP
    FROM target_properties tp
    CROSS JOIN attribute_defs defs
    WHERE defs.property_type_definition_id IS NOT NULL
    ON CONFLICT (property_id, attribute_definition_id) DO UPDATE
    SET value_boolean = NULL,
        value_text = EXCLUDED.value_text,
        value_number = NULL
    RETURNING property_id
),
upsert_style AS (
    INSERT INTO property_attribute_values (
        property_id,
        attribute_definition_id,
        value_boolean,
        value_text,
        value_number,
        created_at
    )
    SELECT
        tp.property_id,
        defs.property_style_definition_id,
        NULL::boolean,
        tp.property_style_value,
        NULL::numeric,
        CURRENT_TIMESTAMP
    FROM target_properties tp
    CROSS JOIN attribute_defs defs
    WHERE defs.property_style_definition_id IS NOT NULL
      AND tp.property_style_value IS NOT NULL
    ON CONFLICT (property_id, attribute_definition_id) DO UPDATE
    SET value_boolean = NULL,
        value_text = EXCLUDED.value_text,
        value_number = NULL
    RETURNING property_id
)
SELECT
    tp.plan_name,
    tp.property_type_value,
    tp.property_style_value,
    COUNT(*) AS property_count
FROM target_properties tp
GROUP BY tp.plan_name, tp.property_type_value, tp.property_style_value
ORDER BY tp.plan_name;

COMMIT;
