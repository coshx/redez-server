const fs = require('fs');
const path = require('path')

import { gql } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { find } from 'lodash';
import { restartServer } from '../index';
import generatedResolvers from './generated/resolvers';

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const coreTypeDefs = gql`
  type GQLType {
    id: Int!
    name: String!
    fields: [GQLField]
  }

  type GQLField {
    id: Int!
    name: String!
    type: String!
  }

  input GQLFieldInput {
    name: String!
    type: String!
  }

  type Query {
    GQLTypes: [GQLType]
  }

  type Mutation {
    removeGQLType(id: Int!): GQLType
    addGQLType(name: String, fields: [GQLFieldInput]): GQLType

    removeGQLField(typeId: Int!, name: String!): GQLField
    addGQLField(typeId: Int!, name: String!, type: String!): GQLField
  }
`;

let generatedTypeDefs = require('./generated/typeDefs.json');
let { generatedTypes, nextTypeId } = generatedTypeDefs;

const coreResolvers = {
  Query: {
    GQLTypes: () => {
      const typeIds = Object.keys(generatedTypes);
      return typeIds.map(id => {
        return {
          id,
          ...generatedTypes[id].typeDef
        };
      });
    },
  },

  Mutation: {
    addGQLType: (_, { name, fields }) => {
      const newType = {
        typeDef: {
          name,
          fields,
        }
      };

      generatedTypes[nextTypeId] = newType;
      const currentId = generatedTypeDefs.nextTypeId;
      generatedTypeDefs.nextTypeId += 1;

      return updateGeneratedTypeDefs().then(() => {
        Promise.resolve().then(restartServer);
        console.log(newType.typeDef);
        return {
          id: currentId,
          name: newType.typeDef.name,
          fields: newType.typeDef.fields,
        };
      });
    },
    removeGQLType: (_, { id }) => {
      const deletedType = Object.assign({}, generatedTypes[id].typeDef);
      delete generatedTypes[id]
      return updateGeneratedTypeDefs().then(() => {
        Promise.resolve().then(restartServer);
        return {
          id,
          ...deletedType
        };
      });
    },

    addGQLField: (_, { typeId, name, type }) => {
      const newField = {
        name,
        type
      };

      generatedTypes[typeId].typeDef.fields.push(newField);
      return updateGeneratedTypeDefs().then(() => {
        Promise.resolve().then(restartServer);
        return newField;
      });
    },
    removeGQLField: (_, { typeId, name }) => {
      const { typeDef } = generatedTypes[typeId];

      const deletedFields = typeDef.fields.filter(field => {
        return field.name === name;
      });

      typeDef.fields = typeDef.fields.filter(field => {
        return field.name !== name;
      });

      return updateGeneratedTypeDefs().then(() => {
        Promise.resolve().then(restartServer);
        return deletedFields.length > 0 ? deletedFields[0] : null;
      });
    },
  },

  GQLType: {
    fields: (GQLType) => {
      return GQLType.fields;
    }
  }
};

async function updateGeneratedTypeDefs() {
  await new Promise((resolve, reject) => {
    const path = require.resolve('./generated/typeDefs.json');

    fs.writeFile(path, JSON.stringify(generatedTypeDefs), (err) => {
      if(err) {
        console.log(err);
        reject();
      }

      generatedTypeDefs = require('./generated/typeDefs.json');
      generatedTypes = generatedTypeDefs.generatedTypes;
      nextTypeId = generatedTypeDefs.nextTypeId;

      resolve();
    });
  })
}

function generateTypesString () {
  return Object.keys(generatedTypes).reduce((acc, id) => {
    const { typeDef } = generatedTypes[id];

    const fields = typeDef.fields.reduce((acc, field) => {
      return acc += `    ${field.name}: ${field.type}\n`;
    }, '');

    const query = `type ${typeDef.name} {\n` + fields + '}\n\n';

    return acc += query;
  }, '');
}

function generateResolvers () {
  fs.readFile(require.resolve('./resolvers.js'), "utf8", (err, contents) => {
    let resolvers = contents;
    const queryResolvers = Object.keys(generatedTypes).reduce((acc, id) => {
      const { typeDef } = generatedTypes[id];

      //TODO Convert to camel case and use actual pluralizing function
      const pluralizedName = `${typeDef.name}s`;

      return acc += `${pluralizedName}: () => getMockData('${pluralizedName}')\n`;
    });

    resolvers = resolvers.replace('/\$QUERY_RESOLVERS/g', queryResolvers);
    console.log(resolvers);
    return resolvers;
  });
}

const makeSchema = () => {
  const { GQLQueryString, GQLTypesString } = require('./generated/typeDefs.json');

  return makeExecutableSchema({
    typeDefs: [coreTypeDefs, GQLTypesString, GQLQueryString],
    resolvers: [coreResolvers, generatedResolvers],
  });
}

export {
  makeSchema,
}
