import { gql } from 'apollo-server';

const typeDefMetadata = require('./typeDefMetadata.json');
const { GQLQueryString, GQLTypesString } = typeDefMetadata;

const generatedQueries = GQLQueryString;
const generatedTypes = GQLTypesString;

console.log(generatedQueries);
console.log(generatedTypes);

export default [generatedTypes, generatedQueries];
