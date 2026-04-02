-- =========================================================================
-- SYSTEM ADMIN & AUTHENTICATION
-- =========================================================================

-- System Users Table (For Data Analysts / Admins logging into the CRM)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- CRM ENTITIES
-- =========================================================================

-- Agents Table (The sales team members managed by the Analyst)
CREATE TABLE agents (
    agent_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL, -- 'Buyer' or 'Seller'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table (PII Data & Agent Assignments)
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone_number VARCHAR(50),
    email VARCHAR(150),
    client_type VARCHAR(50) DEFAULT 'Prospect', -- Buyer, Seller, Both, Prospect
    assigned_buyer_agent_id INTEGER REFERENCES agents(agent_id) ON DELETE SET NULL,
    assigned_seller_agent_id INTEGER REFERENCES agents(agent_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interaction Notes (The Chronological Ledger)
CREATE TABLE interaction_notes (
    note_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    agent_id INTEGER REFERENCES agents(agent_id) ON DELETE SET NULL, -- The agent who had the interaction
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects (Neighborhoods)
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    neighborhood_name VARCHAR(150), -- Legacy single-label field kept for backward compatibility
    layout_plan_path TEXT -- Physical file path (e.g., /app/uploads/projects/palm_layout.jpg)
);

-- Communities (Sub-areas within a project)
CREATE TABLE communities (
    community_id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
    community_name VARCHAR(150) NOT NULL,
    layout_plan_path TEXT, -- Physical file path for the community layout asset
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_communities_project_name UNIQUE (project_id, community_name)
);

-- Floor Plans (Catalogs)
CREATE TABLE floor_plans (
    plan_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE SET NULL,
    plan_name VARCHAR(100) NOT NULL,
    number_of_rooms INTEGER,
    square_footage NUMERIC,
    amenities TEXT,
    floor_plan_image_path TEXT -- Physical file path (e.g., /app/uploads/plans/type3m.jpg)
);

-- Properties (Specific physical units)
CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    villa_number VARCHAR(50) NOT NULL,
    owner_customer_id INTEGER REFERENCES customers(customer_id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(project_id),
    community_id INTEGER REFERENCES communities(community_id) ON DELETE SET NULL,
    plan_id INTEGER REFERENCES floor_plans(plan_id),
    
    -- Location Attributes
    is_corner BOOLEAN DEFAULT FALSE,
    is_lake_front BOOLEAN DEFAULT FALSE,
    is_park_front BOOLEAN DEFAULT FALSE,
    is_beach BOOLEAN DEFAULT FALSE,
    is_market BOOLEAN DEFAULT FALSE,
    
    -- Status
    property_status VARCHAR(50) DEFAULT 'Off-Market', -- Primary Residence, Active Listing, Rented, Off-Market
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurable Property Attributes (Hybrid model)
CREATE TABLE property_attribute_definitions (
    attribute_definition_id SERIAL PRIMARY KEY,
    key VARCHAR(80) UNIQUE NOT NULL,
    label VARCHAR(120) NOT NULL,
    value_type VARCHAR(20) NOT NULL DEFAULT 'boolean', -- boolean, text, number, select
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE property_attribute_values (
    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    attribute_definition_id INTEGER NOT NULL REFERENCES property_attribute_definitions(attribute_definition_id) ON DELETE CASCADE,
    value_boolean BOOLEAN,
    value_text TEXT,
    value_number NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (property_id, attribute_definition_id)
);

-- Historical Transactions
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE SET NULL,
    community_id INTEGER REFERENCES communities(community_id) ON DELETE SET NULL,
    plan_id INTEGER REFERENCES floor_plans(plan_id) ON DELETE SET NULL,
    source_reference VARCHAR(100),
    transaction_date DATE,
    transaction_recorded_at TIMESTAMP,
    transaction_type VARCHAR(50), -- Sale, Rent
    transaction_group VARCHAR(100),
    transaction_procedure VARCHAR(150),
    price NUMERIC,
    procedure_area NUMERIC,
    actual_area NUMERIC,
    usage VARCHAR(100),
    area_name VARCHAR(150),
    property_type VARCHAR(100),
    property_sub_type VARCHAR(100),
    is_offplan BOOLEAN,
    is_freehold BOOLEAN,
    buyer_count INTEGER,
    seller_count INTEGER,
    notes TEXT,
    source_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- INITIAL STATE
-- =========================================================================

-- This schema intentionally inserts no demo users, no default passwords,
-- and no sample CRM records. The first admin account is provisioned by the
-- backend from environment variables when the database is empty.

-- Default configurable property flags seeded for backward compatibility with
-- the original hardcoded location booleans. Additional attributes are created
-- through the CRM settings screen.
INSERT INTO property_attribute_definitions (key, label, value_type, sort_order, is_active, is_system)
VALUES
    ('is_corner', 'Corner', 'boolean', 10, TRUE, TRUE),
    ('is_lake_front', 'Lake-front', 'boolean', 20, TRUE, TRUE),
    ('is_park_front', 'Park-front', 'boolean', 30, TRUE, TRUE),
    ('is_beach', 'Beachfront', 'boolean', 40, TRUE, TRUE),
    ('is_market', 'Market-facing', 'boolean', 50, TRUE, TRUE)
ON CONFLICT (key) DO NOTHING;
