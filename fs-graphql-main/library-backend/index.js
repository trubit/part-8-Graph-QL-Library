const { ApolloServer } = require("@apollo/server");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@as-integrations/express5");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { GraphQLError } = require("graphql");
const { useServer } = require("graphql-ws/use/ws");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const User = require("./models/user");

const mongoUrl = process.env.MONGODB_URI || process.env.MONGODB_URL;
const getJwtSecret = () => process.env.JWT_SECRET || process.env.SECRET;

mongoose.set("strictQuery", false);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const getCurrentUser = async (authorization = "") => {
  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  try {
    const decodedToken = jwt.verify(authorization.substring(7), getJwtSecret());

    return User.findById(decodedToken.id);
  } catch (error) {
    throw new GraphQLError("Invalid or expired token", {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }
};

const server = new ApolloServer({
  schema,
});

const start = async () => {
  if (!mongoUrl) {
    throw new Error("MONGODB_URI or MONGODB_URL is required");
  }

  if (!getJwtSecret()) {
    throw new Error("JWT_SECRET or SECRET is required");
  }

  await mongoose.connect(mongoUrl);
  console.log("connected to MongoDB");

  const app = express();
  const httpServer = http.createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const serverCleanup = useServer({ schema }, wsServer);

  server.addPlugin(
    ApolloServerPluginDrainHttpServer({
      httpServer,
    }),
  );
  server.addPlugin({
    async serverWillStart() {
      return {
        async drainServer() {
          await serverCleanup.dispose();
        },
      };
    },
  });

  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        currentUser: await getCurrentUser(req.headers.authorization || ""),
      }),
    }),
  );

  const port = process.env.PORT || process.env.port || 4000;

  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, resolve);
  });

  console.log(`Server ready at http://localhost:${port}/`);
  console.log(`Subscriptions ready at ws://localhost:${port}/`);
};

start().catch((error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `error starting server: port ${error.port} is already in use. Stop the other backend process or set PORT to another value.`,
    );
    process.exit(1);
  }

  console.error("error starting server:", error.message);
  process.exit(1);
});
