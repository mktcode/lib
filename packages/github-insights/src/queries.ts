import gql from "graphql-tag";

export const GITHUB_USER_FOLLOWERS_QUERY = gql`query ($login: String!, $first: Int = 1, $after: String) { 
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

export const GITHUB_USER_SCAN_QUERY = gql`query (
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

export const GITHUB_REPOSITORY_SCAN_QUERY = gql`query (
  $owner: String!,
  $name: String!
) { 
  repository (owner: $owner, name: $name) {
    createdAt
    stargazerCount
  }
}`;
