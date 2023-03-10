import { graphqlFetchAll } from "@mktcodelib/graphql-fetch-all";
import { UserScan } from "../evaluators/user";
import { GITHUB_USER_SCAN_QUERY } from "../queries";
import { Octokit } from "octokit";

export async function fetchUserScan(
  client: Octokit,
  login: string,
): Promise<UserScan> {
  const { user } = await graphqlFetchAll<{ user: UserScan }>(
    client.graphql,
    GITHUB_USER_SCAN_QUERY,
    {
      login,
      firstFollowers: 100,
      firstRepos: 100,
      firstPrs: 100,
    },
  );

  return user;
}