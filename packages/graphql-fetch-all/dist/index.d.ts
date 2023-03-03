import { DocumentNode } from 'graphql';
import { graphql } from '@octokit/graphql/dist-types/types';

type QueryVariables = Record<string, number | string | boolean>;
type Paginator = {
    path: string[];
    limitParamName: string;
    cursorParamName: string;
    done?: boolean;
};
declare function graphqlFetchAll<T extends Record<string, any>>(client: graphql, query: DocumentNode, variables: QueryVariables, paginators: Paginator[], currentData?: T): Promise<T>;

export { graphqlFetchAll };
