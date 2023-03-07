# Web3 Indexer

## Motivation

When The Graph was released I understood what a huge pain it eases and started using it in my projects. You often don't want to read data from smart contracts directly, especially in more complex pojects. Frontend developers are used to the REST and GraphQL APIs but maybe not smart contract ABIs. Indexing event data and making it available in the format that is actually needed by client applications, is absolutely desireable in most cases.

However, in reality I find myself postponing the Subgraph setup as long as possible. I try to keep my projects small and simple and my contracts client friendly where possible. The last time I implemented a Subgraph is actually quite a while ago. Probably it's a lot easier today but I remember it being a bit of a hassle and during development it started to get a bit annoying to update and redeploy it all the time. And the decentralized network requires the use of a token, to pay indexers. Why do I need that? I mean, why even the whole "decentralization"?

The ultimate truth still lives on-chain and it is really just a convenience to have it nicely packed. An infrastructure with game theoretical tokenomics, query fees and staking and all that, seems a bit bloated to me, at least in some cases and definitely in the early stages of a project. High availability and redundancy is not a concern for me at this point, and when it becomes one, there are other ways to achive it. The Graph may not always be the best or most suitable solution. I assume there's at least still room for experimentation.

What I want is not a token but more like... an npm package.

```bash
npm i @mktcodelib/web3indexer
```

I aimed for the most straightforward and lightweight solution, by mostly just connecting a few puzzle-pieces. **Ethers** is used to listen for contract events. **Redis** stores the data. **Express** serves it. **GraphQL** is supported but optional. **You** implement event listeners and API endpoints and run it.

If you are familiar with all of those, especially Redis, you'll probably have your own indexer up and running within a few minutes.

Check out [this demo implementation](/demo/server/src/web3indexer/index.ts).

## Availability/Replication

### Redis

### Gun