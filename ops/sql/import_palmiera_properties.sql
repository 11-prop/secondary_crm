-- Import Palmiera properties from the finalized workbook.
-- Generated from: Palmiera Property Details Finalized.xlsx
-- Target hierarchy: project 'The Oasis' -> community 'Palmiera'
--
-- Notes:
-- 1. The workbook has 141 rows and 9 distinct Type + Style combinations.
-- 2. Palmiera already has 7 floor plans in the database. The 5 BR Type 1/2
--    distinction is preserved in the custom 'property_type' attribute, while
--    Type 1 and Type 2 Chamfered / Contemporary rows reuse the existing shared
--    Palmiera plans for those styles.
-- 3. This script is idempotent for the Palmiera community: it updates matching
--    properties by villa number and inserts only missing ones.

BEGIN;

DO $$
DECLARE
    oasis_project_id integer;
    palmiera_community_id integer;
    missing_plan_count integer;
BEGIN
    SELECT p.project_id
    INTO oasis_project_id
    FROM projects p
    WHERE p.project_name = 'The Oasis';

    IF oasis_project_id IS NULL THEN
        RAISE EXCEPTION 'Project % not found', 'The Oasis';
    END IF;

    SELECT c.community_id
    INTO palmiera_community_id
    FROM communities c
    WHERE c.project_id = oasis_project_id
      AND c.community_name = 'Palmiera';

    IF palmiera_community_id IS NULL THEN
        RAISE EXCEPTION 'Community % under project % not found', 'Palmiera', 'The Oasis';
    END IF;

    WITH source_data(villa_number, property_type, property_style, property_location, plan_name, is_corner, is_lake_front) AS (
        VALUES
        ('1', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('2', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('3', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('4', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('5', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('6', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('7', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('8', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('9', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('10', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('11', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('12', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('13', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('14', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('15', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('16', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('17', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('18', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('19', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('20', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('21', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('22', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('23', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('24', '4 BR Villa', 'Contemporary', 'Corner / Road', '4 Bedroom Contemporary', true, false),
        ('25', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('26', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('27', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('28', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('29', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('30', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('31', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('32', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('33', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('34', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('35', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('36', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('37', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('38', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('39', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('40', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('41', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('42', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('43', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('44', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('45', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('46', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('47', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('48', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('49', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('50', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('51', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('52', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('53', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('54', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('55', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('56', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('57', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('58', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('59', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('60', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('61', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('62', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('63', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('64', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('65', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('66', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('67', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('68', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('69', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('70', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('71', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('72', '5 BR Villa Type 2', 'Classical', 'Near Water (C)', '5 Bedroom Classical 2', false, false),
        ('73', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('74', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('75', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('76', '5 BR Villa Type 2', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('77', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('78', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('79', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('80', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('81', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('82', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('83', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('84', '5 BR Villa Type 1', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('85', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('102', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('103', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('104', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('105', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('106', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('107', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('108', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('109', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('110', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('111', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('112', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('113', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('114', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('115', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('116', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('117', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('118', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('119', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('120', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('121', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('122', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('123', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('124', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('125', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('126', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('127', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('128', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('129', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('130', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('131', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('132', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('133', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('134', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('135', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('136', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('137', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('138', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('139', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('140', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('141', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('142', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('143', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('144', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('145', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('146', '5 BR Villa Type 1', 'Contemporary', 'Perimeter / Near Water (D)', '5 Bedroom Contemporary', false, false),
        ('147', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('148', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('149', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('150', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('151', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('152', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('153', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('154', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('155', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('156', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('157', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false)
    )
    SELECT COUNT(*)
    INTO missing_plan_count
    FROM source_data s
    LEFT JOIN floor_plans fp
      ON fp.project_id = oasis_project_id
     AND fp.community_id = palmiera_community_id
     AND fp.plan_name = s.plan_name
    WHERE fp.plan_id IS NULL;

    IF missing_plan_count > 0 THEN
        RAISE EXCEPTION 'Palmiera import aborted because % row(s) could not resolve a floor plan.', missing_plan_count;
    END IF;
END $$;

INSERT INTO property_attribute_definitions (key, label, value_type, options, sort_order, is_active, is_system, created_at)
VALUES
    ('property_type', 'Property Type', 'select', '["4 BR Villa", "5 BR Villa Type 1", "5 BR Villa Type 2"]'::json, 100, TRUE, FALSE, CURRENT_TIMESTAMP),
    ('property_style', 'Property Style', 'select', '["Chamfered", "Classical", "Contemporary"]'::json, 110, TRUE, FALSE, CURRENT_TIMESTAMP),
    ('property_location', 'Property Location', 'select', '["Corner / Near Water", "Corner / Road", "Internal Cluster", "Internal Waterway", "Internal Waterway / Near Lake", "Internal Waterway / Near Water", "Near Amenities (B, C) / Water", "Near Water", "Near Water (C)", "Near Water (C, D)", "Near Water (D)", "Near Water / Internal Waterway", "Perimeter", "Perimeter / Near Water", "Perimeter / Near Water (D)", "Perimeter / Road"]'::json, 120, TRUE, FALSE, CURRENT_TIMESTAMP)
ON CONFLICT (key) DO UPDATE
SET label = EXCLUDED.label,
    value_type = EXCLUDED.value_type,
    options = EXCLUDED.options,
    sort_order = EXCLUDED.sort_order,
    is_active = TRUE;

WITH context AS (
    SELECT
        (SELECT p.project_id FROM projects p WHERE p.project_name = 'The Oasis') AS project_id,
        (
            SELECT c.community_id
            FROM communities c
            WHERE c.project_id = (SELECT p.project_id FROM projects p WHERE p.project_name = 'The Oasis')
              AND c.community_name = 'Palmiera'
        ) AS community_id
),
source_data(villa_number, property_type, property_style, property_location, plan_name, is_corner, is_lake_front) AS (
    VALUES
        ('1', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('2', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('3', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('4', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('5', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('6', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('7', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('8', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('9', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('10', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('11', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('12', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('13', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('14', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('15', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('16', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('17', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('18', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('19', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('20', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('21', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('22', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('23', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('24', '4 BR Villa', 'Contemporary', 'Corner / Road', '4 Bedroom Contemporary', true, false),
        ('25', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('26', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('27', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('28', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('29', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('30', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('31', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('32', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('33', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('34', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('35', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('36', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('37', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('38', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('39', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('40', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('41', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('42', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('43', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('44', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('45', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('46', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('47', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('48', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('49', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('50', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('51', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('52', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('53', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('54', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('55', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('56', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('57', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('58', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('59', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('60', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('61', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('62', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('63', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('64', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('65', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('66', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('67', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('68', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('69', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('70', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('71', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('72', '5 BR Villa Type 2', 'Classical', 'Near Water (C)', '5 Bedroom Classical 2', false, false),
        ('73', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('74', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('75', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('76', '5 BR Villa Type 2', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('77', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('78', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('79', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('80', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('81', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('82', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('83', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('84', '5 BR Villa Type 1', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('85', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('102', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('103', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('104', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('105', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('106', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('107', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('108', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('109', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('110', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('111', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('112', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('113', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('114', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('115', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('116', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('117', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('118', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('119', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('120', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('121', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('122', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('123', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('124', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('125', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('126', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('127', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('128', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('129', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('130', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('131', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('132', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('133', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('134', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('135', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('136', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('137', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('138', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('139', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('140', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('141', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('142', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('143', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('144', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('145', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('146', '5 BR Villa Type 1', 'Contemporary', 'Perimeter / Near Water (D)', '5 Bedroom Contemporary', false, false),
        ('147', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('148', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('149', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('150', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('151', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('152', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('153', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('154', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('155', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('156', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('157', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false)
),
resolved AS (
    SELECT
        s.villa_number,
        s.property_type,
        s.property_style,
        s.property_location,
        s.is_corner,
        s.is_lake_front,
        ctx.project_id,
        ctx.community_id,
        fp.plan_id
    FROM source_data s
    CROSS JOIN context ctx
    JOIN floor_plans fp
      ON fp.project_id = ctx.project_id
     AND fp.community_id = ctx.community_id
     AND fp.plan_name = s.plan_name
)
UPDATE properties p
SET project_id = r.project_id,
    community_id = r.community_id,
    plan_id = r.plan_id,
    property_status = 'Off-Market',
    is_corner = r.is_corner,
    is_lake_front = r.is_lake_front,
    is_park_front = FALSE,
    is_beach = FALSE,
    is_market = FALSE
FROM resolved r
WHERE p.villa_number = r.villa_number
  AND p.project_id = r.project_id
  AND p.community_id = r.community_id;

WITH context AS (
    SELECT
        (SELECT p.project_id FROM projects p WHERE p.project_name = 'The Oasis') AS project_id,
        (
            SELECT c.community_id
            FROM communities c
            WHERE c.project_id = (SELECT p.project_id FROM projects p WHERE p.project_name = 'The Oasis')
              AND c.community_name = 'Palmiera'
        ) AS community_id
),
source_data(villa_number, property_type, property_style, property_location, plan_name, is_corner, is_lake_front) AS (
    VALUES
        ('1', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('2', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('3', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('4', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('5', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('6', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('7', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('8', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('9', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('10', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('11', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('12', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('13', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('14', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('15', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('16', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('17', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('18', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('19', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('20', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('21', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('22', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('23', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('24', '4 BR Villa', 'Contemporary', 'Corner / Road', '4 Bedroom Contemporary', true, false),
        ('25', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('26', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('27', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('28', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('29', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('30', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('31', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('32', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('33', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('34', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('35', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('36', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('37', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('38', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('39', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('40', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('41', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('42', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('43', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('44', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('45', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('46', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('47', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('48', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('49', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('50', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('51', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('52', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('53', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('54', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('55', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('56', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('57', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('58', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('59', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('60', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('61', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('62', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('63', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('64', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('65', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('66', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('67', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('68', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('69', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('70', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('71', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('72', '5 BR Villa Type 2', 'Classical', 'Near Water (C)', '5 Bedroom Classical 2', false, false),
        ('73', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('74', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('75', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('76', '5 BR Villa Type 2', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('77', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('78', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('79', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('80', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('81', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('82', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('83', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('84', '5 BR Villa Type 1', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('85', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('102', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('103', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('104', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('105', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('106', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('107', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('108', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('109', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('110', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('111', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('112', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('113', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('114', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('115', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('116', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('117', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('118', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('119', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('120', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('121', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('122', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('123', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('124', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('125', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('126', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('127', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('128', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('129', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('130', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('131', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('132', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('133', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('134', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('135', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('136', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('137', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('138', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('139', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('140', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('141', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('142', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('143', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('144', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('145', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('146', '5 BR Villa Type 1', 'Contemporary', 'Perimeter / Near Water (D)', '5 Bedroom Contemporary', false, false),
        ('147', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('148', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('149', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('150', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('151', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('152', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('153', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('154', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('155', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('156', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('157', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false)
),
resolved AS (
    SELECT
        s.villa_number,
        s.property_type,
        s.property_style,
        s.property_location,
        s.is_corner,
        s.is_lake_front,
        ctx.project_id,
        ctx.community_id,
        fp.plan_id
    FROM source_data s
    CROSS JOIN context ctx
    JOIN floor_plans fp
      ON fp.project_id = ctx.project_id
     AND fp.community_id = ctx.community_id
     AND fp.plan_name = s.plan_name
)
INSERT INTO properties (
    villa_number,
    owner_customer_id,
    project_id,
    plan_id,
    is_corner,
    is_lake_front,
    is_park_front,
    is_beach,
    is_market,
    property_status,
    community_id
)
SELECT
    r.villa_number,
    NULL,
    r.project_id,
    r.plan_id,
    r.is_corner,
    r.is_lake_front,
    FALSE,
    FALSE,
    FALSE,
    'Off-Market',
    r.community_id
FROM resolved r
WHERE NOT EXISTS (
    SELECT 1
    FROM properties p
    WHERE p.villa_number = r.villa_number
      AND p.project_id = r.project_id
      AND p.community_id = r.community_id
);

WITH context AS (
    SELECT
        (SELECT p.project_id FROM projects p WHERE p.project_name = 'The Oasis') AS project_id,
        (
            SELECT c.community_id
            FROM communities c
            WHERE c.project_id = (SELECT p.project_id FROM projects p WHERE p.project_name = 'The Oasis')
              AND c.community_name = 'Palmiera'
        ) AS community_id,
        (SELECT attribute_definition_id FROM property_attribute_definitions WHERE key = 'property_type') AS property_type_attr_id,
        (SELECT attribute_definition_id FROM property_attribute_definitions WHERE key = 'property_style') AS property_style_attr_id,
        (SELECT attribute_definition_id FROM property_attribute_definitions WHERE key = 'property_location') AS property_location_attr_id
),
source_data(villa_number, property_type, property_style, property_location, plan_name, is_corner, is_lake_front) AS (
    VALUES
        ('1', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('2', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('3', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('4', '4 BR Villa', 'Chamfered', 'Perimeter / Road', '4 Bedroom Chamfered', false, false),
        ('5', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('6', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('7', '4 BR Villa', 'Classical', 'Perimeter / Road', '4 Bedroom Classic', false, false),
        ('8', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('9', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('10', '4 BR Villa', 'Chamfered', 'Near Amenities (B, C) / Water', '4 Bedroom Chamfered', false, false),
        ('11', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('12', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('13', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('14', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('15', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('16', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('17', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('18', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('19', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('20', '4 BR Villa', 'Classical', 'Internal Waterway / Near Lake', '4 Bedroom Classic', false, true),
        ('21', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('22', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('23', '4 BR Villa', 'Contemporary', 'Perimeter / Road', '4 Bedroom Contemporary', false, false),
        ('24', '4 BR Villa', 'Contemporary', 'Corner / Road', '4 Bedroom Contemporary', true, false),
        ('25', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('26', '4 BR Villa', 'Classical', 'Corner / Near Water', '4 Bedroom Classic', true, false),
        ('27', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('28', '4 BR Villa', 'Contemporary', 'Internal Waterway / Near Water', '4 Bedroom Contemporary', false, false),
        ('29', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('30', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('31', '4 BR Villa', 'Chamfered', 'Internal Cluster', '4 Bedroom Chamfered', false, false),
        ('32', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('33', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('34', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('35', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('36', '4 BR Villa', 'Classical', 'Internal Cluster', '4 Bedroom Classic', false, false),
        ('37', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('38', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('39', '4 BR Villa', 'Chamfered', 'Near Water', '4 Bedroom Chamfered', false, false),
        ('40', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('41', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('42', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('43', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('44', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('45', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('46', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('47', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('48', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('49', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('50', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('51', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('52', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('53', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('54', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('55', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('56', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('57', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('58', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('59', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('60', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('61', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('62', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('63', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('64', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('65', '4 BR Villa', 'Classical', 'Near Water (C, D)', '4 Bedroom Classic', false, false),
        ('66', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('67', '4 BR Villa', 'Contemporary', 'Near Water (D)', '4 Bedroom Contemporary', false, false),
        ('68', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('69', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('70', '4 BR Villa', 'Classical', 'Near Water (D)', '4 Bedroom Classic', false, false),
        ('71', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('72', '5 BR Villa Type 2', 'Classical', 'Near Water (C)', '5 Bedroom Classical 2', false, false),
        ('73', '5 BR Villa Type 1', 'Classical', 'Near Water (C)', '5 Bedroom Classical 1', false, false),
        ('74', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('75', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('76', '5 BR Villa Type 2', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('77', '5 BR Villa Type 1', 'Contemporary', 'Near Water', '5 Bedroom Contemporary', false, false),
        ('78', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('79', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('80', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('81', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('82', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('83', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('84', '5 BR Villa Type 1', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('85', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('102', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('103', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('104', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('105', '4 BR Villa', 'Contemporary', 'Perimeter / Near Water', '4 Bedroom Contemporary', false, false),
        ('106', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('107', '4 BR Villa', 'Contemporary', 'Corner / Near Water', '4 Bedroom Contemporary', true, false),
        ('108', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('109', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('110', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('111', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('112', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('113', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('114', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('115', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('116', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('117', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('118', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('119', '4 BR Villa', 'Classical', 'Near Water', '4 Bedroom Classic', false, false),
        ('120', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('121', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('122', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('123', '4 BR Villa', 'Chamfered', 'Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('124', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('125', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('126', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('127', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('128', '4 BR Villa', 'Classical', 'Internal Waterway / Near Water', '4 Bedroom Classic', false, false),
        ('129', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('130', '4 BR Villa', 'Contemporary', 'Near Water', '4 Bedroom Contemporary', false, false),
        ('131', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('132', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('133', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('134', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('135', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('136', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('137', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('138', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('139', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('140', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('141', '4 BR Villa', 'Chamfered', 'Near Water / Internal Waterway', '4 Bedroom Chamfered', false, false),
        ('142', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('143', '4 BR Villa', 'Contemporary', 'Internal Waterway', '4 Bedroom Contemporary', false, false),
        ('144', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('145', '4 BR Villa', 'Classical', 'Internal Waterway', '4 Bedroom Classic', false, false),
        ('146', '5 BR Villa Type 1', 'Contemporary', 'Perimeter / Near Water (D)', '5 Bedroom Contemporary', false, false),
        ('147', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('148', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('149', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('150', '5 BR Villa Type 2', 'Classical', 'Perimeter', '5 Bedroom Classical 2', false, false),
        ('151', '5 BR Villa Type 1', 'Classical', 'Perimeter', '5 Bedroom Classical 1', false, false),
        ('152', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('153', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('154', '5 BR Villa Type 1', 'Contemporary', 'Perimeter', '5 Bedroom Contemporary', false, false),
        ('155', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('156', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false),
        ('157', '5 BR Villa Type 2', 'Chamfered', 'Perimeter', '5 Bedroom Chamfered', false, false)
),
resolved AS (
    SELECT
        p.property_id,
        s.property_type,
        s.property_style,
        s.property_location,
        ctx.property_type_attr_id,
        ctx.property_style_attr_id,
        ctx.property_location_attr_id
    FROM source_data s
    CROSS JOIN context ctx
    JOIN properties p
      ON p.villa_number = s.villa_number
     AND p.project_id = ctx.project_id
     AND p.community_id = ctx.community_id
)
INSERT INTO property_attribute_values (
    property_id,
    attribute_definition_id,
    value_boolean,
    value_text,
    value_number,
    created_at
)
SELECT property_id, property_type_attr_id, NULL, property_type, NULL, CURRENT_TIMESTAMP FROM resolved
UNION ALL
SELECT property_id, property_style_attr_id, NULL, property_style, NULL, CURRENT_TIMESTAMP FROM resolved
UNION ALL
SELECT property_id, property_location_attr_id, NULL, property_location, NULL, CURRENT_TIMESTAMP FROM resolved
ON CONFLICT (property_id, attribute_definition_id) DO UPDATE
SET value_boolean = EXCLUDED.value_boolean,
    value_text = EXCLUDED.value_text,
    value_number = EXCLUDED.value_number;

COMMIT;
