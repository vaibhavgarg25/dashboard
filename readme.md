## Features

- **Admin View**: View metrics, filter by role, date ranges, search users, and see signups trends.
- **Teacher View**: Insights into student signups and activity.
- **Student View**: Dashboard focused on peer activity.
- **Responsive UI**: Clean, performant interface using modern React tools.
- **Secure GraphQL API**: JWT-authenticated GraphQL API backed by Prisma ORM.

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- PostgreSQL (or supported database) for Prisma

## Setup Instructions

### Backend

```bash
cd backend
npm install
# or
yarn install

# Copy and configure environment variables
cp .env.example .env

# Run Prisma migration (if applicable)
npx prisma migrate dev

# Start the server
npm run dev

