import { buildASTSchema } from "graphql";
import gql from "graphql-tag";

const ast = gql`
type Transfer {
  from: String
  to: String
  tokenId: String
}

type Query {
  transfers: [Transfer!]
}
`;

export const schema = buildASTSchema(ast);