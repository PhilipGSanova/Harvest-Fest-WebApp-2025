import React from 'react';
import '../styles/Admin.css';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../NavigationContext';

export default function Admin() {
  const navigate = useNavigate();
  const { allowRoute } = useNavigation();

  const handleLogout = () => {
    navigate(-1);
  };

  const handleCreatePlayer = () => {
    allowRoute('CreatePlayer');
    navigate('/CreatePlayer'); // Navigate to the Create Player page
  };

  const handleManageStall = () => {
    allowRoute('ManageStall');
    navigate('/ManageStall');
  };

  const handleManagePlayers = () => {
    allowRoute('ManagePlayers');
    navigate('/ManagePlayers');
  };

  return (
    <div className="admin-container">
      <div className="admin-background-image"></div>

      <h1>Welcome, Admin</h1>
      <p>This is the admin dashboard. You can manage players, view reports, and perform admin tasks here.</p>

      <div className="admin-actions">
        <button onClick={handleCreatePlayer}>Create Player</button>
        <button onClick={handleManageStall}>Manage Stall</button>
        <button onClick={handleManagePlayers}>Manage Players</button>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}