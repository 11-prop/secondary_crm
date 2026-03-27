# **Real Estate CRM \- Use Cases**

## **Use Case 1: Look Up Customer Portfolio**

**Actor:** Agent / Admin

**Trigger:** Agent receives a call from a client.

**Flow:**

1. Agent enters the client's phone number or name in the global search bar.  
2. System returns matching customer records.  
3. Agent selects the customer.  
4. System displays the customer's profile, ongoing notes, and a list of all properties they own.  
5. Agent can immediately see that the client owns "Villa 42" which is a Corner unit, and has 4 bedrooms based on the linked floor plan.

## **Use Case 2: Update Client Status**

**Actor:** Agent / Admin

**Trigger:** A known "Buyer" decides they also want to list their current property.

**Flow:**

1. Agent searches and opens the customer's profile.  
2. Agent edits the "Client Type" tag from "Buyer" to "Both".  
3. Agent adds a note in the "Comments" section indicating the client's intent to sell.  
4. System saves the updated profile.

## **Use Case 3: Property Feature Extraction**

**Actor:** Data Entry / Admin

**Trigger:** New master plan is released for a project.

**Flow:**

1. Admin creates a new "Project" record and links the layout plan image.  
2. Admin creates "Property" records for each villa.  
3. Looking at the layout image, Admin checks the boxes for "Corner", "Park-Front", etc., directly on the property record, bypassing the need for complex GIS software.