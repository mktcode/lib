import { Application, Request, Response } from 'express';
import { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { InterfaceAbi, JsonRpcProvider, Contract } from 'ethers';
import { buildSchema } from 'graphql';

type Web3IndexerDB = ReturnType<typeof createClient>;
type ApiOptions = {
    corsOrigin: CorsOptions['origin'];
    port: number;
    db: Web3IndexerDB;
};
type Options = {
    provider: string | JsonRpcProvider;
    redisConfig?: Record<string, any>;
    debug?: boolean;
    corsOrigin?: CorsOptions['origin'];
    port?: number | string;
};
declare class Web3IndexerApi {
    server: Application;
    db: Web3IndexerDB;
    constructor({ corsOrigin, port, db }: ApiOptions);
    get(path: string, handler: (db: Web3IndexerDB) => (req: Request, res: Response) => void): void;
    post(path: string, handler: (db: Web3IndexerDB) => (req: Request, res: Response) => void): void;
    graphql(schema: ReturnType<typeof buildSchema>, resolvers: (db: Web3IndexerDB) => Record<string, any>): void;
    private getEOASigner;
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
