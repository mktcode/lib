import { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { InterfaceAbi, Contract, JsonRpcProvider } from 'ethers';
import { buildSchema } from 'graphql';

type Options = {
    provider: string | JsonRpcProvider;
    redisConfig?: Record<string, any>;
    corsOrigin?: CorsOptions['origin'];
    port?: number;
    debug?: boolean;
};
declare class Web3Indexer {
    private port;
    private debug;
    db: ReturnType<typeof createClient>;
    private server;
    private contracts;
    private provider;
    constructor({ provider, redisConfig, corsOrigin, port, debug, }: Options);
    log(...args: any[]): void;
    addContract(address: string, abi: InterfaceAbi, callback: (contract: Contract) => void): void;
    graphql(schema: ReturnType<typeof buildSchema>, resolvers: Record<string, any>): void;
    replay(): void;
    start(): void;
}

export { Web3Indexer };
