var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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
import { print } from "graphql";
import { get, set } from "lodash";
function graphqlFetchAll(client, query, variables, paginators, currentData) {
  return __async(this, null, function* () {
    console.log(JSON.stringify(variables));
    const data = yield client(print(query), variables);
    if (currentData) {
      for (const paginator of paginators) {
        if (paginator.done)
          continue;
        const nodes = get(data, paginator.path).nodes;
        const currentNodes = get(currentData, paginator.path).nodes;
        set(currentData, paginator.path, __spreadProps(__spreadValues({}, get(currentData, paginator.path)), {
          nodes: [...currentNodes, ...nodes]
        }));
      }
    } else {
      currentData = data;
    }
    for (const paginator of paginators) {
      const { totalCount, pageInfo: { hasNextPage, endCursor } } = get(data, paginator.path);
      const { nodes } = get(currentData, paginator.path);
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
export {
  graphqlFetchAll
};
