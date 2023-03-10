import { Octokit } from 'octokit';

type RepoCommitsResult = {
    commitCount: number;
};

declare class GithubInsights {
    client: Octokit;
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
    scanRepoCommits(owner: string, repo: string, start: Date, end: Date): Promise<RepoCommitsResult>;
}

export { GithubInsights };
