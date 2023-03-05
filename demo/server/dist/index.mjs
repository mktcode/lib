// src/index.ts
import { GoodFirstWeb3Issues } from "@mktcodelib/good-first-web3-issues";
var gfw3i = new GoodFirstWeb3Issues({
  githubToken: process.env.PAT || "",
  debug: true,
  syncInterval: 1e3 * 60,
  port: 3009,
  corsOrigin: /localhost:3000/
});
gfw3i.run();
