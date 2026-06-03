const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const User = require("./models/user");

const mongoUrl = process.env.MONGODB_URI || process.env.MONGODB_URL;
const getJwtSecret = () => process.env.JWT_SECRET || process.env.SECRET;

mongoose.set("strictQuery", false);

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || process.env.port || 4000 },
  context: async ({ req }) => {
    const auth = req.headers.authorization || "";

    if (auth.toLowerCase().startsWith("bearer ")) {
      try {
        const decodedToken = jwt.verify(auth.substring(7), getJwtSecret());
        const currentUser = await User.findById(decodedToken.id);

        return { currentUser };
      } catch (error) {
        throw new GraphQLError("Invalid or expired token", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
    }

    return {};
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
