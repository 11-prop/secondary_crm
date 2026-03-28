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
    neighborhood_name VARCHAR(150),
    layout_plan_path TEXT -- Physical file path (e.g., /app/uploads/projects/palm_layout.jpg)
);

-- Floor Plans (Catalogs)
CREATE TABLE floor_plans (
    plan_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
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

-- Historical Transactions
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id) ON DELETE CASCADE,
    transaction_date DATE,
    transaction_type VARCHAR(50), -- Sale, Rent
    price NUMERIC,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- INITIAL STATE
-- =========================================================================

-- This schema intentionally inserts no demo users, no default passwords,
-- and no sample CRM records. The first admin account is provisioned by the
-- backend from environment variables when the database is empty.
