import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/home-hero.png';
import { useLocal } from '../context/LocalContext';

const featureItems = [
  {
    title: 'Optimizer berbasis AI',
    copy: 'Hitung target kalori, protein, karbohidrat, dan lemak dalam satu alur yang ringan.',
  },
  {
    title: 'Katalog makan siang',
    copy: 'Koleksi menu makan siang bernutrisi dengan skor kualitas, macro, dan label manfaat.',
  },
  {
    title: 'Tampilan yang interaktif',
    copy: 'Seluruh pengalaman dirancang agar tetap cepat, responsif, dan nyaman digunakan di berbagai alur penggunaan.',
  },
];

function HomePage() {
  const { authUser } = useLocal();
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Selamat pagi' : greetingHour < 17 ? 'Selamat siang' : 'Selamat malam';

  return (
    <div className="page page--home">
      <section className="hero-section">
        <div className="hero-section__content">
          <span className="eyebrow">{authUser ? `${greeting}, ${authUser.name}` : 'Smart Nutrition Experience'}</span>
          <h1>
            Optimasi Menu Makanan Anak
            <span> dengan NutriAI</span>
          </h1>
          <p>
            NutriAI membantu pengguna menemukan menu makan siang yang lebih terarah,
            mengoptimalkan target gizi, dan mengelola profil personal lewat frontend yang responsif.
          </p>
          <div className="hero-section__actions">
            <Link className="button button--primary" to={authUser ? '/ai-optimizer' : '/register'}>
              {authUser ? 'Buka AI Optimizer' : 'Buat Akun'}
            </Link>
            <Link className="button button--secondary" to={authUser ? '/menu' : '/login'}>
              {authUser ? 'Jelajahi Menu' : 'Masuk ke Demo'}
            </Link>
          </div>
        </div>

        <div className="hero-illustration">
          <img src={heroImage} alt="Ilustrasi NutriAI" />
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Core experience</span>
          <h2>Dirancang dengan sederhana dan nyaman digunakan</h2>
        </div>
        <div className="feature-grid">
          {featureItems.map((feature) => (
            <article className="feature-panel" key={feature.title}>
              <span className="feature-panel__icon" />
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
