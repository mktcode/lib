import { DocumentNode } from 'graphql';
import { graphql } from '@octokit/graphql/dist-types/types';

interface PaginatableQueryVariables {
    first: number;
    [key: string]: number | string | boolean;
}
declare function graphqlFetchAll<T extends Record<string, any>>(client: graphql, query: DocumentNode, variables: PaginatableQueryVariables, pathToPaginatedProperty: string[], nodesFetched?: number): Promise<T>;

export { graphqlFetchAll };
