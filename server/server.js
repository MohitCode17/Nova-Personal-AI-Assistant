import "dotenv/config";
import express from "express";
import cors from "cors";
import { assistant } from "./agent/agent.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message)
      return res
        .status(400)
        .json({ message: "Invalid query, message is required field." });

    const result = await assistant(message);

    res.status(200).json({ message: result });
  } catch (error) {
    console.log("Agent failed with error:", error);
    res.status(500).json({ message: "Agent failed." });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
