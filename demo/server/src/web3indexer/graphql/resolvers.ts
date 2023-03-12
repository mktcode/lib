import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function resolvers(db: Web3IndexerDB) {
  return {
    transfers: async () => {
      const cached = await db.hGetAll("Transfer");
      
      if (!cached) return [];
      
      return Object.keys(cached).map((key) => JSON.parse(cached[key]!));
    },
  }
};