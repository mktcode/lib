import { graphql } from "@octokit/graphql/dist-types/types";
import { print } from "graphql";
import { UserScan } from "../evaluators/user";
import { GITHUB_USER_SCAN_QUERY } from "../queries";

export async function fetchUserScan(
  client: graphql,
  login: string,
): Promise<UserScan> {
  const { user } =  await client<{ user: UserScan }>(
    print(GITHUB_USER_SCAN_QUERY),
    { login }
  );

  return user;
}