-- Create Core Tables
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone_number VARCHAR(50),
    email VARCHAR(150),
    client_type VARCHAR(50) DEFAULT 'Prospect', -- Buyer, Seller, Both, Prospect
    comments_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    neighborhood_name VARCHAR(150),
    layout_plan_url TEXT
);

CREATE TABLE floor_plans (
    plan_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id),
    plan_name VARCHAR(100) NOT NULL,
    number_of_rooms INTEGER,
    square_footage NUMERIC,
    amenities TEXT
);

CREATE TABLE properties (
    property_id SERIAL PRIMARY KEY,
    villa_number VARCHAR(50) NOT NULL,
    owner_customer_id INTEGER REFERENCES customers(customer_id),
    project_id INTEGER REFERENCES projects(project_id),
    plan_id INTEGER REFERENCES floor_plans(plan_id),
    is_corner BOOLEAN DEFAULT FALSE,
    is_lake_front BOOLEAN DEFAULT FALSE,
    is_park_front BOOLEAN DEFAULT FALSE,
    is_beach BOOLEAN DEFAULT FALSE,
    is_market BOOLEAN DEFAULT FALSE
);

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(property_id),
    transaction_date DATE,
    transaction_type VARCHAR(50), -- Sale, Rent
    price NUMERIC,
    notes TEXT
);

-- Insert Dummy Data for immediate testing
INSERT INTO customers (first_name, last_name, phone_number, email, client_type, comments_notes) VALUES
('John', 'Doe', '555-0100', 'john@example.com', 'Both', 'Looking to sell Villa 12 and buy a beachfront property.'),
('Sarah', 'Smith', '555-0200', 'sarah@example.com', 'Buyer', 'Interested in park-front townhouses.');

INSERT INTO projects (project_name, neighborhood_name, layout_plan_url) VALUES
('Palm Jumeirah', 'Frond A', 'https://example.com/palm_layout.jpg'),
('The Springs', 'Springs 4', 'https://example.com/springs_layout.jpg');

INSERT INTO floor_plans (project_id, plan_name, number_of_rooms, square_footage, amenities) VALUES
(1, 'Signature Villa', 6, 7000, 'Private Pool, Maid Room, Driver Room'),
(2, 'Type 3M', 3, 2450, 'Study Room, Landscaped Garden');

INSERT INTO properties (villa_number, owner_customer_id, project_id, plan_id, is_corner, is_beach, is_lake_front) VALUES
('Villa 12', 1, 1, 1, TRUE, TRUE, FALSE),
('Townhouse 84', 1, 2, 2, FALSE, FALSE, TRUE);