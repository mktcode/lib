import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function TransferListener(db: Web3IndexerDB) {
  return async (from: string, to: string, tokenId: bigint) => {
    const hash = `${from}-${to}-${tokenId.toString()}`;
    db.hSet("Transfer", hash, JSON.stringify({ from, to, tokenId: tokenId.toString() }));
  }
}