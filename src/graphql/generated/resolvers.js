import { getMockData } from '../mockHelper';

const generatedResolvers = {
  Query: {
    books: () => getMockData('books')
  }
};

export default generatedResolvers;
