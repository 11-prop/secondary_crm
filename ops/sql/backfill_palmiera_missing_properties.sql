-- Backfill Palmiera properties confirmed in the cluster map but absent from the latest dump.
--
-- Evidence used:
-- 1. The latest dump currently contains Palmiera villa numbers 1-85 and 102-157 only.
-- 2. The attached Palmiera cluster-map PDF contains plotted villa labels 1-265.
-- 3. Cross-referencing both leaves two missing ranges in the database:
--    86-101 and 158-265.
--
-- Because the cluster map confirms the villas exist but does not provide a reliable
-- machine-readable plan/style mapping in this environment, this script inserts the
-- missing Palmiera villas as placeholder property records with NULL plan_id. They can
-- be enriched later once the exact plan/style details are confirmed.

BEGIN;

DO $$
DECLARE
    oasis_project_id integer;
    palmiera_community_id integer;
    inserted_count integer := 0;
BEGIN
    SELECT p.project_id
    INTO oasis_project_id
    FROM projects p
    WHERE p.project_name = 'The Oasis';

    IF oasis_project_id IS NULL THEN
        RAISE EXCEPTION 'Project "The Oasis" was not found.';
    END IF;

    SELECT c.community_id
    INTO palmiera_community_id
    FROM communities c
    WHERE c.project_id = oasis_project_id
      AND c.community_name = 'Palmiera';

    IF palmiera_community_id IS NULL THEN
        RAISE EXCEPTION 'Community "Palmiera" under project "The Oasis" was not found.';
    END IF;

    WITH source_data(villa_number) AS (
        SELECT generate_series(86, 101)::text
        UNION ALL
        SELECT generate_series(158, 265)::text
    ),
    missing_rows AS (
        SELECT s.villa_number
        FROM source_data s
        WHERE NOT EXISTS (
            SELECT 1
            FROM properties p
            WHERE p.project_id = oasis_project_id
              AND p.community_id = palmiera_community_id
              AND p.villa_number = s.villa_number
        )
    )
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
        property_status
    )
    SELECT
        m.villa_number,
        NULL,
        oasis_project_id,
        palmiera_community_id,
        NULL,
        FALSE,
        FALSE,
        FALSE,
        FALSE,
        FALSE,
        'Off-Market'
    FROM missing_rows m;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;
    RAISE NOTICE 'Inserted % missing Palmiera properties (expected ranges 86-101 and 158-265).', inserted_count;
END $$;

WITH expected(villa_number) AS (
    SELECT generate_series(1, 265)::text
),
actual AS (
    SELECT p.villa_number
    FROM properties p
    JOIN communities c
      ON c.community_id = p.community_id
    JOIN projects project_row
      ON project_row.project_id = p.project_id
    WHERE project_row.project_name = 'The Oasis'
      AND c.community_name = 'Palmiera'
)
SELECT
    e.villa_number AS still_missing_villa_number
FROM expected e
LEFT JOIN actual a
  ON a.villa_number = e.villa_number
WHERE a.villa_number IS NULL
ORDER BY e.villa_number::integer;

COMMIT;
