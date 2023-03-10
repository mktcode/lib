import { Octokit } from "octokit";
import { evaluateRepoCommits } from "./evaluators/repoCommits";
import { evaluateUserScan } from "./evaluators/user";
import { fetchRepoCommits } from "./fetchers/repoCommits";
import { fetchUserScan } from "./fetchers/user";

export class GithubInsights {
  client: Octokit;

  constructor(options: { viewerToken: string, sourceUrl?: string }) {
    this.client = new Octokit({ auth: options.viewerToken, baseUrl: options.sourceUrl });
  }

  async scanUser(login: string) {
    const userScan = await fetchUserScan(this.client, login);

    return evaluateUserScan(userScan);
  }

  async scanUsers(logins: string[]) {
    const userScans = await Promise.all(logins.map(login => fetchUserScan(this.client, login)));

    return Object.fromEntries(userScans.map(userScan => [userScan.login, evaluateUserScan(userScan)]));
  }

  async scanRepoCommits(owner: string, repo: string, start: Date, end: Date) {
    const commits = await fetchRepoCommits(this.client, owner, repo, start, end);

    return evaluateRepoCommits(commits);
  }
}