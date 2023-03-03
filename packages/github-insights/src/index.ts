import { graphql } from "@octokit/graphql";
import { print } from "graphql";
import { GITHUB_REPOSITORY_SCAN_QUERY } from "./queries";
import { evaluateUserScan } from "./evaluators/user";
import { evaluateRepositoryScan, type RepositoryScan } from "./evaluators/repository";
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

  async scanRepository(owner: string, name: string) {
    const { repository } = await this.client<{ repository: RepositoryScan }>(
      print(GITHUB_REPOSITORY_SCAN_QUERY),
      { owner, name }
    );

    return evaluateRepositoryScan(repository);
  }
}