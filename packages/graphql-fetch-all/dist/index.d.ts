import { SelectionSetNode, DocumentNode } from 'graphql';
import { graphql } from '@octokit/graphql/dist-types/types';

type QueryVariables = Record<string, number | string | boolean>;
type Paginator = {
    path: string[];
    limitVarName: string;
    cursorVarName: string;
    done?: boolean;
};

declare function extractPaginatorsFromSelectionSet(selectionSet: SelectionSetNode, variableNames: string[], path?: string[]): Paginator[];
declare function extractPaginators(document: DocumentNode): Paginator[];
declare function getHighestLevelPaginators(paginators: Paginator[]): Paginator[];
declare function graphqlFetchAll<T extends Record<string, any>>(client: graphql, query: DocumentNode, variables: QueryVariables): Promise<T>;

export { extractPaginators, extractPaginatorsFromSelectionSet, getHighestLevelPaginators, graphqlFetchAll };
