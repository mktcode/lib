# Web3 Indexer

A lightweight and flexible indexer for EVM smart contracts, connecting a couple of popular libraries to provide a simple self-hosted indexing solution.

**Ethers** is used to listen to contract events.
**Redis** is used to store data.
**Express** serves the data.
**GraphQL** is supported but optional.

|                                  | Web3 Indexer               | The Graph                      |
|----------------------------------|----------------------------|--------------------------------|
| decentralized data-integrity     | -                          | ✓                              |
| distributed/redundant storage    | ✓                          | ✓                              |
| self-hosted/self-owned           | ✓                          | run an indexer (requires GRT) |
| number of listeners              | depends on you (only)      | pretty much unlimited          |
| contract factory support         | ✓                          | ✓                              |
| GraphQL support                  | ✓                          | ✓                              |
| REST support                     | ✓                          | -                              |
| freely design API endpoints      | ✓                          | -                              |
| index arbitrary data / call APIs | ✓                          | -                              |
| POST/Mutation support            | ✓                          | -                              |
| optional/custom billing          | ✓                          | -                              |
| package size                     | 22 kB so far (npm package) | 563 kB cli tool, 335 MB node   |
| cognitive load                   | you might know already     | another docs bookmark          |
| Tech                             | Javascript                 | AssemblyScript, WASM, Rust     |


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

## Docker

You can start with this [templpate repository](https://github.com/mktcode/web3indexer-container) and adjust it to your needs.