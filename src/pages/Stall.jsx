import React, { useEffect, useState } from 'react';
import '../styles/Stall.css';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../NavigationContext';
import supabase from '../supabaseClient';   // ✅ Missing import added

export default function Stall() {
  const [stallType, setStallType] = useState('Stall');
  const [stallIncharge, setStallIncharge] = useState('');
  const navigate = useNavigate();
  const { allowRoute } = useNavigation();

  useEffect(() => {
    const storedStallType = sessionStorage.getItem('stallType');
    if (!storedStallType) return;

    setStallType(storedStallType);

    (async () => {
      const { data, error } = await supabase
        .from('UserAccess')
        .select('Incharge')
        .eq('UserType', storedStallType)
        .maybeSingle();

      if (!error && data) {
        setStallIncharge(data.Incharge);
      } else {
        setStallIncharge('Incharge');
      } 
    })();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('stallType');
    navigate('/');
  };

  const handleViewScores = () => {
    allowRoute('Scores');
    navigate('/Scores');
  };

  const handleViewBalance = () => {
    allowRoute('Balance');
    navigate('/Balance');
  };

  const handleAddPoints = () => {
    allowRoute('AddPoints');
    navigate('/AddPoints');
  };

  return (
    <div className="stall-container">
      <div className="stall-background-image"></div>
      <h1>Welcome, {stallIncharge}</h1>
      <p>This is your Stall Dashboard, here you can add points to players and view their total points</p>

      <div className="stall-actions">
        <button onClick={handleAddPoints}>Add Points</button>
        <button onClick={handleViewScores}>View Scores</button>
        <button onClick={handleViewBalance}>Check Balance</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
