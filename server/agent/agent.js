import { agent } from "./graph.js";

async function main() {
  const response = await agent.invoke(
    {
      messages: [
        {
          role: "human",
          content: "Hello, how are you?",
        },
      ],
    }
    // { recursionLimit: 5 } // LATER THIS WILL BE UNCOMMENT WHEN TOOL LOGICS WILL BE ADDED TO GRAPH.
  );

  console.log("Final Response from Agent:", JSON.stringify(response, null, 2));
}

main();
