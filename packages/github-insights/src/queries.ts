import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const USER_QUERY: DocumentNode = gql`query (
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


export const REPO_COMMITS_QUERY: DocumentNode = gql`query (
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