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
import { Contract, JsonRpcProvider } from "ethers";
var Web3Indexer = class {
  constructor({
    provider,
    port = 3e3,
    redisConfig = {},
    corsOrigin = /openq\.dev$/,
    debug = false
  }) {
    this.contracts = [];
    this.port = port;
    this.debug = debug;
    if (typeof provider === "string") {
      this.provider = new JsonRpcProvider(provider);
    } else {
      this.provider = provider;
    }
    this.db = createClient(redisConfig);
    this.db.on("error", (err) => console.log("Redis Client Error", err));
    this.db.connect();
    this.server = express();
    this.server.use(cors({ origin: corsOrigin }));
    this.server.get("/:eventName", (_req, res) => __async(this, null, function* () {
      const cached = yield this.db.hGetAll(_req.params.eventName);
      if (cached) {
        Object.keys(cached).forEach((key) => {
          cached[key] = JSON.parse(cached[key]);
        });
      }
      res.send(cached || {});
    }));
    this.server.listen(this.port, () => {
      console.log(`Listening on http://localhost:${this.port}`);
    });
  }
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }
  addContract(address, abi, callback) {
    const contract = new Contract(address, abi, this.provider);
    this.contracts.push(contract);
    callback(contract);
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
