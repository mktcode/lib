import { GoodFirstWeb3Issues } from '@mktcodelib/good-first-web3-issues';

const gfw3i = new GoodFirstWeb3Issues({
  githubToken: process.env.PAT || '',
  debug: true,
  rateLimit: 2500,
  port: 3009,
  corsOrigin: /localhost:3000/,
})

gfw3i.run()