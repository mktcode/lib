export type RepoCommits = {
  defaultBranchRef: {
    name: string;
    target: {
      history: {
        totalCount: number;
        nodes: {
          additions: number;
          deletions: number;
          changedFilesIfAvailable: number;
          committedDate: string;
          author: {
            user: {
              login: string;
            }
          }
        }[]
      }
    }
  }
}

export function evaluateRepoCommits(repoCommits: RepoCommits) {
  const { defaultBranchRef: { target: { history: { nodes: commits } } } } = repoCommits;

  const commitCount = commits.length;

  return {
    commitCount,
  };
}