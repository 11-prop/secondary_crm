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
          AND c.community_name = 'Palmiera 3'
    ) THEN
        RAISE EXCEPTION 'Community "Palmiera 3" under project "The Oasis" was not found.';
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
        FROM floor_plans fp
        JOIN communities c ON c.community_id = fp.community_id
        JOIN projects p ON p.project_id = c.project_id
        WHERE p.project_name = 'The Oasis'
          AND c.community_name = 'Palmiera 3'
          AND fp.plan_name = '4 Bedroom Classic'
    ) THEN
        RAISE EXCEPTION 'Palmiera 3 floor plan "4 Bedroom Classic" is missing.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM floor_plans fp
        JOIN communities c ON c.community_id = fp.community_id
        JOIN projects p ON p.project_id = c.project_id
        WHERE p.project_name = 'The Oasis'
          AND c.community_name = 'Palmiera 3'
          AND fp.plan_name = '4 Bedroom Contemporary'
    ) THEN
        RAISE EXCEPTION 'Palmiera 3 floor plan "4 Bedroom Contemporary" is missing.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM floor_plans fp
        JOIN communities c ON c.community_id = fp.community_id
        JOIN projects p ON p.project_id = c.project_id
        WHERE p.project_name = 'The Oasis'
          AND c.community_name = 'Palmiera 3'
          AND fp.plan_name = '4 Bedroom Chamfer'
    ) THEN
        RAISE EXCEPTION 'Palmiera 3 floor plan "4 Bedroom Chamfer" is missing.';
    END IF;
END $$;

WITH context AS (
    SELECT
        p.project_id,
        c.community_id
    FROM projects p
    JOIN communities c ON c.project_id = p.project_id
    WHERE p.project_name = 'The Oasis'
      AND c.community_name = 'Palmiera 3'
),
attribute_defs AS (
    SELECT
        MAX(attribute_definition_id) FILTER (WHERE key = 'property_type') AS property_type_definition_id,
        MAX(attribute_definition_id) FILTER (WHERE key = 'property_style') AS property_style_definition_id
    FROM property_attribute_definitions
),
plan_defs AS (
    SELECT
        MAX(plan_id) FILTER (WHERE plan_name = '4 Bedroom Classic') AS classic_plan_id,
        MAX(plan_id) FILTER (WHERE plan_name = '4 Bedroom Contemporary') AS contemporary_plan_id,
        MAX(plan_id) FILTER (WHERE plan_name = '4 Bedroom Chamfer') AS chamfered_plan_id
    FROM floor_plans fp
    JOIN context ctx ON ctx.community_id = fp.community_id
),
property_seed AS (
    SELECT *
    FROM (
        VALUES
            ('322', 'Classical'),
            ('323', 'Classical'),
            ('324', 'Classical'),
            ('325', 'Chamfered'),
            ('326', 'Chamfered'),
            ('327', 'Classical'),
            ('328', 'Classical'),
            ('329', 'Contemporary'),
            ('330', 'Contemporary'),
            ('331', 'Contemporary'),
            ('332', 'Classical'),
            ('333', 'Classical'),
            ('334', 'Classical'),
            ('337', 'Chamfered'),
            ('338', 'Chamfered'),
            ('339', 'Chamfered'),
            ('340', 'Chamfered'),
            ('341', 'Contemporary'),
            ('342', 'Contemporary'),
            ('343', 'Classical'),
            ('344', 'Classical'),
            ('345', 'Classical'),
            ('346', 'Chamfered'),
            ('347', 'Chamfered'),
            ('348', 'Chamfered'),
            ('349', 'Contemporary'),
            ('350', 'Chamfered'),
            ('351', 'Chamfered'),
            ('352', 'Chamfered'),
            ('353', 'Classical'),
            ('354', 'Classical'),
            ('355', 'Classical'),
            ('356', 'Classical'),
            ('357', 'Contemporary'),
            ('358', 'Contemporary'),
            ('359', 'Contemporary'),
            ('360', 'Classical'),
            ('361', 'Classical'),
            ('362', 'Classical'),
            ('363', 'Contemporary'),
            ('364', 'Contemporary'),
            ('365', 'Chamfered'),
            ('366', 'Chamfered'),
            ('369', 'Classical'),
            ('370', 'Classical'),
            ('371', 'Contemporary'),
            ('372', 'Chamfered'),
            ('373', 'Contemporary'),
            ('374', 'Contemporary'),
            ('375', 'Chamfered'),
            ('376', 'Chamfered'),
            ('377', 'Chamfered'),
            ('378', 'Contemporary'),
            ('379', 'Contemporary'),
            ('380', 'Contemporary')
    ) AS seed(villa_number, property_style_value)
),
resolved_seed AS (
    SELECT
        ctx.project_id,
        ctx.community_id,
        seed.villa_number,
        '4 BR Villa'::text AS property_type_value,
        seed.property_style_value,
        CASE
            WHEN seed.property_style_value = 'Classical' THEN plans.classic_plan_id
            WHEN seed.property_style_value = 'Contemporary' THEN plans.contemporary_plan_id
            WHEN seed.property_style_value = 'Chamfered' THEN plans.chamfered_plan_id
            ELSE NULL
        END AS plan_id
    FROM property_seed seed
    CROSS JOIN context ctx
    CROSS JOIN plan_defs plans
),
updated_existing AS (
    UPDATE properties pr
    SET project_id = rs.project_id,
        community_id = rs.community_id,
        plan_id = rs.plan_id,
        property_status = COALESCE(pr.property_status, 'Off-Market')
    FROM resolved_seed rs
    WHERE pr.villa_number = rs.villa_number
      AND pr.community_id = rs.community_id
    RETURNING pr.property_id, pr.villa_number
),
inserted_properties AS (
    INSERT INTO properties (
        villa_number,
        owner_customer_id,
        project_id,
        community_id,
        plan_id,
        is_corner,
        is_lake_front,
        is_park_front,
        is_beach,
        is_market,
        property_status,
        created_at
    )
    SELECT
        rs.villa_number,
        NULL,
        rs.project_id,
        rs.community_id,
        rs.plan_id,
        FALSE,
        FALSE,
        FALSE,
        FALSE,
        FALSE,
        'Off-Market',
        CURRENT_TIMESTAMP
    FROM resolved_seed rs
    WHERE NOT EXISTS (
        SELECT 1
        FROM properties pr
        WHERE pr.villa_number = rs.villa_number
          AND pr.community_id = rs.community_id
    )
    RETURNING property_id, villa_number
),
target_properties AS (
    SELECT
        pr.property_id,
        rs.villa_number,
        rs.property_type_value,
        rs.property_style_value
    FROM resolved_seed rs
    JOIN properties pr
      ON pr.villa_number = rs.villa_number
     AND pr.community_id = rs.community_id
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
    ON CONFLICT (property_id, attribute_definition_id) DO UPDATE
    SET value_boolean = NULL,
        value_text = EXCLUDED.value_text,
        value_number = NULL
    RETURNING property_id
)
SELECT
    property_style_value,
    COUNT(*) AS property_count
FROM resolved_seed
GROUP BY property_style_value
ORDER BY property_style_value;

COMMIT;
