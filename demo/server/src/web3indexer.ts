import { Web3Indexer } from '@mktcodelib/web3indexer';

const PROVIDER_URL = "https://eth-sepolia.g.alchemy.com/v2/xvKElJ_umBDERuORIJrMqQbyDDpbqSxx";
const ADDRESS = "0xab879B28006F5095ab346Eb525daFeA2cf18Bc3f";
const EVENTS_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const indexer = new Web3Indexer({ provider: PROVIDER_URL, debug: true });

indexer.addContract(ADDRESS, EVENTS_ABI, (contract) => {
  contract.on("Transfer", async (from, to, tokenId, event) => {
    
    // Bug in ethers v6: Event not passed to callback, waiting for fix.
    // https://github.com/ethers-io/ethers.js/issues/3767
    event = event || { transactionHash: from + to + tokenId.toString() };

    indexer.db.hSet("Transfer", event.transactionHash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
  });
});

indexer.replay();