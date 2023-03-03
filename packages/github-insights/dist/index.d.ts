import { graphql } from '@octokit/graphql';

declare class GithubInsights {
    client: ReturnType<typeof graphql.defaults>;
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
}

export { GithubInsights };
