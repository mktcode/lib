import { buildASTSchema } from "graphql";
import gql from "graphql-tag";

const ast = gql`
type Transfer {
  id: String!
  from: String
  to: String
  tokenId: String
}

type Query {
  transfers: [Transfer!]
  transfer(id: String!): Transfer
}
`;

export const schema = buildASTSchema(ast);