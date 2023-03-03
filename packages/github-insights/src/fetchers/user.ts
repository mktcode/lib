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
    {
      login,
      firstFollowers: 100,
      firstRepos: 100,
      firstPrs: 100,
    },
    [
      {
        path: ['user', 'followers'],
        limitParamName: 'firstFollowers',
        cursorParamName: 'afterFollower',
      },
      {
        path: ['user', 'repositories'],
        limitParamName: 'firstRepos',
        cursorParamName: 'afterRepo',
      },
      {
        path: ['user', 'pullRequests'],
        limitParamName: 'firstPrs',
        cursorParamName: 'afterPr',
      },
    ]
  );

  console.log(user)

  return user;
}