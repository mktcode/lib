import { graphql } from "@octokit/graphql/dist-types/types";
import { graphqlFetchAll } from "@mktcodelib/graphql-fetch-all";
import { UserScan } from "../evaluators/user";
import { GITHUB_USER_SCAN_QUERY } from "../queries";

export async function fetchUserScan(
  client: graphql,
  login: string,
): Promise<UserScan> {
  const { user } = await graphqlFetchAll<{ user: UserScan }>(
    client,
    GITHUB_USER_SCAN_QUERY,
    { login, first: 1 },
    ['user', 'followers']
  );

  return user;
}