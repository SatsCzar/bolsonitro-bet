# Telegram Bot Example Project

Welcome to the Telegram Bot Example project. This is a node.js-based project for creating a telegram bot with several pre-set features. This bot uses environment variables for the bot token, the owner's chat ID and a cron schedule for periodic tasks.

## Setup

### Prerequisites
- Node.js 18.x and NPM (Node Package Manager) installed on your system.

### Instructions
1. Clone the repository on your local system.
```
git clone git@github.com:SatsCzar/telegram-bot-example.git
```
2. Install dependencies with npm.
```
npm install
```
3. Copy the `.env.example` file and rename it to `.env`. This file contains necessary environment variables for the project. Fill in the appropriate values for the TOKEN (Your Telegram bot token), OWNER_CHAT_ID (Telegram ID of the owner), and CRON_SCHEDULE (Cron syntax for setting up tasks).

**NOTE**: The `.env.example` file comes with preset values. Ensure to replace them with your actual data.

4. Start the application.
```
npm run start
```
Your bot should now be running.

## Bot Commands
Bot commands can be added and declared in the `src/infra/bot/index.js` file.
