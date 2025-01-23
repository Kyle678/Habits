import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [streaks, setStreaks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeStreakId, setActiveStreakId] = useState(null);
  const [resetReason, setResetReason] = useState("");

  useEffect(() => {
    fetch("/api/streaks")
      .then((res) => res.json())
      .then((data) => setStreaks(data));
  }, []);

  const handleResetClick = (streakId) => {
    setActiveStreakId(streakId);
    setShowModal(true);
  };

  const handleDeleteClick = (streakId) => {
    if (window.confirm("Are you sure you want to delete this streak?")) {
      fetch(`/api/streaks/${streakId}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(() => {
          setStreaks((prevStreaks) =>
            prevStreaks.filter((streak) => streak.id !== streakId)
          );
        })
        .catch((err) => {
          console.error("Error deleting streak:", err);
        });
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setResetReason("");
    setActiveStreakId(null);
  };

  const handleSubmit = () => {
    if (!resetReason.trim()) {
      alert("Please enter a reason for resetting the streak.");
      return;
    }

    fetch(`/api/streaks/${activeStreakId}/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason: resetReason }),
    })
      .then((res) => res.json())
      .then(() => {
        setStreaks((prevStreaks) =>
          prevStreaks.map((streak) =>
            streak.id === activeStreakId ? { ...streak, count: 0 } : streak
          )
        );
        handleCancel(); // Close the modal
      })
      .catch((err) => {
        console.error("Error resetting streak:", err);
      });
  };

  return (
    <div className="app">
      <h1>Your Streaks</h1>
      <div className="streaks-container">
        {streaks.map((streak) => (
          <div className="streak-card" key={streak.id}>
            <h2>{streak.title}</h2>
            <p>Count: {streak.count}</p>
            <button className='reset-button' onClick={() => handleResetClick(streak.id)}>Reset</button>
            <button className='delete-button' onClick={() => handleDeleteClick(streak.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Reset Modal */}
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
              <button onClick={handleCancel} className="cancel-button">
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
