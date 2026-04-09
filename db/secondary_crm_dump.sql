--
-- PostgreSQL database dump
--

\restrict L2fmOdy9THggwKGAzgIj9yZUXVQVKxH4xJyqSvFEchsnz0vqzEV3ndWo5rfGNZ7

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agents; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.agents (
    agent_id integer NOT NULL,
    name character varying(100) NOT NULL,
    agent_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.agents OWNER TO crm_user;

--
-- Name: agents_agent_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.agents_agent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.agents_agent_id_seq OWNER TO crm_user;

--
-- Name: agents_agent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.agents_agent_id_seq OWNED BY public.agents.agent_id;


--
-- Name: communities; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.communities (
    community_id integer NOT NULL,
    project_id integer NOT NULL,
    community_name character varying(150) NOT NULL,
    created_at timestamp without time zone,
    layout_plan_path text
);


ALTER TABLE public.communities OWNER TO crm_user;

--
-- Name: communities_community_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.communities_community_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.communities_community_id_seq OWNER TO crm_user;

--
-- Name: communities_community_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.communities_community_id_seq OWNED BY public.communities.community_id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.customers (
    customer_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100),
    phone_number character varying(50),
    email character varying(150),
    client_type character varying(50) DEFAULT 'Prospect'::character varying,
    assigned_buyer_agent_id integer,
    assigned_seller_agent_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO crm_user;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.customers_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_customer_id_seq OWNER TO crm_user;

--
-- Name: customers_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.customers_customer_id_seq OWNED BY public.customers.customer_id;


--
-- Name: floor_plans; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.floor_plans (
    plan_id integer NOT NULL,
    project_id integer,
    plan_name character varying(100) NOT NULL,
    number_of_rooms integer,
    square_footage numeric,
    amenities text,
    floor_plan_image_path text,
    community_id integer
);


ALTER TABLE public.floor_plans OWNER TO crm_user;

--
-- Name: floor_plans_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.floor_plans_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.floor_plans_plan_id_seq OWNER TO crm_user;

--
-- Name: floor_plans_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.floor_plans_plan_id_seq OWNED BY public.floor_plans.plan_id;


--
-- Name: interaction_notes; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.interaction_notes (
    note_id integer NOT NULL,
    customer_id integer,
    agent_id integer,
    note_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.interaction_notes OWNER TO crm_user;

--
-- Name: interaction_notes_note_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.interaction_notes_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.interaction_notes_note_id_seq OWNER TO crm_user;

--
-- Name: interaction_notes_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.interaction_notes_note_id_seq OWNED BY public.interaction_notes.note_id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    project_name character varying(150) NOT NULL,
    neighborhood_name character varying(150),
    layout_plan_path text
);


ALTER TABLE public.projects OWNER TO crm_user;

--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_project_id_seq OWNER TO crm_user;

--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: properties; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.properties (
    property_id integer NOT NULL,
    villa_number character varying(50) NOT NULL,
    owner_customer_id integer,
    project_id integer,
    plan_id integer,
    is_corner boolean DEFAULT false,
    is_lake_front boolean DEFAULT false,
    is_park_front boolean DEFAULT false,
    is_beach boolean DEFAULT false,
    is_market boolean DEFAULT false,
    property_status character varying(50) DEFAULT 'Off-Market'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    community_id integer
);


ALTER TABLE public.properties OWNER TO crm_user;

--
-- Name: properties_property_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.properties_property_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.properties_property_id_seq OWNER TO crm_user;

--
-- Name: properties_property_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.properties_property_id_seq OWNED BY public.properties.property_id;


--
-- Name: property_attribute_definitions; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.property_attribute_definitions (
    attribute_definition_id integer NOT NULL,
    key character varying(80) NOT NULL,
    label character varying(120) NOT NULL,
    value_type character varying(20) NOT NULL,
    options json NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL,
    is_system boolean NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.property_attribute_definitions OWNER TO crm_user;

--
-- Name: property_attribute_definitions_attribute_definition_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.property_attribute_definitions_attribute_definition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.property_attribute_definitions_attribute_definition_id_seq OWNER TO crm_user;

--
-- Name: property_attribute_definitions_attribute_definition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.property_attribute_definitions_attribute_definition_id_seq OWNED BY public.property_attribute_definitions.attribute_definition_id;


--
-- Name: property_attribute_values; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.property_attribute_values (
    property_id integer NOT NULL,
    attribute_definition_id integer NOT NULL,
    value_boolean boolean,
    value_text text,
    value_number numeric,
    created_at timestamp without time zone
);


ALTER TABLE public.property_attribute_values OWNER TO crm_user;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.transactions (
    transaction_id integer NOT NULL,
    property_id integer,
    transaction_date date,
    transaction_type character varying(50),
    price numeric,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    project_id integer,
    community_id integer,
    plan_id integer,
    source_reference character varying(100),
    transaction_recorded_at timestamp without time zone,
    transaction_group character varying(100),
    transaction_procedure character varying(150),
    procedure_area numeric,
    actual_area numeric,
    usage character varying(100),
    area_name character varying(150),
    property_type character varying(100),
    property_sub_type character varying(100),
    is_offplan boolean,
    is_freehold boolean,
    buyer_count integer,
    seller_count integer,
    source_metadata jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.transactions OWNER TO crm_user;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.transactions_transaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_transaction_id_seq OWNER TO crm_user;

--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.transactions_transaction_id_seq OWNED BY public.transactions.transaction_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: crm_user
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(150) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(100),
    is_active boolean DEFAULT true,
    is_admin boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO crm_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: crm_user
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_user_id_seq OWNER TO crm_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: crm_user
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: agents agent_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.agents ALTER COLUMN agent_id SET DEFAULT nextval('public.agents_agent_id_seq'::regclass);


--
-- Name: communities community_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.communities ALTER COLUMN community_id SET DEFAULT nextval('public.communities_community_id_seq'::regclass);


--
-- Name: customers customer_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.customers ALTER COLUMN customer_id SET DEFAULT nextval('public.customers_customer_id_seq'::regclass);


--
-- Name: floor_plans plan_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.floor_plans ALTER COLUMN plan_id SET DEFAULT nextval('public.floor_plans_plan_id_seq'::regclass);


--
-- Name: interaction_notes note_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.interaction_notes ALTER COLUMN note_id SET DEFAULT nextval('public.interaction_notes_note_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: properties property_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.properties ALTER COLUMN property_id SET DEFAULT nextval('public.properties_property_id_seq'::regclass);


--
-- Name: property_attribute_definitions attribute_definition_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.property_attribute_definitions ALTER COLUMN attribute_definition_id SET DEFAULT nextval('public.property_attribute_definitions_attribute_definition_id_seq'::regclass);


--
-- Name: transactions transaction_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.transactions ALTER COLUMN transaction_id SET DEFAULT nextval('public.transactions_transaction_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.agents (agent_id, name, agent_type, is_active, created_at) FROM stdin;
1	Sadaf Zameer	Seller	t	2026-04-08 09:06:37.155214
2	Ahmed Cheema	Seller	t	2026-04-08 09:06:55.669554
\.


--
-- Data for Name: communities; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.communities (community_id, project_id, community_name, created_at, layout_plan_path) FROM stdin;
1	1	Alana	2026-03-30 06:20:18.522768	/uploads/projects/75bce35a-88d5-428d-a507-d6be3f3198b4.pdf
3	1	Elea	2026-03-30 11:55:09.79951	/uploads/projects/db2f5716-188f-4957-a993-bd31f1753a0d.pdf
5	1	Farm Gardens 2	2026-03-30 13:21:45.860248	/uploads/projects/3a8312be-a9df-46ae-b31a-06e2d5b4f31a.pdf
6	1	Farm Grove 1	2026-03-30 13:34:06.045215	/uploads/projects/92ad2a6e-03b4-437a-8475-d685b0d59249.pdf
7	1	Lillia	2026-03-30 16:36:31.98401	/uploads/projects/c6e43c18-a9ad-4e35-b8e2-9f5057607f3d.pdf
8	1	Rivana	2026-03-31 08:10:10.065794	/uploads/projects/bd354ec6-4b2c-4477-b3d2-92d17d6c78ee.pdf
4	2	Palmiera 2	2026-03-30 11:55:50.458	/uploads/projects/e1731688-989e-4ac6-b531-0f989a86fc6c.pdf
9	2	Palmiera 3	2026-03-31 16:12:42.574031	/uploads/projects/f5b0b287-9b26-4b50-8fb9-4b3d70e2484f.pdf
10	2	Mirage	2026-03-31 16:21:14.674832	/uploads/projects/a624aa48-446a-48ac-9545-0a0e79c238a7.pdf
12	2	Ostra	2026-03-31 16:38:46.838768	/uploads/projects/9cfc5390-c3c0-435f-b8f6-9b7999b41525.pdf
13	2	Tierra	2026-03-31 18:40:38.141291	/uploads/projects/bc9c07ca-aaa1-4489-b4a0-91df2463739e.pdf
14	1	Venera	2026-04-01 11:46:47.69027	/uploads/projects/55cbb212-4c50-4ee6-b735-425dd14c7eea.pdf
2	2	Palmiera	2026-03-30 11:54:14.149852	/uploads/projects/5723739e-240a-471c-83d2-d3b75ca0fce5.pdf
15	1	Nima	2026-04-02 17:57:45.991468	/uploads/projects/7a62087f-525b-4619-828b-e87e2ca22e7a.pdf
11	2	Lavita	2026-03-31 16:31:20.276415	/uploads/projects/0d1465f7-4ea5-469b-b1ce-30380178fbed.webp
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.customers (customer_id, first_name, last_name, phone_number, email, client_type, assigned_buyer_agent_id, assigned_seller_agent_id, created_at) FROM stdin;
1	Hisham	Abd Ahmid	97155663162		Prospect	\N	\N	2026-03-29 10:13:27.838087
2	Maqsood	Ur Rehman	+971501296631		Prospect	\N	\N	2026-04-02 04:08:42.386988
4	Maqsood 	 Ur Rehman	971501296631		Seller	\N	2	2026-04-07 10:05:36.012905
3	Ashish	Bhandari	+971502249800		Prospect	\N	2	2026-04-02 04:09:43.717448
\.


--
-- Data for Name: floor_plans; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.floor_plans (plan_id, project_id, plan_name, number_of_rooms, square_footage, amenities, floor_plan_image_path, community_id) FROM stdin;
54	2	6 Bedroom Flat Chamfered	6	12967.06	\N	/uploads/plans/a24e5f30-4c17-4259-99db-f8bac731dcb6.pdf	10
2	1	Townhouse 3 Bedroom Lilac Mirrored	3	3720.0	\N	/uploads/plans/782840e9-1767-41a6-a01b-e341ecc3748b.pdf	1
1	1	Townhouse 3 Bedroom Lillac	3	3849.71	\N	/uploads/plans/35682280-00ca-4335-88ec-ea1438dbb70b.pdf	1
3	1	Townhouse 4 Bedroom Lilac	4	4136.35	\N	/uploads/plans/1f7fab7c-8c71-41e1-9482-e3323e20ab52.pdf	1
4	1	Townhouse 4 Bedroom Lilac Mirrored	4	4099.54	\N	/uploads/plans/f89ac1e0-7172-44c4-bb3a-1d75c0dee982.pdf	1
5	1	Townhouse 5 Bedroom Lilac	5	4878.52	\N	/uploads/plans/ebf9bca8-d37a-4bcf-9a12-d143c901f1bd.pdf	1
6	1	Townhouse 5 Bedroom Lilac Mirrored	5	4754.41	\N	/uploads/plans/14d1fbce-4cc6-479b-b2fd-d99516237b9f.pdf	1
7	1	4 Bedroom Slate	4	2833.81	\N	/uploads/plans/f57bc500-0c5b-4664-a9e2-1a95f823276e.pdf	3
8	1	3 Bedroom Slate	3	2452.34	\N	/uploads/plans/ee82d11f-2c59-4340-8bb9-f04e11daf498.pdf	3
9	1	3 Bedroom Slate	3	2451.8	\N	/uploads/plans/3b7a7fd0-8143-432b-8138-45b9d9588406.pdf	3
10	1	4 Bedroom Slate	4	2837.79	\N	/uploads/plans/7ebcf432-b8e9-45ad-bfbc-da4571957897.pdf	3
11	1	4 Bedroom Oakley	4	2680.64	\N	/uploads/plans/b6a57783-35ca-428e-9d5e-a5bab57c5a64.pdf	3
12	1	3 Bedroom Okaley	3	2444.05	\N	/uploads/plans/ac519513-bc41-4346-a5f2-80843d4c9e6c.pdf	3
13	1	3 Bedroom Oakley	3	2444.05	\N	/uploads/plans/0231385b-0f38-4071-a55c-f0ecaadb8e39.pdf	3
14	1	4 Bedroom Oakley	4	2680.64	\N	/uploads/plans/311bca8a-8744-44a4-879c-b4b1f309efeb.pdf	3
15	1	4 Bedroom Horizon	4	6395.0	\N	/uploads/plans/7bd55ac3-1157-4471-ad48-1fe5ebd90da2.pdf	5
16	1	4 Bedroom Horizon Mirror	4	6395.0	\N	/uploads/plans/3536ccd9-a4e9-49d3-93c6-e2d1c7c34f7d.pdf	5
17	1	4 Bedroom Oren	4	6642.0	\N	/uploads/plans/1ac137c9-b9f8-450b-89c6-b381612e313d.pdf	5
18	1	4 Bedroom Oren Mirror	4	6642.0	\N	/uploads/plans/b11132d2-f99e-4fb6-96c0-78a847689d92.pdf	5
19	1	5 Bedroom Horizon	5	7966.0	\N	/uploads/plans/e5e2d3a4-f32e-440b-927d-300edd0e4832.pdf	5
20	1	5 Bedroom Horizon Mirror	5	7966.0	\N	/uploads/plans/e37ed71c-5110-4eea-aa14-60305bf0443a.pdf	5
21	1	5 Bedroom Oren	5	8074.0	\N	/uploads/plans/562d9fd4-4584-4bd6-9254-2a7f0fc1eba4.pdf	5
22	1	5 Bedroom Oren Mirror	5	8074.0	\N	/uploads/plans/c221ba1e-4bba-409a-9ba8-64bc85e8aba5.pdf	5
23	1	4 Bedroom Gardenia	4	3754.0	\N	/uploads/plans/49bdc267-41f5-4599-999f-4b9a363e7d61.pdf	6
24	1	4 Bedroom Large Villa	4	5581.0	\N	/uploads/plans/ee491d1d-46e0-4bc1-acc2-015833b446d0.pdf	6
25	1	5 Bedroom Villa	5	6078.0	\N	/uploads/plans/616b1d03-e6d5-48e7-85b5-72ab7233692e.pdf	6
26	1	3 Bedroom Jade I A	3	2131.0	\N	/uploads/plans/2e63c1fc-eb01-4a2a-8bb3-0ec977cb81f0.pdf	7
27	1	3 Bedroom Jade Mirror I A	3	2131.0	\N	/uploads/plans/eac131a4-8873-4948-8c3c-58a33ee1efbe.pdf	7
28	1	3 Bedroom Pearl I B	3	2184.0	\N	\N	7
29	1	3 Bedroom Pearl Mirrored I B	3	2184.0	\N	/uploads/plans/11c541c3-4120-4df1-819e-3ffb0a15c117.pdf	7
30	1	4 Bedroom Jade I A	4	2987.0	\N	/uploads/plans/670b25ba-9091-42de-aaf4-3126ef48bc35.pdf	7
31	1	4 Bedroom Jade Mirrored I A	4	2987.0	\N	/uploads/plans/87bdb0ae-ef43-4f87-a34b-f87fe8c29be6.pdf	7
32	1	4 Bedroom Pearl I B	4	2789.0	\N	/uploads/plans/0d98d23d-a321-4fc3-859c-9dfc0b397445.pdf	7
33	1	4 Bedroom Pearl Mirrored I B	4	2791.0	\N	/uploads/plans/7e52cc18-1dd2-47ef-a400-456ec79775a8.pdf	7
34	1	3 Bedroom KAI Mirrored	3	3208.5	\N	/uploads/plans/084a456a-dbfa-4278-a8ec-12d67485a4db.pdf	8
35	1	5 Bedroom Clara	5	4039.0	\N	/uploads/plans/717013f9-2b10-4f5d-8bdf-039100cabd85.pdf	8
36	1	4 Bedroom Clara Mirrored	4	3325.0	\N	/uploads/plans/1ced39b8-3823-4b00-a605-203dc4b2a373.pdf	8
37	1	3 Bedroom Clara	3	3883.0	\N	/uploads/plans/fdf3f87d-ce70-4617-891b-6c6c66a50881.pdf	8
38	1	5 Bedroom Kai Mirrored	5	4548.0	\N	/uploads/plans/9f43a145-7bc4-4d1b-a708-73fc154481d5.pdf	8
39	2	4 Bedroom Classic	4	5843.0	\N	/uploads/plans/bbe2ceb2-6afa-41bc-a2cc-b4890af2642b.pdf	2
40	2	4 Bedroom Contemporary	4	6274.07	\N	/uploads/plans/bf8bbab9-a0ea-4ba1-bab7-d0f4233700ca.pdf	2
41	2	4 Bedroom Chamfered	4	6261.91	\N	/uploads/plans/a569a2a6-7205-4265-b3b5-21d4cdac179f.pdf	2
42	2	5 Bedroom Classical 1	5	8647.3	\N	/uploads/plans/3a2e2f8c-0185-4eb8-a3fe-9388356425b5.pdf	2
43	2	5 Bedroom Classical 2	5	7753.35	\N	/uploads/plans/0fd3f6de-7675-4bd0-8ba5-995805aea8d6.pdf	2
44	2	5 Bedroom Contemporary	5	8689.27	\N	/uploads/plans/93de67f1-364d-4153-b750-cf3a20668f6e.pdf	2
45	2	5 Bedroom Chamfered	5	7787.58	\N	/uploads/plans/de86ecc8-f620-4947-80a4-26fcadbc781c.pdf	2
46	2	4 Bedroom Contemporary	4	5842.86	\N	/uploads/plans/0b60ca2a-f4c5-444f-b07c-92819e8706f4.pdf	4
47	2	4 Bedroom Classic	4	5627.26	\N	/uploads/plans/b74a88b7-9fda-4640-ac44-8d9b148046a7.pdf	4
48	2	4 Bedroom Chamfer	4	5871.92	\N	/uploads/plans/8fc6e19d-abf9-4061-8e21-f2f6783a019e.pdf	4
49	2	4 Bedroom Classic	4	5665.58	\N	/uploads/plans/ca61e1f1-adbd-40fd-826d-7f7d774035a4.pdf	9
50	2	4 Bedroom Contemporary	4	5885.27	\N	/uploads/plans/c39d1aff-7bdc-4ccf-a433-0a7005b7987b.pdf	9
51	2	4 Bedroom Chamfer	4	5913.79	\N	/uploads/plans/786b55d2-a2c6-4913-9f2a-dfacf534d097.pdf	9
52	2	5 Bedroom Flat Chamfered	5	10388.13	\N	/uploads/plans/ccc2976a-ef18-4f1b-bc6d-fc698c890c52.pdf	10
53	2	5 Bedroom Drop Chamfered	5	11163.03	\N	/uploads/plans/b65ee8a4-5e46-4bea-ae5f-a498ee7790c9.pdf	10
55	2	6 Bedroom Drop Chamfered	6	11357.31	\N	/uploads/plans/881740d6-cc48-473c-94bb-faca2b0ee704.pdf	10
56	2	5 Bedroom Flat Contemporary	5	10224.95	\N	/uploads/plans/e8256035-8d5f-4798-b2b9-58d8fd0b5872.pdf	10
57	2	5 Bedroom Drop Contemporary	5	10996.4	\N	/uploads/plans/5e365b3d-1f9f-4972-989c-b6e883bc462c.pdf	10
58	2	6 Bedroom Flat Contemporary	6	12718.09	\N	/uploads/plans/89cc3503-293a-4816-917e-21f93112c5da.pdf	10
59	2	6 Bedroom Drop Contemporary	6	11297.9	\N	/uploads/plans/54ceabd1-1944-4d55-a655-a4b5cec0f7a2.pdf	10
60	2	5 Bedroom Flat Classic	5	10336.25	\N	/uploads/plans/95f1b7d6-cabe-459b-a5e3-a62cef9d0bee.pdf	10
64	2	4 Bedroom Ground Floor	4	7287.0	\N	/uploads/plans/6e555a32-9ebf-46b9-8027-dca17c36bb15.pdf	12
62	2	Small Mansion S1-B Faya	\N	6021.12	\N	/uploads/plans/f2f0202d-eace-4852-8fe7-d2da69c2ff6a.pdf	11
68	2	5 Bed Room First Floor	5	7986.0	\N	/uploads/plans/2f9e05ef-ea6a-4509-abfd-89c55b583113.pdf	12
73	2	5 Bedroom Roof Plan	5	10359.0	\N	/uploads/plans/1a067538-9bfa-44d0-97fa-8fd31b3a3b36.pdf	12
78	2	6 Bedroom Ground Floor	6	12859.0	\N	/uploads/plans/6f23396f-b57c-4670-9a1d-6fa3b199817c.pdf	12
82	2	4 Bedroom with Basement Classic	4	7301.15	\N	/uploads/plans/967322a7-8428-4a3e-bfd4-3d58259e86f9.pdf	13
87	2	5 Bedroom with Basement Classic	5	10362.84	\N	/uploads/plans/92eb4f08-4d00-4da7-9640-040948d7a1a9.pdf	13
96	1	4 Bedroom Oakley	4	2689.47	\N	/uploads/plans/ae124f67-5e6a-4702-b86c-d91b05e4539a.pdf	14
101	1	3 Bedroom Ravine	3	2514.34	\N	/uploads/plans/90c58bf4-51b4-4757-ab54-917c33cb6dec.pdf	14
61	2	Small Mansion S1-B Faya	\N	7137.66	\N	/uploads/plans/0017fab1-0817-49ff-8fc4-4f1651258dc7.pdf	11
63	2	Small Mansion S1-B Faya	\N	5853.63	\N	/uploads/plans/11e61b68-710f-4294-8d3e-224358964e49.pdf	11
67	2	5 Bed Room Ground Floor	5	7986.0	\N	/uploads/plans/c30df4ca-7e0c-48df-ae9f-606b4aa80de8.pdf	12
72	2	5 Bedroom First Floor	5	10359.0	\N	/uploads/plans/d36057e3-0226-4de7-a18e-ba91f9476f6d.pdf	12
77	2	5 Bedroom Roof Plan	5	11111.0	\N	/uploads/plans/cc720e5a-1058-45bd-9938-5f996998426d.pdf	12
86	2	5 Bedroom Chamfer	5	7922.34	\N	/uploads/plans/974058c8-da5c-40a9-a4f1-dccdf5fd5c28.pdf	13
91	2	6 Bedroom with Basement Chamfer	6	12958.77	\N	/uploads/plans/44e168aa-00a3-499e-b5af-d19aa50998de.pdf	13
95	1	4 Bedroom Slate	4	2659.76	\N	/uploads/plans/0be7f9f6-6e24-435b-a51d-58848d4fa01c.pdf	14
100	1	4 Bedroom Ravine	4	2731.55	\N	/uploads/plans/ae4d7e99-633c-420a-8e58-41e0c72650fb.pdf	14
65	2	4 Bedroom Basement	4	7287.0	\N	/uploads/plans/16b1ffbe-411f-4e78-8cfa-d7170275bc48.pdf	12
70	2	5 Bedroom Ground Floor	5	10359.0	\N	/uploads/plans/ffca74f2-39ba-44ed-a691-ca3738115b4e.pdf	12
75	2	5 Bedroom Basement	5	11111.0	\N	/uploads/plans/00bd1de4-f1ec-415b-8cf7-5dcb22ed0c03.pdf	12
80	2	6 Bedroom First Floor	6	12859.0	\N	/uploads/plans/b3e8725a-ddef-46cf-bf36-42e5574de73c.pdf	12
84	2	4 Bedroom with Basement Contemporary	4	7296.85	\N	/uploads/plans/6c9bb7c5-becd-4b49-a16f-9167220c95a5.pdf	13
89	2	5 Bedroom with Basement Contemporary	5	10310.63	\N	/uploads/plans/90bf0e11-1c69-4f64-af06-45de234844b4.pdf	13
92	1	4 Bedroom Slate	4	2718.96	\N	/uploads/plans/bb4e21eb-d359-45e7-90af-2b33d031417f.pdf	14
97	1	3 Bedroom Oakley	3	2477.63	\N	/uploads/plans/8d2ef033-a90b-4406-8332-fec47978636e.pdf	14
66	2	4 Bed Room First Floor	4	7287.0	\N	/uploads/plans/cdb7dff7-1937-4613-95c5-493a14ab1fef.pdf	12
71	2	5 Bedroom Basement	5	10359.0	\N	/uploads/plans/8598289b-b08d-4888-8d5b-f9b6406c936f.pdf	12
76	2	5 Bedroom First Floor	5	11111.0	\N	/uploads/plans/90cf5aec-a51a-4710-8e5a-1d46900a0420.pdf	12
81	2	6 Bedroom Roof Plan	6	12859.0	\N	/uploads/plans/599a5ee4-ce38-4e4e-a66e-50ef0f84b885.pdf	12
85	2	5 Bedroom Contemporary	5	8047.63	\N	/uploads/plans/b55ab9d6-6dfc-41a2-92f3-99f42eb87654.pdf	13
90	2	6 Bedroom with Basement Contemporary	6	12777.07	\N	/uploads/plans/b402e611-c421-4e44-8602-1cadffce1581.pdf	13
94	1	3 Bedroom Slate	3	2437.49	\N	/uploads/plans/73f3381c-0a91-4bc1-bf77-8381fdba62fb.pdf	14
99	1	4 Bedroom Oakley	4	2689.47	\N	/uploads/plans/2522bda1-0d44-4652-985a-20d0dd6078c5.pdf	14
69	2	5 Bed Room Roof Plan	5	7986.0	\N	/uploads/plans/7af8bebf-4545-48cf-bf2c-78f111a6501d.pdf	12
74	2	5 Bedroom Ground Floor	5	11111.0	\N	/uploads/plans/eefd56dd-0e07-44d4-a369-412782639de2.pdf	12
79	2	6 Bedroom Basement	6	12859.0	\N	/uploads/plans/c95939b2-7db7-4dc6-bd10-aad137a73f3d.pdf	12
83	2	4 Bedroom with Basement Chamfer	4	7268.86	\N	/uploads/plans/16cf2278-2e78-49f6-89c1-d1e24d125bec.pdf	13
88	2	5 Bedroom with Chamfer Chamfer	5	10394.05	\N	/uploads/plans/ee79c86a-e38f-4d2c-bf03-e69a48eae87c.pdf	13
93	1	3 Bedroom Slate	3	2452.02	\N	/uploads/plans/3a728d09-ae3a-4b91-964e-e4f0d47276d3.pdf	14
98	1	3 Bedroom Oakley	3	2478.93	\N	/uploads/plans/5205fd6b-eb45-45b4-a0e6-c2c062e7c515.pdf	14
102	1	4 Bedroom Ravine	4	2731.55	\N	/uploads/plans/a42c9d64-30ef-4dd6-9194-294f797f1b13.pdf	14
103	1	4 Bedroom Serene	4	2731.55	\N	/uploads/plans/3a8e13c6-bb30-46a7-b67d-469a0e24e4de.pdf	14
104	1	3 Bedroom Serene	3	2514.34	\N	/uploads/plans/5aa4115f-fa27-4332-ab3b-1ca100ae60a3.pdf	14
105	1	3 Bedroom Serene	3	2514.34	\N	/uploads/plans/22eaa8aa-0a54-4093-95bc-8bf1cc26c637.pdf	14
106	1	4 Bedroom Serene	4	2731.55	\N	/uploads/plans/76113cf8-4866-406c-8f06-5fb9b6065e64.pdf	14
107	1	4 Bedroom Nash	4	2695.28	\N	/uploads/plans/f9b00d85-5f1b-4990-afab-f598cfb9c237.pdf	14
108	1	3 Bedroom Nash	3	2695.28	\N	/uploads/plans/67fb7685-6be9-4262-8f82-88815f8f4d0e.pdf	14
109	1	3 Bedroom Nash	3	\N	\N	/uploads/plans/b3304edc-c712-4e03-90e2-a10a58330455.pdf	14
110	1	4 Bedroom Nash	4	2697.86	\N	/uploads/plans/679ea186-2b1f-474a-adae-47da1e0dd540.pdf	14
111	1	4 Bedroom Vale	4	2729.29	\N	/uploads/plans/071fe6ff-7b66-4176-8488-c870ea41cb46.pdf	14
112	1	3 Bedroom Vale	3	2492.17	\N	/uploads/plans/e775d9c2-48e2-46fd-8d15-3185318b15a1.pdf	14
113	1	3 Bedroom Vale	3	2492.17	\N	/uploads/plans/66ef6bd1-da34-4961-b35f-90bcde0f886a.pdf	14
114	1	4 Bedroom Vale	4	2729.29	\N	/uploads/plans/ca9b36fc-a9ca-4368-9167-36efb0281aa5.pdf	14
115	1	4 Bedroom Dale	4	2729.29	\N	/uploads/plans/443516e8-970f-4424-b5d2-dd9f08b3a96a.pdf	14
116	1	3 Bedroom Dale	3	2492.17	\N	/uploads/plans/a96adf37-ee93-4321-bcbe-5678cf6d9f33.pdf	14
117	1	3 Bedroom Dale	3	2492.17	\N	/uploads/plans/e8f5b297-f566-4401-9d18-85e3638631e1.pdf	14
118	1	4 Bedroom Dale	4	2729.29	\N	/uploads/plans/efd4cebe-f701-4240-baeb-7ee378b8853a.pdf	14
119	1	3 Bedroom I A Canna	3	2232.0	\N	/uploads/plans/f4abec77-8821-4334-99ad-8f71158627a0.pdf	15
120	1	3 Bedroom I A Canna Mirrored	3	2232.0	\N	/uploads/plans/750bd5db-e6de-431d-bded-0943dd2dcaf5.pdf	15
121	1	3 Bedroom I A Canna Mirrored	3	2237.0	\N	/uploads/plans/1dc460c9-9c46-4d80-b24d-13cdc65f49d5.pdf	15
122	1	3 Bedroom I B Canna	3	2442.0	\N	/uploads/plans/bf36c402-f0a9-46be-a510-3d6dc85d180d.pdf	15
123	1	3 Bedroom I B Canna Mirrored	3	2442.0	\N	/uploads/plans/50f57514-d141-4f40-9679-665b28eda756.pdf	15
124	1	4 Bedroom I A Canna	4	2683.0	\N	/uploads/plans/01ba1ad1-d1c4-4149-8c9a-e0b797cf2c5f.pdf	15
125	1	4 Bedroom I A Canna Mirrored	4	2683.0	\N	/uploads/plans/db60555e-089a-4c95-b0b8-a21741822c39.pdf	15
126	1	4 Bedroom I B Canna	4	2546.0	\N	/uploads/plans/c01fa151-e109-459f-800b-c53105d83f00.pdf	15
127	1	4 Bedroom I B Canna Mirrored	4	2546.0	\N	/uploads/plans/fa944e42-e5ad-4d2a-bd92-575397d0c19d.pdf	15
128	1	3 Bedroom I A Cedar	3	2363.0	\N	/uploads/plans/e164f8e9-fdcf-4eb8-b2bd-fc039444f131.pdf	15
129	1	4 Bedroom I A cedar Mirrored	4	2363.0	\N	/uploads/plans/f4725417-bfd3-4d36-9123-cd3890c4f981.pdf	15
130	1	3 Bedroom I B cedar	3	2347.0	\N	/uploads/plans/1e603d6d-b534-4cdd-810a-34898e86d9ff.pdf	15
131	1	3 Bedroom I B Cedar Mirrored	3	2347.0	\N	/uploads/plans/219cc115-ade8-40a8-a60f-d5eab55b0f0b.pdf	15
132	1	4 Bedroom I A Cedar	4	2635.0	\N	/uploads/plans/1e0cede4-de9c-47de-91d2-1d19f2a326a1.pdf	15
133	1	4 Bedroom I A Cedar Mirrored	4	2635.0	\N	/uploads/plans/47aab29e-e09b-452d-907b-ffb72ba33876.pdf	15
134	1	4 Bedroom I B Cedar	4	2600.0	\N	/uploads/plans/4c8e7fba-3686-4b57-949c-32fc349617c1.pdf	15
135	1	4 Bedroom I B Cedar Mirrored	4	2600.0	\N	/uploads/plans/c2a15995-f7f3-4aed-a80a-7575654569cc.pdf	15
\.


--
-- Data for Name: interaction_notes; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.interaction_notes (note_id, customer_id, agent_id, note_text, created_at) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.projects (project_id, project_name, neighborhood_name, layout_plan_path) FROM stdin;
1	The Valley	\N	\N
2	The Oasis	\N	\N
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.properties (property_id, villa_number, owner_customer_id, project_id, plan_id, is_corner, is_lake_front, is_park_front, is_beach, is_market, property_status, created_at, community_id) FROM stdin;
142	1	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
143	2	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
144	3	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
145	4	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
146	5	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
147	6	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
148	7	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
149	8	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
150	9	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
151	10	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
152	11	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
153	12	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
154	13	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
155	14	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
156	15	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
157	16	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
158	17	\N	2	39	f	t	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
159	18	\N	2	39	f	t	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
160	19	\N	2	39	f	t	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
161	20	\N	2	39	f	t	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
162	21	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
163	22	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
164	23	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
165	24	\N	2	40	t	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
166	25	\N	2	39	t	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
167	26	\N	2	39	t	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
168	27	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
169	28	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
170	29	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
171	30	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
172	31	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
173	32	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
174	33	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
175	34	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
176	35	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
177	36	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
178	37	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
179	38	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
180	39	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
181	40	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
182	41	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
184	43	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
185	44	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
186	45	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
187	46	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
188	47	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
189	48	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
190	49	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
191	50	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
192	51	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
193	52	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
194	53	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
195	54	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
196	55	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
197	56	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
198	57	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
199	58	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
200	59	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
201	60	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
202	61	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
203	62	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
204	63	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
205	64	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
206	65	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
207	66	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
208	67	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
209	68	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
210	69	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
211	70	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
212	71	\N	2	42	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
213	72	\N	2	43	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
214	73	\N	2	42	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
215	74	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
216	75	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
217	76	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
218	77	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
219	78	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
220	79	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
221	80	\N	2	43	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
222	81	\N	2	42	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
223	82	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
224	83	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
225	84	\N	2	45	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
226	85	\N	2	45	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
227	102	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
228	103	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
229	104	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
230	105	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
231	106	\N	2	40	t	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
232	107	\N	2	40	t	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
233	108	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
234	109	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
235	110	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
236	111	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
237	112	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
238	113	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
239	114	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
240	115	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
241	116	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
242	117	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
243	118	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
244	119	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
245	120	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
246	121	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
247	122	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
248	123	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
249	124	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
250	125	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
251	126	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
252	127	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
253	128	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
254	129	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
255	130	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
256	131	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
257	132	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
258	133	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
259	134	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
260	135	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
261	136	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
262	137	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
263	138	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
264	139	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
265	140	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
266	141	\N	2	41	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
267	142	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
268	143	\N	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
269	144	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
270	145	\N	2	39	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
271	146	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
272	147	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
273	148	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
274	149	\N	2	42	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
275	150	\N	2	43	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
276	151	\N	2	42	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
277	152	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
278	153	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
279	154	\N	2	44	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
280	155	\N	2	45	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
281	156	\N	2	45	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
282	157	\N	2	45	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
183	42	3	2	40	f	f	f	f	f	Off-Market	2026-04-01 16:42:53.645979	2
283	266	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
284	267	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
285	268	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
286	269	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
287	270	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
288	271	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
289	272	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
290	273	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
291	274	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
292	275	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
293	276	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
294	277	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
295	278	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
296	279	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
297	280	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
298	281	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
299	282	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
300	283	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
301	284	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
302	285	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
303	286	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
304	287	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
305	288	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
306	289	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
307	290	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
308	291	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
309	292	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
310	293	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
311	294	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
312	295	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
313	296	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
314	297	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
315	298	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
316	299	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
317	300	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
318	301	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
319	302	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
320	303	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
321	304	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
322	305	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
323	306	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
324	307	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
325	308	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
326	309	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
327	310	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
328	311	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
329	312	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
330	313	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
331	314	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
332	315	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
333	316	\N	2	46	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
334	317	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
335	318	\N	2	48	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
336	319	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
337	320	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
338	321	\N	2	47	f	f	f	f	f	Off-Market	2026-04-06 18:18:30.290338	4
339	322	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
340	323	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
341	324	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
342	325	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
343	326	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
344	327	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
345	328	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
346	329	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
347	330	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
348	331	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
349	332	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
350	333	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
351	334	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
352	337	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
353	338	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
354	339	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
355	340	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
356	341	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
357	342	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
358	343	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
359	344	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
360	345	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
361	346	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
362	347	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
363	348	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
364	349	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
365	350	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
366	351	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
367	352	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
368	353	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
369	354	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
370	355	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
371	356	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
372	357	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
373	358	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
374	359	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
375	360	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
376	361	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
377	362	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
378	363	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
379	364	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
380	365	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
381	366	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
382	369	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
383	370	\N	2	49	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
384	371	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
385	372	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
386	373	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
387	374	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
388	375	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
389	376	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
390	377	\N	2	51	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
391	378	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
392	379	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
393	380	\N	2	50	f	f	f	f	f	Off-Market	2026-04-06 19:14:29.654604	9
\.


--
-- Data for Name: property_attribute_definitions; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.property_attribute_definitions (attribute_definition_id, key, label, value_type, options, sort_order, is_active, is_system, created_at) FROM stdin;
1	is_corner	Corner	boolean	[]	10	t	t	2026-04-01 15:40:56.081641
2	is_lake_front	Lake-front	boolean	[]	20	t	t	2026-04-01 15:40:56.081641
3	is_park_front	Park-front	boolean	[]	30	t	t	2026-04-01 15:40:56.081641
4	is_beach	Beachfront	boolean	[]	40	t	t	2026-04-01 15:40:56.081641
5	is_market	Market-facing	boolean	[]	50	t	t	2026-04-01 15:40:56.081641
9	property_type	Property Type	select	["4 BR Villa", "5 BR Villa Type 1", "5 BR Villa Type 2"]	100	t	f	2026-04-01 16:42:53.645979
10	property_style	Property Style	select	["Chamfered", "Classical", "Contemporary"]	110	t	f	2026-04-01 16:42:53.645979
17	perimeter	Perimeter	boolean	[]	110	t	f	2026-04-01 19:46:14.211158
18	near_road	Road-facing	boolean	[]	120	t	f	2026-04-01 19:46:14.211158
19	near_water	Near Water	boolean	[]	130	t	f	2026-04-01 19:46:14.211158
20	internal_waterway	Internal Waterway	boolean	[]	140	t	f	2026-04-01 19:46:14.211158
21	near_amenities	Near Amenities	boolean	[]	150	t	f	2026-04-01 19:46:14.211158
22	internal_cluster	Internal Cluster	boolean	[]	160	t	f	2026-04-01 19:46:14.211158
11	property_location	Property Location	select	["Corner / Near Water", "Corner / Road", "Internal Cluster", "Internal Waterway", "Internal Waterway / Near Lake", "Internal Waterway / Near Water", "Near Amenities (B, C) / Water", "Near Water", "Near Water (C)", "Near Water (C, D)", "Near Water (D)", "Near Water / Internal Waterway", "Perimeter", "Perimeter / Near Water", "Perimeter / Near Water (D)", "Perimeter / Road"]	120	f	f	2026-04-01 16:42:53.645979
\.


--
-- Data for Name: property_attribute_values; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.property_attribute_values (property_id, attribute_definition_id, value_boolean, value_text, value_number, created_at) FROM stdin;
142	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
143	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
144	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
145	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
146	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
147	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
148	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
149	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
150	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
151	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
152	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
153	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
154	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
155	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
156	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
157	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
158	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
159	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
160	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
161	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
162	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
163	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
164	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
165	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
166	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
167	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
168	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
169	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
170	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
171	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
172	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
173	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
174	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
175	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
176	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
177	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
178	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
179	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
180	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
181	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
182	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
183	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
184	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
185	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
186	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
187	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
188	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
189	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
190	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
191	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
192	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
193	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
194	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
195	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
196	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
197	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
198	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
199	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
200	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
201	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
202	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
203	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
204	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
205	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
206	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
207	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
208	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
209	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
210	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
211	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
212	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
213	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
214	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
215	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
216	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
217	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
218	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
219	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
220	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
221	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
222	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
223	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
224	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
225	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
226	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
227	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
228	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
229	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
230	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
231	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
232	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
233	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
234	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
235	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
236	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
237	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
238	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
239	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
240	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
241	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
242	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
243	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
244	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
245	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
246	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
247	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
248	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
249	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
250	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
251	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
252	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
253	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
254	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
255	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
256	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
257	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
258	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
259	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
260	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
261	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
262	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
263	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
264	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
265	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
266	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
267	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
268	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
269	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
270	9	\N	4 BR Villa	\N	2026-04-01 16:42:53.645979
271	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
272	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
273	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
274	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
275	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
276	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
277	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
278	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
279	9	\N	5 BR Villa Type 1	\N	2026-04-01 16:42:53.645979
280	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
281	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
282	9	\N	5 BR Villa Type 2	\N	2026-04-01 16:42:53.645979
142	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
143	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
144	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
145	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
146	10	\N	Classical	\N	2026-04-01 16:42:53.645979
147	10	\N	Classical	\N	2026-04-01 16:42:53.645979
148	10	\N	Classical	\N	2026-04-01 16:42:53.645979
149	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
150	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
151	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
152	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
153	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
154	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
155	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
156	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
157	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
158	10	\N	Classical	\N	2026-04-01 16:42:53.645979
159	10	\N	Classical	\N	2026-04-01 16:42:53.645979
160	10	\N	Classical	\N	2026-04-01 16:42:53.645979
161	10	\N	Classical	\N	2026-04-01 16:42:53.645979
162	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
163	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
164	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
165	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
166	10	\N	Classical	\N	2026-04-01 16:42:53.645979
167	10	\N	Classical	\N	2026-04-01 16:42:53.645979
168	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
169	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
170	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
171	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
172	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
173	10	\N	Classical	\N	2026-04-01 16:42:53.645979
174	10	\N	Classical	\N	2026-04-01 16:42:53.645979
175	10	\N	Classical	\N	2026-04-01 16:42:53.645979
176	10	\N	Classical	\N	2026-04-01 16:42:53.645979
177	10	\N	Classical	\N	2026-04-01 16:42:53.645979
178	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
179	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
180	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
181	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
182	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
183	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
184	10	\N	Classical	\N	2026-04-01 16:42:53.645979
185	10	\N	Classical	\N	2026-04-01 16:42:53.645979
186	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
187	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
188	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
189	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
190	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
191	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
192	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
193	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
194	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
195	10	\N	Classical	\N	2026-04-01 16:42:53.645979
196	10	\N	Classical	\N	2026-04-01 16:42:53.645979
197	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
198	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
199	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
200	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
201	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
202	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
203	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
204	10	\N	Classical	\N	2026-04-01 16:42:53.645979
205	10	\N	Classical	\N	2026-04-01 16:42:53.645979
206	10	\N	Classical	\N	2026-04-01 16:42:53.645979
207	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
208	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
209	10	\N	Classical	\N	2026-04-01 16:42:53.645979
210	10	\N	Classical	\N	2026-04-01 16:42:53.645979
211	10	\N	Classical	\N	2026-04-01 16:42:53.645979
212	10	\N	Classical	\N	2026-04-01 16:42:53.645979
213	10	\N	Classical	\N	2026-04-01 16:42:53.645979
214	10	\N	Classical	\N	2026-04-01 16:42:53.645979
215	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
216	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
217	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
218	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
219	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
220	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
221	10	\N	Classical	\N	2026-04-01 16:42:53.645979
222	10	\N	Classical	\N	2026-04-01 16:42:53.645979
223	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
224	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
225	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
226	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
227	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
228	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
229	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
230	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
231	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
232	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
233	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
234	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
235	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
236	10	\N	Classical	\N	2026-04-01 16:42:53.645979
237	10	\N	Classical	\N	2026-04-01 16:42:53.645979
238	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
239	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
240	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
241	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
242	10	\N	Classical	\N	2026-04-01 16:42:53.645979
243	10	\N	Classical	\N	2026-04-01 16:42:53.645979
244	10	\N	Classical	\N	2026-04-01 16:42:53.645979
245	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
246	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
247	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
248	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
249	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
250	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
251	10	\N	Classical	\N	2026-04-01 16:42:53.645979
252	10	\N	Classical	\N	2026-04-01 16:42:53.645979
253	10	\N	Classical	\N	2026-04-01 16:42:53.645979
254	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
255	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
256	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
257	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
258	10	\N	Classical	\N	2026-04-01 16:42:53.645979
259	10	\N	Classical	\N	2026-04-01 16:42:53.645979
260	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
261	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
262	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
263	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
264	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
265	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
266	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
267	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
268	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
269	10	\N	Classical	\N	2026-04-01 16:42:53.645979
270	10	\N	Classical	\N	2026-04-01 16:42:53.645979
271	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
272	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
273	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
274	10	\N	Classical	\N	2026-04-01 16:42:53.645979
275	10	\N	Classical	\N	2026-04-01 16:42:53.645979
276	10	\N	Classical	\N	2026-04-01 16:42:53.645979
277	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
278	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
279	10	\N	Contemporary	\N	2026-04-01 16:42:53.645979
280	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
281	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
282	10	\N	Chamfered	\N	2026-04-01 16:42:53.645979
142	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
143	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
144	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
145	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
146	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
147	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
148	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
149	11	\N	Near Amenities (B, C) / Water	\N	2026-04-01 16:42:53.645979
150	11	\N	Near Amenities (B, C) / Water	\N	2026-04-01 16:42:53.645979
151	11	\N	Near Amenities (B, C) / Water	\N	2026-04-01 16:42:53.645979
152	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
153	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
154	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
155	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
156	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
157	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
158	11	\N	Internal Waterway / Near Lake	\N	2026-04-01 16:42:53.645979
159	11	\N	Internal Waterway / Near Lake	\N	2026-04-01 16:42:53.645979
160	11	\N	Internal Waterway / Near Lake	\N	2026-04-01 16:42:53.645979
161	11	\N	Internal Waterway / Near Lake	\N	2026-04-01 16:42:53.645979
162	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
163	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
164	11	\N	Perimeter / Road	\N	2026-04-01 16:42:53.645979
165	11	\N	Corner / Road	\N	2026-04-01 16:42:53.645979
166	11	\N	Corner / Near Water	\N	2026-04-01 16:42:53.645979
167	11	\N	Corner / Near Water	\N	2026-04-01 16:42:53.645979
168	11	\N	Internal Waterway / Near Water	\N	2026-04-01 16:42:53.645979
169	11	\N	Internal Waterway / Near Water	\N	2026-04-01 16:42:53.645979
170	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
171	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
172	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
173	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
174	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
175	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
176	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
177	11	\N	Internal Cluster	\N	2026-04-01 16:42:53.645979
178	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
179	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
180	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
181	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
182	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
183	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
184	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
185	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
186	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
187	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
188	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
189	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
190	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
191	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
192	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
193	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
194	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
195	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
196	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
197	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
198	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
199	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
200	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
201	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
202	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
203	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
204	11	\N	Near Water (C, D)	\N	2026-04-01 16:42:53.645979
205	11	\N	Near Water (C, D)	\N	2026-04-01 16:42:53.645979
206	11	\N	Near Water (C, D)	\N	2026-04-01 16:42:53.645979
207	11	\N	Near Water (D)	\N	2026-04-01 16:42:53.645979
208	11	\N	Near Water (D)	\N	2026-04-01 16:42:53.645979
209	11	\N	Near Water (D)	\N	2026-04-01 16:42:53.645979
210	11	\N	Near Water (D)	\N	2026-04-01 16:42:53.645979
211	11	\N	Near Water (D)	\N	2026-04-01 16:42:53.645979
212	11	\N	Near Water (C)	\N	2026-04-01 16:42:53.645979
213	11	\N	Near Water (C)	\N	2026-04-01 16:42:53.645979
214	11	\N	Near Water (C)	\N	2026-04-01 16:42:53.645979
215	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
216	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
217	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
218	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
219	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
220	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
221	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
222	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
223	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
224	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
225	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
226	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
227	11	\N	Perimeter / Near Water	\N	2026-04-01 16:42:53.645979
228	11	\N	Perimeter / Near Water	\N	2026-04-01 16:42:53.645979
229	11	\N	Perimeter / Near Water	\N	2026-04-01 16:42:53.645979
230	11	\N	Perimeter / Near Water	\N	2026-04-01 16:42:53.645979
231	11	\N	Corner / Near Water	\N	2026-04-01 16:42:53.645979
232	11	\N	Corner / Near Water	\N	2026-04-01 16:42:53.645979
233	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
234	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
235	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
236	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
237	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
238	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
239	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
240	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
241	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
242	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
243	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
244	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
245	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
246	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
247	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
248	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
249	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
250	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
251	11	\N	Internal Waterway / Near Water	\N	2026-04-01 16:42:53.645979
252	11	\N	Internal Waterway / Near Water	\N	2026-04-01 16:42:53.645979
253	11	\N	Internal Waterway / Near Water	\N	2026-04-01 16:42:53.645979
254	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
255	11	\N	Near Water	\N	2026-04-01 16:42:53.645979
256	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
257	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
258	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
259	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
260	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
261	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
262	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
263	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
264	11	\N	Near Water / Internal Waterway	\N	2026-04-01 16:42:53.645979
265	11	\N	Near Water / Internal Waterway	\N	2026-04-01 16:42:53.645979
266	11	\N	Near Water / Internal Waterway	\N	2026-04-01 16:42:53.645979
267	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
268	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
269	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
270	11	\N	Internal Waterway	\N	2026-04-01 16:42:53.645979
271	11	\N	Perimeter / Near Water (D)	\N	2026-04-01 16:42:53.645979
272	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
273	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
274	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
275	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
276	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
277	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
278	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
279	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
280	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
281	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
282	11	\N	Perimeter	\N	2026-04-01 16:42:53.645979
165	1	t	\N	\N	\N
166	1	t	\N	\N	\N
167	1	t	\N	\N	\N
231	1	t	\N	\N	\N
232	1	t	\N	\N	\N
158	2	t	\N	\N	\N
159	2	t	\N	\N	\N
160	2	t	\N	\N	\N
161	2	t	\N	\N	\N
142	17	t	\N	\N	\N
143	17	t	\N	\N	\N
144	17	t	\N	\N	\N
145	17	t	\N	\N	\N
146	17	t	\N	\N	\N
147	17	t	\N	\N	\N
148	17	t	\N	\N	\N
162	17	t	\N	\N	\N
163	17	t	\N	\N	\N
164	17	t	\N	\N	\N
219	17	t	\N	\N	\N
220	17	t	\N	\N	\N
221	17	t	\N	\N	\N
222	17	t	\N	\N	\N
223	17	t	\N	\N	\N
224	17	t	\N	\N	\N
225	17	t	\N	\N	\N
226	17	t	\N	\N	\N
227	17	t	\N	\N	\N
228	17	t	\N	\N	\N
229	17	t	\N	\N	\N
230	17	t	\N	\N	\N
271	17	t	\N	\N	\N
272	17	t	\N	\N	\N
273	17	t	\N	\N	\N
274	17	t	\N	\N	\N
275	17	t	\N	\N	\N
276	17	t	\N	\N	\N
277	17	t	\N	\N	\N
278	17	t	\N	\N	\N
279	17	t	\N	\N	\N
280	17	t	\N	\N	\N
281	17	t	\N	\N	\N
282	17	t	\N	\N	\N
142	18	t	\N	\N	\N
143	18	t	\N	\N	\N
144	18	t	\N	\N	\N
145	18	t	\N	\N	\N
146	18	t	\N	\N	\N
147	18	t	\N	\N	\N
148	18	t	\N	\N	\N
162	18	t	\N	\N	\N
163	18	t	\N	\N	\N
164	18	t	\N	\N	\N
165	18	t	\N	\N	\N
149	19	t	\N	\N	\N
150	19	t	\N	\N	\N
151	19	t	\N	\N	\N
166	19	t	\N	\N	\N
167	19	t	\N	\N	\N
168	19	t	\N	\N	\N
169	19	t	\N	\N	\N
178	19	t	\N	\N	\N
179	19	t	\N	\N	\N
180	19	t	\N	\N	\N
181	19	t	\N	\N	\N
182	19	t	\N	\N	\N
183	19	t	\N	\N	\N
204	19	t	\N	\N	\N
205	19	t	\N	\N	\N
206	19	t	\N	\N	\N
207	19	t	\N	\N	\N
208	19	t	\N	\N	\N
209	19	t	\N	\N	\N
210	19	t	\N	\N	\N
211	19	t	\N	\N	\N
212	19	t	\N	\N	\N
213	19	t	\N	\N	\N
214	19	t	\N	\N	\N
215	19	t	\N	\N	\N
216	19	t	\N	\N	\N
217	19	t	\N	\N	\N
218	19	t	\N	\N	\N
227	19	t	\N	\N	\N
228	19	t	\N	\N	\N
229	19	t	\N	\N	\N
230	19	t	\N	\N	\N
231	19	t	\N	\N	\N
232	19	t	\N	\N	\N
233	19	t	\N	\N	\N
242	19	t	\N	\N	\N
243	19	t	\N	\N	\N
244	19	t	\N	\N	\N
251	19	t	\N	\N	\N
252	19	t	\N	\N	\N
253	19	t	\N	\N	\N
254	19	t	\N	\N	\N
255	19	t	\N	\N	\N
264	19	t	\N	\N	\N
265	19	t	\N	\N	\N
266	19	t	\N	\N	\N
271	19	t	\N	\N	\N
152	20	t	\N	\N	\N
153	20	t	\N	\N	\N
154	20	t	\N	\N	\N
155	20	t	\N	\N	\N
156	20	t	\N	\N	\N
157	20	t	\N	\N	\N
158	20	t	\N	\N	\N
159	20	t	\N	\N	\N
160	20	t	\N	\N	\N
161	20	t	\N	\N	\N
168	20	t	\N	\N	\N
169	20	t	\N	\N	\N
184	20	t	\N	\N	\N
185	20	t	\N	\N	\N
186	20	t	\N	\N	\N
187	20	t	\N	\N	\N
188	20	t	\N	\N	\N
189	20	t	\N	\N	\N
190	20	t	\N	\N	\N
191	20	t	\N	\N	\N
192	20	t	\N	\N	\N
193	20	t	\N	\N	\N
194	20	t	\N	\N	\N
195	20	t	\N	\N	\N
196	20	t	\N	\N	\N
197	20	t	\N	\N	\N
198	20	t	\N	\N	\N
199	20	t	\N	\N	\N
200	20	t	\N	\N	\N
201	20	t	\N	\N	\N
202	20	t	\N	\N	\N
203	20	t	\N	\N	\N
234	20	t	\N	\N	\N
235	20	t	\N	\N	\N
236	20	t	\N	\N	\N
237	20	t	\N	\N	\N
238	20	t	\N	\N	\N
239	20	t	\N	\N	\N
240	20	t	\N	\N	\N
241	20	t	\N	\N	\N
245	20	t	\N	\N	\N
246	20	t	\N	\N	\N
247	20	t	\N	\N	\N
248	20	t	\N	\N	\N
249	20	t	\N	\N	\N
250	20	t	\N	\N	\N
251	20	t	\N	\N	\N
252	20	t	\N	\N	\N
253	20	t	\N	\N	\N
256	20	t	\N	\N	\N
257	20	t	\N	\N	\N
258	20	t	\N	\N	\N
259	20	t	\N	\N	\N
260	20	t	\N	\N	\N
261	20	t	\N	\N	\N
262	20	t	\N	\N	\N
263	20	t	\N	\N	\N
264	20	t	\N	\N	\N
265	20	t	\N	\N	\N
266	20	t	\N	\N	\N
267	20	t	\N	\N	\N
268	20	t	\N	\N	\N
269	20	t	\N	\N	\N
270	20	t	\N	\N	\N
149	21	t	\N	\N	\N
150	21	t	\N	\N	\N
151	21	t	\N	\N	\N
170	22	t	\N	\N	\N
171	22	t	\N	\N	\N
172	22	t	\N	\N	\N
173	22	t	\N	\N	\N
174	22	t	\N	\N	\N
175	22	t	\N	\N	\N
176	22	t	\N	\N	\N
177	22	t	\N	\N	\N
283	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
284	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
285	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
286	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
287	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
288	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
289	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
290	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
291	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
292	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
293	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
294	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
295	10	\N	Classical	\N	2026-04-06 18:44:46.648892
296	10	\N	Classical	\N	2026-04-06 18:44:46.648892
297	10	\N	Classical	\N	2026-04-06 18:44:46.648892
298	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
299	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
300	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
301	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
302	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
303	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
304	10	\N	Classical	\N	2026-04-06 18:44:46.648892
305	10	\N	Classical	\N	2026-04-06 18:44:46.648892
306	10	\N	Classical	\N	2026-04-06 18:44:46.648892
307	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
308	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
309	10	\N	Classical	\N	2026-04-06 18:44:46.648892
310	10	\N	Classical	\N	2026-04-06 18:44:46.648892
311	10	\N	Classical	\N	2026-04-06 18:44:46.648892
312	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
313	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
314	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
315	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
316	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
317	10	\N	Classical	\N	2026-04-06 18:44:46.648892
318	10	\N	Classical	\N	2026-04-06 18:44:46.648892
319	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
320	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
321	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
322	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
323	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
324	10	\N	Classical	\N	2026-04-06 18:44:46.648892
325	10	\N	Classical	\N	2026-04-06 18:44:46.648892
326	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
327	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
328	10	\N	Classical	\N	2026-04-06 18:44:46.648892
329	10	\N	Classical	\N	2026-04-06 18:44:46.648892
330	10	\N	Classical	\N	2026-04-06 18:44:46.648892
331	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
332	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
333	10	\N	Contemporary	\N	2026-04-06 18:44:46.648892
334	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
335	10	\N	Chamfered	\N	2026-04-06 18:44:46.648892
336	10	\N	Classical	\N	2026-04-06 18:44:46.648892
337	10	\N	Classical	\N	2026-04-06 18:44:46.648892
338	10	\N	Classical	\N	2026-04-06 18:44:46.648892
283	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
284	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
285	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
286	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
287	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
288	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
289	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
290	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
291	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
292	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
293	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
294	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
295	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
296	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
297	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
298	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
299	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
300	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
301	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
302	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
303	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
304	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
305	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
306	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
307	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
308	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
309	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
310	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
311	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
312	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
313	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
314	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
315	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
316	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
317	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
318	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
319	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
320	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
321	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
322	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
323	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
324	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
325	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
326	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
327	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
328	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
329	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
330	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
331	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
332	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
333	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
334	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
335	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
336	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
337	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
338	9	\N	4 BR Villa	\N	2026-04-06 18:44:46.648892
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.transactions (transaction_id, property_id, transaction_date, transaction_type, price, notes, created_at, project_id, community_id, plan_id, source_reference, transaction_recorded_at, transaction_group, transaction_procedure, procedure_area, actual_area, usage, area_name, property_type, property_sub_type, is_offplan, is_freehold, buyer_count, seller_count, source_metadata) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: crm_user
--

COPY public.users (user_id, email, hashed_password, full_name, is_active, is_admin, created_at) FROM stdin;
1	admin@11prop.com	$2b$12$M6R//aJMVsdnlt.QS6huxOL2aRRKqQZEc/tKkg701sP2NB5kBOQ2y	System Administrator	t	t	2026-03-28 11:28:02.20876
2	khizer.saleem@11prop.com	$2b$12$7CK8fmn7KpwqNQbmVzE0meXHPdX.6f8Xn1/2TXq6trKUEgkIHp4UC	Khizer Saleem Malik	t	t	2026-03-28 11:59:23.175018
3	sadaf@11prop.com	$2b$12$2Dxd3878I9lh.tBCSz0fNeW6FsAu8iC197K2ONEb/sSmof4iyiBji	Sadaf Zameer	t	t	2026-03-28 12:04:18.201113
4	ahmed@11prop.com	$2b$12$5UpQKsGoGXNBw3fjMAz0OuuUyy6NpQXB1/521wqghJudClgaEX86C	Ahmed Cheema	t	t	2026-03-28 12:04:36.421174
\.


--
-- Name: agents_agent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.agents_agent_id_seq', 2, true);


--
-- Name: communities_community_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.communities_community_id_seq', 15, true);


--
-- Name: customers_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.customers_customer_id_seq', 4, true);


--
-- Name: floor_plans_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.floor_plans_plan_id_seq', 135, true);


--
-- Name: interaction_notes_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.interaction_notes_note_id_seq', 1, false);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 2, true);


--
-- Name: properties_property_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.properties_property_id_seq', 393, true);


--
-- Name: property_attribute_definitions_attribute_definition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.property_attribute_definitions_attribute_definition_id_seq', 99, true);


--
-- Name: transactions_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.transactions_transaction_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: crm_user
--

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (agent_id);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (community_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (customer_id);


--
-- Name: floor_plans floor_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.floor_plans
    ADD CONSTRAINT floor_plans_pkey PRIMARY KEY (plan_id);


--
-- Name: interaction_notes interaction_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.interaction_notes
    ADD CONSTRAINT interaction_notes_pkey PRIMARY KEY (note_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (property_id);


--
-- Name: property_attribute_definitions property_attribute_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.property_attribute_definitions
    ADD CONSTRAINT property_attribute_definitions_pkey PRIMARY KEY (attribute_definition_id);


--
-- Name: property_attribute_values property_attribute_values_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.property_attribute_values
    ADD CONSTRAINT property_attribute_values_pkey PRIMARY KEY (property_id, attribute_definition_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id);


--
-- Name: communities uq_communities_project_name; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT uq_communities_project_name UNIQUE (project_id, community_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: ix_communities_community_id; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX ix_communities_community_id ON public.communities USING btree (community_id);


--
-- Name: ix_communities_project_id; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX ix_communities_project_id ON public.communities USING btree (project_id);


--
-- Name: ix_property_attribute_definitions_attribute_definition_id; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE INDEX ix_property_attribute_definitions_attribute_definition_id ON public.property_attribute_definitions USING btree (attribute_definition_id);


--
-- Name: ix_property_attribute_definitions_key; Type: INDEX; Schema: public; Owner: crm_user
--

CREATE UNIQUE INDEX ix_property_attribute_definitions_key ON public.property_attribute_definitions USING btree (key);


--
-- Name: communities communities_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: customers customers_assigned_buyer_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_assigned_buyer_agent_id_fkey FOREIGN KEY (assigned_buyer_agent_id) REFERENCES public.agents(agent_id) ON DELETE SET NULL;


--
-- Name: customers customers_assigned_seller_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_assigned_seller_agent_id_fkey FOREIGN KEY (assigned_seller_agent_id) REFERENCES public.agents(agent_id) ON DELETE SET NULL;


--
-- Name: floor_plans floor_plans_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.floor_plans
    ADD CONSTRAINT floor_plans_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(community_id) ON DELETE SET NULL;


--
-- Name: floor_plans floor_plans_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.floor_plans
    ADD CONSTRAINT floor_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: interaction_notes interaction_notes_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.interaction_notes
    ADD CONSTRAINT interaction_notes_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.agents(agent_id) ON DELETE SET NULL;


--
-- Name: interaction_notes interaction_notes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.interaction_notes
    ADD CONSTRAINT interaction_notes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(customer_id) ON DELETE CASCADE;


--
-- Name: properties properties_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(community_id) ON DELETE SET NULL;


--
-- Name: properties properties_owner_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_owner_customer_id_fkey FOREIGN KEY (owner_customer_id) REFERENCES public.customers(customer_id) ON DELETE SET NULL;


--
-- Name: properties properties_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.floor_plans(plan_id);


--
-- Name: properties properties_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id);


--
-- Name: property_attribute_values property_attribute_values_attribute_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.property_attribute_values
    ADD CONSTRAINT property_attribute_values_attribute_definition_id_fkey FOREIGN KEY (attribute_definition_id) REFERENCES public.property_attribute_definitions(attribute_definition_id) ON DELETE CASCADE;


--
-- Name: property_attribute_values property_attribute_values_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.property_attribute_values
    ADD CONSTRAINT property_attribute_values_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;


--
-- Name: transactions transactions_community_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_community_id_fkey FOREIGN KEY (community_id) REFERENCES public.communities(community_id) ON DELETE SET NULL;


--
-- Name: transactions transactions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.floor_plans(plan_id) ON DELETE SET NULL;


--
-- Name: transactions transactions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE SET NULL;


--
-- Name: transactions transactions_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: crm_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(property_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict L2fmOdy9THggwKGAzgIj9yZUXVQVKxH4xJyqSvFEchsnz0vqzEV3ndWo5rfGNZ7

