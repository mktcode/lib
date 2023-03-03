import { describe, expect, test } from '@jest/globals';
import gql from 'graphql-tag';
import { findPaginationParameters } from '../src';

describe('main module', () => {
  test('finds pagination variables in simple query', () => {
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

    const paginationParams = findPaginationParameters(SIMPLE_QUERY);

    expect(paginationParams).toEqual([
      {
        path: [ 'user', 'followers' ],
        limitVarName: 'first',
        cursorVarName: 'after'
      },
    ]);
  });

  test('finds pagination variables in deep query', () => {
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
        repositories (last: $first3, after: $after3) {
          totalCount
          nodes {
            login
          }
        }
      }
    }`

    const paginationParams = findPaginationParameters(COMPLEX_QUERY);

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
});
