# Motivation

When The Graph was released I understood right away what a huge pain it eases and started using it in my projects. Setting up a Subgraph involves a few steps but it is surely worth it, because you get a GraphQL interface for your smart contracts. Yes, I definitely want that.

However, I am personally unsure about the value of all the decentralization. The truth still lives on-chain and it is really just a convenience to have it nicely packed. A decentralized infrastructure, with query fees and staking and tokenomics and all that, seems a bit bloated to me, at least in some cases and early stages of a project. What I want is an npm package, not a token.

## Web3 Indexer

So I made one.

```bash
npm i @mktcodelib/web3indexer
```

The purpose of an indexer is first and foremost to cache data and make it available, without the need to connect to the blockchain itself.

With the minimum configuration the indexer will listen to all contract events, store them in the Redis database and expose them via an express server.

```javascript
import { Web3Indexer } from '@mktcodelib/web3indexer'
import ABI from './abi.json'

const indexer = new Web3Indexer({ provider: "https://..." });
indexer.addContract("0x123...", ABI);
indexer.start();
```

[screenshot of curl/browser]

If you want more control, you can define what events to listen to and how to store the data.

```javascript
indexer.addContract("0x123...", ABI, (contract) => {
  contract.on("Transfer", async (from, to, tokenId, event) => {
    indexer.db.hSet("Transfer", event.transactionHash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
  });
});
```

The express server will still expose the data and let you traverse through an object structure via the URL path.

[screenshot of curl]

And of course, you can define a GraphQL schema and resolvers, using the Redis database as their data source.

```javascript
import { Web3Indexer } from '@mktcodelib/web3indexer'
import ABI from './abi.json'
import typeDefs from './schema.graphql'
import resolvers from './resolvers.js'

const indexer = new Web3Indexer({ provider: "https://..." });
indexer.addContract("0x123...", ABI);
indexer.graphql(typeDefs, resolvers);
indexer.start();
```

```javascript
// schema.graphql
type Transfer {
  from: String
  to: String
  tokenId: String
}

type Query {
  transfers: [Transfer!]
}
```

```javascript
// resolvers.js
export default {
  transfers: async () => {
    const cached = await indexer.db.hGetAll("Transfer");
    
    if (!cached) return [];

    return Object.keys(cached).map((key) => JSON.parse(cached[key]!));
  },
};
```

[screenshot of GraphQL playground]