import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function TransfersEndpoint(db: Web3IndexerDB) {
  return async (_req: any, res: any) => {
    const cached = await db.hGetAll('Transfer');
  
    if (cached) {
      Object.keys(cached).forEach((key) => {
        cached[key] = JSON.parse(cached[key]!);
      });
    }
  
    res.send(cached || {});
  }
}