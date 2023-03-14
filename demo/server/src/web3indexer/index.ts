import { Web3Indexer } from '@mktcodelib/web3indexer';
import listeners from './listeners';
import endpoints from './endpoints';
import graphql from './graphql';

if (!process.env.PROVIDER_URL) throw new Error('No PROVIDER_URL provided.');
if (!process.env.PORT) throw new Error('No PORT provided.');
if (!process.env.OPENAI_API_KEY) throw new Error('No OPENAI_API_KEY provided.');

const indexer = new Web3Indexer({
  provider: process.env.PROVIDER_URL,
  listeners,
  endpoints,
  graphql,
});

indexer.replay();