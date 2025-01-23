const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Initialize SQLite database
const db = new sqlite3.Database("./streaks.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      `
      CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) console.error("Error creating streaks table:", err.message);
      }
    );

    db.run(
      `
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        streak_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reason TEXT,
        FOREIGN KEY (streak_id) REFERENCES streaks (id)
      )
    `,
      (err) => {
        if (err) console.error("Error creating logs table:", err.message);
      }
    );
  }
});

// Add a new streak
app.post("/api/streaks", (req, res) => {
  const { title, start_date, last_reset, reason } = req.body;

  // Ensure all necessary fields are present
  if (!title || !start_date || !last_reset) {
    return res.status(400).send({ error: "Title, start date, and last reset are required." });
  }

  // SQL query to insert new streak into the database
  const insertStreakQuery = `
    INSERT INTO streaks (title, start_date, last_reset)
    VALUES (?, ?, ?)
  `;

  // SQL query to insert a log entry into the logs table
  const logQuery = `
    INSERT INTO logs (streak_id, action, timestamp, reason)
    VALUES (?, 'create', ?, ?)
  `;

  const timestamp = new Date().toISOString();

  db.serialize(() => {
    // Insert the streak into the streaks table
    db.run(insertStreakQuery, [title, start_date, last_reset], function (err) {
      if (err) {
        console.error("Error inserting streak:", err.message);
        return res.status(500).json({ error: "Error creating streak" });
      }

      // After inserting the streak, insert a log entry with the streak ID
      const streakId = this.lastID; // `this.lastID` gives you the ID of the newly inserted streak

      // Insert the log entry for the created streak
      db.run(logQuery, [streakId, timestamp, title], (err) => {
        if (err) {
          console.error("Error logging streak creation:", err.message);
          return res.status(500).json({ error: "Error logging streak creation" });
        }

        // Respond with the newly created streak
        const newStreak = {
          id: streakId,
          title,
          start_date,
          last_reset,
        };

        res.status(201).json(newStreak); // Respond with the created streak
      });
    });
  });
});




// Get all streaks
app.get("/api/streaks", (req, res) => {
  const selectQuery = "SELECT * FROM streaks";

  db.all(selectQuery, [], (err, rows) => {
    if (err) {
      console.error("Error fetching streaks:", err.message);
      return res.status(500).send({ error: "Error fetching streaks" });
    }

    res.status(200).json(rows); // Send all streaks in the response
  });
});

// Reset a streak
app.post("/api/streaks/:id/reset", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const now = new Date().toISOString();
  const updateQuery = "UPDATE streaks SET last_reset = ? WHERE id = ?";
  const logQuery = "INSERT INTO logs (streak_id, action, reason) VALUES (?, 'reset', ?)";

  db.serialize(() => {
    // Update the streak's last reset timestamp
    db.run(updateQuery, [now, id], (err) => {
      if (err) {
        console.error("Error resetting streak:", err.message);
        return res.status(500).json({ error: "Error resetting streak" });
      }

      // Log the reset action
      db.run(logQuery, [id, reason || null], (err) => {
        if (err) {
          console.error("Error logging reset:", err.message);
          return res.status(500).json({ error: "Error logging reset" });
        }

        // Send success response after both queries
        res.status(200).json({ message: "Streak reset successfully" });
      });
    });
  });
});

// Delete a streak and log the deletion
app.post("/api/streaks/:id/delete", (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const getTitleQuery = "SELECT title FROM streaks WHERE id = ?";
  const deleteQuery = "DELETE FROM streaks WHERE id = ?";
  const logQuery = "INSERT INTO logs (streak_id, action, timestamp, reason) VALUES (?, 'delete', ?, ?)";

  const timestamp = new Date().toISOString();

  db.serialize(() => {
    // Fetch the title of the streak
    db.get(getTitleQuery, [id], (err, row) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ error: "Error fetching streak title" });
      }

      if (!row) {
        return res.status(404).json({ error: "Streak not found" });
      }

      const streakTitle = row.title;
      const logReason = streakTitle;

      // Log the deletion
      db.run(logQuery, [id, timestamp, logReason], (err) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: "Error logging deletion" });
        }

        // Perform the delete operation
        db.run(deleteQuery, [id], function (err) {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Error deleting streak" });
          } else if (this.changes === 0) {
            return res.status(404).json({ error: "Streak not found" });
          } else {
            return res.status(200).json({ message: "Streak deleted successfully" });
          }
        });
      });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
