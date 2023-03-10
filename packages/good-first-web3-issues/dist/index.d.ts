import { CorsOptions } from 'cors';

type Label = {
    id: string;
    name: string;
    color: string;
};
type Language = {
    id: string;
    name: string;
    color: string;
};
type Assignee = {
    id: string;
    login: string;
    avatarUrl: string;
};
type Issue = {
    id: string;
    title: string;
    url: string;
    labels: Label[];
    assignees: Assignee[];
};
type IssueNode = Issue & {
    labels: {
        totalCount: number;
        nodes: Label[];
    };
    assignees: {
        totalCount: number;
        nodes: Assignee[];
    };
};
type Repository = {
    id: string;
    name: string;
    owner: {
        login: string;
    };
    description: string;
    url: string;
    stargazersCount: number;
    languages: Language[];
    issues: Issue[];
};
type RepositoryNode = Repository & {
    languages: {
        totalCount: number;
        nodes: Language[];
    };
    issues: {
        totalCount: number;
        nodes: IssueNode[];
    };
};
type Organization = {
    id: string;
    login: string;
    name: string;
    description: string;
    url: string;
    websiteUrl: string;
    avatarUrl: string;
    repositories: Repository[];
};
type OrganizationNode = Organization & {
    repositories: {
        totalCount: number;
        nodes: RepositoryNode[];
    };
};
type RateLimit = {
    used: number;
    resetAt: string;
};

type Options = {
    githubToken: string;
    port?: number;
    redisConfig?: Record<string, any>;
    rateLimit?: number;
    corsOrigin?: CorsOptions['origin'];
    debug?: boolean;
};
declare class GoodFirstWeb3Issues {
    private port;
    private rateLimit;
    private debug;
    private db;
    private server;
    private github;
    constructor({ githubToken, port, redisConfig, rateLimit, corsOrigin, debug, }: Options);
    log(...args: any[]): void;
    sanitizeData(orgOrUser: OrganizationNode): Organization;
    wait(rateLimit: RateLimit): Promise<void>;
    sync(): Promise<void>;
    run(): void;
}

export { GoodFirstWeb3Issues };
