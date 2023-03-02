type Options = {
    githubToken: string;
    port?: number;
    redisConfig?: Record<string, any>;
    snycInterval?: number;
    debug?: boolean;
};
declare class GoodFirstWeb3Issues {
    private port;
    private snycInterval;
    private debug;
    private db;
    private server;
    private github;
    constructor({ githubToken, port, redisConfig, snycInterval, debug, }: Options);
    log(...args: any[]): void;
    sync(): Promise<void>;
    run(): void;
}

export { GoodFirstWeb3Issues };
