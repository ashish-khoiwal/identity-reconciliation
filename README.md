# Identify Contact Assignment

This assignment focuses on building a service for identifying and managing contacts. The service allows users to create contacts and identify similar contacts based on email addresses and phone numbers. It also provides endpoints for retrieving information about linked contacts.


### Demo

https://bitespeed-task-reconciliation-udal.onrender.com


## Endpoints

### POST /identify

This endpoint is used to identify and manage contacts. It accepts a JSON payload with information about the contact, such as email and phone number. The endpoint performs the following actions:

- If there are no existing contacts with similar email or phone number:
  - Creates a new primary contact with the provided information.
  - Returns the details of the newly created primary contact, including its ID, email, phone number, and an empty array of secondary contact IDs.

- If there are existing contacts with similar email or phone number:
  - Retrieves the linked contact associated with the existing contact.
  - Returns the details of the linked contact, including its ID, email, phone number, and an array of secondary contact IDs.

### Example Request

```http
POST /identify
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "phoneNumber": "1234567890"
}
```

### Example Response
```json
{
  "primaryContactId": 1,
  "emails": ["john.doe@example.com", "johndoe@example.com"],
  "phoneNumbers": ["1234567890", "9876543210"],
  "secondaryContactIds": [2, 3, 4]
}
```
### Installation and Setup
- Clone the repository.
- Install the required dependencies using npm install or yarn install.
- Create a .env file.
- Set up the database connection and credentials in the configuration file.
- Run the application using npm start or yarn start.
- The service will be available at http://localhost:8000.