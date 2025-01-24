import React, { useState, useEffect } from "react";
import "./App.css";

import StreakChart from "./StreakChart";

function App() {
  const [streaks, setStreaks] = useState([]);
  const [newStreakTitle, setNewStreakTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeStreakId, setActiveStreakId] = useState(null);
  const [resetReason, setResetReason] = useState("");
  
  // Fetch streaks from the server
  const fetchStreaks = () => {
    setStreaks([]);
    /*
    fetch("/api/streaks")
      .then((res) => res.json())
      .then((data) => {
        setStreaks(data); // Update the state with the fetched streaks
      })
      .catch((err) => console.error("Error fetching streaks:", err));
      */
  };

  // Call fetchStreaks when the component mounts or whenever necessary
  useEffect(() => {
    fetchStreaks();
  }, []);

  const calculateDaysSince = (timestamp) => {
    const lastResetDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - lastResetDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert ms to days
  };

// Handle adding a new streak
const handleAddStreak = () => {
  // Validate if the title is empty
  if (!newStreakTitle.trim()) {
    alert("Please provide a title for the streak.");
    return;
  }

  // Send request to the backend to add the streak
  fetch("/api/streaks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newStreakTitle,
      start_date: new Date().toISOString(), // Store current date as start_date
      last_reset: new Date().toISOString(), // Set last_reset as the current date
    }),
  })
    .then((res) => res.json())
    .then((newStreak) => {
      if (newStreak.error) {
        alert(newStreak.error); // Display any error from the server
      } else {
        setStreaks((prevStreaks) => [...prevStreaks, newStreak]); // Update streaks list
        setNewStreakTitle(""); // Clear input field
      }
    })
    .catch((err) => console.error("Error adding streak:", err));
};
  

  const handleResetClick = (streakId) => {
    setActiveStreakId(streakId);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!resetReason.trim()) {
      alert("Please enter a reason for resetting the streak.");
      return;
    }

    fetch(`/api/streaks/${activeStreakId}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: resetReason }),
    })
      .then((res) => res.json())
      .then(() => {
        setStreaks((prevStreaks) =>
          prevStreaks.map((streak) =>
            streak.id === activeStreakId
              ? { ...streak, last_reset: new Date().toISOString() }
              : streak
          )
        );
        setShowModal(false);
        setResetReason("");
      })
      .catch((err) => console.error("Error resetting streak:", err));
  };

  const handleDeleteClick = (streakId) => {
    if (window.confirm("Are you sure you want to delete this streak?")) {
      fetch(`/api/streaks/${streakId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to delete streak");
          }
          return res.json();
        })
        .then(() => {
          // Optimistically update the state to remove the deleted streak
          setStreaks((prevStreaks) =>
            prevStreaks.filter((streak) => streak.id !== streakId)
          );
        })
        .catch((err) => {
          console.error("Error deleting streak:", err);
        });
    }
  };
  

  return (
    <div className="app">
      <h1>Your Streaks</h1>
      <StreakChart />
      <div className="add-streak-form">
        <input
          type="text"
          value={newStreakTitle}
          onChange={(e) => setNewStreakTitle(e.target.value)}
          placeholder="Enter new streak title"
        />
        <button onClick={handleAddStreak}>Add Streak</button>
      </div>

      <div className="streaks-container">
        {streaks.map((streak) => (
          <div className="streak-card" key={streak.id}>
            <h2>{streak.title}</h2>
            <p>Days: {calculateDaysSince(streak.last_reset)}</p>
            <button onClick={() => handleResetClick(streak.id)}>Reset</button>
            <button className='delete-button' onClick={() => handleDeleteClick(streak.id)}>Delete</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Reset Streak</h3>
            <p>Why are you resetting this streak?</p>
            <textarea
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
              placeholder="Enter your reason here"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleSubmit} className="submit-button">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
