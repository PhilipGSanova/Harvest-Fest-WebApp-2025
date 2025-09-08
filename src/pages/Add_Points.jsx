import React, { useState, useEffect } from 'react';
import '../styles/Add_Points.css';
import supabase from '../supabaseClient';

export default function AddPoints() {
  const [playerId, setPlayerId] = useState('');
  const [points, setPoints] = useState('');
  const [stallType, setStallType] = useState('');
  const [stallName, setStallName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [verifiedPlayer, setVerifiedPlayer] = useState(null);
  const [step, setStep] = useState(1); // 1: Verify Player, 2: Add Points

  useEffect(() => {
    const storedType = sessionStorage.getItem('stallType');
    if (storedType) setStallType(storedType);

    // Fetch stall name from UserAccess
    (async () => {
      const { data, error } = await supabase
        .from('UserAccess')
        .select('Name')
        .eq('UserType', storedType)
        .maybeSingle();
      
      if (!error && data) {
        setStallName(data.Name);
      } else {
        setStallName(storedType);
      }
    })();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleVerifyPlayer = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const trimmedPlayerId = playerId.trim();
      if (!trimmedPlayerId) {
        throw new Error('Player ID cannot be empty');
      }

      // Check if player exists
      const { data, error } = await supabase
        .from('PointsTable')
        .select('*')
        .eq('PlayerId', trimmedPlayerId)
        .maybeSingle();

      if (error) throw new Error(`Database error: ${error.message}`);
      if (!data) {
        setPlayerId('');
        throw new Error(`Player ${trimmedPlayerId} not found`);
      }
      setVerifiedPlayer(data);
      setStep(2); // Move to next step
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPoints = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const pointsValue = parseInt(points);
      if (isNaN(pointsValue) || pointsValue <= 0) {
        throw new Error('Points must be a positive number');
      }

      // Calculate new points
      const currentPoints = verifiedPlayer[stallType] || 0;
      const currentTotal = verifiedPlayer.Total || 0;
      const updatedPoints = currentPoints + pointsValue;
      const updatedTotal = currentTotal + pointsValue;

      // Update points
      const { error: updateError } = await supabase
        .from('PointsTable')
        .update({ 
          [stallType]: updatedPoints,
          Total: updatedTotal,
        })
        .eq('PlayerId', verifiedPlayer.PlayerId);

      if (updateError) throw new Error(`Update failed: ${updateError.message}`);

      // Fetch the updated data
      const { data: updatedData, error: refetchError } = await supabase
        .from('PointsTable')
        .select('*')
        .eq('PlayerId', verifiedPlayer.PlayerId)
        .maybeSingle();

      if (refetchError) throw new Error(`Failed to fetch updated data: ${refetchError.message}`);

      setPlayerData(updatedData);
      setMessage(`✅ Successfully added ${pointsValue} points to ${updatedData.Name || 'Player'} (ID: ${verifiedPlayer.PlayerId})`);
      setPoints('');
      
      // Reset after successful addition
      setTimeout(() => {
        setStep(1);
        setVerifiedPlayer(null);
        setPlayerData(null);
        setPlayerId('');
      }, 2000);
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-points-container">
      <div className="add-points-background-image"></div>
      <h1>{stallName} - Add Points</h1>

      <div className="add-points-box">
        {/* Step 1: Verify Player */}
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Enter Player ID"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              disabled={isLoading}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleVerifyPlayer()}
            />
            <div className='add-button-wrapper'>
              <button 
                onClick={handleVerifyPlayer}
                disabled={isLoading || !playerId}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Add Points */}
        {step === 2 && (
          <>
            <div className="player-name-display">
              Name: {verifiedPlayer?.Name || `ID: ${verifiedPlayer?.PlayerId}`}
            </div>
            <input
              type="number"
              placeholder="Enter Points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              disabled={isLoading}
            />
            <div className='add-button-wrapper'>
              <button 
                onClick={handleAddPoints}
                disabled={isLoading || !points}
              >
                {isLoading ? 'Processing...' : 'Add Points'}
              </button>
            </div>
          </>
        )}
      </div>

      {message && (
        <p className={`add-points-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}

      {playerData && (
        <div className="player-details">
          <h3><strong>Total Points: </strong>{playerData.Total || 0}</h3>
        </div>
      )}
    </div>
  );
}