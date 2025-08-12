import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../NavigationContext';
import supabase from '../supabaseClient';
import '../styles/GiftCounter.css';

export default function GiftCounter() {
    const navigate = useNavigate();
    const { allowRoute } = useNavigation();

    const handleDeductPoints = () => {
        allowRoute('DeductPoints'); // Ensure the route is allowed
        navigate('/DeductPoints'); // Navigate to the Deduct Points page
    }
    const handleViewScores = () => {
        allowRoute('Scores'); // Ensure the route is allowed
        navigate('/Scores'); // Navigate to the Scores page
    };
    const handleViewBalance = () => {
        allowRoute('Balance'); // Ensure the route is allowed
        navigate('/Balance'); // Navigate to the Balance page
    };
    const handleLogout = () => {
        navigate(-1); // Navigate to the login page
    };
    return (
        <div className="stall-container">
            <div className="stall-background-image"></div>
            <h1>Gift Counter</h1>
            <p>This is your Dashboard, here you can deduct points from players based on their gift purchases and view their point balance</p>

            <div className="stall-actions">
                <button onClick={handleDeductPoints}>Deduct Points</button>
                <button onClick={handleViewScores}>View Scores</button>
                <button onClick={handleViewBalance}>Check Balance</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}