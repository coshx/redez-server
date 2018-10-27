import generatedResolvers from './generated/resolvers.js'

const resolvers = {
  Query: {
    books: () => getMockData('books')
  }
};

export default resolvers;
