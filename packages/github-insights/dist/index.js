"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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
var src_exports = {};
__export(src_exports, {
  GithubInsights: () => GithubInsights
});
module.exports = __toCommonJS(src_exports);
var import_graphql_fetch_all = require("@mktcodelib/graphql-fetch-all");
var import_core = require("@octokit/core");
var import_plugin_paginate_rest = require("@octokit/plugin-paginate-rest");

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
  const commitsByAuthor = commits.reduce((acc, commit) => {
    var _a, _b, _c, _d, _e, _f;
    if (!((_b = (_a = commit.author) == null ? void 0 : _a.user) == null ? void 0 : _b.login))
      return acc;
    const author = commit.author.user.login;
    const commitCount2 = (_d = (_c = acc[author]) == null ? void 0 : _c.commitCount) != null ? _d : 0;
    const linesChanged2 = (_f = (_e = acc[author]) == null ? void 0 : _e.linesChanged) != null ? _f : 0;
    acc[author] = {
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
    },
    commitsByAuthor
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
var import_graphql_tag = __toESM(require("graphql-tag"));
var USER_QUERY = import_graphql_tag.default`query (
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
var REPO_COMMITS_QUERY = import_graphql_tag.default`query (
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
    const octokit = import_core.Octokit.plugin(import_plugin_paginate_rest.paginateRest);
    this.client = new octokit({ auth: options.viewerToken, baseUrl: options.sourceUrl });
  }
  scanUser(login) {
    return __async(this, null, function* () {
      const { user } = yield (0, import_graphql_fetch_all.graphqlFetchAll)(
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
      const { repository } = yield (0, import_graphql_fetch_all.graphqlFetchAll)(
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GithubInsights
});
