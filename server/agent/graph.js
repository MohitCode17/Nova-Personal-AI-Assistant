import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { model } from "./model.js";

// Call Agent Node
async function callAgent(state) {
  console.log("State in call Agent:", state);
  console.log("State messages in call Agent:", state.messages);
  const response = await model.invoke(state.messages);
  console.log("CallAgent Res:", response);

  // Append to existing messages
  return { messages: [...state.messages, response] };
}

// Build the Agent Graph
const graph = new StateGraph(MessagesAnnotation)
  .addNode("callAgent", callAgent)
  .addEdge("__start__", "callAgent")
  .addEdge("callAgent", "__end__");

// Compiling the graph and export it.
export const agent = graph.compile();
