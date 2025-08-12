import React, { useEffect, useState } from 'react';
import '../styles/Stall.css';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../NavigationContext';

export default function Stall() {
  const [stallType, setStallType] = useState('Stall');
  const navigate = useNavigate();
  const { allowRoute } = useNavigation();

  useEffect(() => {
    const storedStallType = sessionStorage.getItem('stallType');
    if (storedStallType) {
      setStallType(storedStallType);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('stallType');
    navigate('/');
  };

  const handleViewScores = () => {
    allowRoute('Scores'); // Ensure the route is allowed
    navigate('/Scores'); // Navigation to Scores page
  };

  const handleAddPoints = () => {
    allowRoute('AddPoints'); // Ensure the route is allowed
    navigate('/AddPoints'); // <-- Make sure this route is configured in your router
  };

  return (
    <div className="stall-container">
      <div className="stall-background-image"></div>
      <h1>Welcome, {stallType}</h1>
      <p>This is your Stall Dashboard, here you can add points to players and view their total points</p>

      <div className="stall-actions">
        <button onClick={handleAddPoints}>Add Points</button>
        <button onClick={handleViewScores}>View Scores</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}