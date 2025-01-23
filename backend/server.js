const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Mock database
let streaks = [
  { id: 1, title: "Days Without Smoking", count: 5 },
  { id: 2, title: "Gym Streak", count: 10 },
];

let deletionLogs = [];

app.get("/api/streaks", (req, res) => {
  res.json(streaks);
});

// Reset streak endpoint
app.post("/api/streaks/:id/reset", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const streak = streaks.find((s) => s.id === parseInt(id));
  if (!streak) return res.status(404).send("Streak not found");

  // Log the reset
  // Here you can store the reset reason in a separate log table if necessary

  streak.count = 0;
  res.json(streak);
});

// Delete streak and log the deletion
app.post("/api/streaks/:id/delete", (req, res) => {
  const { id } = req.params;

  const streakIndex = streaks.findIndex((s) => s.id === parseInt(id));
  if (streakIndex === -1) return res.status(404).send("Streak not found");

  // Log the deletion
  const deletedStreak = streaks[streakIndex];
  deletionLogs.push({
    streakId: deletedStreak.id,
    deletedAt: new Date().toISOString(),
    reason: "User deleted the streak", // You can modify this to accept a reason from the frontend if needed
  });

  // Remove the streak
  streaks.splice(streakIndex, 1);
  res.json({ message: "Streak deleted successfully", logs: deletionLogs });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
