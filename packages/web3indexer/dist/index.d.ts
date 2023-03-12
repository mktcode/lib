import { Application, Request, Response } from 'express';
import { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { InterfaceAbi, JsonRpcProvider, Contract } from 'ethers';
import { buildSchema } from 'graphql';

type ApiOptions = {
    corsOrigin: CorsOptions['origin'];
    port: number;
};
type Options = Partial<ApiOptions> & {
    provider: string | JsonRpcProvider;
    redisConfig?: Record<string, any>;
    debug?: boolean;
};
type Web3IndexerDB = ReturnType<typeof createClient>;
declare class Web3IndexerApi {
    server: Application;
    constructor({ corsOrigin, port }: ApiOptions);
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
    graphql(schema: ReturnType<typeof buildSchema>, resolvers: Record<string, any>): void;
}
declare class Web3IndexerContract {
    instance: Contract;
    db: Web3IndexerDB;
    constructor(address: string, abi: InterfaceAbi, provider: JsonRpcProvider, db: Web3IndexerDB);
    store(event: string, listener: (db: Web3IndexerDB) => (...args: any[]) => Promise<void>): void;
}
declare class Web3Indexer {
    db: Web3IndexerDB;
    api: Web3IndexerApi;
    private debug;
    private contracts;
    private provider;
    constructor({ provider, redisConfig, corsOrigin, port, debug, }: Options);
    log(...args: any[]): void;
    contract(address: string, abi: InterfaceAbi): Web3IndexerContract;
    replay(): void;
}

export { Web3Indexer, Web3IndexerDB };
