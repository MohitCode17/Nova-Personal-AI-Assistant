import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createModel } from "./model.js";
import { tools } from "./tools.js";
import { ToolMessage } from "@langchain/core/messages";
import { checkpointer } from "./memory.js";

const model = createModel(tools);

const toolsNode = new ToolNode(tools);

// Call Agent Node
async function callAgent(state) {
  try {
    // const MAX_MESSAGES = 8;
    // const trimmedMessages = state.messages.slice(-MAX_MESSAGES);

    const systemMsg = state.messages.find((m) => m.role === "system");
    const recent = state.messages.slice(-6);

    const trimmedMessages = systemMsg ? [systemMsg, ...recent] : recent;

    const response = await model.invoke(trimmedMessages);
    return { messages: [response] };
  } catch (error) {
    console.log("Call agent failed:", error);
  }
}

const whereToGo = (state) => {
  const lastMessage = state.messages.at(-1);

  // If we already have a tool result, force final answer
  if (lastMessage instanceof ToolMessage) {
    return "callAgent";
  }

  // Prevent multiple tool calls
  const hasToolResult = state.messages.some(
    (m) => m.constructor.name === "ToolMessage"
  );

  if (hasToolResult) {
    return "__end__";
  }

  if (lastMessage.tool_calls?.length > 0) {
    return "toolsNode";
  }

  return "__end__";
};

// Build the Agent Graph
const graph = new StateGraph(MessagesAnnotation)
  .addNode("callAgent", callAgent)
  .addNode("toolsNode", toolsNode)
  .addEdge("__start__", "callAgent")
  .addEdge("toolsNode", "callAgent")
  .addConditionalEdges("callAgent", whereToGo, {
    toolsNode: "toolsNode",
    __end__: "__end__",
  });

// Compiling the graph and export it.
export const agent = graph.compile({ checkpointer: checkpointer });
