var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
import express from "express";
import cors from "cors";
import { createClient } from "redis";
import { graphql } from "@octokit/graphql";
import { graphqlFetchAll } from "@mktcodelib/graphql-fetch-all";

// src/whitelist.ts
var whitelist = [
  "OpenQDev",
  "Opty-Fi",
  "AktaryTech",
  "DAOSquare",
  "ipfs",
  "filecoin-project",
  "livepeer",
  "across-protocol",
  "mycelium-ethereum",
  "lexDAO",
  "maticnetwork",
  "The-OpenDAO",
  "NomicFoundation",
  "smartcontractkit",
  "xtokenmarket",
  "SuperteamDAO",
  "kwenta",
  "sushiswap",
  "nounsDAO",
  "InstaDApp",
  "decentralgames",
  "Badger-Finance",
  "cryptonative-ch",
  "rook",
  "rarible",
  "ensdomains",
  "decentraland",
  "Sperax",
  "Storj",
  "safe-global",
  "nftport",
  "privy-io",
  "reservoirprotocol",
  "Tenderly",
  "unlock-protocol",
  "Swivel-Finance",
  "ApeWorX",
  "crypto-org-chain",
  "covalenthq",
  "valist-io",
  "ProjectOpenSea",
  "dydxprotocol",
  "skalenetwork",
  "tatumio",
  "golemfoundation",
  "ethersphere",
  "starkware-libs",
  "element-fi",
  "LedgerHQ",
  "PWNFinance",
  "xmtp",
  "quiknode-labs",
  "PureStake",
  "OpenZeppelin",
  "degatedev",
  "ceramicnetwork",
  "sygmaprotocol",
  "Autonomy-Network",
  "bobanetwork",
  "cartesi",
  "cowswap",
  "streamr-dev",
  "pokt-network",
  "APWine",
  "umaprotocol",
  "ethereum-push-notification-service",
  "MinaProtocol",
  "coinbase",
  "klaytn",
  "scroll-tech",
  "MetaMask",
  "bloxapp",
  "web3auth",
  "AztecProtocol",
  "devfolioco",
  "0xsquid",
  "attestantio",
  "byz-f",
  "LIT-Protocol",
  "dappnode",
  "hyperlane-xyz",
  "Delta-Financial",
  "poap-xyz",
  "Entropyxyz",
  "OrchidTechnologies",
  "ChainSafe",
  "alt-research",
  "celestiaorg",
  "quantstamp",
  "nftfy",
  "nomad-xyz",
  "sismo-core",
  "ethereum-optimism",
  "INFURA",
  "matter-labs",
  "ObolNetwork",
  "FuelLabs",
  "DuneAnalytics",
  "Manta-Network",
  "OlympusDAO",
  "Synthetixio",
  "ribbon-finance",
  "aave",
  "compound-finance",
  "lidofinance",
  "bitdao-io",
  "graphprotocol",
  "MASQ-Project",
  "Sacred-Finance",
  "labdao",
  "wgmi-community",
  "decent-dao",
  "zenon-network",
  "coordinape",
  "nextdotid",
  "1Hive",
  "metaDAObuilders",
  "schnoodledao",
  "Official-MoonDao",
  "ResearchHub",
  "connext",
  "shapeshift",
  "neonlabsorg",
  "Azuro-protocol",
  "node-real",
  "ripio",
  "1inch",
  "MoralisWeb3",
  "agoraxyz",
  "fluxprotocol",
  "worldcoin",
  "kleros",
  "WalletConnect",
  "gitpoap",
  "redstone-finance",
  "aave",
  "humanprotocol",
  "Aut-Labs",
  "superfluid-finance",
  "api3dao",
  "lens-protocol",
  "snapshot-labs",
  "MetaFactoryAI",
  "BendDAO",
  "multi-DAO",
  "PaladinFinance",
  "lexDAO",
  "People-DAO",
  "new-order-network",
  "obscuronet",
  "nation3",
  "AhoyTeam",
  "gnosischain",
  "archway-network",
  "aragon",
  "amun",
  "AleoHQ",
  "alchemyplatform",
  "citydaoproject",
  "IndexCoop",
  "perpetual-protocol",
  "ToucanProtocol",
  "KlimaDAO",
  "VitaDAO",
  "buildspace",
  "bridgesplit",
  "Brahma-fi",
  "BluntDAO",
  "bluejayfinance",
  "txlabs",
  "Blockdaemon",
  "BlockApex",
  "bitrefill",
  "axelarnetwork",
  "atomizexyz",
  "maticnetwork",
  "radicle-dev",
  "makerdao",
  "Uniswap",
  "anyswap",
  "bifrost-platform",
  "celer-network",
  "hop-protocol",
  "bcnmy",
  "interlay",
  "layerswap",
  "liquality",
  "O3Labs",
  "broxus",
  "Orbiter-Finance",
  "qredo",
  "renproject",
  "stargate-protocol",
  "thorchain",
  "ZeroDAO",
  "umbrella-network",
  "debridge-finance",
  "lifinance",
  "viaprotocol",
  "chainx-org",
  "Gravity-Bridge",
  "iotubeproject",
  "scrtlabs",
  "terra-money",
  "varenfinance",
  "bender-labs",
  "ZeroswapLabs",
  "allbridge-io",
  "beamer-bridge",
  "celer-network",
  "byteball",
  "darwinia-network",
  "debridge-finance",
  "elkfinance",
  "hotcrosscom",
  "irisnet",
  "layerzero-Labs",
  "mapprotocol",
  "ComposableFi",
  "celo-org",
  "orbit-chain",
  "polynetwork",
  "polymerdao",
  "router-protocol",
  "SocketDotTech",
  "swim-io",
  "symbiosis-finance",
  "synapsecns",
  "teleport-network",
  "omni",
  "Transit-Finance",
  "Geo-Web-Project",
  "alto-io",
  "trustfractal",
  "Gelotto",
  "sorare",
  "TreasureProject",
  "Merit-Circle",
  "enjinstarter",
  "Seedifyfund",
  "bit-country",
  "improbable",
  "monaverse",
  "oncyberio",
  "PHI-LABS-INC",
  "vhslab",
  "StemsDAO",
  "pianity",
  "soundxyz",
  "sudoswap",
  "BitSongOfficial",
  "AudiusProject",
  "KyberNetwork",
  "okex",
  "CoboVault",
  "fireblocks",
  "delta-exchange",
  "aktionariat",
  "bottlepay",
  "crossmint",
  "moonpay",
  "RampNetwork",
  "Transak",
  "Zeeve-App",
  "BanklessDAO",
  "code-423n4",
  "0xMacro",
  "CRE8RDAO",
  "JokeDAO",
  "MetricsDAO",
  "Developer-DAO",
  "dOrgTech",
  "DAOSquare",
  "decent-labs",
  "Layer2DAO",
  "metacartel",
  "dao-xyz",
  "readyplayerme",
  "openlawteam",
  "luumen",
  "lnpay",
  "reddio-com",
  "threshold-network",
  "MatrixAINetwork",
  "GaloyMoney",
  "akash-network",
  "Super-Protocol",
  "4everland",
  "RunOnFlux",
  "sigp",
  "Build-the-Bear",
  "amberdata",
  "cheqd",
  "fluree",
  "goldenrecursion",
  "masa-finance",
  "oceanprotocol",
  "orbitdb",
  "Particle-Network",
  "PowerLoom",
  "truflation",
  "blocknative",
  "esprezzo",
  "fal-ai",
  "Kylin-Network",
  "KYVENetwork",
  "tablelandnetwork",
  "SyntropyNet",
  "andromedaprotocol",
  "AntelopeIO",
  "Apillon-web3",
  "completium",
  "block-vision",
  "lastrust",
  "comdex-official",
  "ethereansos",
  "fission-codes",
  "fluencelabs",
  "kotalco",
  "kurtosis-tech",
  "lum-network",
  "iotexproject",
  "Risk-Harbor",
  "eucrypt",
  "maticlaunch",
  "glitchdefi",
  "Tenderize",
  "dn3010",
  "MtPelerin",
  "TWOTWOArt",
  "gelatodigital",
  "webaverse",
  "SuperFarmDAO",
  "HausDAO",
  "consenlabs",
  "cycloneprotocol",
  "bitbond",
  "nftport",
  "nansen-ai",
  "kryptco",
  "subdao-network",
  "The-Mining-Game",
  "depayfi",
  "0xSplits",
  "spritz-finance",
  "RabbyHub",
  "radiant-so",
  "SyndicateProtocol",
  "101eth",
  "verbwire",
  "paybolt",
  "liteflow-labs",
  "0xsequence",
  "flair-sdk",
  "MASQ-Project",
  "AndinaDeFi",
  "luabase",
  "block-wallet",
  "zeriontech",
  "wiw-io",
  "tars-protocol",
  "iExecBlockchainComputing",
  "Cypherock",
  "BoggedFinance",
  "LIQNFT",
  "ZenGo-X",
  "Breakthrough-Labs",
  "subsquid",
  "valory-xyz",
  "BitOKorg",
  "diagonal-finance",
  "macaronswap",
  "Tutellus",
  "FMTLOL",
  "ciety-xyz",
  "yup-io",
  "talentprotocol",
  "KrebitDAO",
  "thecodacus",
  "NestedFi",
  "Zapper-fi",
  "Trace-Metaverse",
  "FATEx-DAO",
  "ChainWhiZ",
  "etherspot",
  "thxprotocol",
  "TeamAikon",
  "versify-labs",
  "0xFlair",
  "gitshock-labs",
  "wert-io",
  "ISLAMIBLOCKCHAIN",
  "certhis",
  "sirenmarkets",
  "shield2protocol",
  "CrescentBase",
  "CYBAVO",
  "bnb-chain",
  "MixinNetwork",
  "bitkeepwallet",
  "Monopole-network",
  "RequestNetwork",
  "0Vix",
  "Debetsorg",
  "RociFi",
  "CaskProtocol",
  "fcc2022",
  "ednsdomains",
  "incognitochain",
  "su-squares",
  "0xBets",
  "ruufpay",
  "intrXn",
  "kevinkaburu",
  "parasol-finance",
  "metavaultorg",
  "openocean-finance",
  "snftpro",
  "hashup-it",
  "NextDimensionStudios",
  "tamago-labs",
  "marscolony-io",
  "gogocoin",
  "hashbomb",
  "onblockio",
  "niftsy",
  "gitshock-labs",
  "InfinityWallet",
  "lucylow",
  "Foxlottery",
  "CivilizationCIV",
  "unipilot",
  "build-finance",
  "polygon-io",
  "dhealthproject",
  "OptixProtocol",
  "secret-tech",
  "vorzdao",
  "justmoney-io",
  "cruzocards",
  "CoinbetFi",
  "DZapIO",
  "bequest-finance"
];
function* cycleWhitelist() {
  let index = 0;
  while (true) {
    yield whitelist[index];
    index = (index + 1) % whitelist.length;
  }
}
var whitelistCycle = cycleWhitelist();

