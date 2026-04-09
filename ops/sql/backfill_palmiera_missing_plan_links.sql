-- Backfill Palmiera missing properties with inferred floor-plan links.
--
-- This script is intended to be run after the Palmiera placeholder backfill,
-- but it is also safe to run on its own: it will insert any still-missing
-- Palmiera villas in the identified ranges and attach them to the matching
-- Palmiera floor plan.
--
-- Source of inference:
-- 1. The Palmiera cluster-map PDF contains villa labels through 265.
-- 2. The latest dump only contained villas 1-85 and 102-157 for Palmiera.
-- 3. The missing villas were mapped to Palmiera floor plans by comparing the
--    cluster-map image features and lot positions against the already-linked
--    Palmiera villas in the same dump.

BEGIN;

DO $$
DECLARE
    oasis_project_id integer;
    palmiera_community_id integer;
    updated_count integer := 0;
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

    WITH source_data(villa_number, plan_name) AS (
        VALUES
            ('86', '5 Bedroom Chamfered'),
            ('87', '5 Bedroom Chamfered'),
            ('88', '4 Bedroom Contemporary'),
            ('89', '4 Bedroom Contemporary'),
            ('90', '4 Bedroom Contemporary'),
            ('91', '4 Bedroom Contemporary'),
            ('92', '4 Bedroom Contemporary'),
            ('93', '4 Bedroom Contemporary'),
            ('94', '4 Bedroom Contemporary'),
            ('95', '4 Bedroom Contemporary'),
            ('96', '4 Bedroom Contemporary'),
            ('97', '4 Bedroom Contemporary'),
            ('98', '4 Bedroom Contemporary'),
            ('99', '4 Bedroom Contemporary'),
            ('100', '4 Bedroom Contemporary'),
            ('101', '4 Bedroom Contemporary'),
            ('158', '5 Bedroom Chamfered'),
            ('159', '5 Bedroom Chamfered'),
            ('160', '5 Bedroom Chamfered'),
            ('161', '5 Bedroom Chamfered'),
            ('162', '5 Bedroom Chamfered'),
            ('163', '5 Bedroom Chamfered'),
            ('164', '5 Bedroom Chamfered'),
            ('165', '5 Bedroom Chamfered'),
            ('166', '5 Bedroom Chamfered'),
            ('167', '5 Bedroom Chamfered'),
            ('168', '5 Bedroom Chamfered'),
            ('169', '5 Bedroom Chamfered'),
            ('170', '5 Bedroom Chamfered'),
            ('171', '5 Bedroom Chamfered'),
            ('172', '5 Bedroom Chamfered'),
            ('173', '5 Bedroom Chamfered'),
            ('174', '5 Bedroom Contemporary'),
            ('175', '5 Bedroom Contemporary'),
            ('176', '5 Bedroom Contemporary'),
            ('177', '5 Bedroom Contemporary'),
            ('178', '5 Bedroom Chamfered'),
            ('179', '5 Bedroom Contemporary'),
            ('180', '5 Bedroom Contemporary'),
            ('181', '5 Bedroom Contemporary'),
            ('182', '5 Bedroom Classical 1'),
            ('183', '5 Bedroom Classical 1'),
            ('184', '5 Bedroom Classical 1'),
            ('185', '5 Bedroom Classical 1'),
            ('186', '5 Bedroom Classical 1'),
            ('187', '5 Bedroom Classical 1'),
            ('188', '5 Bedroom Classical 1'),
            ('189', '5 Bedroom Classical 1'),
            ('190', '5 Bedroom Classical 1'),
            ('191', '5 Bedroom Classical 1'),
            ('192', '5 Bedroom Classical 1'),
            ('193', '5 Bedroom Classical 1'),
            ('194', '5 Bedroom Classical 1'),
            ('195', '5 Bedroom Classical 1'),
            ('196', '5 Bedroom Classical 1'),
            ('197', '5 Bedroom Classical 1'),
            ('198', '5 Bedroom Contemporary'),
            ('199', '5 Bedroom Contemporary'),
            ('200', '5 Bedroom Contemporary'),
            ('201', '5 Bedroom Contemporary'),
            ('202', '5 Bedroom Contemporary'),
            ('203', '5 Bedroom Classical 1'),
            ('204', '5 Bedroom Contemporary'),
            ('205', '5 Bedroom Classical 1'),
            ('206', '5 Bedroom Classical 2'),
            ('207', '5 Bedroom Classical 2'),
            ('208', '5 Bedroom Contemporary'),
            ('209', '5 Bedroom Classical 1'),
            ('210', '5 Bedroom Chamfered'),
            ('211', '5 Bedroom Contemporary'),
            ('212', '5 Bedroom Chamfered'),
            ('213', '5 Bedroom Chamfered'),
            ('214', '5 Bedroom Chamfered'),
            ('215', '5 Bedroom Chamfered'),
            ('216', '5 Bedroom Chamfered'),
            ('217', '5 Bedroom Chamfered'),
            ('218', '5 Bedroom Chamfered'),
            ('219', '5 Bedroom Chamfered'),
            ('220', '5 Bedroom Chamfered'),
            ('221', '5 Bedroom Chamfered'),
            ('222', '5 Bedroom Chamfered'),
            ('223', '5 Bedroom Chamfered'),
            ('224', '5 Bedroom Chamfered'),
            ('225', '5 Bedroom Chamfered'),
            ('226', '5 Bedroom Contemporary'),
            ('227', '5 Bedroom Contemporary'),
            ('228', '5 Bedroom Classical 2'),
            ('229', '5 Bedroom Classical 2'),
            ('230', '5 Bedroom Classical 2'),
            ('231', '5 Bedroom Classical 1'),
            ('232', '5 Bedroom Contemporary'),
            ('233', '5 Bedroom Classical 1'),
            ('234', '5 Bedroom Classical 2'),
            ('235', '5 Bedroom Classical 2'),
            ('236', '5 Bedroom Chamfered'),
            ('237', '5 Bedroom Chamfered'),
            ('238', '5 Bedroom Chamfered'),
            ('239', '5 Bedroom Chamfered'),
            ('240', '5 Bedroom Chamfered'),
            ('241', '5 Bedroom Chamfered'),
            ('242', '5 Bedroom Chamfered'),
            ('243', '5 Bedroom Chamfered'),
            ('244', '5 Bedroom Chamfered'),
            ('245', '5 Bedroom Chamfered'),
            ('246', '5 Bedroom Chamfered'),
            ('247', '5 Bedroom Chamfered'),
            ('248', '5 Bedroom Chamfered'),
            ('249', '5 Bedroom Chamfered'),
            ('250', '5 Bedroom Chamfered'),
            ('251', '5 Bedroom Chamfered'),
            ('252', '5 Bedroom Chamfered'),
            ('253', '5 Bedroom Chamfered'),
            ('254', '5 Bedroom Chamfered'),
            ('255', '5 Bedroom Chamfered'),
            ('256', '5 Bedroom Chamfered'),
            ('257', '5 Bedroom Chamfered'),
            ('258', '5 Bedroom Chamfered'),
            ('259', '5 Bedroom Chamfered'),
            ('260', '5 Bedroom Contemporary'),
            ('261', '5 Bedroom Classical 1'),
            ('262', '5 Bedroom Classical 1'),
            ('263', '5 Bedroom Classical 1'),
            ('264', '5 Bedroom Contemporary'),
            ('265', '5 Bedroom Contemporary')
    ),
    resolved_plans AS (
        SELECT
            s.villa_number,
            fp.plan_id
        FROM source_data s
        JOIN floor_plans fp
          ON fp.project_id = oasis_project_id
         AND fp.community_id = palmiera_community_id
         AND fp.plan_name = s.plan_name
    )
    UPDATE properties p
    SET
        project_id = oasis_project_id,
        community_id = palmiera_community_id,
        plan_id = rp.plan_id
    FROM resolved_plans rp
    WHERE p.project_id = oasis_project_id
      AND p.community_id = palmiera_community_id
      AND p.villa_number = rp.villa_number;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    WITH source_data(villa_number, plan_name) AS (
        VALUES
            ('86', '5 Bedroom Chamfered'),
            ('87', '5 Bedroom Chamfered'),
            ('88', '4 Bedroom Contemporary'),
            ('89', '4 Bedroom Contemporary'),
            ('90', '4 Bedroom Contemporary'),
            ('91', '4 Bedroom Contemporary'),
            ('92', '4 Bedroom Contemporary'),
            ('93', '4 Bedroom Contemporary'),
            ('94', '4 Bedroom Contemporary'),
            ('95', '4 Bedroom Contemporary'),
            ('96', '4 Bedroom Contemporary'),
            ('97', '4 Bedroom Contemporary'),
            ('98', '4 Bedroom Contemporary'),
            ('99', '4 Bedroom Contemporary'),
            ('100', '4 Bedroom Contemporary'),
            ('101', '4 Bedroom Contemporary'),
            ('158', '5 Bedroom Chamfered'),
            ('159', '5 Bedroom Chamfered'),
            ('160', '5 Bedroom Chamfered'),
            ('161', '5 Bedroom Chamfered'),
            ('162', '5 Bedroom Chamfered'),
            ('163', '5 Bedroom Chamfered'),
            ('164', '5 Bedroom Chamfered'),
            ('165', '5 Bedroom Chamfered'),
            ('166', '5 Bedroom Chamfered'),
            ('167', '5 Bedroom Chamfered'),
            ('168', '5 Bedroom Chamfered'),
            ('169', '5 Bedroom Chamfered'),
            ('170', '5 Bedroom Chamfered'),
            ('171', '5 Bedroom Chamfered'),
            ('172', '5 Bedroom Chamfered'),
            ('173', '5 Bedroom Chamfered'),
            ('174', '5 Bedroom Contemporary'),
            ('175', '5 Bedroom Contemporary'),
            ('176', '5 Bedroom Contemporary'),
            ('177', '5 Bedroom Contemporary'),
            ('178', '5 Bedroom Chamfered'),
            ('179', '5 Bedroom Contemporary'),
            ('180', '5 Bedroom Contemporary'),
            ('181', '5 Bedroom Contemporary'),
            ('182', '5 Bedroom Classical 1'),
            ('183', '5 Bedroom Classical 1'),
            ('184', '5 Bedroom Classical 1'),
            ('185', '5 Bedroom Classical 1'),
            ('186', '5 Bedroom Classical 1'),
            ('187', '5 Bedroom Classical 1'),
            ('188', '5 Bedroom Classical 1'),
            ('189', '5 Bedroom Classical 1'),
            ('190', '5 Bedroom Classical 1'),
            ('191', '5 Bedroom Classical 1'),
            ('192', '5 Bedroom Classical 1'),
            ('193', '5 Bedroom Classical 1'),
            ('194', '5 Bedroom Classical 1'),
            ('195', '5 Bedroom Classical 1'),
            ('196', '5 Bedroom Classical 1'),
            ('197', '5 Bedroom Classical 1'),
            ('198', '5 Bedroom Contemporary'),
            ('199', '5 Bedroom Contemporary'),
            ('200', '5 Bedroom Contemporary'),
            ('201', '5 Bedroom Contemporary'),
            ('202', '5 Bedroom Contemporary'),
            ('203', '5 Bedroom Classical 1'),
            ('204', '5 Bedroom Contemporary'),
            ('205', '5 Bedroom Classical 1'),
            ('206', '5 Bedroom Classical 2'),
            ('207', '5 Bedroom Classical 2'),
            ('208', '5 Bedroom Contemporary'),
            ('209', '5 Bedroom Classical 1'),
            ('210', '5 Bedroom Chamfered'),
            ('211', '5 Bedroom Contemporary'),
            ('212', '5 Bedroom Chamfered'),
            ('213', '5 Bedroom Chamfered'),
            ('214', '5 Bedroom Chamfered'),
            ('215', '5 Bedroom Chamfered'),
            ('216', '5 Bedroom Chamfered'),
            ('217', '5 Bedroom Chamfered'),
            ('218', '5 Bedroom Chamfered'),
            ('219', '5 Bedroom Chamfered'),
            ('220', '5 Bedroom Chamfered'),
            ('221', '5 Bedroom Chamfered'),
            ('222', '5 Bedroom Chamfered'),
            ('223', '5 Bedroom Chamfered'),
            ('224', '5 Bedroom Chamfered'),
            ('225', '5 Bedroom Chamfered'),
            ('226', '5 Bedroom Contemporary'),
            ('227', '5 Bedroom Contemporary'),
            ('228', '5 Bedroom Classical 2'),
            ('229', '5 Bedroom Classical 2'),
            ('230', '5 Bedroom Classical 2'),
            ('231', '5 Bedroom Classical 1'),
            ('232', '5 Bedroom Contemporary'),
            ('233', '5 Bedroom Classical 1'),
            ('234', '5 Bedroom Classical 2'),
            ('235', '5 Bedroom Classical 2'),
            ('236', '5 Bedroom Chamfered'),
            ('237', '5 Bedroom Chamfered'),
            ('238', '5 Bedroom Chamfered'),
            ('239', '5 Bedroom Chamfered'),
            ('240', '5 Bedroom Chamfered'),
            ('241', '5 Bedroom Chamfered'),
            ('242', '5 Bedroom Chamfered'),
            ('243', '5 Bedroom Chamfered'),
            ('244', '5 Bedroom Chamfered'),
            ('245', '5 Bedroom Chamfered'),
            ('246', '5 Bedroom Chamfered'),
            ('247', '5 Bedroom Chamfered'),
            ('248', '5 Bedroom Chamfered'),
            ('249', '5 Bedroom Chamfered'),
            ('250', '5 Bedroom Chamfered'),
            ('251', '5 Bedroom Chamfered'),
            ('252', '5 Bedroom Chamfered'),
            ('253', '5 Bedroom Chamfered'),
            ('254', '5 Bedroom Chamfered'),
            ('255', '5 Bedroom Chamfered'),
            ('256', '5 Bedroom Chamfered'),
            ('257', '5 Bedroom Chamfered'),
            ('258', '5 Bedroom Chamfered'),
            ('259', '5 Bedroom Chamfered'),
            ('260', '5 Bedroom Contemporary'),
            ('261', '5 Bedroom Classical 1'),
            ('262', '5 Bedroom Classical 1'),
            ('263', '5 Bedroom Classical 1'),
            ('264', '5 Bedroom Contemporary'),
            ('265', '5 Bedroom Contemporary')
    ),
    resolved_plans AS (
        SELECT
            s.villa_number,
            fp.plan_id
        FROM source_data s
        JOIN floor_plans fp
          ON fp.project_id = oasis_project_id
         AND fp.community_id = palmiera_community_id
         AND fp.plan_name = s.plan_name
    ),
    missing_rows AS (
        SELECT rp.villa_number, rp.plan_id
        FROM resolved_plans rp
        WHERE NOT EXISTS (
            SELECT 1
            FROM properties p
            WHERE p.project_id = oasis_project_id
              AND p.community_id = palmiera_community_id
              AND p.villa_number = rp.villa_number
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
        m.plan_id,
        FALSE,
        FALSE,
        FALSE,
        FALSE,
        FALSE,
        'Off-Market'
    FROM missing_rows m;

    GET DIAGNOSTICS inserted_count = ROW_COUNT;

    RAISE NOTICE 'Palmiera floor-plan links updated: % rows updated, % rows inserted.', updated_count, inserted_count;
END $$;

SELECT
    p.villa_number,
    fp.plan_name
FROM properties p
JOIN projects project_row
  ON project_row.project_id = p.project_id
JOIN communities c
  ON c.community_id = p.community_id
LEFT JOIN floor_plans fp
  ON fp.plan_id = p.plan_id
WHERE project_row.project_name = 'The Oasis'
  AND c.community_name = 'Palmiera'
  AND p.villa_number IN (
      '86','87','88','89','90','91','92','93','94','95','96','97','98','99','100','101',
      '158','159','160','161','162','163','164','165','166','167','168','169','170','171','172','173',
      '174','175','176','177','178','179','180','181','182','183','184','185','186','187','188','189',
      '190','191','192','193','194','195','196','197','198','199','200','201','202','203','204','205',
      '206','207','208','209','210','211','212','213','214','215','216','217','218','219','220','221',
      '222','223','224','225','226','227','228','229','230','231','232','233','234','235','236','237',
      '238','239','240','241','242','243','244','245','246','247','248','249','250','251','252','253',
      '254','255','256','257','258','259','260','261','262','263','264','265'
  )
ORDER BY p.villa_number::integer;

COMMIT;
