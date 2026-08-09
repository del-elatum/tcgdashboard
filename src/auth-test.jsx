import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './supabase';

function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function signIn() {
    setMessage('Signing in...');

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Signed in successfully.');
  }

  async function registerPasskey() {
    setMessage('Starting passkey registration...');

    const { data, error } =
      await supabase.auth.passkey.registerPasskey();

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    console.log('Registered passkey:', data);
    setMessage('Passkey registered successfully.');
  }

  async function signInWithPasskey() {
    setMessage('Waiting for passkey...');

    const { data, error } =
      await supabase.auth.passkey.signInWithPasskey();

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    console.log('Passkey login:', data);
    setMessage('Signed in with passkey.');
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '80px auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>The Crochet Garden</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 10,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 10,
        }}
      />

      <button
        onClick={signIn}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 10,
        }}
      >
        Sign in
      </button>

      <button
        onClick={registerPasskey}
        style={{
          width: '100%',
          padding: 12,
          marginBottom: 10,
        }}
      >
        Register Passkey
      </button>

      <button
        onClick={signInWithPasskey}
        style={{
          width: '100%',
          padding: 12,
        }}
      >
        Sign in with Passkey
      </button>

      <p>{message}</p>
    </div>
  );
}

ReactDOM.createRoot(
  document.getElementById('app')
).render(<AuthTest />);
