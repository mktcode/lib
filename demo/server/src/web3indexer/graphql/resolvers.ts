import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function resolvers(db: Web3IndexerDB) {
  return {
    transfer: async ({ id }: { id: string }) => {
      const cached = await db.hGet("Transfer", id);
      
      if (!cached) return null;
      
      return JSON.parse(cached);
    },
    transfers: async () => {
      const cached = await db.hGetAll("Transfer");
      
      if (!cached) return [];
      
      return Object.keys(cached).map((id) => JSON.parse(cached[id]!));
    },
  }
};