const fs = require('fs');
const path = require('path')

import { makeExecutableSchema } from 'graphql-tools';
import { find } from 'lodash';
import { restartServer } from '../index';
import  apiModificationResolvers  from './resolvers';
import  apiModificationTypeDefs  from './typeDefs';

/**
 * Create an executable schema containing
 * autogenerated type defs and resolvers,
 * type defs and resolvers required to modify the API,
 * and custom resolvers
 * @version 0.0.1
 *
 * @returns {object}
 */
const makeSchema = () => {
  const schema = require('./generated/typeDefs.json');
  const { GQLQueryString, GQLTypesString } = schema;

  return makeExecutableSchema({
    typeDefs: [apiModificationTypeDefs, GQLTypesString, GQLQueryString],
    resolvers: [apiModificationResolvers, require('./generated/resolvers.js').default],
  });
}

/**
* Update the type database and
* generate resolvers that return mock data
* unless a custom resolver is present
* @version 0.0.1
*
* @returns {Promise}
*/
async function updateAPI(schema) {
  const { generatedTypes: GQLTypes } = schema;

  schema.GQLTypesString = generateGQLSchemaTypes(GQLTypes);
  schema.GQLQueryString = generateGQLQueries(GQLTypes);

  await Promise.all([
    writeGQLSchema(schema),
    writeGQLResolvers(GQLTypes)
  ]);

  return schema;
}

/**
 * Update the type database.
 * Currently uses
 * @version 0.0.1
 *
 * @returns {Promise}
 */
async function writeGQLSchema(schema) {
  await new Promise((resolve, reject) => {
    const path = require.resolve('./generated/typeDefs.json');

    fs.writeFile(path, JSON.stringify(schema), (err) => {
      if(err) {
        console.log(err);
        reject();
      }
      resolve();
    });
  })
}

/**
 * Update mock resolvers
 * These resolvers are generated to serve mock data
 * Unless a custom resolver has been specified
 * @version 0.0.1
 *
 * @returns {Promise}
 */
async function writeGQLResolvers(GQLTypes) {
  const path = require.resolve('./generated/resolvers.js');
  const resolvers = await generateResolvers(GQLTypes);

  return new Promise((resolve, reject) => {
    fs.writeFile(path, resolvers, (err) => {
      if (err) {
        console.log(err);
        reject();
      }

      resolve();
    })
  });
}

/**
 * Converts json type data (currently stored in typeDefs.json) into a string in the GraphQL schema format.
 * @version 0.0.1

 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function generateGQLSchemaTypes (GQLTypes) {
  return Object.keys(GQLTypes).reduce((acc, id) => {
    const { typeDef } = GQLTypes[id];

    const fields = typeDef.fields.reduce((acc, field) => {
      return acc += `    ${field.name}: ${field.type}\n`;
    }, '');

    const type = `type ${typeDef.name} {\n` + fields + '}\n\n';

    return acc += type;
  }, '');
}

/**
 * Generates a query for each type
 * That gets a list of the type
 * @version 0.0.1
 *
 * @returns {string}
 */
function generateGQLQueries (GQLTypes) {
  const types = Object.keys(GQLTypes).reduce((acc, id) => {
    const { typeDef } = GQLTypes[id];
    const { name } = typeDef;

    const query = `  ${getQueryName(name)}: [${name}]\n`;

    return acc += query;
  }, '');

  return `extend type Query{\n${types}}`;
}


/**
 * Generates resolvers that return mock data
 * TODO unless an custom resolver is found
 * @version 0.0.1
 *
 * @returns {string}
 */
async function generateResolvers (GQLTypes) {
  return new Promise((resolve, reject) => {
    fs.readFile(require.resolve('./templates/resolvers.js'), "utf8", (err, contents) => {
      if (err) {
        reject(err);
      }

      let resolvers = contents;
      const queryResolvers = Object.keys(GQLTypes).reduce((acc, id) => {
        const { typeDef } = GQLTypes[id];

        const queryName = getQueryName(typeDef.name);

        return acc += `${queryName}: () => getMockData('${queryName}'),\n`;
      },'');

      resolvers = resolvers.replace(/\$QUERY_RESOLVERS/g, queryResolvers);
      resolve(resolvers);
    });
  })
}


/**
 * TODO Convert typeName to camel case and pluralize it
 * @param {string} typeName
 * @version 0.0.1

 * @returns {string}
 */
function getQueryName(typeName) {
  return `${typeName}s`;
}

export {
  makeSchema,
  updateAPI
}
