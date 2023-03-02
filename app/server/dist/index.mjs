// src/index.ts
import GoodFirstWeb3Issues from "@mktcodelib/good-first-web3-issues";
console.log(GoodFirstWeb3Issues);
console.log(process.env.PAT);
var gfw3i = new GoodFirstWeb3Issues({
  githubToken: process.env.PAT || ""
});
gfw3i.run();
