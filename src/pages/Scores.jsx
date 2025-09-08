import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

  const fetchScores = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('PointsTable')
        .select('PlayerId, Name, Total')
        .order('Total', { ascending: false });

      if (error) throw error;

      const newPlayers = data?.map((player, index) => ({
        ...player,
        rank: index + 1,
      })) || [];

      const changes = {};
      newPlayers.forEach(newPlayer => {
        const oldPlayer = prevPlayersRef.current.find(p => p.PlayerId === newPlayer.PlayerId);
        if (oldPlayer) {
          if (newPlayer.rank < oldPlayer.rank) changes[newPlayer.PlayerId] = 'up';
          if (newPlayer.rank > oldPlayer.rank) changes[newPlayer.PlayerId] = 'down';
        }
      });

      setHighlightChanges(changes);
      prevPlayersRef.current = newPlayers;
      setPlayers(newPlayers);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch scores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();

    const subscription = supabase
      .channel('points-table-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PointsTable' },
        fetchScores
      );

    const sub = subscription.subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [fetchScores]);

  useEffect(() => {
    const timer = setTimeout(() => setHighlightChanges({}), 2000);
    return () => clearTimeout(timer);
  }, [highlightChanges]);

  const filteredPlayers = useMemo(() => (
    players.filter(player => {
      const query = searchQuery.toLowerCase();
      return (
        player.Name.toLowerCase().includes(query) ||
        player.PlayerId.toString().includes(query)
      );
    })
  ), [players, searchQuery]);

  const handleBack = () => navigate(-1);

  if (loading) return <div className="scores-container">Loading Player Rankings...</div>;
  if (error) return <div className="scores-container">Error: {error}</div>;

  return (
    <div className="scores-container">
      <div className="scores-background-image"></div>
      <h1>Live Player Rankings</h1>

      <div className="search-container">
        <FaSearch 
          className="search-icon" 
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Toggle search"
        />
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
        {filteredPlayers.length > 0 ? (
          <table className="scores-table">
            <thead>
              <tr>
                <th>Rank</th>
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
                  <td>{player.Name}</td>
                  <td>{player.Total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No matching players found.</p>
        )}
      </div>

      <div className="fixed-actions">
        <button onClick={handleBack} >Back to Dashboard</button>
        <button onClick={fetchScores} >Refresh Scores</button>
      </div>
    </div>
  );
}