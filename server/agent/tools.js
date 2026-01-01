import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

const tavily = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

const webSearch = tool(
  async ({ query }) => {
    const response = await tavily.invoke({ query });
    console.log("Tavily Search Response:", response);

    // Format the response more clearly for the AI
    if (typeof response === "string") {
      return response;
    }

    // If it's an object with results, format it nicely
    if (response.results && Array.isArray(response.results)) {
      const formattedResults = response.results
        .slice(0, 3) // Limit to top 3 results
        .map((r) => `${r.title}: ${r.content}`)
        .join("\n\n");
      return `Search results for "${query}":\n\n${formattedResults}`;
    }

    return JSON.stringify(response);
  },
  {
    name: "webSearch",
    description: "Search the internet for real-time or unknown informations",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

export const tools = [webSearch];
