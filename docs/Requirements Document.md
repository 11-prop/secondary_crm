# Real Estate CRM - Requirements Document

## 1. System Overview

A custom CRM designed for real estate management, allowing the secure tracking of customers, projects, floor plans, specific property units (villas/townhouses), and historical transactions. The system is operated exclusively by a centralized Data Analyst/Manager. It must strictly protect PII, track lead protection rules between specialized agents, provide robust data entry and bulk import methods, and offer a highly readable, visually rich user experience with physically stored image assets.

## 2. Core Entities

-   **System Users**: Individuals authorized to log into the CRM.
    -   _Current Structure_: Limited strictly to Data Analysts / Managers (Admin role).
-   **Agents (Data Entity)**: The internal sales team members.
    -   _Current Team Structure_: 2 Buyer Agents, 2 Seller Agents.
-   **Customers**: Store contact details and client type tags (Buyer, Seller, Both, Prospect). _(Contains PII - Requires secure access)._
    -   **Agent Assignment**: Customers can be linked to a specific Buyer Agent, a specific Seller Agent, or both.
-   **Interaction Notes (Ledger/Timeline)**: Time-stamped, append-only records of interactions or updates related to a specific customer, maintaining a full history rather than a single overwritable text box.
-   **Projects**: Define neighborhoods/communities and store references to actual layout plan images.
-   **Floor Plans**: Standardized layouts within projects, defining square footage, room counts, amenities, and storing references to the actual floor plan images.
-   **Properties**: Specific physical units linked to a project, a floor plan, and an owner.
    -   **Location Attributes**: Corner, lake-front, park-front, beach, market, etc.
    -   **Property Status**: Identifies the current state of the unit (e.g., Primary Residence, Active Listing, Rented, Off-Market).
-   **Historical Transactions**: Records of past sales or rentals associated with a property (includes date, transaction type, price, and associated sizes/project context).

## 3. Functional Requirements

-   **Authentication & Security**:
    -   The Data Analyst/Manager must authenticate via Email and Password to access the CRM (JWT-based session).
    -   The system is closed to the public and to external sales agents.
-   **Data Entry & Management (CRUD)**:
    -   **Agent Management**: Ability to add new agents, deactivate former agents, or reassign their roles.
    -   **Forms**: The system must provide intuitive UI forms to manually add new Customers, Projects, Floor Plans, Properties, and log new Interaction Notes.
    -   **Linking**: Ability to easily link a new Property to an existing Customer, Project, and Floor Plan during data entry.
-   **Bulk Import & Initial Load**:
    -   **Excel Parsing**: The system must provide an upload interface for the Analyst to import existing Excel spreadsheets, which automatically parses and populates the Customers, Projects, and Properties tables to prevent manual data entry bottleneck.
-   **File & Asset Storage Strategy**:
    -   **Physical Path Storage**: Layout plan images and floor plan images must be stored as files on a physical storage path (e.g., a local Docker volume or cloud storage like S3). Images **must not** be stored as binary blobs directly within the PostgreSQL database. The database will only store the file path/URL.
-   **Backup & Disaster Recovery**:
    -   **Daily Automated Backups**: A scheduled job must run daily to capture a full backup of the PostgreSQL database and create a compressed archive of the physical images/assets folder.
    -   **Retention**: Backups must be safely stored (e.g., locally in a separate volume or synced to cloud storage) to ensure full system recovery in case of failure.
-   **Lead Protection Tracking**:
    -   The system must help the Analyst enforce cross-specialty rules.
    -   **Rule Enforcements**: A customer can have a maximum of ONE Buyer Agent and ONE Seller Agent assigned at any time. The UI should prevent or warn the Analyst if they attempt to assign a second agent of the same type.
-   **UI/UX & Image Rendering**:
    -   **Visual Assets**: When viewing property details, the actual community layout plans and floor plan images must be fetched from their physical path and rendered directly in the user interface (not just as clickable URLs).
    -   **Readability**: Information must be structured smartly. Customer 360 views must prioritize a clean hierarchy, making properties, assigned agents, tags, and the interaction ledger instantly scannable.
-   **Search**: The Analyst must be able to search for a customer by Name, Phone Number, or Email.
-   **Customer 360 View**: Selecting a customer must display their profile, tags, assigned agents, a chronological timeline of all interaction notes, and a list of all their owned properties.
-   **Property Details**: Property cards must show aggregated data (e.g., "Villa 42, Palm Jumeirah, Type 3M, 4 Rooms, 3500 sqft, Corner, Lake-Front"), its current Status, and a table of its Historical Transactions.

## 4. Technical Stack

-   **Database**: PostgreSQL    
-   **Backend**: Python / FastAPI (REST API)
-   **Security**: OAuth2 with JWT (JSON Web Tokens)
-   **Storage**: Local Docker Volume mapping (for physical image assets)
-   **Backup Scheduler**: Dockerized Cron job or Python-based task scheduler (e.g., APScheduler)
-   **Frontend**: React.js with Tailwind CSS
-   **Infrastructure**: Docker & Docker Compose