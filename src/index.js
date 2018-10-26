import { ApolloServer } from 'apollo-server';

function startServer() {
  const graphqlSchema = require('./graphql');
  console.log(graphqlSchema);
  return new ApolloServer({
    typeDefs: graphqlSchema.typeDefs,
    resolvers: { ...graphqlSchema.resolvers },
  });
}


let server = startServer();

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

if(module.hot) {
  module.hot.accept('./graphql', async () => {
    console.log("Stopping server");
    await server.stop();
    server = startServer();
    console.log("Restarting");
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  });
}
