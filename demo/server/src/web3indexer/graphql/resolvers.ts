import { Web3Indexer } from "@mktcodelib/web3indexer";

export default (indexer: Web3Indexer) => ({
  user: async ({ address }: { address: string }) => {
    const cached = await indexer.db.hGet("users", address);
    
    if (!cached) return null;
    
    return JSON.parse(cached);
  },
  users: async () => {
    const cached = await indexer.db.hGetAll("users");
    
    if (!cached) return [];
    
    return Object.keys(cached).map((address) => JSON.parse(cached[address]!));
  },
});