import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", (req, res) => {
  res.status(200).json({ message: "Ok" });
});

app.use("/api/chat", (req, res) => {
  const { message } = req.body;
  res.status(200).json({ message });
});

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
