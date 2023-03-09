# @mktcode Lib

## Packages

### [GraphQL Fetch All](/packages/graphql-fetch-all/)

A function to fetch all data from a paginated GraphQL query.

### [GitHub Insights](/packages/github-insights/)

A collection of functions to aggregate and evaluate data from the GitHub GraphQL API.

### [Good Fist Web3 Issues](/packages/good-first-web3-issues/)

An express server, collecting, caching and serving issues, labled "good first issue", based on a whitelist of web3 organizations on GitHub.

### [Web3 Indexer](/packages/web3indexer/)

A lightweight and flexible indexer for EVM smart contracts, connecting a couple of popular libraries to provide a simple self-hosted indexing solution.

### Web3 Action (maybe coming soon)

Connecting GitHub Actions and EVMs. 

### Web3 Transaction Builder (maybe coming soon)

UI components to build and sign transactions for EVMs.

## Development

```bash
git clone https://github.com/mktcode/lib
cd lib
pnpm install
pnpm all
```

### Demo

The demo directory contains apps (client and server) to demonstrate the usage of the packages.

```bash
pnpm client:dev
pnpm server:start
```