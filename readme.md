## Features

- **Admin View**: View metrics, filter by role, date ranges, search users, and see signups trends.
- **Teacher View**: Insights into student signups and activity.
- **Student View**: Dashboard focused on peer activity.
- **Responsive UI**: Clean, performant interface using modern React tools.
- **Secure GraphQL API**: JWT-authenticated GraphQL API backed by Prisma ORM.

## Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) — React framework for production-ready apps
- [TypeScript](https://www.typescriptlang.org/) — Type safety and better developer experience

**Backend**
- [Express.js](https://expressjs.com/) — Fast, minimal Node.js web framework
- [GraphQL](https://graphql.org/) — Flexible API query language
- [Prisma ORM](https://www.prisma.io/) — Database toolkit for Node.js
- [MongoDB](https://www.mongodb.com/) — NoSQL document database

**Authentication & Security**
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — Password hashing
- [JWT (JSON Web Token)](https://jwt.io/) — Stateless authentication

## Prerequisites

- Node.js v16 or higher
- npm or yarn
- MongoDB (or supported database) for Prisma

## Setup Instructions

### Frontend
```bash
cd client
npm install
# or
yarn install

# Start the React development server
npm run dev
```

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