// src/queries.ts
import gql from "graphql-tag";
var ORG_REPOS_QUERY = gql`query ($login: String!, $first: Int!, $after: String) {
  rateLimit {
    used
    resetAt
  }
  organization (login: $login) {
    id
    login
    name
    description
    url
    websiteUrl
    avatarUrl
    repositories (first: $first, after: $after, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        nameWithOwner
        description
        url
        stargazerCount
        languages (first: 10) {
          nodes {
            id
            name
            color
          }
        }
        issues {
          totalCount
        }
      }
    }
  }
}`;
var USER_REPOS_QUERY = gql`query ($login: String!, $first: Int!, $after: String) {
  rateLimit {
    used
    resetAt
  }
  user (login: $login) {
    id
    login
    name
    description: bio
    url
    websiteUrl
    avatarUrl
    repositories (first: $first, after: $after, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        nameWithOwner
        description
        url
        stargazerCount
        languages (first: 10) {
          nodes {
            id
            name
            color
          }
        }
        issues {
          totalCount
        }
      }
    }
  }
}`;
var REPO_ISSUES_QUERY = gql`query ($owner: String!, $name: String!, $first: Int!, $after: String) {
  rateLimit {
    used
    resetAt
  }
  repository (owner: $owner, name: $name) {
    issues (first: $first, after: $after, labels: ["good first issue"], states: [OPEN]) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        number
        title
        url
        labels (first: 10) {
          nodes {
            id
            name
            color
          }
        }
        assignees (first: 3) {
          nodes {
            id
            login
            name
            avatarUrl
          }
        }
        comments {
          totalCount
        }
      }
    }
  }
}`;

