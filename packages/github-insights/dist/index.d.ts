import { Octokit } from '@octokit/core';
import { PaginateInterface } from '@octokit/plugin-paginate-rest';

type User = {
    login: string;
    createdAt: string;
    followers: {
        totalCount: number;
        nodes: {
            repositories: {
                nodes: {
                    stargazerCount: number;
                    forkCount: number;
                }[];
            };
            followers: {
                totalCount: number;
            };
        }[];
    };
    repositories: {
        nodes: {
            stargazerCount: number;
            forkCount: number;
        }[];
    };
    pullRequests: {
        totalCount: number;
        nodes: {
            merged: boolean;
            mergedAt: string;
            repository: {
                owner: {
                    login: string;
                };
                stargazerCount: number;
                forkCount: number;
            } | null;
        }[];
    };
};

type Commit = {
    sha: string;
    node_id: string;
    commit: {
        additions: number;
        deletions: number;
        total: number;
    };
};
type RepoCommitsResult = {
    commitCount: number;
};
declare class GithubInsights {
    client: Octokit & {
        paginate: PaginateInterface;
    };
    constructor(options: {
        viewerToken: string;
        sourceUrl?: string;
    });
    fetchUser(login: string): Promise<User>;
    scanUser(login: string): Promise<{
        forkCount: number;
        followersForkCount: number;
        stargazerCount: number;
        followersStargazerCount: number;
        followersFollowerCount: number;
        mergedPullRequestCount: number;
        mergedPullRequestCount30d: number;
        mergedPullRequestCount365d: number;
    }>;
    scanUsers(logins: string[]): Promise<{
        [k: string]: {
            forkCount: number;
            followersForkCount: number;
            stargazerCount: number;
            followersStargazerCount: number;
            followersFollowerCount: number;
            mergedPullRequestCount: number;
            mergedPullRequestCount30d: number;
            mergedPullRequestCount365d: number;
        };
    }>;
    scanRepoCommits(owner: string, name: string, since: Date, until: Date): Promise<{
        commitCount: number;
    }>;
}

export { Commit, GithubInsights, RepoCommitsResult };
