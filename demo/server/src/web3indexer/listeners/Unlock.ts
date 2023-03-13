import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function UnlockListener(db: Web3IndexerDB) {
  return async (user: string, amount: bigint) => {
    db.hSet("users", user, JSON.stringify({
      address: user,
      unlocked: true,
      amountPaid: amount.toString(),
      indexedAt: Date.now()
    }));
  }
}