import ethers from 'ethers';
import { Request, Response, Application } from 'express';
import { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { buildSchema } from 'graphql';

type Web3IndexerDB = ReturnType<typeof createClient>;
type ApiOptions = {
    corsOrigin: CorsOptions['origin'];
    port: number;
    db: Web3IndexerDB;
};
type Listeners = {
    [network: string]: {
        [contract: string]: {
            abi: ethers.InterfaceAbi;
            listeners: {
                [event: string]: (indexer: Web3Indexer) => (...args: any[]) => Promise<void>;
            };
        };
    };
};
type Endpoints = {
    [path: string]: (indexer: Web3Indexer) => (req: Request, res: Response) => void;
};
type GraphQL = {
    schema: ReturnType<typeof buildSchema>;
    resolvers: (indexer: Web3Indexer) => Record<string, any>;
};
type Options = {
    provider: string | ethers.JsonRpcProvider;
    redisConfig?: Record<string, any>;
    debug?: boolean;
    corsOrigin?: CorsOptions['origin'];
    port?: number | string;
    listeners?: Listeners;
    endpoints?: Endpoints;
    graphql?: GraphQL;
};
declare class Web3IndexerApi {
    server: Application;
    db: Web3IndexerDB;
    constructor({ corsOrigin, port, db }: ApiOptions);
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
    graphql(schema: ReturnType<typeof buildSchema>, resolvers: Record<string, any>): void;
    private getEOASigner;
}
declare class Web3Indexer {
    db: Web3IndexerDB;
    api: Web3IndexerApi;
    ethers: typeof ethers;
    private debug;
    private contracts;
    private provider;
    constructor({ provider, redisConfig, corsOrigin, port, debug, listeners, endpoints, graphql }: Options);
    registerListeners(listeners: Listeners): void;
    registerEndpoints(endpoints: Endpoints): void;
    registerGraphQL(graphql: GraphQL): void;
    log(...args: any[]): void;
    contract(address: string, abi: ethers.InterfaceAbi): ethers.ethers.Contract;
    replay(): void;
}

export { Web3Indexer, Web3IndexerDB };
