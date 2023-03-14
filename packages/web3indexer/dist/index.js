"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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
var src_exports = {};
__export(src_exports, {
  Web3Indexer: () => Web3Indexer
});
module.exports = __toCommonJS(src_exports);
var import_ethers = __toESM(require("ethers"));
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_redis = require("redis");
var import_express_graphql = require("express-graphql");
var Web3IndexerApi = class {
  constructor({ corsOrigin, port, db }) {
    this.db = db;
    this.server = (0, import_express.default)();
    this.server.use((0, import_cors.default)({ origin: corsOrigin }));
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
    this.server.use("/graphql", (0, import_express_graphql.graphqlHTTP)({
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
        const signer = import_ethers.default.verifyMessage(message, signature);
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
    this.ethers = import_ethers.default;
    this.contracts = [];
    this.debug = debug;
    if (typeof provider === "string") {
      this.provider = new import_ethers.default.JsonRpcProvider(provider);
    } else {
      this.provider = provider;
    }
    this.db = (0, import_redis.createClient)(redisConfig);
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
    const contract = new import_ethers.default.Contract(address, abi, this.provider);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Web3Indexer
});