// src/index.ts
var GoodFirstWeb3Issues = class {
  constructor({
    githubToken,
    port = 3e3,
    redisConfig = {},
    rateLimit = 5e3,
    corsOrigin = /openq\.dev$/,
    debug = false
  }) {
    this.port = port;
    this.debug = debug;
    this.db = createClient(redisConfig);
    this.db.on("error", (err) => console.log("Redis Client Error", err));
    this.rateLimit = rateLimit;
    this.server = express();
    this.server.use(cors({ origin: corsOrigin }));
    this.server.get("/", (_req, res) => __async(this, null, function* () {
      const cached = yield this.db.hGetAll("orgs");
      if (cached) {
        Object.keys(cached).forEach((key) => {
          cached[key] = JSON.parse(cached[key]);
        });
      }
      res.send(cached || {});
    }));
    this.github = graphql.defaults({
      headers: {
        Authorization: `bearer ${githubToken}`
      }
    });
  }
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }
  sanitizeData(orgOrUser) {
    return __spreadProps(__spreadValues({}, orgOrUser), {
      repositories: orgOrUser.repositories.nodes.map((repo) => __spreadProps(__spreadValues({}, repo), {
        languages: repo.languages.nodes,
        issues: repo.issues.nodes.map((issue) => __spreadProps(__spreadValues({}, issue), {
          labels: issue.labels.nodes,
          assignees: issue.assignees.nodes
        }))
      }))
    });
  }
  wait(rateLimit) {
    return __async(this, null, function* () {
      let waitTime = 0;
      process.stdout.write("\x1B[1A\x1B[0G");
      this.log(`\rRate limit: ${rateLimit.used}/${this.rateLimit}`);
      if (rateLimit.used >= this.rateLimit) {
        waitTime = 1e3 * 10;
        this.log(`Waiting ${(waitTime / 1e3 / 60).toFixed(2)} minutes until rate limit resets...
`);
      }
      yield new Promise((resolve) => setTimeout(resolve, waitTime));
    });
  }
  sync() {
    return __async(this, null, function* () {
      const { value: login } = whitelistCycle.next();
      this.log(`
Syncing ${login}...
`);
      let orgOrUser;
      try {
        const orgResponse = yield graphqlFetchAll(
          this.github,
          ORG_REPOS_QUERY,
          { login, first: 100 }
        );
        orgOrUser = orgResponse.organization;
        yield this.wait(orgResponse.rateLimit);
      } catch (e) {
        try {
          const userResponse = yield graphqlFetchAll(
            this.github,
            USER_REPOS_QUERY,
            { login, first: 100 }
          );
          orgOrUser = userResponse.user;
          yield this.wait(userResponse.rateLimit);
        } catch (e2) {
          this.log(e2);
          const resetAt = new Date(Date.now() + 5 * 60 * 1e3).toISOString();
          yield this.wait({ used: this.rateLimit, resetAt });
        }
      }
      if (!orgOrUser) {
        this.db.hDel("orgs", login);
        this.log(`Removed ${login}!`);
        this.sync();
        return;
      }
      for (const repo of orgOrUser.repositories.nodes) {
        try {
          const issuesResponse = yield graphqlFetchAll(
            this.github,
            REPO_ISSUES_QUERY,
            { owner: orgOrUser.login, name: repo.name, first: 100 }
          );
          repo.issues.nodes = issuesResponse.repository.issues.nodes;
          yield this.wait(issuesResponse.rateLimit);
        } catch (e) {
          this.log(e);
          const resetAt = new Date(Date.now() + 5 * 60 * 1e3).toISOString();
          yield this.wait({ used: this.rateLimit, resetAt });
        }
      }
      orgOrUser.repositories.nodes = orgOrUser.repositories.nodes.filter((repo) => repo.issues.nodes.length > 0);
      const issueCount = orgOrUser.repositories.nodes.reduce((acc, repo) => acc + repo.issues.nodes.length, 0);
      this.log(`Found ${orgOrUser.repositories.nodes.length} repo(s) with ${issueCount} issue(s) for ${login}.`);
      if (orgOrUser.repositories.nodes.length === 0) {
        this.db.hDel("orgs", login);
        this.log(`Removed ${login}!`);
        this.sync();
        return;
      }
      yield this.db.hSet("orgs", login, JSON.stringify(this.sanitizeData(orgOrUser)));
      this.log(`Synced ${login}!`);
      this.sync();
    });
  }
  run() {
    this.db.connect();
    this.server.listen(this.port, () => {
      console.log(`Listening on http://localhost:${this.port}`);
      this.sync();
    });
  }
};
export {
  GoodFirstWeb3Issues
};
