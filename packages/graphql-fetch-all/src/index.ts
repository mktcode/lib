import { ArgumentNode, DocumentNode, Kind, OperationDefinitionNode, print, SelectionSetNode, VariableDefinitionNode } from "graphql";
import { get, set } from "lodash";
import { graphql } from "@octokit/graphql/dist-types/types";
import { isCursorParameter, isLimitParameter, Paginator, QueryVariables } from "./interface";

function getVarNamesFromArguments(argumentNodes: ReadonlyArray<ArgumentNode>, variableNames: string[]): (string | undefined)[] {
  let limitVarName: string | undefined;
  let cursorVarName: string | undefined;
  
  for (const argument of argumentNodes) {
    if (
      argument.value.kind === Kind.VARIABLE &&
      variableNames.includes(argument.value.name.value)
    ) {
      if (isLimitParameter(argument.name.value)) {
        limitVarName = argument.value.name.value;
      } else if (isCursorParameter(argument.name.value)) {
        cursorVarName = argument.value.name.value;
      }
    }
  }

  return [limitVarName, cursorVarName];
}

export function extractPaginatorsFromSelectionSet(selectionSet: SelectionSetNode, variableNames: string[], path: string[] = []): Paginator[] {
  const paginators: Paginator[] = [];

  for (const selection of selectionSet.selections) {
    if (selection.kind !== Kind.FIELD) continue;

    if (selection.arguments) {
      const [limitVarName, cursorVarName] = getVarNamesFromArguments(selection.arguments, variableNames);

      if (limitVarName && cursorVarName) {
        paginators.push({
          path: [...path, selection.name.value],
          limitVarName,
          cursorVarName,
        });
      }
    }

    if (selection.selectionSet) {
      paginators.push(...extractPaginatorsFromSelectionSet(selection.selectionSet, variableNames, [...path, selection.name.value]));
    }
  }
  
  return paginators;
}

type VariableOperationDefinitionNode = OperationDefinitionNode & {
  readonly variableDefinitions: ReadonlyArray<VariableDefinitionNode>;
}

export function extractPaginators(document: DocumentNode): Paginator[] {
  const queryOperation = document.definitions.find(
    (definition) => definition.kind === Kind.OPERATION_DEFINITION &&
    definition.operation === "query" &&
    definition.variableDefinitions &&
    definition.variableDefinitions.length > 0
  ) as VariableOperationDefinitionNode;
  
  if (!queryOperation) throw new Error("No query operation with variables found in document");
  
  const variableNames = queryOperation.variableDefinitions.map((variableDefinition) => variableDefinition.variable.name.value);
  
  const paginationParameters: Paginator[] = [];
  paginationParameters.push(...extractPaginatorsFromSelectionSet(queryOperation.selectionSet, variableNames));

  return paginationParameters;
}

export function getHighestLevelPaginators(paginators: Paginator[]): Paginator[] {
  const highestLevelPaginators: Paginator[] = [];

  for (const paginator of paginators) {
    if (!paginators.filter(p => p !== paginator).some((otherPaginator) => otherPaginator.path.length < paginator.path.length)) {
      highestLevelPaginators.push(paginator);
    }
  }

  return highestLevelPaginators;
}

async function fetchAllPages<T extends Record<string, any>>(
  client: graphql,
  query: DocumentNode,
  variables: QueryVariables,
  paginators: Paginator[],
  currentData?: T,
): Promise<T> {
  const data = await client<T>(print(query), variables);

  if (currentData) {
    for (const paginator of paginators) {
      if (paginator.done) continue;

      const nodes = get(data, paginator.path).nodes;
      const currentNodes = get(currentData, paginator.path).nodes;

      set(currentData, paginator.path, {
        ...get(currentData, paginator.path),
        nodes: [...currentNodes, ...nodes],
      });
    }
  } else {
    currentData = data;
  }
  
  for (const paginator of paginators) {
    const { totalCount, pageInfo: { hasNextPage, endCursor } } = get(data, paginator.path);
    const { nodes } = get(currentData, paginator.path)
  
    if (hasNextPage) {
      variables[paginator.limitVarName] = Math.min(totalCount - nodes.length, 100);
      variables[paginator.cursorVarName] = endCursor;
    } else {
      paginator.done = true;
    }
  }

  if (paginators.every(paginator => paginator.done)) {
    return currentData;
  } else {
    return fetchAllPages(client, query, variables, paginators, currentData);
  }
}

export async function graphqlFetchAll<T extends Record<string, any>>(
  client: graphql,
  query: DocumentNode,
  variables: QueryVariables,
): Promise<T> {
  const paginators = getHighestLevelPaginators(extractPaginators(query));

  return fetchAllPages(client, query, variables, paginators);
}