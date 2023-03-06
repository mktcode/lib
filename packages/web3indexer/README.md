# Web3 Indexer

```bash
npm i @mktcodelib/web3indexer
```

```javascript
// indexer.js
import { Web3Indexer } from '@mktcodelib/web3indexer'

const PROVIDER_URL = "https://...";
const ADDRESS = "0x70A3Bd555AC77232f0a2dBD29D51068ABa740Ad2";
const EVENTS_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const indexer = new Web3Indexer({ provider: PROVIDER_URL });
indexer.addContract(ADDRESS, EVENTS_ABI);
```

```bash
$ node indexer.js

Indexing...
Event data: http://localhost:3000/<eventName>
GraphQL interface at: http://localhost:3000/graphql
```