var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// src/db.ts
import { createClient } from "redis";
var db;
var init_db = __esm({
  "src/db.ts"() {
    "use strict";
    db = createClient();
    db.on("error", (err) => console.log("Redis Client Error", err));
    db.connect();
  }
});

// src/whitelist.ts
function* cycleWhitelist() {
  let index = 0;
  while (true) {
    yield whitelist[index];
    index = (index + 1) % whitelist.length;
  }
}
var whitelist, whitelistCycle;
var init_whitelist = __esm({
  "src/whitelist.ts"() {
    "use strict";
    whitelist = [
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
      "fei--protocol",
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
    whitelistCycle = cycleWhitelist();
  }
});

// src/queries.ts
import gql from "graphql-tag";
var ORG_REPOS_QUERY, USER_REPOS_QUERY, REPO_ISSUES_QUERY;
var init_queries = __esm({
  "src/queries.ts"() {
    "use strict";
    ORG_REPOS_QUERY = gql`query ($login: String!, $first: Int!, $after: String) {
  rateLimit {
    cost
    remaining
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
        name
        description
        url
        issues {
          totalCount
        }
      }
    }
    __typename
  }
}`;
    USER_REPOS_QUERY = gql`query ($login: String!, $first: Int!, $after: String) {
  rateLimit {
    cost
    remaining
  }
  user (login: $login) {
    id
    login
    name
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
        name
        description
        url
        issues {
          totalCount
        }
      }
    }
    __typename
  }
}`;
    REPO_ISSUES_QUERY = gql`query ($owner: String!, $name: String!, $first: Int!, $after: String) {
  rateLimit {
    cost
    remaining
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
      }
    }
  }
}`;
  }
});

// src/sync.ts
import { graphqlFetchAll } from "@mktcode/graphql-fetch-all";
import { graphql } from "@octokit/graphql";
function sync() {
  return __async(this, null, function* () {
    const { value: login } = whitelistCycle.next();
    console.log(`Syncing ${login}...`);
    let orgOrUser;
    try {
      const orgResponse = yield graphqlFetchAll(client, ORG_REPOS_QUERY, { login, first: 100 }, ["organization", "repositories"]);
      orgOrUser = orgResponse.organization;
    } catch (e) {
      try {
        const userResponse = yield graphqlFetchAll(client, USER_REPOS_QUERY, { login, first: 100 }, ["user", "repositories"]);
        orgOrUser = userResponse.user;
      } catch (e2) {
        console.log(e2);
      }
    }
    if (!orgOrUser) {
      db.hDel("orgs", login);
      console.log(`Removed ${login}!`);
      return;
    }
    for (const repo of orgOrUser.repositories.nodes) {
      try {
        const issuesResponse = yield graphqlFetchAll(client, REPO_ISSUES_QUERY, { owner: orgOrUser.login, name: repo.name, first: 100 }, ["repository", "issues"]);
        orgOrUser.repositories.nodes = orgOrUser.repositories.nodes.map((r) => r.name === repo.name ? issuesResponse.repository : r);
      } catch (e) {
        console.log(e);
      }
    }
    orgOrUser.repositories.nodes = orgOrUser.repositories.nodes.filter((repo) => repo.issues.nodes.length > 0);
    if (orgOrUser.repositories.nodes.length === 0) {
      db.hDel("orgs", login);
      console.log(`Removed ${login}!`);
      return;
    }
    yield db.hSet("orgs", login, JSON.stringify(orgOrUser));
    console.log(`Synced ${login}!`);
  });
}
var client;
var init_sync = __esm({
  "src/sync.ts"() {
    "use strict";
    init_whitelist();
    init_queries();
    init_db();
    client = graphql.defaults({
      headers: {
        Authorization: `bearer ${process.env.PAT}`
      }
    });
  }
});

// src/index.ts
import express from "express";
var require_src = __commonJS({
  "src/index.ts"(exports) {
    init_db();
    init_sync();
    var app = express();
    app.get("/", (_req, res) => __async(exports, null, function* () {
      const cached = yield db.hGetAll("orgs");
      if (cached) {
        Object.keys(cached).forEach((key) => {
          cached[key] = JSON.parse(cached[key]);
        });
      }
      res.send(cached || {});
    }));
    app.listen(3e3, () => {
      console.log(`Example app listening at http://localhost:3000`);
    });
    sync();
    setInterval(sync, 60 * 1e3);
  }
});
export default require_src();
