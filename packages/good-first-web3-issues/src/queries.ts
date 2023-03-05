import gql from 'graphql-tag';

export const ORG_REPOS_QUERY = gql`query ($login: String!, $first: Int!, $after: String) {
  rateLimit {
    remaining
  }
  organization (login: $login) {
    id
    login
    name
    description
    url
    websiteUrl
    avatarUrl
    repositories (first: $first, after: $after, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        nameWithOwner
        description
        url
        stargazerCount
        languages (first: 10) {
          nodes {
            id
            name
            color
          }
        }
        issues {
          totalCount
        }
      }
    }
  }
}`;

export const USER_REPOS_QUERY = gql`query ($login: String!, $first: Int!, $after: String) {
  rateLimit {
    remaining
  }
  user (login: $login) {
    id
    login
    name
    description: bio
    url
    websiteUrl
    avatarUrl
    repositories (first: $first, after: $after, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        nameWithOwner
        description
        url
        stargazerCount
        languages (first: 10) {
          nodes {
            id
            name
            color
          }
        }
        issues {
          totalCount
        }
      }
    }
  }
}`;

export const REPO_ISSUES_QUERY = gql`query ($owner: String!, $name: String!, $first: Int!, $after: String) {
  rateLimit {
    remaining
  }
  repository (owner: $owner, name: $name) {
    issues (first: $first, after: $after, labels: ["good first issue"], states: [OPEN]) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        number
        title
        url
        labels (first: 10) {
          nodes {
            id
            name
            color
          }
        }
        assignees (first: 3) {
          nodes {
            id
            login
            name
            avatarUrl
          }
        }
        comments {
          totalCount
        }
      }
    }
  }
}`;