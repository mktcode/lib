# Building my own web3 indexing solution

## Motivation

When The Graph was announced I understood what pain it eases and started using it in my projects. You often don't want to read data from smart contracts directly and frontend developers are familiar with REST and GraphQL but not necessarily with smart contract ABIs. Indexing blockchain data and making it available in the format that is actually needed by client applications, is absolutely desireable in most cases.

However, during development I often found myself avoiding a Subgraph setup as long as possible. I spend a lot of my time on silly experiments that I delete a week later. I keep such projects very small and contracts "client friendly" where possible. So I don't really want to create a Subgraph for every little thing I try out. But querying on-chain data, in a more convenient way than direct contract interaction, would still be nice. So I wanted to have a solution that is easy to setup and use, lightweight and only uses technology I am already familiar with. A simple, reusable, npm package that does only what I need and nothing more.

But before I dive into the package itself, I want to share a few thoughts on the broader topic, that came up while playing with this idea.

## Decentralization

The Graph started by offering a centralized, hosted service. The transition to the decentralized network is ongoing and the tooling and developer experience is improving. The last time I built a Subgraph is actually a while ago and I am probably not really up to date with the current state of things here. So generally, let me know if anything I write is wrong or outdated or utter bullshit. But the decentralized nature itself introduces some compromises, like the need for incentive mechanisms (a token and staking) and determinism (no API calls, just like in smart contracts). So as far as I understand this correctly, the result is that you can only store data in a Subgraph, that is derived from the blockchain or other decentralized storage (like IPFS) in a deterministic way. And someone has to pay the indexers.

In the early days, on their Discord server, I had some questions and was told that, "if it won't be cheaper than running your own infrastructure, then we've obviously failed." For the hosted service I believe that without any doubt but for the decentralized network? I mean, how can a decentralized infrastructure be cheaper than a centralized one? Doesn't that at least depend on what I need and how I would implement it? It also introduces a payment gateway that I'm not in control of. What about market situation? GRT tokenomics? How does that effect my app? Again, maybe I'm not informed enough but I'm also probably not the only one. And I'm just afraid of implementing/using a costly infrastructure for decentralized indexing of decentralized data.

The advantage is of course the scalability and independently guaranteed data integrity. But since the ultimate truth still lives on-chain, an infrastructure with complex tokenomics, query fees and staking and all that, seems a bit much to me for certain use cases and definitely in the early stages of a project. High availability and redundancy are not yet a primary concern for me at this point, and when it becomes one, there are more ways to achive it. At least it's reason enough for me to try my own stupid ideas and stay in my own little sandbox world. :D

## Web3 Indexer

And here's [the package](https://www.npmjs.com/package/@mktcodelib/web3indexer):

It's of course not a valid comparison and you can absolutely see this really just as the playful and naive approach it is. But I made this table to make it more clear what to expect or what I aim for at least.

|                                  | Web3 Indexer               | The Graph                      |
|----------------------------------|----------------------------|--------------------------------|
| decentralized data-integrity     | -                          | ✓                              |
| distributed/redundant storage    | ✓                          | ✓                              |
| self-hosted/self-owned           | ✓                          | run an indexer? (requires GRT) |
| number of listeners              | depends on you             | unlimited                      |
| contract factory support         | ✓                          | ✓                              |
| GraphQL support                  | ✓                          | ✓                              |
| REST support                     | ✓                          | -                              |
| freely design API endpoints      | ✓                          | -                              |
| index arbitrary data / call APIs | ✓                          | -                              |
| POST/Mutation support            | ✓                          | -                              |
| optional/custom billing          | ✓                          | -                              |
| package size                     | 22 kB so far (npm package) | 563 kB cli tool, 335 MB node   |
| cognitive load                   | you might know already     | another docs bookmark          |
| Tech                             | Javascript                 | AssemblyScript, WASM, Rust     |

Actually this table doesn't look so bad if you don't care about decentralization and scalability that much. :D But it all just comes from the fact that I simply went for the quickest, most straightforward and lightweight solution, by wrapping a few other libraries and leaving the rest to you. **Ethers** listens for contract events. **Redis** stores data. **Express** serves it. **GraphQL** is supported but optional. **You** implement event listeners and the API you need and then run it.

If you are already familiar with such a setup, you'll probably have your own indexer up and running within a few minutes and without reading any docs.

Check out [this demo implementation](/demo/server/src/web3indexer/index.ts) and let me know if you agree.

The Graph is probably built on the stronger tech stack, sure. But my implementation at least tries to get out of your way as much as possible and leaves 100% freedom to you. You could even use this package as a proxy for your Subgraph(s) and other APIs and merge everything into one. A thing you might have already thought about before. Then you throw it into your kubernetes cluster, which you are of course already running for other reasons. Et voilà, you can remove URLs from your client config.

## Billing/Payment

Now this is really, really experimental and probably won't make a slot of sense. Anyways... :D

I've written a simple smart contract that can release deposited funds if you provide it with a valid signature. Now that plays well with the fact that the indexer can require a signature for all or some of your endpoints. That means such requests can't be made directly from a frontend but need to be proxied through a backend. Just like it should be whenever an API requires authorization. But you can now collect those signatures and for example hand them to an UMA court, allowing you to withdraw from the user's deposit or not.

## Conclusion

