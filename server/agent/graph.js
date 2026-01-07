import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { createModel } from "./model.js";
import { tools } from "./tools.js";
import { ToolMessage } from "@langchain/core/messages";
import { checkpointer } from "./memory.js";

const model = createModel(tools);

const toolsNode = new ToolNode(tools);

function trimMessages(messages, limit = 8) {
  const result = [];
  for (let i = messages.length - 1; i >= 0 && result.length < limit; i--) {
    const msg = messages[i];
    result.unshift(msg);

    // if tool message → also keep the assistant tool_call before it
    if (msg.constructor.name === ToolMessage) {
      const prev = messages[i - 1];
      if (prev?.tool_calls) {
        result.unshift(prev);
        i--;
      }
    }
  }
  return result;
}

// Call Agent Node
async function callAgent(state) {
  try {
    const systemMsg = state.messages.find((m) => m.role === "system");
    const trimmed = trimMessages(state.messages, 8);

    const finalMessages = systemMsg
      ? [systemMsg, ...trimmed.filter((m) => m.role !== "system")]
      : trimmed;

    const response = await model.invoke(finalMessages);
    return { messages: [response] };
  } catch (error) {
    if (error.message.startsWith("MISSING_EMAIL")) {
      const name = error.message.split(":")[1];
      return {
        messages: [
          {
            role: "assistant",
            content: `I don’t have an email for ${name}. Could you please provide it?`,
          },
        ],
      };
    }

    throw error;
  }
}

const whereToGo = (state) => {
  const lastMessage = state.messages.at(-1);

  // If we already have a tool result, force final answer
  if (lastMessage instanceof ToolMessage) {
    return "callAgent";
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
