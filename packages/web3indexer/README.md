# Web3 Indexer

A lightweight and flexible indexer for EVM smart contracts, connecting a couple of popular libraries to provide a simple self-hosted indexing solution.

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
import { Web3Indexer } from '@mktcodelib/web3indexer';
import { TransferListener } from './listeners/Transfer';
import { TransfersEndpoint } from './endpoints/transfers';
import { schema } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import CONTRACT from './listeners/CONTRACT.json';

if (!process.env.PROVIDER_URL) throw new Error('PROVIDER_URL env variable is required');

const indexer = new Web3Indexer({ provider: process.env.PROVIDER_URL });

const contract = indexer.contract(CONTRACT.address, CONTRACT.abi)
contract.store("Transfer", TransferListener);

indexer.api.get('/transfers', TransfersEndpoint);
indexer.api.graphql(schema, resolvers);

indexer.replay();
```

```javascript
// listeners/Transfer.js
export function TransferListener(db) {
  return async (from, to, tokenId, event) => {
    db.hSet("Transfer", event.transactionHash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
  }
}
```

```javascript
// endpoints/transfers.js
export function TransfersEndpoint(db) {
  return async (req, res) => {
    const cached = await db.hGetAll('Transfer');
  
    if (cached) {
      Object.keys(cached).forEach((key) => {
        cached[key] = JSON.parse(cached[key]!);
      });
    }
  
    res.send(cached || {});
  }
}
```

```javascript
// graphql/schema.js
import { buildASTSchema } from "graphql";
import gql from "graphql-tag";

const ast = gql`
type Transfer {
  from: String
  to: String
  tokenId: String
}

type Query {
  transfers: [Transfer!]
}
`;

export const schema = buildASTSchema(ast);
```

```javascript
// graphql/resolvers.js
export function resolvers(db) {
  return {
    transfers: async () => {
      const cached = await db.hGetAll("Transfer");
      
      if (!cached) return [];
      
      return Object.keys(cached).map((key) => JSON.parse(cached[key]!));
    },
  }
};
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