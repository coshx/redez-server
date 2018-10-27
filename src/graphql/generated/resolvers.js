import { getMockData } from '../mockHelper';

const generatedResolvers = {
  Query: {
    Books: () => getMockData('Books'),
Authors: () => getMockData('Authors'),

  }
};

export default generatedResolvers;
