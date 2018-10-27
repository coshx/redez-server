import { restartServer } from '../index';
import { updateAPI } from './index';
const { performance } = require('perf_hooks');

let schemaCache = require('./generated/typeDefs.json');

const refreshAPI = async () => {
  const t0 = performance.now();
  schemaCache = await updateAPI(schemaCache);
  const t1 = performance.now();

  console.log(`API refreshed in ${(t1 - t0)} ms`);
}

const resolvers = {
  Query: {
    GQLTypes: () => {
      const { generatedTypes, nextTypeId: id } = schemaCache;
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
      const { generatedTypes: GQLTypes, nextTypeId: id } = schemaCache;
      const newType = {
        typeDef: {
          name,
          fields,
        }
      };

      GQLTypes[id] = newType;
      schemaCache.nextTypeId += 1;

      return refreshAPI().then(() => {
        restartServer();
        return {
          id,
          ...newType
        };
      });
    },
    removeGQLType: (_, { id }) => {
      const { generatedTypes: GQLTypes } = schemaCache;

      const deletedType = Object.assign({}, GQLTypes[id].typeDef);
      delete GQLTypes[id]

      return refreshAPI().then(() => {
        restartServer();
        return {
          id,
          ...deletedType
        };
      });
    },

    addGQLField: (_, { typeId, name, type }) => {
      const { generatedTypes: GQLTypes } = schemaCache;

      const newField = {
        name,
        type
      };

      GQLTypes[typeId].typeDef.fields.push(newField);
      return refreshAPI().then(() => {
        restartServer();
        return newField;
      });
    },
    removeGQLField: (_, { typeId, name }) => {
      const { generatedTypes: GQLTypes } = schemaCache;
      const { typeDef } = GQLTypes[typeId];
      const { fields } = typeDef;

      const deletedFields = fields.filter(field => field.name === name);
      typeDef.fields = fields.filter(field => field.name !== name);

      return refreshAPI().then(() => {
        restartServer();
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

export default resolvers;
