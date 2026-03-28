export const demoCredentials = {
    email: "admin@crm.local",
    password: "admin",
};

export const demoAgents = [
    { agent_id: 1, name: "Alice Buyer", agent_type: "Buyer", is_active: true, created_at: "2026-01-05T09:30:00Z" },
    { agent_id: 2, name: "Bob Buyer", agent_type: "Buyer", is_active: true, created_at: "2026-01-09T11:00:00Z" },
    { agent_id: 3, name: "Charlie Seller", agent_type: "Seller", is_active: true, created_at: "2026-01-12T15:20:00Z" },
    { agent_id: 4, name: "Diana Seller", agent_type: "Seller", is_active: true, created_at: "2026-01-16T10:15:00Z" },
];

export const demoCustomers = [
    {
        customer_id: 1,
        first_name: "John",
        last_name: "Doe",
        phone_number: "555-0100",
        email: "john@example.com",
        client_type: "Both",
        assigned_buyer_agent_id: 1,
        assigned_seller_agent_id: 3,
        created_at: "2026-03-15T08:30:00Z",
    },
    {
        customer_id: 2,
        first_name: "Sarah",
        last_name: "Smith",
        phone_number: "555-0200",
        email: "sarah@example.com",
        client_type: "Buyer",
        assigned_buyer_agent_id: 2,
        assigned_seller_agent_id: null,
        created_at: "2026-03-14T10:15:00Z",
    },
    {
        customer_id: 3,
        first_name: "Mariam",
        last_name: "Khan",
        phone_number: "+92 300 4400112",
        email: "mariam@example.com",
        client_type: "Seller",
        assigned_buyer_agent_id: null,
        assigned_seller_agent_id: 4,
        created_at: "2026-03-10T16:45:00Z",
    },
];

export const demoProjects = [
    {
        project_id: 1,
        project_name: "Palm Jumeirah",
        neighborhood_name: "Frond A",
        layout_plan_path: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    },
    {
        project_id: 2,
        project_name: "The Springs",
        neighborhood_name: "Springs 4",
        layout_plan_path: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    },
];

export const demoFloorPlans = [
    {
        plan_id: 1,
        project_id: 1,
        plan_name: "Signature Villa",
        number_of_rooms: 6,
        square_footage: 7000,
        amenities: "Private pool, maid room, driver room",
        floor_plan_image_path: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    },
    {
        plan_id: 2,
        project_id: 2,
        plan_name: "Type 3M",
        number_of_rooms: 3,
        square_footage: 2450,
        amenities: "Study room, landscaped garden",
        floor_plan_image_path: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    },
];

export const demoProperties = [
    {
        property_id: 101,
        villa_number: "Villa 12",
        owner_customer_id: 1,
        project_id: 1,
        plan_id: 1,
        property_status: "Active Listing",
        is_corner: true,
        is_lake_front: false,
        is_park_front: false,
        is_beach: true,
        is_market: false,
        created_at: "2026-03-16T08:30:00Z",
    },
    {
        property_id: 102,
        villa_number: "Townhouse 84",
        owner_customer_id: 1,
        project_id: 2,
        plan_id: 2,
        property_status: "Rented",
        is_corner: false,
        is_lake_front: true,
        is_park_front: false,
        is_beach: false,
        is_market: false,
        created_at: "2026-03-12T11:20:00Z",
    },
    {
        property_id: 103,
        villa_number: "Villa 27",
        owner_customer_id: 3,
        project_id: 1,
        plan_id: 1,
        property_status: "Primary Residence",
        is_corner: false,
        is_lake_front: false,
        is_park_front: true,
        is_beach: false,
        is_market: true,
        created_at: "2026-03-09T12:00:00Z",
    },
];

export const demoInteractionNotes = [
    {
        note_id: 1,
        customer_id: 1,
        agent_id: 3,
        note_text: "John called to discuss listing his beachfront villa before summer demand peaks.",
        created_at: "2026-03-20T14:30:00Z",
    },
    {
        note_id: 2,
        customer_id: 1,
        agent_id: 1,
        note_text: "Shared two Palm Jumeirah options that match his beachfront buying criteria.",
        created_at: "2026-03-18T09:15:00Z",
    },
    {
        note_id: 3,
        customer_id: 2,
        agent_id: 2,
        note_text: "Sarah shortlisted The Springs after reviewing three family-friendly layouts.",
        created_at: "2026-03-17T16:50:00Z",
    },
    {
        note_id: 4,
        customer_id: 3,
        agent_id: 4,
        note_text: "Mariam wants to position her property quietly off-market for investor outreach.",
        created_at: "2026-03-11T11:10:00Z",
    },
];

export const demoTransactions = [
    {
        transaction_id: 1,
        property_id: 101,
        transaction_date: "2020-05-10",
        transaction_type: "Sale",
        price: 12000000,
        notes: "Original purchase by John Doe.",
        created_at: "2020-05-10T12:00:00Z",
    },
    {
        transaction_id: 2,
        property_id: 102,
        transaction_date: "2023-01-15",
        transaction_type: "Rent",
        price: 150000,
        notes: "One-year lease signed.",
        created_at: "2023-01-15T15:00:00Z",
    },
    {
        transaction_id: 3,
        property_id: 103,
        transaction_date: "2024-09-04",
        transaction_type: "Sale",
        price: 9800000,
        notes: "Family transfer and valuation reset.",
        created_at: "2024-09-04T10:00:00Z",
    },
];

export const demoUsers = [
    {
        user_id: 1,
        email: "admin@crm.local",
        full_name: "System Admin",
        is_active: true,
        is_admin: true,
        created_at: "2026-01-01T07:00:00Z",
    },
    {
        user_id: 2,
        email: "analyst@crm.local",
        full_name: "Lead Analyst",
        is_active: true,
        is_admin: true,
        created_at: "2026-02-08T09:10:00Z",
    },
];
