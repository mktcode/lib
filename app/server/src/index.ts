import { GoodFirstWeb3Issues } from '@mktcodelib/good-first-web3-issues';

const gfw3i = new GoodFirstWeb3Issues({
  githubToken: process.env.PAT || '',
})

gfw3i.run()