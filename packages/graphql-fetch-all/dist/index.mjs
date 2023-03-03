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
import { Kind, print } from "graphql";
import { get, set } from "lodash";

// src/interface.ts
function isLimitParameter(name) {
  return name === "first" || name === "last";
}
function isCursorParameter(name) {
  return name === "after" || name === "before";
}

// src/index.ts
function getVarNamesFromArguments(argumentNodes, variableNames) {
  let limitVarName;
  let cursorVarName;
  for (const argument of argumentNodes) {
    if (argument.value.kind === Kind.VARIABLE && variableNames.includes(argument.value.name.value)) {
      if (isLimitParameter(argument.name.value)) {
        limitVarName = argument.value.name.value;
      } else if (isCursorParameter(argument.name.value)) {
        cursorVarName = argument.value.name.value;
      }
    }
  }
  return [limitVarName, cursorVarName];
}
function extractPaginatorsFromSelectionSet(selectionSet, variableNames, path = []) {
  const paginators = [];
  for (const selection of selectionSet.selections) {
    if (selection.kind !== Kind.FIELD)
      continue;
    if (selection.arguments) {
      const [limitVarName, cursorVarName] = getVarNamesFromArguments(selection.arguments, variableNames);
      if (limitVarName && cursorVarName) {
        paginators.push({
          path: [...path, selection.name.value],
          limitVarName,
          cursorVarName
        });
      }
    }
    if (selection.selectionSet) {
      paginators.push(...extractPaginatorsFromSelectionSet(selection.selectionSet, variableNames, [...path, selection.name.value]));
    }
  }
  return paginators;
}
function extractPaginators(document) {
  const queryOperation = document.definitions.find(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION && definition.operation === "query" && definition.variableDefinitions && definition.variableDefinitions.length > 0
  );
  if (!queryOperation)
    throw new Error("No query operation with variables found in document");
  const variableNames = queryOperation.variableDefinitions.map((variableDefinition) => variableDefinition.variable.name.value);
  const paginationParameters = [];
  paginationParameters.push(...extractPaginatorsFromSelectionSet(queryOperation.selectionSet, variableNames));
  return paginationParameters;
}
function getHighestLevelPaginators(paginators) {
  const highestLevelPaginators = [];
  for (const paginator of paginators) {
    if (!paginators.filter((p) => p !== paginator).some((otherPaginator) => otherPaginator.path.length < paginator.path.length)) {
      highestLevelPaginators.push(paginator);
    }
  }
  return highestLevelPaginators;
}
function fetchAllPages(client, query, variables, paginators, currentData) {
  return __async(this, null, function* () {
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
        variables[paginator.limitVarName] = Math.min(totalCount - nodes.length, 100);
        variables[paginator.cursorVarName] = endCursor;
      } else {
        paginator.done = true;
      }
    }
    if (paginators.every((paginator) => paginator.done)) {
      return currentData;
    } else {
      return fetchAllPages(client, query, variables, paginators, currentData);
    }
  });
}
function graphqlFetchAll(client, query, variables) {
  return __async(this, null, function* () {
    const paginators = getHighestLevelPaginators(extractPaginators(query));
    return fetchAllPages(client, query, variables, paginators);
  });
}
export {
  extractPaginators,
  extractPaginatorsFromSelectionSet,
  getHighestLevelPaginators,
  graphqlFetchAll
};
