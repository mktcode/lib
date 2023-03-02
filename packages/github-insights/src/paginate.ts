import { DocumentNode, print } from "graphql";
import { get, set } from "lodash";
import { graphql } from "@octokit/graphql/dist-types/types";

interface PaginatableQueryVariables {
  first: number,
  [key: string]: number | string | boolean,
}

export async function paginate<T extends Record<string, any>>(
  client: graphql,
  query: DocumentNode,
  variables: PaginatableQueryVariables,
  pathToPaginatedProperty: string[],
  nodesFetched = 0,
): Promise<T> {
  const fullData = await client<T>(print(query), variables);
  
  const {
    nodes,
    totalCount,
    pageInfo: { hasNextPage, endCursor }
  } = get(fullData, pathToPaginatedProperty);

  if (hasNextPage) {
    const perPage = Math.min(totalCount - nodesFetched, 100);
    const nextData = await paginate(
      client,
      query,
      { ...variables, first: perPage, after: endCursor },
      pathToPaginatedProperty,
      nodesFetched + nodes.length
    );
    const nextPageData = get(nextData, pathToPaginatedProperty);
    set(fullData, pathToPaginatedProperty, {
      ...nextPageData,
      nodes: [...nodes, ...nextPageData.nodes],
    });
  }

  return fullData;
}
