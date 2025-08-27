import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken, setUsername }) {
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');

  const login = async () => {
    if (!inputUser.trim() || !inputPass.trim()) {
      alert('Please enter both username and password');
      return;
    }
    
    try {
      const res = await axios.post('http://localhost:4000/api/login', {
        username: inputUser,
        password: inputPass
      });
      setToken(res.data.token);
      setUsername(inputUser);
    } catch (e) {
      if (e.response?.data?.error) {
        alert(e.response.data.error);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    }
  };

  const register = async () => {
    if (!inputUser.trim() || !inputPass.trim()) {
      alert('Please enter both username and password');
      return;
    }
    
    if (inputPass.length < 3) {
      alert('Password must be at least 3 characters long');
      return;
    }
    
    try {
      await axios.post('http://localhost:4000/api/register', {
        username: inputUser,
        password: inputPass
      });
      alert('Registration successful! Now login with your credentials.');
      setInputPass(''); // Clear password after successful registration
    } catch (e) {
      if (e.response?.data?.error) {
        alert(e.response.data.error);
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div style={{ 
      padding: 40, 
      maxWidth: 400, 
      margin: '50px auto', 
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#e91e63', marginBottom: 30 }}>🍒 Cherry Game Login 🍒</h2>
      <div style={{ marginBottom: 20 }}>
        <input 
          placeholder="Username" 
          value={inputUser} 
          onChange={e => setInputUser(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && login()}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            marginBottom: '10px'
          }}
        />
      </div>
      <div style={{ marginBottom: 30 }}>
        <input 
          placeholder="Password" 
          type="password" 
          value={inputPass} 
          onChange={e => setInputPass(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && login()}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '5px'
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={login}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
        <button 
          onClick={register}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Login;