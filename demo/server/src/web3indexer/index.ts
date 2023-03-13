import { Web3Indexer } from '@mktcodelib/web3indexer';
import { UnlockListener } from './listeners/Unlock';
import { UsersEndpoint } from './endpoints/users';
import { ChatEndpoint } from './endpoints/chat';
import { schema } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import CONTRACT from './listeners/CONTRACT.json';

if (!process.env.PROVIDER_URL) throw new Error('No PROVIDER_URL provided.');

const indexer = new Web3Indexer({ provider: process.env.PROVIDER_URL });

const contract = indexer.contract(CONTRACT.address, CONTRACT.abi);
contract.store("Unlock", UnlockListener);

indexer.api.get('/users', UsersEndpoint);
indexer.api.get('/chat/:message', ChatEndpoint);
indexer.api.graphql(schema, resolvers);

indexer.replay();