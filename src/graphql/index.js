import { gql } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { find } from 'lodash';
import generatedTypeDefs from './generated/typeDefs';
import generatedResolvers from './generated/resolvers';

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const coreTypeDefs = gql`
  type GQLType {
    id: Int!
    name: String
    fields: [GQLField]
  }

  type GQLField {
    id: Int!
    name: String
    type: String
  }

  type Query {
    gqlTypes: [GQLType]
  }
`;

const coreResolvers = {
  Query: {
    gqlTypes: getGQLTypes,
  },

  GQLType: {
    fields: getGQLTypeFields
  }
};

const typeDefMetadata = require('./generated/typeDefMetadata.json');
const { generatedTypes } = typeDefMetadata;

function getGQLTypes() {
  const typeIds = Object.keys(generatedTypes);
  return typeIds.map(id => generatedTypes[id]);
}

function getGQLTypeFields(gqlType) {
  return generatedTypes[gqlType.id].fields;
}

const makeSchema = () => {
  return makeExecutableSchema({
    typeDefs: [coreTypeDefs, ...generatedTypeDefs],
    resolvers: [coreResolvers, generatedResolvers],
  });
}

const generateTypesString = () => {
  return Object.keys(generatedTypes).reduce((acc, id) => {
    const type = generatedTypes[id];

    const fields = type.fields.reduce((acc, field) => {
      return acc += `    ${field.name}: ${field.type}\n`;
    }, '');

    const query = `type ${type.name} {\n` + fields + '}\n\n';

    return acc += query;
  }, '');
}

export {
  makeSchema,
  generateTypesString,
}
