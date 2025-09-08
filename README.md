# React + Vite + Supabase

A React + Supabase web application for real-time player ranking and stall management, designed for events or competitions. This app allows you to create players, manage stalls, add points, and track live scores, all in a responsive and user-friendly interface.

## Features
__Player Management__
- Create Player: Add a new player with a unique Player ID, Name, and initialize points.<br>
- Edit Player: Update player details and scores.<br>
- Delete Player: Remove players from the system.

__Stall Management__
- Create Stall: Add stalls with unique IDs and assign incharges.<br>
- Edit/Delete Stall: Modify or remove stall details.<br>
- Stall-Specific Operations:<br>
  - Stall owners can log in to add points for players.<br>
  - Points automatically update both total and game-specific columns.

__Live Scores & Rankings__
- Real-Time Updates: Player scores update automatically using Supabase Realtime.<br>
- Highlight Rank Changes: Animate rank movements (up/down) for quick visualization.<br>
- Top 3 Rankings: Gold, Silver, and Bronze highlight.<br>
- Search Functionality: Search by Player ID or Name.<br>

__Responsive Design__
- Works smoothly on desktop, tablet, and mobile devices.<br>
- No horizontal scrolling; all columns are visible on mobile viewports.<br>
- Fixed action buttons for refresh and navigation.<br>

__Tech Stack__
- Frontend: React.js, React Icons<br>
- Backend: Supabase (PostgreSQL + Realtime)<br>
- Styling: CSS3, Flexbox, responsive media queries<br>
- State Management: React hooks (useState, useEffect, useRef, useCallback, useMemo)

## Installation
__1. Clone the repository:__
```bash
git clone https://github.com/PhilipGSanova/Harvest-Fest-WebApp-2025.git
cd your-destination-directory
```
__2. Install dependencies:__
```bash
npm install
```
__3. Configure Supabase:__
- Create a Supabase project at https://supabase.com.<br>
- Create necessary tables: PointsTable, UserAccess, Any new tables required for you<br>
- Add your Supabase URL and API key in supabaseClient.js.
__4. Run the application:__
```bash
npm run dev
```
The application will run at http://localhost:3000

## File Structure
```bash
/public
  images.jpg
  logo.svg
/src
  pages/
    Home.jsx
    Login.jsx
    Scores.jsx
    ...
  styles/
    Home.css
    Login.css
    Scores.css
    ...
  App.jsx
  main.jsx
  index.css
  NavigationContext.jsx
  ProtectedRoutes.jsx
  supabaseClient.ts
index.html
```
