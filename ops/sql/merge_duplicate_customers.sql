BEGIN;

DROP TABLE IF EXISTS tmp_customer_duplicate_groups;

CREATE TEMP TABLE tmp_customer_duplicate_groups AS
WITH RECURSIVE normalized_customers AS (
    SELECT
        c.customer_id,
        c.created_at,
        NULLIF(lower(btrim(c.email)), '') AS normalized_email,
        NULLIF(regexp_replace(COALESCE(c.phone_number, ''), '[^0-9]+', '', 'g'), '') AS normalized_phone
    FROM customers c
),
linked_customers AS (
    SELECT DISTINCT
        a.customer_id AS source_id,
        b.customer_id AS target_id
    FROM normalized_customers a
    JOIN normalized_customers b
        ON a.customer_id <> b.customer_id
       AND (
            (a.normalized_email IS NOT NULL AND a.normalized_email = b.normalized_email)
            OR
            (a.normalized_phone IS NOT NULL AND a.normalized_phone = b.normalized_phone)
       )
),
reachable AS (
    SELECT customer_id AS start_id, customer_id AS reachable_id
    FROM normalized_customers

    UNION

    SELECT reachable.start_id, linked_customers.target_id
    FROM reachable
    JOIN linked_customers
        ON linked_customers.source_id = reachable.reachable_id
),
components AS (
    SELECT
        reachable_id AS customer_id,
        MIN(start_id) AS component_id
    FROM reachable
    GROUP BY reachable_id
),
duplicate_components AS (
    SELECT component_id
    FROM components
    GROUP BY component_id
    HAVING COUNT(*) > 1
)
SELECT
    components.component_id,
    ARRAY_AGG(components.customer_id ORDER BY normalized_customers.created_at ASC NULLS FIRST, components.customer_id ASC) AS member_ids,
    (ARRAY_AGG(components.customer_id ORDER BY normalized_customers.created_at ASC NULLS FIRST, components.customer_id ASC))[1] AS keeper_id
FROM components
JOIN duplicate_components
    ON duplicate_components.component_id = components.component_id
JOIN normalized_customers
    ON normalized_customers.customer_id = components.customer_id
GROUP BY components.component_id;

DO $$
DECLARE
    duplicate_group RECORD;
