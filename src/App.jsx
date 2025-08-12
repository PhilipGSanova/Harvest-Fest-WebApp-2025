import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Stall from './pages/Stall';
import AddPoints from './pages/Add_Points';
import CreatePlayer from './pages/Create_Player';
import ManageStalls from './pages/Manage_Stalls';
import Scores from './pages/Scores';
import ViewScores from './pages/ViewScores';
import ManagePlayers from './pages/Manage_Players';
import GiftCounter from './pages/Gift_Counter';
import DeductPoints from './pages/Deduct_Points';
import Balance from './pages/Balance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Admin" element={
        <ProtectedRoute routeName="Admin">
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="/Stall" element={
        <ProtectedRoute routeName="Stall">
          <Stall />
        </ProtectedRoute>
      } />
      <Route path="/AddPoints" element={
        <ProtectedRoute routeName="AddPoints">
          <AddPoints />
        </ProtectedRoute>
      } />
      <Route path="/CreatePlayer" element={
        <ProtectedRoute routeName="CreatePlayer">
          <CreatePlayer />
        </ProtectedRoute>
      } />
      <Route path="/ManageStall" element={
        <ProtectedRoute routeName="ManageStall">
          <ManageStalls />
        </ProtectedRoute>
      } />
      <Route path="/Scores" element={
        <ProtectedRoute routeName="Scores">
          <Scores />
        </ProtectedRoute>
      } />
      <Route path="/ViewScores" element={<ViewScores />} />
      <Route path="/ManagePlayers" element={
        <ProtectedRoute routeName="ManagePlayers">
          <ManagePlayers />
        </ProtectedRoute>
      } />
      <Route path="/GiftCounter" element={
        <ProtectedRoute routeName="GiftCounter">
          <GiftCounter />
        </ProtectedRoute>
      } />
      <Route path="/DeductPoints" element={
        <ProtectedRoute routeName="DeductPoints">
          <DeductPoints />
        </ProtectedRoute>
      } />
      <Route path="/Balance" element={
        <ProtectedRoute routeName="Balance">
          <Balance />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;