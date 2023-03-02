import gql from 'graphql-tag';

export const ORG_REPOS_QUERY = gql`query ($login: String!, $first: Int!) {
  organization (login: $login) {
    login
    name
    description
    url
    websiteUrl
    avatarUrl
    repositories (first: $first, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        name
        description
        url
        stargazersCount
      }
    }
  }
}`;