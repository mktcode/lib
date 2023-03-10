var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
import { graphqlFetchAll } from "@mktcodelib/graphql-fetch-all";
import { Octokit } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";

// src/evaluators/repoCommits.ts
function normalizeNumbers(numbers) {
  const max = Math.max(...numbers);
  return numbers.map((num) => num / max);
}
function evaluateRepoCommits(repoCommits) {
  const { defaultBranchRef: { target: { history: { nodes: commits } } } } = repoCommits;
  const commitCount = commits.length;
  const linesChanged = commits.reduce((acc, commit) => acc + commit.additions + commit.deletions, 0);
  const commitsByDay = commits.reduce((acc, commit) => {
    var _a, _b, _c, _d;
    const date = new Date(commit.committedDate).toISOString().split("T")[0];
    const commitCount2 = (_b = (_a = acc[date]) == null ? void 0 : _a.commitCount) != null ? _b : 0;
    const linesChanged2 = (_d = (_c = acc[date]) == null ? void 0 : _c.linesChanged) != null ? _d : 0;
    acc[date] = {
      commitCount: commitCount2 + 1,
      linesChanged: linesChanged2 + commit.additions + commit.deletions
    };
    return acc;
  }, {});
  return {
    commitCount,
    linesChanged,
    commitsByDay,
    commitsByDayNormalized: {
      commitCount: normalizeNumbers(Object.values(commitsByDay).map(({ commitCount: commitCount2 }) => commitCount2)),
      linesChanged: normalizeNumbers(Object.values(commitsByDay).map(({ linesChanged: linesChanged2 }) => linesChanged2))
    }
  };
}

// src/evaluators/user.ts
function evaluateUser(user) {
  const {
    followers: { nodes: followers },
    repositories: { nodes: repositories },
    pullRequests: { nodes: pullRequests }
  } = user;
  const forkCount = repositories.reduce(
    (acc, repo) => acc + repo.forkCount,
    0
  );
  const stargazerCount = repositories.reduce(
    (acc, repo) => acc + repo.stargazerCount,
    0
  );
  const followersForkCount = followers.reduce(
    (acc, follower) => acc + follower.repositories.nodes.reduce(
      (acc2, repo) => acc2 + repo.forkCount,
      0
    ),
    0
  );
  const followersStargazerCount = followers.reduce(
    (acc, follower) => acc + follower.repositories.nodes.reduce(
      (acc2, repo) => acc2 + repo.stargazerCount,
      0
    ),
    0
  );
  const followersFollowerCount = followers.reduce(
    (acc, follower) => acc + follower.followers.totalCount,
    0
  );
  const eligablePullRequests = pullRequests.filter((pr) => pr.merged && !!pr.repository).filter((pr) => {
    var _a;
    return !!pr.repository && ((_a = pr.repository) == null ? void 0 : _a.owner.login) !== user.login;
  });
  const mergedPullRequestCount = eligablePullRequests.reduce(
    (acc, pr) => pr.merged ? acc + 1 : acc,
    0
  );
  const mergedPullRequestCount30d = eligablePullRequests.reduce(
    (acc, pr) => {
      const mergedAt = new Date(pr.mergedAt);
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - mergedAt.getTime();
      const diffDays = Math.ceil(diff / (1e3 * 3600 * 24));
      return pr.merged && diffDays <= 30 ? acc + 1 : acc;
    },
    0
  );
  const mergedPullRequestCount365d = eligablePullRequests.reduce(
    (acc, pr) => {
      const mergedAt = new Date(pr.mergedAt);
      const now = /* @__PURE__ */ new Date();
      const diff = now.getTime() - mergedAt.getTime();
      const diffDays = Math.ceil(diff / (1e3 * 3600 * 24));
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
    mergedPullRequestCount365d
  };
}

// src/queries.ts
import gql from "graphql-tag";
var USER_QUERY = gql`query (
  $login: String!,
  $firstFollowers: Int!,
  $afterFollower: String,
  $firstRepos: Int!,
  $afterRepo: String,
  $firstPrs: Int!,
  $afterPr: String,
) { 
  user (login: $login) {
    login
    createdAt
    followers (first: $firstFollowers, after: $afterFollower) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        repositories (first: 100, isFork: false) {
          nodes {
            stargazerCount
            forkCount
          }
        }
        followers {
          totalCount
        }
      }
    }
    repositories (first: $firstRepos, after: $afterRepo, isFork: false) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        stargazerCount
        forkCount
      }
    }
    pullRequests (first: $firstPrs, after: $afterPr, states: [MERGED], orderBy: { field: CREATED_AT, direction: DESC}) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        merged
        mergedAt
        repository {
          owner {
            login
          }
          stargazerCount
          forkCount
        }
      }
    }
  }
}`;
var REPO_COMMITS_QUERY = gql`query (
  $owner: String!,
  $name: String!,
  $since: GitTimestamp!,
  $until: GitTimestamp!,
  $first: Int!,
  $after: String
) {
  repository(owner: $owner, name: $name) {
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(since: $since, until: $until, first: $first, after: $after) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              message
              additions
              deletions
              changedFilesIfAvailable
              committedDate
              author {
                user {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
}`;

// src/index.ts
var GithubInsights = class {
  constructor(options) {
    const octokit = Octokit.plugin(paginateRest);
    this.client = new octokit({ auth: options.viewerToken, baseUrl: options.sourceUrl });
  }
  scanUser(login) {
    return __async(this, null, function* () {
      const { user } = yield graphqlFetchAll(
        this.client.graphql,
        USER_QUERY,
        {
          login,
          firstFollowers: 100,
          firstRepos: 100,
          firstPrs: 100
        }
      );
      return evaluateUser(user);
    });
  }
  scanUsers(logins) {
    return __async(this, null, function* () {
      return Object.fromEntries(
        yield Promise.all(
          logins.map((login) => __async(this, null, function* () {
            return [login, yield this.scanUser(login)];
          }))
        )
      );
    });
  }
  scanRepoCommits(owner, name, since, until) {
    return __async(this, null, function* () {
      const { repository } = yield graphqlFetchAll(
        this.client.graphql,
        REPO_COMMITS_QUERY,
        {
          owner,
          name,
          since: since.toISOString(),
          until: until.toISOString(),
          first: 100
        }
      );
      return evaluateRepoCommits(repository);
    });
  }
};
export {
  GithubInsights
};
