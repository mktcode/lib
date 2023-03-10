import { Commit } from "../fetchers/repoCommits";

export type RepoCommitsResult = {
  commitCount: number;
}

export function evaluateRepoCommits(commits: Commit[]): RepoCommitsResult {
  return {
    commitCount: 0,
  };
}