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
    this.server.get(path, handler(this.db));
  }
  post(path, handler) {
    this.server.post(path, handler(this.db));
  }
  graphql(schema, resolvers) {
    this.server.use("/graphql", graphqlHTTP({
      schema,
      rootValue: resolvers(this.db),
      graphiql: true
    }));
  }
  getEOASigner(req, _res, next) {
    return __async(this, null, function* () {
      const signature = req.header("EOA-Signature");
      if (signature) {
        const signer = verifyMessage(req.body, signature);
        req.headers["EOA-Signer"] = signer;
      }
      next();
    });
  }
};
var Web3IndexerContract = class {
  constructor(address, abi, provider, db) {
    this.instance = new Contract(address, abi, provider);
    this.db = db;
  }
  store(event, listener) {
    this.instance.on(event, listener(this.db));
  }
};
var Web3Indexer = class {
  constructor({
    provider,
    redisConfig = {},
    corsOrigin = /localhost$/,
    port = 3e3,
    debug = false
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
    this.api = new Web3IndexerApi({ corsOrigin, port, db: this.db });
  }
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }
  contract(address, abi) {
    const contract = new Web3IndexerContract(address, abi, this.provider, this.db);
    this.contracts.push(contract);
    return contract;
  }
  replay() {
    this.contracts.forEach((contract) => __async(this, null, function* () {
      contract.instance.interface.forEachEvent((event) => __async(this, null, function* () {
        const eventName = event.name;
        const listeners = yield contract.instance.listeners(eventName);
        listeners.forEach(() => __async(this, null, function* () {
          const pastEvents = yield contract.instance.queryFilter(eventName);
          pastEvents.forEach((pastEvent) => __async(this, null, function* () {
            const decodedEventData = contract.instance.interface.decodeEventLog(eventName, pastEvent.data, pastEvent.topics);
            contract.instance.emit(
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
