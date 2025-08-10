import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import bodyParser from 'body-parser';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './schema.js';
import { verifyToken } from './utils/jwt.js'; // you already have this
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/graphql',
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || '';
      let user = null;

      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7); // remove "Bearer "
        try {
          user = verifyToken(token); // decode & verify
        } catch (err) {
          console.warn('Invalid token:', err.message);
        }
      }
      return { user }; // available to all resolvers
    },
  })
);

app.listen(8080, () => {
  console.log(`🚀 Server ready at http://localhost:8080/graphql`);
});
