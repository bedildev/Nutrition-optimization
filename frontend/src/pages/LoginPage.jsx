import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocal } from '../context/LocalContext';
import useInput from '../hooks/useInput';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useLocal();
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      login({ email, password });
      navigate('/homepage');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-hero">
        <span className="eyebrow">Login Page</span>
        <h1>Masuk ke workspace NutriAI</h1>
        <p>Gunakan akun demo atau akun yang Anda daftarkan.</p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__header">
          <span className="auth-card__logo">N</span>
          <div>
            <h2>Login</h2>
            <p>Masuk untuk membuka homepage, menu, optimizer, dan profile.</p>
          </div>
        </div>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="demo@nutriai.local"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="password123"
          required
        />

        {errorMessage ? <p className="form-message form-message--error">{errorMessage}</p> : null}

        <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </button>

        <p className="auth-note">Demo: gunakan `demo@nutriai.local` dan `password123`.</p>
        <p className="auth-footer">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </form>
    </section>
  );
}

export default LoginPage;
