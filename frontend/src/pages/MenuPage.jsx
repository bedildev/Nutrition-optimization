import React, { useEffect, useMemo, useState } from 'react';
import MenuCard from '../components/MenuCard';
import { useLocal } from '../context/LocalContext';
import useInput from '../hooks/useInput';

const filters = ['Semua', 'Tinggi Protein', 'Rendah Lemak', 'Lokal', 'Meal Prep', 'Tinggi Serat'];

function MenuPage() {
  const { lunchMenus } = useLocal();
  const [search, onSearchChange] = useInput('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeSlide, setActiveSlide] = useState(0);

  const featuredMenus = lunchMenus.slice(0, 4);

  const filteredMenus = useMemo(() => (
    lunchMenus.filter((menu) => {
      const matchSearch = menu.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === 'Semua' || menu.tags.includes(activeFilter);
      return matchSearch && matchFilter;
    })
  ), [activeFilter, lunchMenus, search]);

  useEffect(() => {
    if (!featuredMenus.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % featuredMenus.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [featuredMenus.length]);

  function showPrevious() {
    setActiveSlide((current) => (current === 0 ? featuredMenus.length - 1 : current - 1));
  }

  function showNext() {
    setActiveSlide((current) => (current + 1) % featuredMenus.length);
  }

  return (
    <div className="page page--menu">
      <section className="content-section content-section--wide">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">Lunch</span>
            <h1>Katalog menu makan siang</h1>
            <p>Halaman ini dirancang khusus untuk menampilkan rekomendasi menu makan siang secara lebih fokus dan terarah.</p>
          </div>
          <div className="menu-summary-badge">
            <strong>{lunchMenus.length}</strong>
            <span>menu bergizi terkurasi</span>
          </div>
        </div>

        <section className="carousel-panel" aria-label="Carousel menu makan siang">
          <div className="carousel-panel__header">
            <div>
              <span className="eyebrow">Featured</span>
              <h2>Makan Siang Pilihan</h2>
            </div>
            <div className="carousel-panel__actions">
              <button className="carousel-button" type="button" onClick={showPrevious} aria-label="Menu sebelumnya">
                Prev
              </button>
              <button className="carousel-button" type="button" onClick={showNext} aria-label="Menu berikutnya">
                Next
              </button>
            </div>
          </div>

          <div className="carousel-track">
            <div
              className="carousel-track__inner"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {featuredMenus.map((menu) => (
                <article className="carousel-slide" key={menu.id}>
                  <div className="carousel-slide__content">
                    <span className="carousel-slide__emoji" aria-hidden="true">{menu.img}</span>
                    <div>
                      <span className="carousel-slide__pill">Skor {menu.score}</span>
                      <h3>{menu.name}</h3>
                      <p>{menu.description}</p>
                    </div>
                  </div>
                  <div className="carousel-slide__stats">
                    <span>{menu.cal} kkal</span>
                    <span>{menu.protein}g protein</span>
                    <span>{menu.carbs}g karbo</span>
                    <span>{menu.fat}g lemak</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="carousel-dots">
            {featuredMenus.map((menu, index) => (
              <button
                key={menu.id}
                className={`carousel-dot ${activeSlide === index ? 'carousel-dot--active' : ''}`}
                type="button"
                aria-label={`Buka slide ${index + 1}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </section>

        <section className="catalog-panel">
          <div className="catalog-panel__controls">
            <label className="search-field" htmlFor="menu-search">
              <span>Go</span>
              <input
                id="menu-search"
                type="search"
                value={search}
                onChange={onSearchChange}
                placeholder="Cari menu makan siang..."
              />
            </label>

            <div className="chip-row" aria-label="Filter menu">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`chip ${activeFilter === filter ? 'chip--active' : ''}`}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="card-grid">
            {filteredMenus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>

          {!filteredMenus.length ? (
            <div className="empty-state">
              <strong>Menu tidak ditemukan</strong>
              <p>Coba kata kunci atau filter lain untuk menampilkan kembali katalog makan siang.</p>
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}

export default MenuPage;
