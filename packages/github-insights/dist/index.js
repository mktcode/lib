"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var import_graphql3 = require("@octokit/graphql");
var import_graphql4 = require("graphql");

// src/queries.ts
var import_graphql_tag = __toESM(require("graphql-tag"));
var GITHUB_USER_FOLLOWERS_QUERY = import_graphql_tag.default`query ($login: String!, $first: Int = 1, $after: String) { 
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
var GITHUB_USER_SCAN_QUERY = import_graphql_tag.default`query (
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
var GITHUB_REPOSITORY_SCAN_QUERY = import_graphql_tag.default`query (
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
var import_graphql = require("graphql");
function fetchUserScan(client, login) {
  return __async(this, null, function* () {
    const { user } = yield client(
      (0, import_graphql.print)(GITHUB_USER_SCAN_QUERY),
      { login }
    );
    return user;
  });
}

// src/paginate.ts
var import_graphql2 = require("graphql");
var import_lodash = require("lodash");
function paginate(client, query, variables, pathToPaginatedProperty, nodesFetched = 0) {
  return __async(this, null, function* () {
    const fullData = yield client((0, import_graphql2.print)(query), variables);
    const {
      nodes,
      totalCount,
      pageInfo: { hasNextPage, endCursor }
    } = (0, import_lodash.get)(fullData, pathToPaginatedProperty);
    if (hasNextPage) {
      const perPage = Math.min(totalCount - nodesFetched, 100);
      const nextData = yield paginate(
        client,
        query,
        __spreadProps(__spreadValues({}, variables), { first: perPage, after: endCursor }),
        pathToPaginatedProperty,
        nodesFetched + nodes.length
      );
      const nextPageData = (0, import_lodash.get)(nextData, pathToPaginatedProperty);
      (0, import_lodash.set)(fullData, pathToPaginatedProperty, __spreadProps(__spreadValues({}, nextPageData), {
        nodes: [...nodes, ...nextPageData.nodes]
      }));
    }
    return fullData;
  });
}

// src/index.ts
var GithubInsights = class {
  constructor(options) {
    this.client = import_graphql3.graphql.defaults({
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
        (0, import_graphql4.print)(GITHUB_REPOSITORY_SCAN_QUERY),
        { owner, name }
      );
      return evaluateRepositoryScan(repository);
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GithubInsights
});
