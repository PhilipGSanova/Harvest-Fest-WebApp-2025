import React, { useState } from 'react';
import '../styles/Create_Player.css';
import supabase from '../supabaseClient';

export default function CreatePlayer() {
  const [playerId, setPlayerId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleCreatePlayer = async () => {
  if (!playerId || !playerName) {
    showMessage('Both fields are required.', 'error');
    return;
  }

  try {
    // Check if Player ID already exists
    const { data: existingPlayers, error: fetchError, count } = await supabase
      .from('PointsTable')
      .select('*', { count: 'exact' })
      .eq('PlayerId', playerId);

    if (fetchError) {
      throw fetchError;
    }

    if (count && count > 0) {
      showMessage('Player ID already exists.', 'error');
      return;
    }

    // Insert new player
    const { error: insertError } = await supabase.from('PointsTable').insert([
      {
        PlayerId: playerId,
        Name: playerName,
        Total: 0,
        Stall1: 0,
        Stall2: 0,
        Stall3: 0,
        Deducted: 0
      }
    ]);

    if (insertError) {
      throw insertError;
    }

    showMessage(`Player ${playerName} created successfully!`, 'success');
    setPlayerId('');
    setPlayerName('');
  } catch (error) {
    console.error('Error:', error);
    // Handle unique constraint violation specifically
    if (error.code === '23505') {
      showMessage('Player ID already exists.', 'error');
    } else {
      showMessage(error.message || 'Failed to create player.', 'error');
    }
  }
};


  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 2000);
  };

  return (
    <div className="create-player-container">
      <div className="create-player-background-image"></div>
      <h1>Create New Player</h1>

      <div className="create-player-box">
        <input
          type="text"
          placeholder="Enter Player Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Player ID"
          value={playerId}
          onChange={(e) => setPlayerId(e.target.value)}
        />

        <div className="create-button-wrapper">
          <button onClick={handleCreatePlayer}>Create Player</button>
        </div>

        {message && (
          <p
            className="create-player-message"
            style={{ color: messageType === 'success' ? 'lightgreen' : 'red' }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}