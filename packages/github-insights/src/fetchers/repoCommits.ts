import { Octokit } from "octokit";

export type Commit = {
  sha: string;
  node_id: string;
  commit: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export async function fetchRepoCommits(
  client: Octokit,
  owner: string,
  repo: string,
  start: Date,
  end: Date
): Promise<Commit[]> {
  const commits = await client.paginate<Commit>('GET /repos/{org}/{repo}/commits', {
    owner,
    repo,
  });

  return commits;
}