# Bitespeed Backend Task: Identity Reconciliation

This service provides an identity reconciliation API that helps track customer identities across multiple purchases.

## Overview

The service maintains a database of contact information and links related contacts together. When a request comes in with an email or phone number, the service:

1. Identifies if the contact already exists
2. Creates new contacts when needed
3. Links related contacts together
4. Returns a consolidated view of the customer's contact information

## API Endpoint

### POST /api/identify

Identifies a contact based on email and/or phone number.

**Request Format:**
```json
{
  "email": "example@example.com",
  "phoneNumber": "1234567890"
}
```

**Response Format:**
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["1234567890", "9876543210"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env` and update the database configuration
3. Install dependencies:
   ```
   npm install
   ```
4. Run database migrations:
   ```
   npm run migrate:up
   ```
5. Start the server:
   ```
   npm start
   ```

## Database Schema

The service uses a `Contacts` table with the following structure:

```
{
  id                   Int                   
  phoneNumber          String?
  email                String?
  linkedId             Int? // the ID of another Contact linked to this one
  linkPrecedence       "secondary"|"primary" // "primary" if it's the first Contact in the link
  createdAt            DateTime              
  updatedAt            DateTime              
  deletedAt            DateTime
}
```

## Deployment

The API is deployed at: [Your deployment URL here]
