import React, { useState, useEffect } from 'react';
import '../App.css';

export default function LoadingOverlay({ messages }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If there's only one message or none, don't set up an interval
    if (!messages || messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500); // Cycles every 2.5 seconds

    return () => clearInterval(interval);
  }, [messages]);

  // Fallback in case messages array is empty
  const currentText = messages && messages.length > 0 ? messages[currentIndex] : "Loading...";

  return (
    <div className="global-loading-overlay">
      <div className="loading-spinner"></div>
      <p className="loading-text">{currentText}</p>
    </div>
  );
}