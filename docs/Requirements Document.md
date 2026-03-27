# **Real Estate CRM \- Requirements Document**

## **1\. System Overview**

A custom CRM designed for real estate management, allowing the tracking of customers, projects, floor plans, and specific property units (villas/townhouses).

## **2\. Core Entities**

* **Customers**: Store contact details, client type tags (Buyer, Seller, Both, Prospect), and interaction notes.  
* **Projects**: Define neighborhoods/communities and link to layout plan images.  
* **Floor Plans**: Standardized layouts within projects, defining square footage, room counts, and amenities.  
* **Properties**: Specific physical units linked to a project, a floor plan, and an owner, featuring specific location attributes (corner, lake-front, park-front, etc.).

## **3\. Functional Requirements**

* **Search**: Users must be able to search for a customer by Name, Phone Number, or Email.  
* **Customer 360 View**: Selecting a customer must display their profile, tags, notes, and a list of all their owned properties.  
* **Property Details**: Property cards must show aggregated data (e.g., "Villa 42, Palm Jumeirah, Type 3M, 4 Rooms, 3500 sqft, Corner, Lake-Front").  
* **Categorization**: Ability to mark customers as Buyers, Sellers, or Both.

## **4\. Technical Stack**

* **Database**: PostgreSQL  
* **Backend**: Python / FastAPI (REST API)  
* **Frontend**: React.js with Tailwind CSS  
* **Infrastructure**: Docker & Docker Compose