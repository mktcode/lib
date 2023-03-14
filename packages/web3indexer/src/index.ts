import { Contract, InterfaceAbi, JsonRpcProvider } from 'ethers';
import { Request, Response } from 'express';
import { CorsOptions } from 'cors';
import { createClient, RedisClientType } from 'redis';
import { buildSchema } from 'graphql';
import { Web3IndexerApi } from './api';

type Providers = {
  [network: string]: string | JsonRpcProvider
}

type ProviderObjects = {
  [network: string]: JsonRpcProvider
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
  providers: Providers;
  redisConfig?: Record<string, any>;
  debug?: boolean;
  corsOrigin?: CorsOptions['origin'];
  port?: number | string;
  listeners?: Listeners;
  endpoints?: Endpoints;
  graphql?: GraphQL;
}

export class Web3Indexer {
  public db: RedisClientType;
  public api: Web3IndexerApi;

  private debug: boolean;

  private contracts: Contract[] = [];
  private providers: ProviderObjects;

  constructor({
    providers,
    redisConfig = {},
    corsOrigin = /localhost$/,
    port = 3000,
    debug = false,
    listeners = {},
    endpoints = {},
    graphql
  }: Options) {
    this.debug = debug;

    this.providers = Object.fromEntries(Object.entries(providers).map(([network, provider]) => {
      if (typeof provider === 'string') {
        return [network, new JsonRpcProvider(provider)]
      }

      return [network, provider]
    }))

    this.db = createClient(redisConfig);
    this.db.on('error', (err: any) => this.log('Redis Client Error', err));
    this.db.connect();

    port = typeof port === 'string' ? parseInt(port) : port;
    this.api = new Web3IndexerApi({ corsOrigin, port });

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

          if (this.providers[network] === undefined) {
            throw new Error(`No provider for network ${network}`)
          }
          
          this.contract(
            contractAddress,
            contract.abi,
            this.providers[network] as JsonRpcProvider,
          ).on(event, listener(this));
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

  contract(address: string, abi: InterfaceAbi, provider: JsonRpcProvider) {
    const contract = new Contract(address, abi, provider)
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