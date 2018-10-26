import { gql } from 'apollo-server';

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
  {
    id: 0,
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    category: 'Fiction',
    testField: 50,
  },
  {
    id: 1,
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    category: 'Fiction',
    testField: 65,
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
export const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    id: Int!
    title: String
    author: String
    category: String
    testField: Int
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book]
    book: Book
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
export const resolvers = {
  Query: {
    books: () => books,
    book: (root, args, context, info) => {
      return find(books, { id: args.id })
    },
  },
};
