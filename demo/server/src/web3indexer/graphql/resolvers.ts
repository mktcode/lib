import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function resolvers(db: Web3IndexerDB) {
  return {
    user: async ({ address }: { address: string }) => {
      const cached = await db.hGet("users", address);
      
      if (!cached) return null;
      
      return JSON.parse(cached);
    },
    users: async () => {
      const cached = await db.hGetAll("users");
      
      if (!cached) return [];
      
      return Object.keys(cached).map((address) => JSON.parse(cached[address]!));
    },
  }
}