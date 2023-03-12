import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function TransferListener(db: Web3IndexerDB) {
  return async (from: string, to: string, tokenId: bigint) => {
    const id = `${from}-${to}-${tokenId.toString()}`;
    db.hSet("Transfer", id, JSON.stringify({ id, from, to, tokenId: tokenId.toString() }));
  }
}