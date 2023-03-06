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
var import_express = __toESM(require("express"));
var import_cors = __toESM(require("cors"));
var import_redis = require("redis");
var import_ethers = require("ethers");
var import_express_graphql = require("express-graphql");
var Web3Indexer = class {
  constructor({
    provider,
    redisConfig = {},
    corsOrigin = /openq\.dev$/,
    port = 3e3,
    debug = false
  }) {
    this.contracts = [];
    this.port = port;
    this.debug = debug;
    if (typeof provider === "string") {
      this.provider = new import_ethers.JsonRpcProvider(provider);
    } else {
      this.provider = provider;
    }
    this.db = (0, import_redis.createClient)(redisConfig);
    this.db.on("error", (err) => console.log("Redis Client Error", err));
    this.db.connect();
    this.server = (0, import_express.default)();
    this.server.use((0, import_cors.default)({ origin: corsOrigin }));
    this.server.get("/events/:eventName", (_req, res) => __async(this, null, function* () {
      const cached = yield this.db.hGetAll(_req.params.eventName);
      if (cached) {
        Object.keys(cached).forEach((key) => {
          cached[key] = JSON.parse(cached[key]);
        });
      }
      res.send(cached || {});
    }));
  }
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }
  addContract(address, abi, callback) {
    const contract = new import_ethers.Contract(address, abi, this.provider);
    this.contracts.push(contract);
    callback(contract);
  }
  graphql(schema, resolvers) {
    this.server.use("/graphql", (0, import_express_graphql.graphqlHTTP)({
      schema,
      rootValue: resolvers,
      graphiql: true
    }));
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
  start() {
    this.server.listen(this.port, () => {
      console.log(`Listening on http://localhost:${this.port}`);
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Web3Indexer
});
