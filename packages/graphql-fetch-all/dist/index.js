"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
  graphqlFetchAll: () => graphqlFetchAll
});
module.exports = __toCommonJS(src_exports);
var import_graphql = require("graphql");
var import_lodash = require("lodash");
function graphqlFetchAll(client, query, variables, paginators, currentData) {
  return __async(this, null, function* () {
    console.log(JSON.stringify(variables));
    const data = yield client((0, import_graphql.print)(query), variables);
    if (currentData) {
      for (const paginator of paginators) {
        if (paginator.done)
          continue;
        const nodes = (0, import_lodash.get)(data, paginator.path).nodes;
        const currentNodes = (0, import_lodash.get)(currentData, paginator.path).nodes;
        (0, import_lodash.set)(currentData, paginator.path, __spreadProps(__spreadValues({}, (0, import_lodash.get)(currentData, paginator.path)), {
          nodes: [...currentNodes, ...nodes]
        }));
      }
    } else {
      currentData = data;
    }
    for (const paginator of paginators) {
      const { totalCount, pageInfo: { hasNextPage, endCursor } } = (0, import_lodash.get)(data, paginator.path);
      const { nodes } = (0, import_lodash.get)(currentData, paginator.path);
      if (hasNextPage) {
        variables[paginator.limitParamName] = Math.min(totalCount - nodes.length, 100);
        variables[paginator.cursorParamName] = endCursor;
      } else {
        paginator.done = true;
      }
    }
    if (paginators.every((paginator) => paginator.done)) {
      return currentData;
    } else {
      return graphqlFetchAll(client, query, variables, paginators, currentData);
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  graphqlFetchAll
});
