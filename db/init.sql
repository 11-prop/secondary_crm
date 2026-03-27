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
    is_admin BOOLEAN DEFAULT TRUE,
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
-- INITIAL DUMMY DATA FOR TESTING
-- =========================================================================

-- Insert default Admin User (Password is 'admin' hashed with bcrypt for testing)
INSERT INTO users (email, hashed_password, full_name, is_admin) VALUES
('admin@crm.local', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'System Admin', TRUE);

-- Insert Agents
INSERT INTO agents (name, agent_type) VALUES
('Alice Buyer', 'Buyer'),
('Bob Buyer', 'Buyer'),
('Charlie Seller', 'Seller'),
('Diana Seller', 'Seller');

-- Insert Customers
INSERT INTO customers (first_name, last_name, phone_number, email, client_type, assigned_buyer_agent_id, assigned_seller_agent_id) VALUES
('John', 'Doe', '555-0100', 'john@example.com', 'Both', 1, 3),
('Sarah', 'Smith', '555-0200', 'sarah@example.com', 'Buyer', 2, NULL);

-- Insert Interaction Notes
INSERT INTO interaction_notes (customer_id, agent_id, note_text) VALUES
(1, 3, 'John called to discuss listing his current villa.'),
(1, 1, 'Sent John some beachfront properties to consider buying.'),
(2, 2, 'Sarah attended an open house for a park-front townhouse.');

-- Insert Projects
INSERT INTO projects (project_name, neighborhood_name, layout_plan_path) VALUES
('Palm Jumeirah', 'Frond A', '/uploads/projects/palm_layout.jpg'),
('The Springs', 'Springs 4', '/uploads/projects/springs_layout.jpg');

-- Insert Floor Plans
INSERT INTO floor_plans (project_id, plan_name, number_of_rooms, square_footage, amenities, floor_plan_image_path) VALUES
(1, 'Signature Villa', 6, 7000, 'Private Pool, Maid Room, Driver Room', '/uploads/plans/signature_villa.jpg'),
(2, 'Type 3M', 3, 2450, 'Study Room, Landscaped Garden', '/uploads/plans/type_3m.jpg');

-- Insert Properties
INSERT INTO properties (villa_number, owner_customer_id, project_id, plan_id, property_status, is_corner, is_beach, is_lake_front) VALUES
('Villa 12', 1, 1, 1, 'Active Listing', TRUE, TRUE, FALSE),
('Townhouse 84', 1, 2, 2, 'Rented', FALSE, FALSE, TRUE);

-- Insert Historical Transactions
INSERT INTO transactions (property_id, transaction_date, transaction_type, price, notes) VALUES
(2, '2023-01-15', 'Rent', 150000, '1-year lease signed.'),
(1, '2020-05-10', 'Sale', 12000000, 'Original purchase by John Doe.');