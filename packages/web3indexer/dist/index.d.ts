import { InterfaceAbi, JsonRpcProvider, Contract } from 'ethers';
import { Application, Request, Response } from 'express';
import { CorsOptions } from 'cors';
import { RedisClientType } from 'redis';
import { buildSchema } from 'graphql';

type ApiOptions = {
    corsOrigin: CorsOptions['origin'];
    port: number;
};
declare class Web3IndexerApi {
    server: Application;
    constructor({ corsOrigin, port }: ApiOptions);
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
    graphql(schema: ReturnType<typeof buildSchema>, resolvers: Record<string, any>): void;
    private getEOASigner;
}

type Providers = {
    [network: string]: string | JsonRpcProvider;
};
type Listeners = {
    [network: string]: {
        [contract: string]: {
            abi: InterfaceAbi;
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
    providers: Providers;
    redisConfig?: Record<string, any>;
    debug?: boolean;
    corsOrigin?: CorsOptions['origin'];
    port?: number | string;
    listeners?: Listeners;
    endpoints?: Endpoints;
    graphql?: GraphQL;
};
declare class Web3Indexer {
    db: RedisClientType;
    api: Web3IndexerApi;
    private debug;
    private contracts;
    private providers;
    constructor({ providers, redisConfig, corsOrigin, port, debug, listeners, endpoints, graphql }: Options);
    registerListeners(listeners: Listeners): void;
    registerEndpoints(endpoints: Endpoints): void;
    registerGraphQL(graphql: GraphQL): void;
    log(...args: any[]): void;
    contract(address: string, abi: InterfaceAbi, provider: JsonRpcProvider): Contract;
    replay(): void;
}

export { Web3Indexer };