BEGIN
    FOR duplicate_group IN
        SELECT *
        FROM tmp_customer_duplicate_groups
        ORDER BY component_id
    LOOP
        UPDATE customers keeper
        SET
            first_name = COALESCE(
                NULLIF(btrim(keeper.first_name), ''),
                (
                    SELECT NULLIF(btrim(candidate.first_name), '')
                    FROM customers candidate
                    WHERE candidate.customer_id = ANY(duplicate_group.member_ids)
                      AND candidate.customer_id <> duplicate_group.keeper_id
                      AND NULLIF(btrim(candidate.first_name), '') IS NOT NULL
                    ORDER BY candidate.created_at ASC, candidate.customer_id ASC
                    LIMIT 1
                ),
                'Unknown'
            ),
            last_name = COALESCE(
                NULLIF(btrim(keeper.last_name), ''),
                (
                    SELECT NULLIF(btrim(candidate.last_name), '')
                    FROM customers candidate
                    WHERE candidate.customer_id = ANY(duplicate_group.member_ids)
                      AND candidate.customer_id <> duplicate_group.keeper_id
                      AND NULLIF(btrim(candidate.last_name), '') IS NOT NULL
                    ORDER BY candidate.created_at ASC, candidate.customer_id ASC
                    LIMIT 1
                )
            ),
            email = COALESCE(
                NULLIF(lower(btrim(keeper.email)), ''),
                (
                    SELECT NULLIF(lower(btrim(candidate.email)), '')
                    FROM customers candidate
                    WHERE candidate.customer_id = ANY(duplicate_group.member_ids)
                      AND candidate.customer_id <> duplicate_group.keeper_id
                      AND NULLIF(lower(btrim(candidate.email)), '') IS NOT NULL
                    ORDER BY candidate.created_at ASC, candidate.customer_id ASC
                    LIMIT 1
                )
            ),
            phone_number = COALESCE(
                NULLIF(btrim(keeper.phone_number), ''),
                (
                    SELECT NULLIF(btrim(candidate.phone_number), '')
                    FROM customers candidate
                    WHERE candidate.customer_id = ANY(duplicate_group.member_ids)
                      AND candidate.customer_id <> duplicate_group.keeper_id
                      AND NULLIF(btrim(candidate.phone_number), '') IS NOT NULL
                    ORDER BY candidate.created_at ASC, candidate.customer_id ASC
                    LIMIT 1
                )
            ),
            client_type = COALESCE(
                (
                    SELECT candidate_type
                    FROM (
                        SELECT
                            NULLIF(btrim(candidate.client_type), '') AS candidate_type,
                            CASE upper(COALESCE(NULLIF(btrim(candidate.client_type), ''), ''))
                                WHEN 'BOTH' THEN 4
                                WHEN 'BUYER' THEN 3
                                WHEN 'SELLER' THEN 2
                                WHEN 'PROSPECT' THEN 1
                                ELSE 0
                            END AS rank_value,
                            candidate.created_at,
                            candidate.customer_id
                        FROM customers candidate
                        WHERE candidate.customer_id = ANY(duplicate_group.member_ids)
                    ) ranked_candidates
                    WHERE candidate_type IS NOT NULL
                    ORDER BY rank_value DESC, created_at ASC, customer_id ASC
                    LIMIT 1
                ),
                keeper.client_type,
                'Prospect'
            ),
            assigned_buyer_agent_id = COALESCE(
                keeper.assigned_buyer_agent_id,
                (
                    SELECT candidate.assigned_buyer_agent_id
                    FROM customers candidate
                    WHERE candidate.customer_id = ANY(duplicate_group.member_ids)
                      AND candidate.customer_id <> duplicate_group.keeper_id
                      AND candidate.assigned_buyer_agent_id IS NOT NULL
                    ORDER BY candidate.created_at ASC, candidate.customer_id ASC
                    LIMIT 1
                )
            ),
            assigned_seller_agent_id = COALESCE(
                keeper.assigned_seller_agent_id,
                (
                    SELECT candidate.assigned_seller_agent_id
                    FROM customers candidate
                    WHERE candidate.customer_id = ANY(duplicate_group.member_ids)
                      AND candidate.customer_id <> duplicate_group.keeper_id
                      AND candidate.assigned_seller_agent_id IS NOT NULL
                    ORDER BY candidate.created_at ASC, candidate.customer_id ASC
                    LIMIT 1
                )
            )
        WHERE keeper.customer_id = duplicate_group.keeper_id;

        UPDATE properties
        SET owner_customer_id = duplicate_group.keeper_id
        WHERE owner_customer_id = ANY(duplicate_group.member_ids)
          AND owner_customer_id <> duplicate_group.keeper_id;

        UPDATE interaction_notes
        SET customer_id = duplicate_group.keeper_id
        WHERE customer_id = ANY(duplicate_group.member_ids)
          AND customer_id <> duplicate_group.keeper_id;

        DELETE FROM customers
        WHERE customer_id = ANY(duplicate_group.member_ids)
          AND customer_id <> duplicate_group.keeper_id;
    END LOOP;
END $$;

DROP INDEX IF EXISTS uq_customers_email_normalized;
DROP INDEX IF EXISTS uq_customers_phone_normalized;

CREATE UNIQUE INDEX uq_customers_email_normalized
    ON customers ((lower(btrim(email))))
    WHERE NULLIF(btrim(email), '') IS NOT NULL;

CREATE UNIQUE INDEX uq_customers_phone_normalized
    ON customers ((regexp_replace(phone_number, '[^0-9]+', '', 'g')))
    WHERE NULLIF(regexp_replace(COALESCE(phone_number, ''), '[^0-9]+', '', 'g'), '') IS NOT NULL;

SELECT
    customer_id,
    first_name,
    last_name,
    phone_number,
    email,
    client_type,
    assigned_buyer_agent_id,
    assigned_seller_agent_id,
    created_at
FROM customers
ORDER BY created_at ASC, customer_id ASC;

COMMIT;
