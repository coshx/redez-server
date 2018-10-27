import { gql } from 'apollo-server';

const apiModificationTypeDefs = gql`
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

export default apiModificationTypeDefs;
