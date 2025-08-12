import React, { useState } from 'react';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../NavigationContext';
import '../styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { allowRoute } = useNavigation();

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('UserAccess')
      .select('*')
      .eq('UserType', username)
      .single();

    if (error || !data) {
      setErrorMessage('Username is incorrect');
      return;
    }

    if (data.Password !== password) {
      setErrorMessage('Password is incorrect');
      return;
    }

    if (data.UserType === 'Admin') {
      allowRoute('Admin');
      navigate('/Admin');
    } else if (data.UserType.startsWith('Stall')) {
      sessionStorage.setItem('stallType', data.UserType); // ← Store before navigating
      allowRoute('Stall');
      navigate('/Stall');
    } else if (data.UserType === 'GiftCounter'){
      allowRoute('GiftCounter');
      navigate('/GiftCounter');
     }else {
      setErrorMessage('Invalid user type');
    }
  };

  return (
    <div className="login-outer">
      <div className="login-box">
        <h1 className="login-heading">Login</h1>

        <div className="input-wrapper username-wrapper">
          <input
            type="text"
            placeholder={usernameFocused ? '' : 'Username'}
            className="login-input"
            onFocus={() => setUsernameFocused(true)}
            onBlur={() => setUsernameFocused(false)}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-wrapper password-wrapper">
          <input
            type="password"
            placeholder={passwordFocused ? '' : 'Password'}
            className="login-input"
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {errorMessage && <div className="login-error">{errorMessage}</div>}

        <button type="button" className="login-button" onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;