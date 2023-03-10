import { describe, expect, test } from '@jest/globals';
import gql from 'graphql-tag';
import { extractPaginators, getHighestLevelPaginators } from '../src';

const SIMPLE_QUERY = gql`query GetUser($login: String!, $first: Int = 100, $after: String) {
  user (login: $login) {
    login
    followers (first: $first, after: $after) {
      totalCount
      nodes {
        login
      }
    }
  }
}`

const SIMPLE_FRAGMENTS_QUERY = gql`query (
  $owner: String!,
  $name: String!,
  $since: GitTimestamp!,
  $until: GitTimestamp!,
  $last: Int!,
  $after: String
) {
  repository(owner: $owner, name: $name) {
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(since: $since, until: $until, last: $last, after: $after) {
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

const COMPLEX_QUERY = gql`query GetUser($login: String!, $first1: Int = 100, $after1: String, $first2: Int = 100, $after2: String, $first3: Int = 100, $after3: String) {
  user (login: $login) {
    login
    followers (first: $first1, after: $after1) {
      totalCount
      nodes {
        login
        followers (first: $first2, after: $after2) {
          totalCount
          nodes {
            login
          }
        }
      }
    }
    repositories (first: $first3, after: $after3) {
      totalCount
      nodes {
        login
      }
    }
  }
}`

describe('main module', () => {
  test('finds pagination variables in simple query', () => {
    const paginationParams = extractPaginators(SIMPLE_QUERY);

    expect(paginationParams).toEqual([
      {
        path: [ 'user', 'followers' ],
        limitVarName: 'first',
        cursorVarName: 'after'
      },
    ]);
  });

  test('finds pagination variables in simple query with fragment', () => {
    const paginationParams = extractPaginators(SIMPLE_FRAGMENTS_QUERY);

    expect(paginationParams).toEqual([
      {
        path: [ 'repository', 'defaultBranchRef', 'target', 'history' ],
        limitVarName: 'last',
        cursorVarName: 'after'
      },
    ]);
  });

  test('finds all pagination variables in deep query', () => {
    const paginationParams = extractPaginators(COMPLEX_QUERY);

    expect(paginationParams).toEqual([
      {
        path: [ 'user', 'followers' ],
        limitVarName: 'first1',
        cursorVarName: 'after1'
      },
      {
        path: [ 'user', 'followers', 'nodes', 'followers' ],
        limitVarName: 'first2',
        cursorVarName: 'after2'
      },
      {
        path: [ 'user', 'repositories' ],
        limitVarName: 'first3',
        cursorVarName: 'after3'
      }
    ]);
  });

  test('finds highest level pagination variables in deep query', () => {
    const paginationParams = getHighestLevelPaginators(extractPaginators(COMPLEX_QUERY));

    expect(paginationParams).toEqual([
      {
        path: [ 'user', 'followers' ],
        limitVarName: 'first1',
        cursorVarName: 'after1'
      },
      {
        path: [ 'user', 'repositories' ],
        limitVarName: 'first3',
        cursorVarName: 'after3'
      }
    ]);
  });
});
