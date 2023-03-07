# Web3 Indexer

## Motivation

When The Graph was released I understood what a huge pain it eases and started using it in my projects. I'm holding a few tokens as well ever since. You often don't want to read data from smart contracts directly, especially in more complex pojects. Frontend developers are familiar with REST and GraphQL but not necessarily with smart contract ABIs. Indexing blockchain data and making it available in the format that is actually needed by client applications, is absolutely desireable in most cases.

However, in reality I often found myself avoiding a Subgraph as long as possible. I like to keep my projects small and simple and my contracts client friendly where possible. The last time I implemented a Subgraph is quite a while ago. Probably it's a lot easier today but I remember it being a bit of a hassle and during development it started to get annoying to update and redeploy it all the time. And the decentralized network requires the use of a token. Why do I need that? I mean, why even the whole "decentralization", I'm wondering.

The ultimate truth still lives on-chain and it is (imho) really just a convenience feature in the end, to have it nicely packed for your apps to consume. An infrastructure with game theoretical tokenomics, query fees and staking and all that, seems a bit much to me, at least in some cases and definitely in the early stages of a project. High availability and redundancy is not a concern for me at this point, and when it becomes one, there are more ways to achive it. I think The Graph might not always be the best or most suitable solution. At least for me and so I wanted to play with an idea.

What I want is not a token but more like... an npm package.

```bash
npm i @mktcodelib/web3indexer
```

I aimed for the most straightforward and lightweight solution, by mostly just connecting a few puzzle-pieces. **Ethers** is used to listen for contract events. **Redis** stores the data. **Express** serves it. **GraphQL** is supported but optional. **You** implement event listeners and API endpoints and run it.

If you are familiar with all of those, especially Redis, you'll probably have your own indexer up and running within a few minutes.

Check out [this demo implementation](/demo/server/src/web3indexer/index.ts).

## Everything in one place

The typical dApp has a few contracts and some sort of client UI with it's own state and often a separate database and API for "off-chain" data **plus** one or more Subgraphs. Another downside of the decentralized nature of The Graph's protocol, is that you can't store any data that is not derived from the blockchain or other decentralized storage. Decentralization requires consensus which requires determinism, which at the end of the means: Nope, no API calls. Just as in the smart contracts you are trying to integrate more seemlesly into your application architecture.

Web3 Indexer simply gives you acces to a redis store and an express server, and ethers is installed as well, so to say. You can define POST endpoints, authenticated or not, make API calls and store and serve whatever data you want, however you want, be it good old REST or shiny GraphQL or whatever you can make an express server do. Or go and implement the whole thing in.. Go or Rust. The point is, you can have your client's "off-chain" API and your contract data in one place, setup can be super easy, and you don't need to buy a token.

## Availability/Replication

The clear advantage of decentralization is of course the almost guaranteed availability. Having multiple, independent entities do the work and cross-check each other is kinda cool. For blockchain transactions, of course, but for caching and aggregating the data and serving it to client applications too? The thing is, if you just do it yourself, for your specific business case, you don't need to check anything other than your code. And you might already know how to scale things and ensure availability.

### Redis

https://redis.io/docs/management/replication/

### Gun

https://gun.eco/

## Conclusion

As always, I asssume that I missed something important, that renders my approach not viable for production apps. But as mentioned before, maybe it helps in the early days of a project and maybe I didn't miss anything at all. So I'm sharing this. Just in case. I'm curious to hear your thoughts.