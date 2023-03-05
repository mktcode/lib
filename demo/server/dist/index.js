"use strict";

// src/index.ts
var import_good_first_web3_issues = require("@mktcodelib/good-first-web3-issues");
var gfw3i = new import_good_first_web3_issues.GoodFirstWeb3Issues({
  githubToken: process.env.PAT || "",
  debug: true,
  syncInterval: 1e3 * 60,
  port: 3009,
  corsOrigin: /localhost:3000/
});
gfw3i.run();
