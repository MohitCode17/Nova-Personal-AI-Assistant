import "dotenv/config";
import express from "express";
import cors from "cors";
import { google } from "googleapis";
import { assistant } from "./agent/agent.js";

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Ok" });
});

app.get("/auth", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/calendar"];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  console.log("URL:", url);
  res.redirect(url);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const { tokens } = await oauth2Client.getToken(code);

  console.log(tokens);

  res.send("Connected ✅ You can close this tab now.");
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, thread_id } = req.body;

    if (!message)
      return res
        .status(400)
        .json({ message: "Invalid query, message is required field." });

    const result = await assistant(message, thread_id);

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
