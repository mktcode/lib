# GraphQL Fetch All

This package is still tied to GitHub's GraphQL API but might become more generic in the future.

```bash
npm i @mktcodelib/graphql-fetch-all
```

```js
import { graphql } from "@octokit/graphql";
import { graphqlFetchAll } from "@mktcodelib/graphql-fetch-all";

const client = graphql.defaults({
  headers: {
    Authorization: `bearer ghp_...`,
  },
})

const GITHUB_USER_FOLLOWERS_QUERY = gql`query ($login: String!, $first: Int!, $after: String) { 
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

const followers = await graphqlFetchAll(
  client,
  GITHUB_USER_FOLLOWERS_QUERY,
  { login, first: 100 },
);
```

For a user with 205 followers, this will make 3 requests, fetching 100, 100 and then 5 followers.
Based on how many nodes have already been fetched, it will try to use the lowest possible `first` argument.
With an initial `first` argument of 10 and 85 total followers, it will make 2 requests, fetching 10 and then 75. For 150 followers, it would be 10, 100 and then 40.

## Multiple Paginators

You can have multiple paginated fields in your query but they must be on the same level and only the highest level will befetched.

```js
const GITHUB_USER_FOLLOWERS_QUERY = gql`query (
  $login: String!,
  $firstFollowers: Int!,
  $afterFollower: String
  $firstRepos: Int!,
  $afterRepo: String
  $lastIssues: Int = 10,
  $beforeIssue: String
) { 
  user (login: $login) {
    followers (first: $firstFollowers, after: $afterFollower) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        login
      }
    }
    repositories (first: $firstRepos, after: $afterRepo) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        issues (last: $lastIssues, before: $beforeIssue) {
          totalCount
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            title
            number
          }
        }
      }
    }
  }
}`;
```

This query fetches all `followers` and all `repositories` but only the last 10 issues of each repository.