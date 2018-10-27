import { ApolloServer } from 'apollo-server';

function startServer() {
  const gql = require('./graphql');
  const graphqlSchema = gql.makeSchema();
  return new ApolloServer({
    schema: graphqlSchema
  });
}


let server = startServer();

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

export async function restartServer() {
  console.log("Stopping...");
  await server.stop();
  console.log("Restarting")
  server = startServer();
  console.log("Listening...");
  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}
