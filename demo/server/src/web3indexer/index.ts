import { buildSchema } from 'graphql';
import { Web3Indexer } from '@mktcodelib/web3indexer';

if (!process.env.PROVIDER_URL) throw new Error('PROVIDER_URL env variable is required');

const ADDRESS = "0xab879B28006F5095ab346Eb525daFeA2cf18Bc3f";
const EVENTS_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const indexer = new Web3Indexer({
  provider: process.env.PROVIDER_URL,
  debug: true
});

indexer.contract(ADDRESS, EVENTS_ABI, (contract) => {
  contract.on("Transfer", async (from, to, tokenId, event) => {
    indexer.db.hSet("Transfer", event.transactionHash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
  });
});

indexer.server.get('/transfers', async (_req, res) => {
  const cached = await indexer.db.hGetAll('Transfer');

  if (cached) {
    Object.keys(cached).forEach((key) => {
      cached[key] = JSON.parse(cached[key]!);
    });
  }

  res.send(cached || {});
});

const schema = buildSchema(`
  type Transfer {
    from: String
    to: String
    tokenId: String
  }

  type Query {
    transfers: [Transfer!]
  }
`);

const resolvers = {
  transfers: async () => {
    const cached = await indexer.db.hGetAll("Transfer");
    
    if (!cached) return [];

    return Object.keys(cached).map((key) => JSON.parse(cached[key]!));
  },
};

indexer.graphql(schema, resolvers);

indexer.replay();
indexer.start();