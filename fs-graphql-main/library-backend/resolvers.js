const { GraphQLError } = require("graphql");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");
const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || process.env.SECRET;

const userInputError = (message, invalidArgs) =>
  new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      invalidArgs,
    },
  });

const authenticationError = () =>
  new GraphQLError("Authentication required", {
    extensions: {
      code: "BAD_USER_INPUT",
    },
  });

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments({}),
    authorCount: async () => Author.countDocuments({}),

    allBooks: async (root, args) => {
      const query = {};

      if (args.author) {
        const author = await Author.findOne({ name: args.author });

        if (!author) {
          return [];
        }

        query.author = author._id;
      }

      if (args.genre) {
        query.genres = args.genre;
      }

      return Book.find(query).populate("author");
    },

    allAuthors: async () => Author.find({}),

    me: async (root, args, context) => {
      if (!context.currentUser) {
        return null;
      }

      return context.currentUser;
    },
  },

  Author: {
    bookCount: async (root) => Book.countDocuments({ author: root._id }),
  },

  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw authenticationError();
      }

      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (error) {
          throw userInputError(error.message, args.author);
        }
      }

      const book = new Book({ ...args, author: author._id });

      try {
        await book.save();
        return book.populate("author");
      } catch (error) {
        throw userInputError(error.message, args.title);
      }
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw authenticationError();
      }

      const author = await Author.findOne({ name: args.name });

      if (!author) {
        return null;
      }

      author.born = args.setBornTo;
      try {
        await author.save();
        return author;
      } catch (error) {
        throw userInputError(error.message, args.setBornTo);
      }
    },
    createUser: async (root, args) => {
      const user = new User({ ...args });

      try {
        await user.save();
        return user;
      } catch (error) {
        throw userInputError(error.message, args.username);
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw userInputError("Invalid username or password", {
          username: args.username,
        });
      }

      const token = jwt.sign(
        { username: user.username, id: user._id },
        getJwtSecret(),
        { expiresIn: "7d" },
      );

      return { value: token };
    },

    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("_resetDatabase is only available in test mode");
      }

      await Author.deleteMany({});
      await Book.deleteMany({});
      await User.deleteMany({});

      return true;
    },
  },
};

module.exports = resolvers;
