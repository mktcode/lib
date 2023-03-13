import { buildASTSchema } from "graphql";
import gql from "graphql-tag";

const ast = gql`
type User {
  address: String!
  unlocked: Boolean!
  amountPaid: String!
  indexedAt: String!
}

type Query {
  users: [User!]
  user(address: String!): User
}
`;

export const schema = buildASTSchema(ast);