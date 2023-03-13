import express, { Application, NextFunction, Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import { createClient } from 'redis';
import { Contract, InterfaceAbi, JsonRpcProvider, verifyMessage } from 'ethers';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';

export type Web3IndexerDB = ReturnType<typeof createClient>;

type ApiOptions = {
  corsOrigin: CorsOptions['origin'];
  port: number;
  db: Web3IndexerDB;
}

type Options = {
  provider: string | JsonRpcProvider;
  redisConfig?: Record<string, any>;
  debug?: boolean;
  corsOrigin?: CorsOptions['origin'];
  port?: number | string;
}

class Web3IndexerApi {
  public server: Application;
  public db: Web3IndexerDB;

  constructor({ corsOrigin, port, db }: ApiOptions) {
    this.db = db;

    this.server = express();
    this.server.use(cors({ origin: corsOrigin }))
    this.server.use(this.getEOASigner)
    this.server.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`)
      console.log('\nRoutes:');
      this.server._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          console.log(middleware.route.methods.post ? 'POST' : 'GET', middleware.route.path);
        }
      });
    });
  }

  get(
    path: string,
    handler: (db: Web3IndexerDB) => (req: Request, res: Response) => void
  ) {
    this.server.get(path, handler(this.db))
  }

  post(
    path: string,
    handler: (db: Web3IndexerDB) => (req: Request, res: Response) => void
  ) {
    this.server.post(path, handler(this.db))
  }

  graphql(
    schema: ReturnType<typeof buildSchema>,
    resolvers: (db: Web3IndexerDB) => Record<string, any>
  ) {
    this.server.use('/graphql', graphqlHTTP({
      schema,
      rootValue: resolvers(this.db),
      graphiql: true,
    }));
  }

  private async getEOASigner(req: Request, _res: Response, next: NextFunction) {
    const signature = req.header('EOA-Signature');
    const message = req.header('EOA-Signed-Message');

    if (signature && message) {
      const signer = verifyMessage(message, signature);
      req.headers['EOA-Signer'] = signer;
    }

    next();
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

    port = typeof port === 'string' ? parseInt(port) : port;
    this.api = new Web3IndexerApi({ corsOrigin, port, db: this.db });
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