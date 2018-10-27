# redez-server
The backend component of redez

Running the server
`git clone https://github.com/coshx/redez-server`
`cd redez-server`
`npm install`
`npm start`

The aim of this component of redez is to augment an Apollo Server so that its schema can be modified remotely. Resolvers and mock data will also be generated when the schema is updated.

The plan is to eventually interface with the redez design tool so that a designer can make a React prototype that is already hooked up to an Apollo Server API. A backend developer should be able to override any autogenerated resolvers or parts of the schema. It may also be possible to automate some kind of actual database connection.

Currently this component is a fully functional server, but in the future it should be made into a library (middleware?) which can be easily added to an existing ApolloServer.
