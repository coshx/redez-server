const typeDefMetadata = require('./typeDefMetadata.json');

const resolvers = {
  Query: {
    books: () => getMockData('books')
  }
};

function getMockData(query, args){
  return typeDefMetadata.mockData[query];
};

export default resolvers;
