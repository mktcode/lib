# Web3 Indexer

A lightweight and easy to set up indexer for EVM smart contracts.

Read more about my motivation [here](MOTIVATION.md).

## Usage

```bash
npm i @mktcodelib/web3indexer
```

```javascript
// indexer.js
import { Web3Indexer } from '@mktcodelib/web3indexer'

const indexer = new Web3Indexer({ provider: "https://..." });

const CONTRACT_ADDRESS = "0x70A3Bd555AC77232f0a2dBD29D51068ABa740Ad2";
const ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

indexer.addContract(CONTRACT_ADDRESS, ABI, (contract) => {
  contract.on("Transfer", async (from, to, tokenId, event) => {
    indexer.db.hSet("Transfer", event.transactionHash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
  });
});

indexer.start();
```

```bash
$ node indexer.js

Indexing...
Event data: http://localhost:3000/events
```

### Redis

Inside your contract listeners you can access the Redis client via `indexer.db` to store whatever data in whatever format you like.

```javascript
indexer.db.hSet("Transfer", event.transactionHash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
```

The express server exposes the data and let's you traverse through an object structure via the URL path.

```bash
$ curl http://localhost:3000/events/mycontract.eth/Transfer/<transactionHash>
{"from":"0x000000","to":"0x000001","tokenId":"1000"}
```

```bash
$ curl http://localhost:3000/events/<contractAddress>/Transfer/<transactionHash>/tokenId
1000
```

### GraphQL

You can also define a GraphQL schema and resolvers and use the Redis data as a data source.

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
export const resolvers = {
  transfers: async () => {
    const cached = await indexer.db.hGetAll("Transfer");
    
    if (!cached) return [];

    return Object.keys(cached).map((key) => JSON.parse(cached[key]!));
  },
};
```

```javascript
// indexer.js
import { Web3Indexer } from '@mktcodelib/web3indexer'
import { resolvers } from './resolvers'
import { readFileSync } from 'fs'

const schema = readFileSync('./schema.graphql', 'utf8')

const indexer = new Web3Indexer({ provider: "https://..." });

indexer.addContract(/* ... */);

indexer.graphql(schema, resolvers);

indexer.start();
```

```bash
$ curl http://localhost:3000/graphql?query={transfers{from,to,tokenId}}
{"data":{"transfers":[{"from":"0x000000","to":"0x000001","tokenId":"1000"}]}}
```

```bash
$ curl http://localhost:3000/graphql?query={transfer(transactionHash:"0x..."){from,to,tokenId}}
{"data":{"transfer":{"from":"0x000000","to":"0x000001","tokenId":"1000"}}}
```

### Replay

To sync all events from the beginning of the chain, use the `replay` function.

```javascript
const indexer = new Web3Indexer(/* ... */);

// ...

indexer.start();
indexer.replay();
```