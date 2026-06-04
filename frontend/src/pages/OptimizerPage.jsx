import React, { useState } from 'react';
import MenuCard from '../components/MenuCard';
import { useLocal } from '../context/LocalContext';
import useInput from '../hooks/useInput';

const goals = ['Turun Berat Badan', 'Naikkan Massa Otot', 'Jaga Kesehatan', 'Fokus Energi Harian'];
const activities = ['Sedentary', 'Ringan', 'Sedang', 'Aktif', 'Sangat Aktif'];
const activityFactors = {
  Sedentary: 1.2,
  Ringan: 1.375,
  Sedang: 1.55,
  Aktif: 1.725,
  'Sangat Aktif': 1.9,
};

function OptimizerPage() {
  const { lunchMenus, profile, optimizerResult, saveOptimizerResult, updateProfile, addGeneratedMenus } = useLocal();
  const _raw = import.meta.env.VITE_API_BASE_URL || '';
  const apiBaseUrl = _raw.startsWith('http://localhost') || _raw.startsWith('https://localhost') ? '' : _raw.replace(/\/$/, '');
  const [age, onAgeChange] = useInput(String(profile.age));
  const [weight, onWeightChange] = useInput(String(profile.weight));
  const [height, onHeightChange] = useInput(String(profile.height));
  const [budget, onBudgetChange] = useInput(String(profile.budget ?? 15000));
  const [goal, setGoal] = useState(profile.goal);
  const [activity, setActivity] = useState(profile.activity);
  const [step, setStep] = useState(optimizerResult ? 3 : 1);
  const [result, setResult] = useState(optimizerResult);
  const [apiError, setApiError] = useState('');

  function calculateRecommendation() {
    const ageValue = Number(age);
    const weightValue = Number(weight);
    const heightValue = Number(height);
    const budgetValue = Number(budget);

    if (!ageValue || !weightValue || !heightValue || !budgetValue) {
      return null;
    }

    const bmr = Math.round(10 * weightValue + (6.25 * heightValue) - (5 * ageValue) + 5);
    const tdee = Math.round(bmr * activityFactors[activity]);
    const target = goal.includes('Turun')
      ? tdee - 300
      : goal.includes('Naikkan')
        ? tdee + 300
        : tdee;

    const sortedMenus = [...lunchMenus].sort((left, right) => right.score - left.score);
    const recommended = goal.includes('Turun')
      ? sortedMenus.filter((menu) => menu.cal <= 420).slice(0, 3)
      : goal.includes('Naikkan')
        ? sortedMenus.filter((menu) => menu.protein >= 35).slice(0, 3)
        : sortedMenus.slice(0, 3);

    return {
      budget: budgetValue,
      bmr,
      tdee,
      target,
      protein: Math.round(weightValue * (goal.includes('Naikkan') ? 2 : 1.6)),
      carbs: Math.round((target * 0.45) / 4),
      fat: Math.round((target * 0.25) / 9),
      recommended,
    };
  }

  async function fetchAiSummary(nextResult) {
    // Gunakan URL proxy lokal jika berjalan di development (root project)
    const apiUrl = apiBaseUrl ? `${apiBaseUrl}/v1/optimizes` : '/v1/optimizes';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budget_maksimal: nextResult.budget,
        target_kalori: nextResult.target,
        berat_badan: Number(weight),
        protein: 0,
        lemak: 0,
        karbo: 0,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message || 'Gagal memanggil API AI.');
    }

    const payload = await response.json();
    return payload?.data?.ringkasan || payload?.ringkasan || {};
  }

  async function handleGenerate() {
    setStep(2);
    setApiError('');
    await new Promise((resolve) => setTimeout(resolve, 1300));

    const nextResult = calculateRecommendation();

    if (!nextResult) {
      setStep(1);
      return;
    }

    let aiSummary = {};

    try {
      aiSummary = await fetchAiSummary(nextResult);

      if (aiSummary.menu_baru && Array.isArray(aiSummary.menu_baru)) {
        const generatedMenus = aiSummary.menu_baru.map((m, i) => ({
          id: `ai-${Date.now()}-${i}`,
          name: m.name || 'Menu AI',
          cal: m.cal || 0,
          protein: m.protein || 0,
          carbs: m.carbs || 0,
          fat: m.fat || 0,
          tags: m.tags || ['AI Generated'],
          time: m.time || 'Makan Siang',
          img: m.img || 'AI',
          score: m.score || 95,
          description: m.description || 'Rekomendasi khusus dari AI Optimizer',
        }));

        nextResult.recommended = [...generatedMenus, ...nextResult.recommended].slice(0, 3);
        
        if (addGeneratedMenus) {
          addGeneratedMenus(generatedMenus);
        }
      }

    } catch (error) {
      setApiError(error.message);
    }

    const mergedResult = {
      ...nextResult,
      aiSummary,
    };

    setResult(mergedResult);
    setStep(3);
    saveOptimizerResult(mergedResult);
    updateProfile({
      goal,
      activity,
      budget: Number(budget),
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
    });
  }
  return (
    <div className="page page--optimizer">
      <section className="content-section">
        <div className="section-heading">
          <span className="eyebrow">AI-powered plan</span>
          <h1>AI Optimizer</h1>
          <p>Proses optimasi dirancang dengan alur yang ringan dan intuitif agar pengguna dapat menerima rekomendasi dengan cepat dan jelas.</p>
        </div>

        {step === 1 ? (
          <div className="optimizer-panel">
            <div className="optimizer-grid">
              {[
                { id: 'budget', label: 'Budget (Rp)', value: budget, onChange: onBudgetChange },
                { id: 'age', label: 'Usia (tahun)', value: age, onChange: onAgeChange },
                { id: 'weight', label: 'Berat badan (kg)', value: weight, onChange: onWeightChange },
                { id: 'height', label: 'Tinggi badan (cm)', value: height, onChange: onHeightChange },
              ].map((field) => (
                <label className="field" htmlFor={field.id} key={field.id}>
                  <span>{field.label}</span>
                  <input
                    id={field.id}
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </label>
              ))}
            </div>

            <div className="optimizer-choice-grid">
              <div className="choice-panel">
                <h2>Tujuan kesehatan</h2>
                <div className="choice-list">
                  {goals.map((item) => (
                    <button
                      key={item}
                      className={`choice-button ${goal === item ? 'choice-button--active' : ''}`}
                      type="button"
                      onClick={() => setGoal(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="choice-panel">
                <h2>Tingkat aktivitas</h2>
                <div className="choice-list">
                  {activities.map((item) => (
                    <button
                      key={item}
                      className={`choice-button choice-button--violet ${activity === item ? 'choice-button--active' : ''}`}
                      type="button"
                      onClick={() => setActivity(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="button button--violet button--full" type="button" onClick={handleGenerate}>
              Generate menu optimal
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="loading-panel">
            <div className="loading-spinner">
              <div className="spinner-circle" />
              <div className="spinner-circle" />
              <div className="spinner-circle" />
            </div>
            <h2>Menganalisis kebutuhan nutrisi Anda...</h2>
            <p>Menghitung target kalori dan mencocokkan menu makan paling relevan.</p>
            <div className="loading-panel__dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}

        {step === 3 && result ? (
          <div className="result-stack">
            <section className="result-summary">
              <div className="section-heading section-heading--split">
                <div>
                  <span className="eyebrow">Nutrition plan</span>
                  <h2>Ringkasan target Anda</h2>
                </div>
                <button className="button button--secondary" type="button" onClick={() => setStep(1)}>
                  Ubah input
                </button>
              </div>

              <div className="result-metrics">
                {[
                  { label: 'Target kalori', value: result.target, suffix: 'kkal', accent: 'orange' },
                  { label: 'Protein', value: result.protein, suffix: 'g', accent: 'green' },
                  { label: 'Karbohidrat', value: result.carbs, suffix: 'g', accent: 'yellow' },
                  { label: 'Lemak sehat', value: result.fat, suffix: 'g', accent: 'violet' },
                ].map((metric) => (
                  <article className={`result-metric result-metric--${metric.accent}`} key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.suffix}</span>
                    <p>{metric.label}</p>
                  </article>
                ))}
              </div>

              <div className="result-meta">
                <span>BMR {result.bmr} kkal</span>
                <span>TDEE {result.tdee} kkal</span>
                <span>Budget Rp{result.budget}</span>
                <span>{goal}</span>
              </div>

              <div className="result-meta">
                {apiError ? (
                  <span>AI: {apiError}</span>
                ) : (
                  <span>
                    AI: {result.aiSummary?.catatan_ai || 'Belum ada saran AI.'}
                  </span>
                )}
              </div>
            </section>

            <section className="content-section content-section--compact">
              <div className="section-heading section-heading--split">
                <div>
                  <span className="eyebrow">Recommended menus</span>
                  <h2>Rekomendasi dari optimizer</h2>
                </div>
              </div>
              <div className="card-grid">
                {result.recommended.map((menu) => (
                  <MenuCard key={menu.id} menu={menu} />
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default OptimizerPage;
