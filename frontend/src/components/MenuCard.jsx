import React from 'react';
import { useLocal } from '../context/LocalContext';

function MenuCard({ menu, compact = false }) {
  const { savedMenuIds, toggleSavedMenu } = useLocal();
  const isSaved = savedMenuIds.includes(menu.id);

  return (
    <article className={`menu-card ${compact ? 'menu-card--compact' : ''}`}>
      <div className="menu-card__header">
        <div className="menu-card__title">
          <span className="menu-card__emoji" aria-hidden="true">{menu.img}</span>
          <div>
            <h3>{menu.name}</h3>
            <p>{menu.time}</p>
          </div>
        </div>

        <div className="menu-card__actions">
          <span className="menu-card__score">Skor {menu.score}</span>
          <button className="menu-card__save" type="button" onClick={() => toggleSavedMenu(menu.id)}>
            {isSaved ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>

      <p className="menu-card__description">{menu.description}</p>

      <div className="menu-card__tags">
        {menu.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="menu-card__macros">
        {[
          ['Kalori', `${menu.cal} kkal`],
          ['Protein', `${menu.protein} g`],
          ['Karbo', `${menu.carbs} g`],
          ['Lemak', `${menu.fat} g`],
        ].map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default MenuCard;
