import { Web3Indexer } from '@mktcodelib/web3indexer';
import { TransferListener } from './listeners/Transfer';
import { TransfersEndpoint } from './endpoints/transfers';
import schema from './graphql/schema';
import resolvers from './graphql/resolvers';
import CONTRACT from './listeners/CONTRACT.json';

if (!process.env.PROVIDER_URL) throw new Error('PROVIDER_URL env variable is required');

const indexer = new Web3Indexer({ provider: process.env.PROVIDER_URL });

indexer.contract(CONTRACT.address, CONTRACT.abi, (contract) => {
  contract.on("Transfer", TransferListener(indexer.db));
});

indexer.server.get('/transfers', TransfersEndpoint(indexer.db));

indexer.graphql(schema, resolvers(indexer.db));

indexer.replay();
indexer.start();