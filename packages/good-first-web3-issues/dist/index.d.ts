type Options = {
    githubToken: string;
    port?: number;
    redisConfig?: Record<string, any>;
    syncInterval?: number;
    debug?: boolean;
};
declare class GoodFirstWeb3Issues {
    private port;
    private syncInterval;
    private debug;
    private db;
    private server;
    private github;
    constructor({ githubToken, port, redisConfig, syncInterval, debug, }: Options);
    log(...args: any[]): void;
    sync(): Promise<void>;
    run(): void;
}

export { GoodFirstWeb3Issues };
