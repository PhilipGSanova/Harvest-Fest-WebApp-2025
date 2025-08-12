import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import '../styles/Scores.css';
import { FaSearch } from 'react-icons/fa';

export default function Scores() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [highlightChanges, setHighlightChanges] = useState({});
  const prevPlayersRef = useRef([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('PointsTable')
        .select('PlayerId, Name, Total')
        .order('Total', { ascending: false });

      if (error) throw error;

      setPlayers(prevPlayers => {
        const newPlayers = data.map((player, index) => ({
          ...player,
          rank: index + 1
        }));

        // Calculate ranking changes
        const changes = {};
        newPlayers.forEach(newPlayer => {
          const oldPlayer = prevPlayersRef.current.find(p => p.PlayerId === newPlayer.PlayerId);
          if (oldPlayer) {
            if (newPlayer.rank < oldPlayer.rank) changes[newPlayer.PlayerId] = 'up';
            if (newPlayer.rank > oldPlayer.rank) changes[newPlayer.PlayerId] = 'down';
          }
        });

        setHighlightChanges(changes);
        setTimeout(() => setHighlightChanges({}), 2000);
        
        prevPlayersRef.current = newPlayers;
        return newPlayers;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchScores();

    // Real-time subscription
    const subscription = supabase
      .channel('points-table-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'PointsTable',
        },
        () => {
          console.log('Change detected - refreshing data...');
          fetchScores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.toLowerCase();
    return (
      player.Name.toLowerCase().startsWith(query) ||
      player.PlayerId.toString().startsWith(query)
    )
  });

  if (loading) return (
    <div className="scores-container">
      <div className="scores-background-image"></div>
      <p>Loading scores...</p>
    </div>
  );

  if (error) return (
    <div className="scores-container">
      <div className="scores-background-image"></div>
      <p className="error">Error: {error}</p>
      <button onClick={handleBack}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="scores-container">
      <div className="scores-background-image"></div>
      <h1>Live Player Rankings</h1>
      
      <div className="search-container">
        <FaSearch className="search-icon" onClick={() => setShowSearch(!showSearch)} />
          {showSearch && (
            <input
              type="text"
              className="search-input"
              placeholder="Search by Player ID or Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
      </div>
      <div className="table-wrapper">
        <div className="scores-content">
          {players.length > 0 ? (
            <table className="scores-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player ID</th>
                  <th>Name</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr 
                    key={player.PlayerId}
                    className={highlightChanges[player.PlayerId] || ''}
                  >
                    <td>{player.rank}</td>
                    <td>{player.PlayerId}</td>
                    <td>{player.Name}</td>
                    <td>{player.Total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No players found</p>
          )}
        </div>
      </div>

      <div className="fixed-actions">
        <button onClick={fetchScores} className="refresh-btn">Refresh Scores</button>
      </div>
    </div>
  );
}