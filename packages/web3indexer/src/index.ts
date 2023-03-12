import express, { Application, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { Contract, InterfaceAbi, JsonRpcProvider } from 'ethers';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

type ApiOptions = {
  corsOrigin: CorsOptions['origin'];
  port: number;
}

type Options = Partial<ApiOptions> & {
  provider: string | JsonRpcProvider;
  redisConfig?: Record<string, any>;
  debug?: boolean;
}

export type Web3IndexerDB = ReturnType<typeof createClient>;

class Web3IndexerApi {
  public server: Application;

  constructor({ corsOrigin, port }: ApiOptions) {
    this.server = express();
    this.server.use(cors({ origin: corsOrigin }))
    this.server.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`)
      console.log('\nRoutes:');
      this.server._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          console.log(`GET ${middleware.route.path}`);
        }
      });
    });
  }

  get(path: string, handler: (req: Request, res: Response) => void) {
    this.server.get(path, handler)
  }

  post(path: string, handler: (req: Request, res: Response) => void) {
    this.server.post(path, handler)
  }

  graphql(schema: ReturnType<typeof buildSchema>, resolvers: Record<string, any>) {
    this.server.use('/graphql', graphqlHTTP({
      schema,
      rootValue: resolvers,
      graphiql: true,
    }));
  }
}

class Web3IndexerContract {
  public instance: Contract;
  public db: Web3IndexerDB;

  constructor(address: string, abi: InterfaceAbi, provider: JsonRpcProvider, db: Web3IndexerDB) {
    this.instance = new Contract(address, abi, provider)
    this.db = db
  }

  store(
    event: string,
    listener: (db: Web3IndexerDB) => (...args: any[]) => Promise<void>
  ) {
    this.instance.on(event, listener(this.db))
  }
}


export class Web3Indexer {
  public db: Web3IndexerDB;
  public api: Web3IndexerApi;

  private debug: boolean;

  private contracts: Web3IndexerContract[] = [];
  private provider: JsonRpcProvider

  constructor({
    provider,
    redisConfig = {},
    corsOrigin = /localhost$/,
    port = 3000,
    debug = false,
  }: Options) {
    this.debug = debug;

    if (typeof provider === 'string') {
      this.provider = new JsonRpcProvider(provider)
    } else {
      this.provider = provider
    }

    this.db = createClient(redisConfig);
    this.db.on('error', (err: any) => this.log('Redis Client Error', err));
    this.db.connect();

    this.api = new Web3IndexerApi({ corsOrigin, port });
  }

  log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  contract(address: string, abi: InterfaceAbi) {
    const contract = new Web3IndexerContract(address, abi, this.provider, this.db)
    this.contracts.push(contract)

    return contract
  }

  replay() {
    this.contracts.forEach(async (contract) => {
      contract.instance.interface.forEachEvent(async (event) => {
        const eventName = event.name
        const listeners = await contract.instance.listeners(eventName)
        listeners.forEach(async () => {
          const pastEvents = await contract.instance.queryFilter(eventName)
          pastEvents.forEach(async (pastEvent) => {
            const decodedEventData = contract.instance.interface.decodeEventLog(eventName, pastEvent.data, pastEvent.topics)
            contract.instance.emit(
              eventName,
              ...decodedEventData
            )
          })
        })
      })
    })
  }
}