import React, { useState, useEffect, useRef } from 'react';
import supabase from '../supabaseClient';
import '../styles/Manage_Stalls.css';

export default function ManageStalls() {
  const [userAccess, setUserAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stallToDelete, setStallToDelete] = useState(null);
  const [editingStall, setEditingStall] = useState({
    id: null,
    Name: '',
    UserType: '',
    Password: '',
    Incharge: '',
  });
  const [newStall, setNewStall] = useState({
    Name: '',
    UserType: '',
    Password: '',
    Incharge: '',
  });
  const tableRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    fetchUserAccess();
    
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        if (buttonsRef.current && !buttonsRef.current.contains(event.target)) {
          setSelectedStall(null);
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowCreateModal(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchUserAccess = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('UserAccess')
        .select('id, created_at, UserType, Password, Name, Incharge')
        .order('id', { ascending: true });

      if (error) throw error;
      setUserAccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStall = async () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      if (!newStall.Name || !newStall.UserType || !newStall.Password || !newStall.Incharge) {
        throw new Error('All fields are required');
      }

      // Validate UserType format (valid SQL column name)
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newStall.UserType)) {
        throw new Error('User Type must start with a letter or underscore and contain only letters, numbers, and underscores');
      }

      // First insert into UserAccess
      const { data, error } = await supabase
        .from('UserAccess')
        .insert([{
          Name: newStall.Name,
          UserType: newStall.UserType,
          Password: newStall.Password,
          Incharge: newStall.Incharge
        }])
        .select();

      if (error) throw error;

      // Then add column to PointsTable using RPC - CORRECT PARAMETER NAME
      const { error: alterError } = await supabase.rpc('add_stall_column', {
        new_column_name: newStall.UserType  // Matches PostgreSQL function parameter
      });

      if (alterError) {
        // Rollback user creation if column add fails
        await supabase
          .from('UserAccess')
          .delete()
          .eq('id', data[0].id);
        throw alterError;
      }

      // Success - reset form and refresh
      setNewStall({ Name: '', UserType: '', Password: '' });
      setShowCreateModal(false);
      setSuccess(`Stall "${newStall.Name}" created successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      await fetchUserAccess();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditStall = async () => {
    if (!selectedStall) {
      setError('Please select a stall to edit');
      return;
    }
    
    try {
      setLoading(true);
      // Fetch the current stall data
      const { data, error } = await supabase
        .from('UserAccess')
        .select('*')
        .eq('id', selectedStall)
        .single();

      if (error) throw error;
      
      setEditingStall({
        id: data.id,
        Name: data.Name,
        UserType: data.UserType,
        Password: data.Password,
        Incharge: data.Incharge,
      });
      
      setShowEditModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setIsCreating(true);
      setError(null);
      
      if (!editingStall.Name || !editingStall.UserType || !editingStall.Password || !editingStall.Incharge) {
        throw new Error('All fields are required');
      }

      // Update the stall in UserAccess table
      const { error } = await supabase
        .from('UserAccess')
        .update({
          Name: editingStall.Name,
          UserType: editingStall.UserType,
          Password: editingStall.Password,
          Incharge: editingStall.Incharge,
        })
        .eq('id', editingStall.id);

      if (error) throw error;

      // Success - reset and refresh
      setShowEditModal(false);
      setSuccess(`Stall "${editingStall.Name}" updated successfully!`);
      setTimeout(() => setSuccess(null), 3000);
      await fetchUserAccess();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };


  const handleDeleteStall = async () => {
  if (!selectedStall) {
    setError('Please select a stall to delete');
    return;
  }

  // Find the stall to be deleted
  const stall = userAccess.find(stall => stall.id === selectedStall);
  setStallToDelete(stall);
  setShowDeleteConfirm(true);
};

const confirmDelete = async () => {
  try {
    setIsCreating(true);
    setError(null);
    
    const userType = stallToDelete.UserType;

    // First drop the column from PointsTable using RPC
    const { error: dropColumnError } = await supabase.rpc('drop_stall_column', {
      col_to_drop: userType  // This must match the PostgreSQL function parameter name
    });

    if (dropColumnError) throw dropColumnError;

    // Then delete from UserAccess
    const { error: deleteError } = await supabase
      .from('UserAccess')
      .delete()
      .eq('id', stallToDelete.id);

    if (deleteError) throw deleteError;

    // Success - reset and refresh
    setSelectedStall(null);
    setShowDeleteConfirm(false);
    setSuccess(`Stall "${stallToDelete.Name}" and its points column deleted successfully!`);
    setTimeout(() => setSuccess(null), 3000);
    await fetchUserAccess();
    
  } catch (err) {
    setError(err.message);
    // Attempt to restore if possible
    if (err.message.includes('column was removed but stall record deletion failed')) {
      try {
        // Try to recreate the column
        const { error: restoreError } = await supabase.rpc('add_stall_column', { 
          new_column_name: stallToDelete.UserType 
        });
        if (restoreError) throw restoreError;
      } catch (restoreError) {
        setError(`${err.message} | Failed to restore column: ${restoreError.message}`);
      }
    }
  } finally {
    setIsCreating(false);
    setShowDeleteConfirm(false);
  }
};

  if (loading) return (
    <div className="manage-stalls-container">
      <div className="manage-stalls-background-image"></div>
      <p>Loading user access data...</p>
    </div>
  );

  return (
    <div className="manage-stalls-container">
      <div className="manage-stalls-background-image"></div>
      {success && <div className="notification success">{success}</div>}
      {error && <div className="notification error">Error: {error}</div>}
      
      <h1>Stall Management</h1>
      
      <div className="table-wrapper" ref={tableRef}>
        <table className="user-access-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>User Type</th>
              <th>Password</th>
              <th>Stall Incharge</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {userAccess.length > 0 ? (
              userAccess.map((access) => (
                <tr 
                  key={access.id}
                  className={selectedStall === access.id ? 'selected-row' : ''}
                  onClick={() => setSelectedStall(access.id)}
                >
                  <td>{access.id}</td>
                  <td>{access.Name}</td>
                  <td>{access.UserType}</td>
                  <td>{access.Password}</td>
                  <td>{access.Incharge}</td>
                  <td>{new Date(access.created_at).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No user access records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="action-buttons" ref={buttonsRef}>
        <button className="create-btn" onClick={handleCreateStall}>
          Create Stall
        </button>
        <button 
          className="edit-btn"
          onClick={handleEditStall}
          disabled={!selectedStall}
        >
          Edit Stall
        </button>
        <button 
          className="delete-btn"
          onClick={handleDeleteStall}
          disabled={!selectedStall}
        >
          Delete Stall
        </button>
      </div>

      {/* Create Stall Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ position: 'relative' }}>
              <h2>Create New Stall</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowCreateModal(false)}
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '10px',
                  color: '#666'
                }}
              >
                &times;
              </button>
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newStall.Name}
                onChange={(e) => setNewStall({...newStall, Name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>User Type (Column Name):</label>
              <input
                type="text"
                value={newStall.UserType}
                onChange={(e) => setNewStall({...newStall, UserType: e.target.value})}
              />
              {newStall.UserType && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newStall.UserType) && (
                <p className="input-warning">
                  Must start with a letter/underscore and contain only letters, numbers, underscores
                </p>
              )}
            </div>
            <div className="form-group">
              <label>Stall Incharge:</label>
              <input
                type="text"
                value={newStall.Incharge}
                onChange={(e) => setNewStall({...newStall, Incharge: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={newStall.Password}
                onChange={(e) => setNewStall({...newStall, Password: e.target.value})}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                className="submit-btn" 
                onClick={handleCreateSubmit}
                disabled={isCreating || 
                  !newStall.Name || 
                  !newStall.UserType || 
                  !newStall.Password ||
                  !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newStall.UserType)
                }
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Stall Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header" style={{ position: 'relative' }}>
              <h2>Edit Stall</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowEditModal(false)}
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '10px',
                  color: '#666'
                }}
              >
                &times;
              </button>
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editingStall.Name}
                onChange={(e) => setEditingStall({...editingStall, Name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>User Type:</label>
              <input
                type="text"
                value={editingStall.UserType}
                onChange={(e) => setEditingStall({...editingStall, UserType: e.target.value})}
                disabled // UserType should typically not be editable as it's used as a column name
              />
            </div>
            <div className="form-group">
              <label>Stall Incharge:</label>
              <input
                type="text"
                value={editingStall.Incharge}
                onChange={(e) => setEditingStall({...editingStall, Incharge: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={editingStall.Password}
                onChange={(e) => setEditingStall({...editingStall, Password: e.target.value})}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button 
                className="submit-btn" 
                onClick={handleEditSubmit}
                disabled={isCreating || 
                  !editingStall.Name || 
                  !editingStall.Password
                }
              >
                {isCreating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <div className="modal-header" style={{ position: 'relative' }}>
              <h2>Confirm Delete</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  position: 'absolute',
                  top: '0',
                  right: '0',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '10px',
                  color: '#666'
                }}
              >
                &times;
              </button>
            </div>
            <div className="delete-confirm-message">
              <p>Are you sure you want to delete "{stallToDelete?.Name}"?</p>
              <p className="delete-confirm-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-confirm-buttons">
              <button 
                className="delete-cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isCreating}
              >
                Cancel
              </button>
              <button 
                className="delete-confirm-btn" 
                onClick={confirmDelete}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <span className="deleting-spinner"></span>
                    Deleting...
                  </>
                ) : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}