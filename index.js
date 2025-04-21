import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 8080;

// Health check route
app.get("/health", (req, res) => {
  res.status(200).send("💓 Agent is alive");
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Agent listening on port ${PORT}`);
});

// Self-ping every 30 seconds to keep alive
setInterval(async () => {
  try {
    console.log("🔄 Self-ping: Still here 👋");
    await fetch(`http://localhost:${PORT}/health`);
  } catch (err) {
    console.error("❌ Self-ping failed:", err);
  }
}, 30000);

// Prevent exit
setInterval(() => {}, 1 << 30);
