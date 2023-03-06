import { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { InterfaceAbi, Contract, JsonRpcProvider } from 'ethers';

type Options = {
    provider: string | JsonRpcProvider;
    port?: number;
    redisConfig?: Record<string, any>;
    corsOrigin?: CorsOptions['origin'];
    debug?: boolean;
};
declare class Web3Indexer {
    private port;
    private debug;
    db: ReturnType<typeof createClient>;
    private server;
    private contracts;
    private provider;
    constructor({ provider, port, redisConfig, corsOrigin, debug, }: Options);
    log(...args: any[]): void;
    addContract(address: string, abi: InterfaceAbi, callback: (contract: Contract) => void): void;
    replay(): void;
}

export { Web3Indexer };
