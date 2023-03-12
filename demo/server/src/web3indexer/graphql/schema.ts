import { buildASTSchema } from "graphql";
import gql from "graphql-tag";

export default buildASTSchema(gql`

type Transfer {
  from: String
  to: String
  tokenId: String
}

type Query {
  transfers: [Transfer!]
}

`);