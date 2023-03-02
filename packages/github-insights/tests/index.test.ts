import { describe, expect, test } from '@jest/globals';
import { evaluateRepositoryScan } from '../src/evaluators/repository';
import { evaluateUserScan } from '../src/evaluators/user';
import GITHUB_USER_SCAN_MOCK from './mocks/github-user-scan.json';
import GITHUB_REPOSITORY_SCAN_MOCK from './mocks/github-repository-scan.json';

jest.useFakeTimers();
jest.setSystemTime(1677015116954);

describe('main module', () => {
  test('evaluates user score correctly', () => {
    const expectedForkCount = 753;
    const expectedFollowersForkCount = 11371;
    const expectedStargazerCount = 2389;
    const expectedFollowersStargazerCount = 18244;
    const expectedFollowersFollowerCount = 17950;
    const expectedMergedPullRequestCount = 92;
    const expectedMergedPullRequestCount30d = 7;
    const expectedMergedPullRequestCount365d = 67;

    const {
      forkCount,
      followersForkCount,
      stargazerCount,
      followersStargazerCount,
      followersFollowerCount,
      mergedPullRequestCount,
      mergedPullRequestCount30d,
      mergedPullRequestCount365d,
    } = evaluateUserScan(GITHUB_USER_SCAN_MOCK.data.user);

    expect(forkCount).toBe(expectedForkCount);
    expect(followersForkCount).toBe(expectedFollowersForkCount);
    expect(stargazerCount).toBe(expectedStargazerCount);
    expect(followersStargazerCount).toBe(expectedFollowersStargazerCount);
    expect(followersFollowerCount).toBe(expectedFollowersFollowerCount);
    expect(mergedPullRequestCount).toBe(expectedMergedPullRequestCount);
    expect(mergedPullRequestCount30d).toBe(expectedMergedPullRequestCount30d);
    expect(mergedPullRequestCount365d).toBe(expectedMergedPullRequestCount365d);
  });

  test('evaluates repository score correctly', () => {
    const expectedResult = {
      mostActiveContributor: null,
      contributors: [
        {
          login: 'mktcode',
          contributions: {
            totalCount: 113,
            totalIssueContributions: 0,
            totalPullRequestContributions: 11,
            totalCommitContributions: 102,
            totalRepositoryContributions: 0,
            totalPullRequestReviewContributions: 0
          }
        },
      ],
    };

    const result = evaluateRepositoryScan(GITHUB_REPOSITORY_SCAN_MOCK.data.repository);

    expect(result).toBe(expectedResult);
  });
});
