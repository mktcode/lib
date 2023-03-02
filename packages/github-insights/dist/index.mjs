var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
import { graphql } from "@octokit/graphql";
import { print as print3 } from "graphql";

// src/queries.ts
import gql from "graphql-tag";
var GITHUB_USER_FOLLOWERS_QUERY = gql`query ($login: String!, $first: Int = 1, $after: String) { 
  user (login: $login) {
    followers (first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        login
      }
    }
  }
}`;
var GITHUB_USER_SCAN_QUERY = gql`query (
  $login: String!,
  $followersBatchSize: Int = 50,
  $followersAfter: String,
) { 
  user (login: $login) {
    login
    createdAt
    followers (first: $followersBatchSize, after: $followersAfter) {
      totalCount
      nodes {
        repositories (first: 50, isFork: false) {
          nodes {
            stargazerCount
            forkCount
          }
        }
        followers (first: 50) {
          totalCount
        }
      }
    }
    repositories (first: 50, isFork: false) {
      nodes {
        stargazerCount
        forkCount
      }
    }
    pullRequests (first: 50, states: [MERGED], orderBy: { field: CREATED_AT, direction: DESC}) {
      totalCount
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
var GITHUB_REPOSITORY_SCAN_QUERY = gql`query (
  $owner: String!,
  $name: String!
) { 
  repository (owner: $owner, name: $name) {
    createdAt
    stargazerCount
  }
}`;

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

// src/evaluators/repository.ts
function evaluateRepositoryScan(repositoryScan) {
  return {
    mostActiveContributor: null,
    contributors: []
  };
}

// src/fetchers/user.ts
import { print } from "graphql";
function fetchUserScan(client, login) {
  return __async(this, null, function* () {
    const { user } = yield client(
      print(GITHUB_USER_SCAN_QUERY),
      { login }
    );
    return user;
  });
}

// src/paginate.ts
import { print as print2 } from "graphql";
import { get, set } from "lodash";
function paginate(client, query, variables, pathToPaginatedProperty, nodesFetched = 0) {
  return __async(this, null, function* () {
    const fullData = yield client(print2(query), variables);
    const {
      nodes,
      totalCount,
      pageInfo: { hasNextPage, endCursor }
    } = get(fullData, pathToPaginatedProperty);
    if (hasNextPage) {
      const perPage = Math.min(totalCount - nodesFetched, 100);
      const nextData = yield paginate(
        client,
        query,
        __spreadProps(__spreadValues({}, variables), { first: perPage, after: endCursor }),
        pathToPaginatedProperty,
        nodesFetched + nodes.length
      );
      const nextPageData = get(nextData, pathToPaginatedProperty);
      set(fullData, pathToPaginatedProperty, __spreadProps(__spreadValues({}, nextPageData), {
        nodes: [...nodes, ...nextPageData.nodes]
      }));
    }
    return fullData;
  });
}

// src/index.ts
var GithubInsights = class {
  constructor(options) {
    this.client = graphql.defaults({
      baseUrl: options.sourceUrl,
      headers: {
        Authorization: `bearer ${options.viewerToken}`
      }
    });
  }
  scanUser(login) {
    return __async(this, null, function* () {
      const userScan = yield fetchUserScan(this.client, login);
      const followers = yield paginate(this.client, GITHUB_USER_FOLLOWERS_QUERY, { login, first: 1 }, ["user", "followers"]);
      return evaluateUserScan(userScan);
    });
  }
  scanRepository(owner, name) {
    return __async(this, null, function* () {
      const { repository } = yield this.client(
        print3(GITHUB_REPOSITORY_SCAN_QUERY),
        { owner, name }
      );
      return evaluateRepositoryScan(repository);
    });
  }
};
export {
  GithubInsights
};
