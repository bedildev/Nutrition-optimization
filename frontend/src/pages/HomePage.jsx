import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/home-hero.png';
import food1 from '../assets/food 1.jpg';
import food2 from '../assets/food 2.jpg';
import food3 from '../assets/food 3.jpg';
import { useLocal } from '../context/LocalContext';
import CardImage from '../components/CardImage';

const featureItems = [
  {
    title: 'Optimizer berbasis AI',
    copy: 'Hitung target kalori, protein, karbohidrat, dan lemak dalam satu alur yang ringan.',
    to: '/ai-optimizer',
    image: food1,
  },
  {
    title: 'Katalog makan siang',
    copy: 'Koleksi menu makan siang bernutrisi dengan skor kualitas, macro, dan label manfaat.',
    to: '/catalog',
    image: food2,
  },
  {
    title: 'Tampilan yang interaktif',
    copy: 'Seluruh pengalaman dirancang agar tetap cepat, responsif, dan nyaman digunakan di berbagai alur penggunaan.',
    to: '/about',
    image: food3,
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
            <span> dengan </span>
            <span> NutriMeal AI</span>
          </h1>
          <p>
            NutriMeal AI membantu pengguna menemukan menu makan siang yang lebih terarah dan
            mengoptimalkan target gizi.
          </p>
          <div className="hero-section__actions">
            <Link className="button button--primary" to={authUser ? '/ai-optimizer' : '/login'}>
              {authUser ? 'Buka AI Optimizer' : 'Masuk ke Demo'}
            </Link>
          </div>
        </div>

        <div className="hero-illustration">
          <img src={heroImage} alt="Ilustrasi NutriMeal AI" />
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">Core experience</span>
          <h2>Dirancang dengan sederhana dan nyaman digunakan</h2>
        </div>
        <div className="feature-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureItems.map((feature, idx) => (
            <CardImage
              key={feature.title}
              title={feature.title}
              description={feature.copy}
              image={feature.image}
              buttonText={null}
              to={feature.to}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
