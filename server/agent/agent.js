import { agent } from "./graph.js";

export async function assistant(userInput) {
  const response = await agent.invoke(
    {
      messages: [
        {
          role: "human",
          content: userInput,
        },
      ],
    }
    // { recursionLimit: 5 } // LATER THIS WILL BE UNCOMMENT WHEN TOOL LOGICS WILL BE ADDED TO GRAPH.
  );

  return response.messages.at(-1).content;
}
