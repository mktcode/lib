import express from 'express';
import cors, { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { Contract, InterfaceAbi, JsonRpcProvider } from 'ethers';

type Options = {
  provider: string | JsonRpcProvider;
  port?: number;
  redisConfig?: Record<string, any>;
  corsOrigin?: CorsOptions['origin']
  debug?: boolean;
}

export class Web3Indexer {
  private port: number;
  private debug: boolean;

  public db: ReturnType<typeof createClient>;
  private server: ReturnType<typeof express>;

  private contracts: Contract[] = [];
  private provider: JsonRpcProvider

  constructor({
    provider,
    port = 3000,
    redisConfig = {},
    corsOrigin = /openq\.dev$/,
    debug = false,
  }: Options) {
    this.port = port;
    this.debug = debug;

    if (typeof provider === 'string') {
      this.provider = new JsonRpcProvider(provider)
    } else {
      this.provider = provider
    }

    this.db = createClient(redisConfig);
    this.db.on('error', (err: any) => console.log('Redis Client Error', err));
    this.db.connect();

    this.server = express();
    this.server.use(cors({ origin: corsOrigin }))
    this.server.get('/:eventName', async (_req, res) => {
      const cached = await this.db.hGetAll(_req.params.eventName);
    
      if (cached) {
        Object.keys(cached).forEach((key) => {
          cached[key] = JSON.parse(cached[key]!);
        });
      }
    
      res.send(cached || {});
    });

    this.server.listen(this.port, () => {
      console.log(`Listening on http://localhost:${this.port}`)
    });
  }

  log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  addContract(
    address: string,
    abi: InterfaceAbi,
    callback: (contract: Contract) => void
  ) {
    const contract = new Contract(address, abi, this.provider)
    this.contracts.push(contract)
    callback(contract)
  }

  replay() {
    this.contracts.forEach(async (contract) => {
      contract.interface.forEachEvent(async (event) => {
        const eventName = event.name
        const listeners = await contract.listeners(eventName)
        listeners.forEach(async () => {
          const pastEvents = await contract.queryFilter(eventName)
          pastEvents.forEach(async (pastEvent) => {
            const decodedEventData = contract.interface.decodeEventLog(eventName, pastEvent.data, pastEvent.topics)
            contract.emit(
              eventName,
              ...decodedEventData
            )
          })
        })
      })
    })
  }
}