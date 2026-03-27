
# Real Estate CRM - Use Cases

## Use Case 1: Bulk Import of Excel Data

**Actor:** Data Analyst **Trigger:** Analyst receives a master spreadsheet containing historical customer and property data. **Flow:**
1.  Analyst logs into the CRM and navigates to the "Import Data" module.
2.  Analyst uploads the `.xlsx` or `.csv` file.
3.  System parses the rows, automatically extracting Projects, Floor Plans, Customers, and specific Properties.
4.  System highlights any data conflicts (e.g., missing villa numbers).
5.  Analyst confirms the import, and the database is populated in bulk, saving hours of manual data entry.

## Use Case 2: Agent Roster Management

**Actor:** Data Analyst **Trigger:** A new Buyer Agent is hired to the team. **Flow:**
1.  Analyst navigates to "Agent Management".
2.  Analyst clicks "Add New Agent".
3.  Analyst inputs the agent's name and selects the role "Buyer Agent".
4.  System saves the agent as an active entity in the database, making them available in the dropdown menus for customer assignment.

## Use Case 3: Enforce Lead Protection Rules

**Actor:** Data Analyst **Trigger:** Analyst needs to assign a newly imported lead to an agent. **Flow:**
1.  Analyst opens the Customer 360 profile.
2.  Analyst selects "Agent Assignment" and chooses "Buyer Agent A" from the dropdown.
3.  System saves the assignment.
4.  Later, the Analyst mistakenly tries to assign "Buyer Agent B" to the same customer.
5.  System displays a warning/blocks the action: "Rule Violation: Customer already has a maximum of ONE active Buyer Agent."

## Use Case 4: Upload and View Visual Assets

**Actor:** Data Analyst **Trigger:** A new Project (Neighborhood) is launched by a developer. **Flow:**
1.  Analyst creates a new Project record via the UI.
2.  Analyst uploads the master community layout image (e.g., a `.jpg` or `.png`).
3.  System saves the physical file to the local Docker volume and stores the file path in the database.
4.  When the Analyst later views a specific Property linked to this Project, the UI fetches the image from the volume and renders the actual layout visually on the screen.

## Use Case 5: Maintain the Interaction Ledger

**Actor:** Data Analyst **Trigger:** A Seller Agent informs the Analyst that they just finished a property viewing with a client. **Flow:**
1.  Analyst searches for the specific Customer and opens their 360 View.
2.  Analyst clicks "Add Interaction".
3.  Analyst types the viewing notes and selects the corresponding Seller Agent from a reference dropdown.
4.  System saves the note, permanently stamping it with the current date and time.
5.  The note is appended to the customer's chronological Interaction Ledger, preserving all past notes underneath it.

## Use Case 6: Track Property Status and Transactions

**Actor:** Data Analyst **Trigger:** A client successfully rents out their primary residence. **Flow:**
1.  Analyst locates the specific Property under the Customer's profile.
2.  Analyst changes the "Property Status" from "Primary Residence" to "Rented".
3.  Analyst clicks "Add Historical Transaction".
4.  Analyst inputs the Transaction Date, Type ("Rent"), Price, and attached notes.
5.  System updates the Property card to reflect the new status and adds the rental agreement to the property's transaction history table.

## Use Case 7: Automated System Backup

**Actor:** System Scheduler (Cron/APScheduler) **Trigger:** The daily scheduled time (e.g., 2:00 AM) is reached. **Flow:**
1.  The scheduler triggers the backup sequence.
2.  System executes a `pg_dump` of the PostgreSQL database.
3.  System compresses the physical Docker volume containing all uploaded layout and floor plan images.
4.  System saves the archives to a designated secure backup directory.