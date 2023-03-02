export type UserScan = {
  login: string;
  createdAt: string;
  followers: {
    totalCount: number;
    nodes: {
      repositories: {
        nodes: {
          stargazerCount: number;
          forkCount: number;
        }[]
      }
      followers: {
        totalCount: number;
      }
    }[]
  }
  repositories: {
    nodes: {
      stargazerCount: number;
      forkCount: number;
    }[]
  }
  pullRequests: {
    totalCount: number;
    nodes: {
      merged: boolean;
      mergedAt: string;
      repository: {
        owner: {
          login: string;
        }
        stargazerCount: number;
        forkCount: number;
      } | null;
    }[]
  }
}

export function evaluateUserScan(userScan: UserScan) {
  const forkCount = userScan.repositories.nodes.reduce(
    (acc, repo) => acc + repo.forkCount,
    0
  );
  const followersForkCount = userScan.followers.nodes.reduce(
    (acc, follower) => acc + follower.repositories.nodes.reduce(
      (acc, repo) => acc + repo.forkCount,
      0
    ),
    0
  );

  const stargazerCount = userScan.repositories.nodes.reduce(
    (acc, repo) => acc + repo.stargazerCount,
    0
  );
  const followersStargazerCount = userScan.followers.nodes.reduce(
    (acc, follower) => acc + follower.repositories.nodes.reduce(
      (acc, repo) => acc + repo.stargazerCount,
      0
    ),
    0
  );
  
  const followersFollowerCount = userScan.followers.nodes.reduce(
    (acc, follower) => acc + follower.followers.totalCount,
    0
  );

  const eligablePullRequests = userScan.pullRequests.nodes
    .filter(pr => pr.merged && !!pr.repository)
    .filter(pr => !!pr.repository && pr.repository?.owner.login !== userScan.login);

  const mergedPullRequestCount = eligablePullRequests.reduce(
    (acc, pr) => pr.merged ? acc + 1 : acc,
    0
  );

  const mergedPullRequestCount30d = eligablePullRequests.reduce(
    (acc, pr) => {
      const mergedAt = new Date(pr.mergedAt);
      const now = new Date();
      const diff = now.getTime() - mergedAt.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      return pr.merged && diffDays <= 30 ? acc + 1 : acc;
    },
    0
  );

  const mergedPullRequestCount365d = eligablePullRequests.reduce(
    (acc, pr) => {
      const mergedAt = new Date(pr.mergedAt);
      const now = new Date();
      const diff = now.getTime() - mergedAt.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      return pr.merged && diffDays <= 365 ? acc + 1 : acc;
    },
    0
  );

  return {
    forkCount,
    followersForkCount,
    stargazerCount,
    followersStargazerCount,
    followersFollowerCount,
    mergedPullRequestCount,
    mergedPullRequestCount30d,
    mergedPullRequestCount365d,
  };
}