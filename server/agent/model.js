import { ChatOpenAI } from "@langchain/openai";

export function createModel(tools) {
  return new ChatOpenAI({
    model: "gpt-5-mini-2025-08-07",
    maxCompletionTokens: 500,
    reasoning: { effort: "low" },
  }).bindTools(tools);
}
