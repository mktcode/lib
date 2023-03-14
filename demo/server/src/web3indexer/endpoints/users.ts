import { Web3Indexer } from "@mktcodelib/web3indexer";

export default (indexer: Web3Indexer) => async (_req: any, res: any) => {
  const cached = await indexer.db.hGetAll('users');

  if (cached) {
    Object.keys(cached).forEach((key) => {
      cached[key] = JSON.parse(cached[key]!);
    });
  }

  res.send(cached || {});
}