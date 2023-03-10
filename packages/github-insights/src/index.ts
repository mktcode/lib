import { graphqlFetchAll } from "@mktcodelib/graphql-fetch-all";
import { Octokit } from "@octokit/core";
import { PaginateInterface, paginateRest } from "@octokit/plugin-paginate-rest";
import { evaluateRepoCommits, RepoCommits } from "./evaluators/repoCommits";
import { evaluateUser, User } from "./evaluators/user";
import { REPO_COMMITS_QUERY, USER_QUERY } from "./queries";

export type Commit = {
  sha: string;
  node_id: string;
  commit: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export type RepoCommitsResult = {
  commitCount: number;
}

export class GithubInsights {
  client: Octokit & { paginate: PaginateInterface };

  constructor(options: { viewerToken: string, sourceUrl?: string }) {
    const octokit = Octokit.plugin(paginateRest);
    this.client = new octokit({ auth: options.viewerToken, baseUrl: options.sourceUrl });
  }

  async fetchUser(login: string): Promise<User> {
    const { user } = await graphqlFetchAll<{ user: User }>(
      this.client.graphql,
      USER_QUERY,
      {
        login,
        firstFollowers: 100,
        firstRepos: 100,
        firstPrs: 100,
      },
    );
  
    return user;
  }

  async scanUser(login: string) {
    const userScan = await this.fetchUser(login);

    return evaluateUser(userScan);
  }

  async scanUsers(logins: string[]) {
    const userScans = await Promise.all(logins.map(login => this.fetchUser(login)));

    return Object.fromEntries(userScans.map(userScan => [userScan.login, evaluateUser(userScan)]));
  }

  async scanRepoCommits(owner: string, name: string, since: Date, until: Date) {
    const { repository } = await graphqlFetchAll<{ repository: RepoCommits }>(
      this.client.graphql,
      REPO_COMMITS_QUERY,
      {
        owner,
        name,
        since: since.toISOString(),
        until: until.toISOString(),
        first: 100,
      },
    );

    return evaluateRepoCommits(repository);
  }
}