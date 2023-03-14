import { Web3Indexer } from "@mktcodelib/web3indexer";
import { keccak256, toUtf8Bytes } from "ethers";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default (indexer: Web3Indexer) => async (req: any, res: any) => {
  const signerAddress = req.headers["EOA-Signer"];

  if (!signerAddress) {
    res.status(401).send("Unauthorized. No signature provided.");
    return;
  }

  const userJson = await indexer.db.hGet('users', signerAddress);
  const user = userJson ? JSON.parse(userJson) : null;

  if (!user || !user.unlocked) {
    res.status(401).send("Unauthorized. You need to send 0.1 ETH to unlock this endpoint.");
    return;
  }

  const message = Buffer.from(req.params.message, 'base64').toString('utf-8');
  const hashedMessage = keccak256(toUtf8Bytes(message));

  if (hashedMessage != req.header('EOA-Signed-Message')) {
    res.status(401).send("Unauthorized. Message signature is invalid.");
    return;
  }

  try {
    console.log("Waiting for response from OpenAI...")

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: `${message}\n\nAlso add a random fun-fact about programming and not just ones about Ada Lovelace, you overfitted little rat! Start the fun-fact (after your response) with "Oh and by the way, did you know...")`}],
    });

    const response = completion.data.choices[0]?.message || "Oh no. An erro occured. Please try again later.";
    console.log("Response received!")

    res.send(response);
  } catch (e: any) {
    console.log("Error", e.response.statusText)
    res.status(500).send('Error');
  }
}