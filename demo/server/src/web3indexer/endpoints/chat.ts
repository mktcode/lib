import { Web3IndexerDB } from "@mktcodelib/web3indexer";

export function ChatEndpoint(db: Web3IndexerDB) {
  return async (req: any, res: any) => {
    const signerAddress = req.headers["EOA-Signer"];

    if (!signerAddress) {
      res.status(401).send("Unauthorized. No signature provided.");
      return;
    }

    const userJson = await db.hGet('users', signerAddress);
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user || !user.unlocked) {
      res.status(401).send("Unauthorized. You need to send 0.1 ETH to unlock this endpoint.");
    } else {
      res.send(req.params.message);
    }
  }
}