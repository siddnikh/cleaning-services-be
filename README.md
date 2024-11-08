# Cleaning Services Backend

This README provides instructions on how to set up the configuration for this backend project.

## Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)
- PostgreSQL database

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Configuration

1. Create a `.env` file in the root directory of the project.

2. Add the following environment variables to the `.env` file:

   You can use the `.env.SAMPLE` file as a template. Copy its contents to your `.env` file and replace the placeholder values with your actual configuration:

   ```
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_HOST=localhost
   DB_PORT=whatever

   GMAIL_USER=your_email
   GMAIL_PASS=your_password
   ```

Replace the values with your actual database credentials.

## Database Setup

Ensure your PostgreSQL database is running and accessible with the credentials provided in the `.env` file.
You can use supabase or any other provider to host the database. The dialect is `postgres`.


## Twilio Setup for OTP

To enable OTP (One-Time Password) functionality using Twilio, follow these steps:

1. Sign up for a Twilio account at https://www.twilio.com if you haven't already.

2. Once logged in, navigate to the Twilio Console and find your Account SID and Auth Token.

3. Purchase a Twilio phone number that will be used to send SMS messages.

4. Add the following Twilio-specific environment variables to your `.env` file:

   ```
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

   Replace `your_account_sid`, `your_auth_token`, and `your_twilio_phone_number` with your actual Twilio credentials and phone number.

5. Install the Twilio SDK by running:

   ```bash
   npm install twilio
   ```

6. For detailed instructions on how to use the Twilio SDK to send OTP via SMS, please refer to the official Twilio documentation:

   https://www.twilio.com/docs/verify/api

   The documentation provides comprehensive guides and examples for implementing OTP functionality securely in your application.

Remember to handle the OTP verification process securely in your application logic.



## Running the Server

To start the server, run:

```bash
node server.js
```
or
```bash
npm run start
```

The server will start on the port specified in your `.env` file (default is 3000).

## Project Structure

- `server.js`: Main entry point of the application
- `config/logger.js`: Logger configuration
- `config/db.js`: Database configuration using Sequelize
- `models`: Folder containing the Sequelize models
- `migrations`: Folder containing the Sequelize migrations
- `seeders`: Folder containing the Sequelize seeders
- `routes`: Folder containing the API routes
- `controllers`: Folder containing the API controllers
- `utils`: Folder containing the utility functions (helpers)

## Logging

This project uses Winston for logging. Logs are output to the console and stored in log files.

## Database

The project uses Sequelize as an ORM. The database connection is established in `server.js` and the configuration is in `config/db.js`.

## Troubleshooting

If you encounter any issues with database connection, ensure your PostgreSQL service is running and the credentials in your `.env` file are correct.

## Note
Checkout the frontend (and the app in use [https://github.com/siddnikh/cleaning-service-app](here).
