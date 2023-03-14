var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
import express from "express";
import cors from "cors";
import { createClient } from "redis";
import { Contract, JsonRpcProvider, verifyMessage } from "ethers";
import { graphqlHTTP } from "express-graphql";
var Web3IndexerApi = class {
  constructor({ corsOrigin, port, db }) {
    this.db = db;
    this.server = express();
    this.server.use(cors({ origin: corsOrigin }));
    this.server.use(this.getEOASigner);
    this.server.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
      console.log("\nRoutes:");
      this.server._router.stack.forEach((middleware) => {
        if (middleware.route) {
          console.log(middleware.route.methods.post ? "POST" : "GET", middleware.route.path);
        }
      });
    });
  }
  get(path, handler) {
    this.server.get(path, handler);
  }
  post(path, handler) {
    this.server.post(path, handler);
  }
  graphql(schema, resolvers) {
    this.server.use("/graphql", graphqlHTTP({
      schema,
      rootValue: resolvers,
      graphiql: true
    }));
  }
  getEOASigner(req, _res, next) {
    return __async(this, null, function* () {
      const signature = req.header("EOA-Signature");
      const message = req.header("EOA-Signed-Message");
      if (signature && message) {
        const signer = verifyMessage(message, signature);
        req.headers["EOA-Signer"] = signer;
      }
      next();
    });
  }
};
var Web3Indexer = class {
  constructor({
    provider,
    redisConfig = {},
    corsOrigin = /localhost$/,
    port = 3e3,
    debug = false,
    listeners = {},
    endpoints = {},
    graphql
  }) {
    this.contracts = [];
    this.debug = debug;
    if (typeof provider === "string") {
      this.provider = new JsonRpcProvider(provider);
    } else {
      this.provider = provider;
    }
    this.db = createClient(redisConfig);
    this.db.on("error", (err) => this.log("Redis Client Error", err));
    this.db.connect();
    port = typeof port === "string" ? parseInt(port) : port;
    this.api = new Web3IndexerApi({ corsOrigin, port, db: this.db });
    this.registerListeners(listeners);
    this.registerEndpoints(endpoints);
    if (graphql) {
      this.registerGraphQL(graphql);
    }
  }
  registerListeners(listeners) {
    const networks = Object.keys(listeners);
    networks.forEach((network) => {
      const contracts = Object.keys(listeners[network]);
      contracts.forEach((contractAddress) => {
        const contract = listeners[network][contractAddress];
        const events = Object.keys(contract.listeners);
        events.forEach((event) => {
          const listener = contract.listeners[event];
          this.contract(contractAddress, contract.abi).on(event, listener(this));
        });
      });
    });
  }
  registerEndpoints(endpoints) {
    const requestRegex = /^(GET|POST) (\/.*)/;
    const requests = Object.keys(endpoints);
    requests.forEach((requestString) => {
      const request = requestString.match(requestRegex);
      if (!request) {
        throw new Error(`Invalid endpoint ${requestString}`);
      }
      const [_, method, path] = request;
      const endpoint = endpoints[requestString];
      if (method === "GET") {
        this.api.get(path, endpoint(this));
      } else if (method === "POST") {
        this.api.post(path, endpoint(this));
      }
    });
  }
  registerGraphQL(graphql) {
    if (graphql) {
      this.api.graphql(graphql.schema, graphql.resolvers(this));
    }
  }
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }
  contract(address, abi) {
    const contract = new Contract(address, abi, this.provider);
    this.contracts.push(contract);
    return contract;
  }
  replay() {
    this.contracts.forEach((contract) => __async(this, null, function* () {
      contract.interface.forEachEvent((event) => __async(this, null, function* () {
        const eventName = event.name;
        const listeners = yield contract.listeners(eventName);
        listeners.forEach(() => __async(this, null, function* () {
          const pastEvents = yield contract.queryFilter(eventName);
          pastEvents.forEach((pastEvent) => __async(this, null, function* () {
            const decodedEventData = contract.interface.decodeEventLog(eventName, pastEvent.data, pastEvent.topics);
            contract.emit(
              eventName,
              ...decodedEventData
            );
          }));
        }));
      }));
    }));
  }
};
export {
  Web3Indexer
};
