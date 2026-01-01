import { agent } from "./graph.js";

export async function assistant(userInput) {
  const response = await agent.invoke(
    {
      messages: [
        {
          role: "system",
          content: `
You are Nova, a reliable personal AI assistant.

IMPORTANT RULES:
- You may call a tool ONLY ONCE per user query.
- After receiving a tool result, you MUST produce a final answer.
- NEVER call a second tool for the same question.
- Respond in 1–2 concise sentences only.
- Do NOT include reasoning or analysis.

Current UTC time: ${new Date().toUTCString()}
`,
        },
        {
          role: "human",
          content: userInput,
        },
      ],
    },
    // Ensures that even if callAgent keeps asking tools, it stops after N iterations. Prevent the infinite looping
    { recursionLimit: 6 }
  );

  return response.messages.at(-1).content;
}
