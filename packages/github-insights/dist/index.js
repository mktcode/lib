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
var import_octokit = require("octokit");

// src/evaluators/repoCommits.ts
function evaluateRepoCommits(commits) {
  return {
    commitCount: 0
  };
}

// src/evaluators/user.ts
function evaluateUserScan(userScan) {
  const forkCount = userScan.repositories.nodes.reduce(
    (acc, repo) => acc + repo.forkCount,
    0
  );
  const followersForkCount = userScan.followers.nodes.reduce(
    (acc, follower) => acc + follower.repositories.nodes.reduce(
      (acc2, repo) => acc2 + repo.forkCount,
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
      (acc2, repo) => acc2 + repo.stargazerCount,
      0
    ),
    0
  );
  const followersFollowerCount = userScan.followers.nodes.reduce(
    (acc, follower) => acc + follower.followers.totalCount,
    0
  );
  const eligablePullRequests = userScan.pullRequests.nodes.filter((pr) => pr.merged && !!pr.repository).filter((pr) => {
    var _a;
    return !!pr.repository && ((_a = pr.repository) == null ? void 0 : _a.owner.login) !== userScan.login;
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

// src/fetchers/repoCommits.ts
function fetchRepoCommits(client, owner, repo, start, end) {
  return __async(this, null, function* () {
    const commits = yield client.paginate("GET /repos/{org}/{repo}/commits", {
      owner,
      repo
    });
    return commits;
  });
}

// src/fetchers/user.ts
var import_graphql_fetch_all = require("@mktcodelib/graphql-fetch-all");

// src/queries.ts
var import_graphql_tag = __toESM(require("graphql-tag"));
var GITHUB_USER_SCAN_QUERY = import_graphql_tag.default`query (
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

// src/fetchers/user.ts
function fetchUserScan(client, login) {
  return __async(this, null, function* () {
    const { user } = yield (0, import_graphql_fetch_all.graphqlFetchAll)(
      client.graphql,
      GITHUB_USER_SCAN_QUERY,
      {
        login,
        firstFollowers: 100,
        firstRepos: 100,
        firstPrs: 100
      }
    );
    return user;
  });
}

// src/index.ts
var GithubInsights = class {
  constructor(options) {
    this.client = new import_octokit.Octokit({ auth: options.viewerToken, baseUrl: options.sourceUrl });
  }
  scanUser(login) {
    return __async(this, null, function* () {
      const userScan = yield fetchUserScan(this.client, login);
      return evaluateUserScan(userScan);
    });
  }
  scanUsers(logins) {
    return __async(this, null, function* () {
      const userScans = yield Promise.all(logins.map((login) => fetchUserScan(this.client, login)));
      return Object.fromEntries(userScans.map((userScan) => [userScan.login, evaluateUserScan(userScan)]));
    });
  }
  scanRepoCommits(owner, repo, start, end) {
    return __async(this, null, function* () {
      const commits = yield fetchRepoCommits(this.client, owner, repo, start, end);
      return evaluateRepoCommits(commits);
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GithubInsights
});
