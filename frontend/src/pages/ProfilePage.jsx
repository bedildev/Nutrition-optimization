import React, { useState } from 'react';
import { useLocal } from '../context/LocalContext';
import useInput from '../hooks/useInput';

function ProfilePage() {
  const { authUser, lunchMenus, optimizerResult, profile, savedMenuIds, updateProfile } = useLocal();
  const [name, onNameChange] = useInput(profile.name || authUser?.name || '');
  const [bio, onBioChange] = useInput(profile.bio || '');
  const [goal, onGoalChange] = useInput(profile.goal || 'Jaga Kesehatan');
  const [savedState, setSavedState] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    updateProfile({
      ...profile,
      name,
      bio,
      goal,
    });
    setSavedState(true);
    window.setTimeout(() => setSavedState(false), 1800);
  }

  const topScore = Math.max(...lunchMenus.map((menu) => menu.score));
  const stats = [
    { label: 'Menu disimpan', value: savedMenuIds.length },
    { label: 'Skor tertinggi', value: topScore },
    { label: 'Rencana aktif', value: optimizerResult.recommended.length },
  ];

  return (
    <div className="page page--profile">
      <section className="content-section content-section--narrow">
        <div className="section-heading">
          <span className="eyebrow">Personal settings</span>
          <h1>Profile</h1>
          <p>Halaman profil menjaga nuansa referensi sekaligus memberi area edit yang tetap sederhana di frontend.</p>
        </div>

        <div className="profile-header">
          <div className="profile-avatar">{(name || authUser?.name || 'U').charAt(0).toUpperCase()}</div>
          <div>
            <h2>{name || authUser?.name}</h2>
            <p>{authUser?.email}</p>
          </div>
        </div>

        <form className="profile-panel" onSubmit={handleSubmit}>
          <label className="field" htmlFor="profile-name">
            <span>Nama tampil</span>
            <input id="profile-name" type="text" value={name} onChange={onNameChange} />
          </label>

          <label className="field" htmlFor="profile-email">
            <span>Email</span>
            <input id="profile-email" type="email" value={authUser?.email || ''} readOnly />
          </label>

          <label className="field" htmlFor="profile-goal">
            <span>Fokus nutrisi</span>
            <input id="profile-goal" type="text" value={goal} readOnly />
          </label>

          <label className="field" htmlFor="profile-bio">
            <span>Bio singkat</span>
            <textarea id="profile-bio" value={bio} onChange={onBioChange} rows="4" />
          </label>

          <button className={`button button--primary button--full ${savedState ? 'button--saved' : ''}`} type="submit">
            {savedState ? 'Perubahan tersimpan' : 'Simpan perubahan'}
          </button>
        </form>

        <div className="profile-stats">
          {stats.map((item) => (
            <article className="metric-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>status</span>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
