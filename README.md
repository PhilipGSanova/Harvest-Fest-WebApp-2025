# React + Vite + Supabase

A React + Supabase web application for real-time player ranking and stall management, designed for events or competitions. This app allows you to create players, manage stalls, add points, and track live scores, all in a responsive and user-friendly interface.

## Features
__Player Management__
- Create Player: Add a new player with a unique Player ID, Name, and initialize points.<br>
- Edit Player: Update player details and scores.<br>
- Delete Player: Remove players from the system.

Stall Management
Create Stall: Add stalls with unique IDs and assign incharges.

Edit/Delete Stall: Modify or remove stall details.

Stall-Specific Operations:

Stall owners can log in to add points for players.

Points automatically update both total and game-specific columns.

Live Scores & Rankings
Real-Time Updates: Player scores update automatically using Supabase Realtime.

Highlight Rank Changes: Animate rank movements (up/down) for quick visualization.

Top 3 Rankings: Gold, Silver, and Bronze highlight.

Search Functionality: Search by Player ID or Name.

Responsive Design
Works smoothly on desktop, tablet, and mobile devices.

No horizontal scrolling; all columns are visible on mobile viewports.

Fixed action buttons for refresh and navigation.

Tech Stack
Frontend: React.js, React Icons

Backend: Supabase (PostgreSQL + Realtime)

Styling: CSS3, Flexbox, responsive media queries

State Management: React hooks (useState, useEffect, useRef, useCallback, useMemo)
