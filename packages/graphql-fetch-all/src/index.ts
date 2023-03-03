import { DocumentNode, print } from "graphql";
import { get, set } from "lodash";
import { graphql } from "@octokit/graphql/dist-types/types";

type QueryVariables = Record<string, number | string | boolean>;
type Paginator = {
  path: string[];
  limitParamName: string;
  cursorParamName: string;
  done?: boolean;
}

export async function graphqlFetchAll<T extends Record<string, any>>(
  client: graphql,
  query: DocumentNode,
  variables: QueryVariables,
  paginators: Paginator[],
  currentData?: T,
): Promise<T> {
  console.log(JSON.stringify(variables))
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
      variables[paginator.limitParamName] = Math.min(totalCount - nodes.length, 100);
      variables[paginator.cursorParamName] = endCursor;
    } else {
      paginator.done = true;
    }
  }

  if (paginators.every(paginator => paginator.done)) {
    return currentData;
  } else {
    return graphqlFetchAll(client, query, variables, paginators, currentData);
  }
}
