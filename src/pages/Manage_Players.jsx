import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import '../styles/Manage_Players.css';
import { FaSearch } from 'react-icons/fa';

export default function Manage_Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [playerDelete, setPlayerDelete] = useState(null);
  const buttonsRef = React.useRef(null);

  const EXCLUDE_COLUMNS = ['your_column_name_here', 'created_at'];
  const ALWAYS_LAST = ['Total', 'Deducted', 'Balance'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from('PointsTable').select('*');
        if (error) throw error;

        if (data.length > 0) {
          let allCols = Object.keys(data[0]).filter(
            col => !EXCLUDE_COLUMNS.includes(col)
          );

          const dynamicCols = allCols.filter(col => !ALWAYS_LAST.includes(col));
          const finalCols = [...dynamicCols, ...ALWAYS_LAST.filter(col => allCols.includes(col))];

          setColumns(finalCols);
          setPlayers(data);
        }
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.toLowerCase();
    return (
      player?.Name?.toLowerCase().startsWith(query) ||
      player?.PlayerId?.toString().startsWith(query)
    );
  });

  const handleEditPlayer = async () => {
    if (!selectedPlayer) {
      setError('Please select a player to edit.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('PointsTable')
        .select('*')
        .eq('PlayerId', selectedPlayer)
        .single();
      if (error) throw error;

      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([key]) => !['created_at', 'your_column_name_here', 'id'].includes(key)
        )
      );

      setEditingPlayer(cleanedData);
      setShowEditModal(true);
    } catch (err) {
      setError('Failed to fetch player: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const updatedData = { ...editingPlayer };
      delete updatedData.created_at;
      delete updatedData.your_column_name_here;
      delete updatedData.id;

      const { error } = await supabase
        .from('PointsTable')
        .update(updatedData)
        .eq('PlayerId', editingPlayer.PlayerId);

      if (error) throw error;

      const { data: refreshedPlayers, error: fetchError } = await supabase.from('PointsTable').select('*');
      if (fetchError) throw fetchError;

      setPlayers(refreshedPlayers);
      setShowEditModal(false);
      setEditingPlayer(null);
      setSelectedPlayer(null);
    } catch (err) {
      setError('Failed to update player: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlayer = () => {
    if (!selectedPlayer) {
      setError('Please select a player to delete.');
      return;
    }

    const player = players.find(p => p.PlayerId === selectedPlayer);
    if (!player) {
      setError('Selected player not found.');
      return;
    }

    setPlayerDelete(player);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('PointsTable')
        .delete()
        .eq('PlayerId', selectedPlayer);

      if (error) throw error;

      setPlayers(prev => prev.filter(p => p.PlayerId !== selectedPlayer));
      setSelectedPlayer(null);
      setPlayerDelete(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError('Failed to delete player: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-players-container">
      <div className="manage-players-background-image"></div>
      <h1>Manage Players</h1>
      {error && <p className="error">{error}</p>}

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
        <div className="manage-players-content">
          {filteredPlayers.length > 0 ? (
            <table className="points-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, idx) => (
                  <tr key={idx} onClick={() => setSelectedPlayer(player.PlayerId)} className={player.PlayerId === selectedPlayer ? 'selected-row' : ''}>
                    {columns.map(col => (
                      <td key={col}>{player[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No players found.</p>
          )}
        </div>
      </div>

      <div className="action-buttons" ref={buttonsRef}>
        <button className="edit-btn" onClick={handleEditPlayer} disabled={!selectedPlayer}>Edit Player</button>
        <button className="delete-btn" onClick={handleDeletePlayer} disabled={!selectedPlayer}>Delete Player</button>
      </div>

      {showEditModal && editingPlayer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ position: 'relative' }}>
              <h2>Edit Player</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)} style={{
                position: 'absolute', top: '0', right: '0', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: '1.5rem', padding: '10px', color: '#666'
              }}>&times;</button>
            </div>

            <form onSubmit={handleUpdatePlayer} className="edit-form">
              {Object.entries(editingPlayer).map(([key, value]) => {
                if (['created_at', 'your_column_name_here', 'id'].includes(key)) return null;
                return (
                  <div key={key} className="form-group">
                    <label>{key}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setEditingPlayer(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                );
              })}

              <div className="form-actions">
                <button type="submit" className="save-btn">Save</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteConfirm && playerDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="close-btn" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
            </div>
            <p>Are you sure you want to delete player {playerDelete.Name} (ID: {playerDelete.PlayerId})?</p>
            <p className="delete-confirm-warning">This action cannot be undone.</p>
            <div className="form-actions">
              <button onClick={confirmDelete} className="delete-confirm-btn">Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}