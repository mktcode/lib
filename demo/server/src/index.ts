import { GoodFirstWeb3Issues } from '@mktcodelib/good-first-web3-issues';

const gfw3i = new GoodFirstWeb3Issues({
  githubToken: process.env.PAT || '',
  debug: true,
  syncInterval: 1e3 * 10,
})

gfw3i.run()