# bolsonitro-bet

This is a proof-of-concept project focused on integrating with Bitcoin's Lightning Network through a Telegram robot. The aim is to demonstrate how Bitcoin transactions can be handled quickly and securely using the Lightning Network.

## Setup

### Prerequisites
- Node.js 18.x and NPM (Node Package Manager) installed on your system.

### Instructions
1. Clone the repository on your local system.
```
git clone https://github.com/SatsCzar/bolsonitro-bet.git
```
2. Install dependencies with npm.
```
npm install
```
3. Run the database migration to create tables in the SQLite database.
```
npm run knex:migrate
```

4. Copy the `.env.example` file and rename it to `.env`. This file contains necessary environment variables for the project. Fill in the appropriate values for the TOKEN (Your Telegram bot token), OWNER_CHAT_ID (Telegram ID of the owner), and CRON_SCHEDULE (Cron syntax for setting up tasks).

**NOTE**: The `.env.example` file comes with preset values. Ensure to replace them with your actual data.

5. Start the application.
```
npm run start
```
Your bot should now be running.

## Bot Commands
Bot commands can be added and declared in the `src/infra/bot/index.js` file.

## Dependencies
Before setting up the project, you need to have Polar Lightning installed, which is used for testing purposes. Polar Lightning is a type of RegTest environment specifically designed for the Bitcoin Lightning Network. It helps in simulating the network for development and testing.

For more information and to download Polar Lightning, visit their official website:
Polar Lightning