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

type Listeners = {
  [network: string]: {
    [contract: string]: {
      abi: InterfaceAbi;
      listeners: {
        [event: string]: (indexer: Web3Indexer) => (...args: any[]) => Promise<void>
      }
    }
  }
}

type Endpoints = {
  [path: string]: (indexer: Web3Indexer) => (req: Request, res: Response) => void
}

type GraphQL = {
  schema: ReturnType<typeof buildSchema>;
  resolvers: (indexer: Web3Indexer) => Record<string, any>
}

type Options = {
  provider: string | JsonRpcProvider;
  redisConfig?: Record<string, any>;
  debug?: boolean;
  corsOrigin?: CorsOptions['origin'];
  port?: number | string;
  listeners?: Listeners;
  endpoints?: Endpoints;
  graphql?: GraphQL;
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
    handler: (req: Request, res: Response) => void
  ) {
    this.server.get(path, handler)
  }

  post(
    path: string,
    handler: (req: Request, res: Response) => void
  ) {
    this.server.post(path, handler)
  }

  graphql(
    schema: ReturnType<typeof buildSchema>,
    resolvers: Record<string, any>
  ) {
    this.server.use('/graphql', graphqlHTTP({
      schema,
      rootValue: resolvers,
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

export class Web3Indexer {
  public db: Web3IndexerDB;
  public api: Web3IndexerApi;

  private debug: boolean;

  private contracts: Contract[] = [];
  private provider: JsonRpcProvider

  constructor({
    provider,
    redisConfig = {},
    corsOrigin = /localhost$/,
    port = 3000,
    debug = false,
    listeners = {},
    endpoints = {},
    graphql
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

    this.registerListeners(listeners)
    this.registerEndpoints(endpoints)

    if (graphql) {
      this.registerGraphQL(graphql)
    }
  }

  registerListeners(listeners: Listeners) {
    const networks = Object.keys(listeners)
    networks.forEach((network) => {
      const contracts = Object.keys(listeners[network]!)
      contracts.forEach((contractAddress) => {
        const contract = listeners[network]![contractAddress]!;
        const events = Object.keys(contract.listeners)
        events.forEach((event) => {
          const listener = contract.listeners[event]!
          this.contract(contractAddress, contract.abi).on(event, listener(this));
        })
      })
    })
  }

  registerEndpoints(endpoints: Endpoints) {
    const requestRegex = /^(GET|POST) (\/.*)/;
    const requests = Object.keys(endpoints)
    requests.forEach((requestString) => {
      const request = requestString.match(requestRegex)

      if (!request) {
        throw new Error(`Invalid endpoint ${requestString}`)
      }

      const [_, method, path] = request;

      const endpoint = endpoints[requestString]!

      if (method === 'GET') {
        this.api.get(path!, endpoint(this))
      } else if (method === 'POST') {
        this.api.post(path!, endpoint(this))
      }
    })
  }

  registerGraphQL(graphql: GraphQL) {
    if (graphql) {
      this.api.graphql(graphql.schema, graphql.resolvers(this))
    }
  }

  log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  contract(address: string, abi: InterfaceAbi) {
    const contract = new Contract(address, abi, this.provider)
    this.contracts.push(contract)

    return contract
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