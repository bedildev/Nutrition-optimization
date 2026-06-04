import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocal } from '../context/LocalContext';
import useInput from '../hooks/useInput';

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useLocal();
  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [confirmPassword, onConfirmPasswordChange] = useInput('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (password.length < 8) {
      setErrorMessage('Password minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password belum sama.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      register({ name, email, password });
      navigate('/login');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-hero">
        <span className="eyebrow">Register Page</span>
        <h1>Buat akun untuk memulai pengalaman NutriAI</h1>
        <p>Daftar sekarang untuk mengakses fitur personalisasi nutrisi, rekomendasi menu, dan pengalaman sehat yang lebih terarah.</p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__header">
          <span className="auth-card__logo">N</span>
          <div>
            <h2>Register</h2>
            <p>Buat akun baru lalu lanjut masuk ke dashboard experience yang sudah direvisi.</p>
          </div>
        </div>

        <label htmlFor="name">Nama lengkap</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={onNameChange}
          placeholder="Nama Lengkap"
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="Masukkan Email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="Minimal 8 karakter"
          required
        />

        <label htmlFor="confirmPassword">Konfirmasi password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          placeholder="Ulangi password"
          required
        />

        {errorMessage ? <p className="form-message form-message--error">{errorMessage}</p> : null}

        <button className="button button--primary button--full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Buat akun'}
        </button>

        <p className="auth-footer">
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </form>
    </section>
  );
}

export default RegisterPage;
