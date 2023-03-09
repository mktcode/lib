import { graphql } from "@octokit/graphql";
import { evaluateUserScan } from "./evaluators/user";
import { fetchUserScan } from "./fetchers/user";

export class GithubInsights {
  client: ReturnType<typeof graphql.defaults>;

  constructor(options: { viewerToken: string, sourceUrl?: string }) {
    this.client = graphql.defaults({
      baseUrl: options.sourceUrl,
      headers: {
        Authorization: `bearer ${options.viewerToken}`,
      },
    })
  }

  async scanUser(login: string) {
    const userScan = await fetchUserScan(this.client, login);

    return evaluateUserScan(userScan);
  }

  async scanUsers(logins: string[]) {
    const userScans = await Promise.all(logins.map(login => fetchUserScan(this.client, login)));

    return Object.fromEntries(userScans.map(userScan => [userScan.login, evaluateUserScan(userScan)]));
  }
}