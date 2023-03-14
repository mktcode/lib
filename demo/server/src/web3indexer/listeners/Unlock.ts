import { Web3Indexer } from "@mktcodelib/web3indexer";

export default (indexer: Web3Indexer) => async (user: string, amount: bigint) => {
  indexer.db.hSet("users", user, JSON.stringify({
    address: user,
    unlocked: true,
    amountPaid: amount.toString(),
    indexedAt: Date.now()
  }));
}