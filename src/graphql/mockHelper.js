const mockData = require('./generated/mock.json');

export function getMockData(query, args){
  return mockData[query];
};
