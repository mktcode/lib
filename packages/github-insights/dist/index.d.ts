import { Octokit } from '@octokit/core';
import { PaginateInterface } from '@octokit/plugin-paginate-rest';

type Commit = {
    sha: string;
    node_id: string;
    commit: {
        additions: number;
        deletions: number;
        total: number;
    };
};
declare class GithubInsights {
    client: Octokit & {
        paginate: PaginateInterface;
    };
    constructor(options: {
        viewerToken: string;
        sourceUrl?: string;
    });
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
    scanUsers(logins: string[]): Promise<any>;
    scanRepoCommits(owner: string, name: string, since: Date, until: Date): Promise<{
        commitCount: number;
        linesChanged: number;
        commitsByDay: Record<string, {
            commitCount: number;
            linesChanged: number;
        }>;
        commitsByDayNormalized: {
            commitCount: number[];
            linesChanged: number[];
        };
        commitsByAuthor: Record<string, {
            commitCount: number;
            linesChanged: number;
        }>;
    }>;
}

export { Commit, GithubInsights };
