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
function graphqlFetchAll(client, query, variables, pathToPaginatedProperty, nodesFetched = 0) {
  return __async(this, null, function* () {
    const fullData = yield client(print(query), variables);
    const {
      nodes,
      totalCount,
      pageInfo: { hasNextPage, endCursor }
    } = get(fullData, pathToPaginatedProperty);
    nodesFetched += nodes.length;
    if (hasNextPage) {
      const perPage = Math.min(totalCount - nodesFetched, 100);
      const nextData = yield graphqlFetchAll(
        client,
        query,
        __spreadProps(__spreadValues({}, variables), { first: perPage, after: endCursor }),
        pathToPaginatedProperty,
        nodesFetched
      );
      const nextPageData = get(nextData, pathToPaginatedProperty);
      set(fullData, pathToPaginatedProperty, __spreadProps(__spreadValues({}, nextPageData), {
        nodes: [...nodes, ...nextPageData.nodes]
      }));
    }
    return fullData;
  });
}
export {
  graphqlFetchAll
};
