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

      // Use Supabase's rpc to call the PostgreSQL function
      const { data: stallColumns, error: colError } = await supabase
        .rpc('get_columns_starting_with', {
          table_name: 'PointsTable',
          schema_name: 'public',
          prefix: 'Stall'
        });

      if (colError) {
        throw colError;
      }

      // Create and insert new player
      const newPlayer = createPlayerObject(playerId, playerName, stallColumns || []);
      await insertPlayer(newPlayer);

      showMessage(`Player ${playerName} created successfully!`, 'success');
      setPlayerId('');
      setPlayerName('');
    } catch (error) {
      console.error('Error:', error);
      if (error.code === '23505') {
        showMessage('Player ID already exists.', 'error');
      } else {
        showMessage(error.message || 'Failed to create player.', 'error');
      }
    }
  };

  // Helper function to create player object
  const createPlayerObject = (id, name, stallColumns) => {
    const newPlayer = {
      PlayerId: id,
      Name: name,
      Total: 0,
      Deducted: 0,
      Balance: 0,
      GiftCounter: 0,
    };

    // Initialize all Stall columns to 0
    stallColumns.forEach(stallCol => {
      newPlayer[stallCol] = 0;
    });

    return newPlayer;
  };

  // Helper function to insert player
  const insertPlayer = async (player) => {
    const { error: insertError } = await supabase
      .from('PointsTable')
      .insert([player]);

    if (insertError) {
      throw insertError;
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