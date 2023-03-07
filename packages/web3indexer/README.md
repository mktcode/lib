# Web3 Indexer

A lightweight and flexible indexer for EVM smart contracts.

Web3 Indexer connects a couple of popular libraries to provide a simple self-hosted indexing solution.

**Ethers** is used to listen to contract events.
**Redis** is used to store data.
**Express** serves the data.
**GraphQL** is supported but optional.

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

indexer.contract(CONTRACT_ADDRESS, ABI, (contract) => {
  contract.on("Transfer", async (from, to, tokenId, event) => {
    indexer.db.hSet("Transfer", event.transactionHash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
  });
});

indexer.server.get('/events/transfers', async (_req, res) => {
  const transfers = await indexer.db.hGetAll('Transfer');

  if (transfers) {
    Object.keys(transfers).forEach((key) => {
      transfers[key] = JSON.parse(transfers[key]);
    });
  }

  res.send(transfers || {});
});

indexer.start();
```

```bash
$ node indexer.js

Listening on http://localhost:3000

Routes:
GET /events/transfers
```

### Redis

Inside your contract listeners you can access the Redis client via `indexer.db` to read and store whatever data in whatever format you like.

```javascript
const balance = Number(await indexer.db.hGet("Balance", to));

indexer.db.hSet("Balance", to, (balance + amount).toString());
```

Then you tell express how to serve the data by adding endpoints.

```javascript
indexer.server.get('/balances', async (_req, res) => {
  const balances = await indexer.db.hGetAll('balances');

  res.send(balances || {});
});
```

```bash
$ curl http://localhost:3000/balances
[{"0x123":"100000","0xAbc":"200000"}]
```

### GraphQL

You can also define a GraphQL schema and resolvers.

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
import schema from './schema.graphql'

const indexer = new Web3Indexer({ provider: "https://..." });

indexer.contract(/* ... */);
indexer.graphql(schema, resolvers);
indexer.start();
```

### Replay

To sync past events, use the `replay` function.

```javascript
indexer.start();
indexer.replay();
```