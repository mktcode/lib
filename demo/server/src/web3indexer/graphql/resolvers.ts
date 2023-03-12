import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export default (db: Web3IndexerDB) => ({
  transfers: async () => {
    const cached = await db.hGetAll("Transfer");
    
    if (!cached) return [];
    
    return Object.keys(cached).map((key) => JSON.parse(cached[key]!));
  },
});