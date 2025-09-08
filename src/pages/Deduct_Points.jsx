import React, { useState, useEffect } from 'react';
import '../styles/Add_Points.css';
import supabase from '../supabaseClient';

export default function DeductPoints() {
    const [playerId, setPlayerId] = useState('');
    const [points, setPoints] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [playerData, setPlayerData] = useState(null);
    const [verifiedPlayer, setVerifiedPlayer] = useState(null);
    const [step, setStep] = useState(1);

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
            setStep(2);
        } catch (error) {
            setMessage(`❌ ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeductPoints = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            const pointsValue = parseInt(points, 10);
            if (isNaN(pointsValue) || pointsValue <= 0) {
                throw new Error('Please enter a valid number of points to deduct');
            }

            if (!verifiedPlayer) {
                throw new Error('No player selected for deduction');
            }

            const currentBalance = verifiedPlayer.Balance || 0;
            const currentDeductedPoints = verifiedPlayer.Deducted || 0;

            if (currentBalance < pointsValue) {
                throw new Error('Insufficient points to deduct');
            }

            const updatedBalance = currentBalance - pointsValue;
            const updatedDeducted = currentDeductedPoints + pointsValue;

            const { error: updateError } = await supabase
                .from('PointsTable')
                .update({ 
                    Total: updatedBalance,
                    Deducted: updatedDeducted
                })
                .eq('PlayerId', verifiedPlayer.PlayerId);

            if (updateError) throw new Error(`Database error: ${updateError.message}`);

            const { data: updatedData, error: refetchError } = await supabase
                .from('PointsTable')
                .select('*')
                .eq('PlayerId', verifiedPlayer.PlayerId)
                .maybeSingle();

            if (refetchError) throw new Error(`Failed to fetch updated data: ${refetchError.message}`);

            setPlayerData(updatedData);
            setPoints('');
            setMessage(`✅ Successfully deducted ${pointsValue} points from Player ID ${verifiedPlayer.PlayerId}`);

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
      <h1>Deduct Points</h1>

      <div className="add-points-box">
        {/* Verify Player */}
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

        {/* Add Points */}
        {step === 2 && (
          <>
            <div className="player-name-display">
              Name: {verifiedPlayer?.Name || `ID: ${verifiedPlayer?.PlayerId}`}
              <br/>
              Total Points: {verifiedPlayer?.Total || 0}
            </div>
            <input
              type="number"
              placeholder="Enter Points to Deduct"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              disabled={isLoading}
            />
            <div className='add-button-wrapper'>
              <button 
                onClick={handleDeductPoints}
                disabled={isLoading || !points}
              >
                {isLoading ? 'Processing...' : 'Deduct'}
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
          <h3><strong>Balance: </strong>{playerData.Total || 0}</h3>
        </div>
      )}
    </div>
  );
}