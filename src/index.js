import { ApolloServer } from 'apollo-server';
import { makeSchema } from './graphql/index';

function startServer() {
  const schema = makeSchema();
  return new ApolloServer({
    schema
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
