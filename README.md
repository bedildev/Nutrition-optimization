# 🥗 NutriMeal AI
> Sistem Optimasi Menu Makanan Berbasis AI untuk Gizi Seimbang Masyarakat Indonesia  
> Capstone Project PSU091 — Coding Camp 2026

![Status](https://img.shields.io/badge/Status-Completed-brightgreen)
![MAE](https://img.shields.io/badge/Model%20MAE-0.0032-blue)
![Platform](https://img.shields.io/badge/Platform-3%20Deployed-orange)

---

## 📌 Deskripsi Proyek

NutriMeal AI adalah sistem cerdas yang membantu masyarakat Indonesia — khususnya mahasiswa,
pekerja perantau, dan kelompok menengah ke bawah — menemukan kombinasi menu makanan lokal
yang paling hemat namun tetap memenuhi kebutuhan gizi harian.

Sistem ini menggabungkan **Deep Learning (TensorFlow)** untuk menghitung skor efisiensi gizi
dan **Generative AI (Google Gemini)** untuk menghasilkan rekomendasi menu dalam bahasa
Indonesia yang natural dan mudah dipahami.

---

## 🚀 Demo Aplikasi

| Platform | Link |
|----------|------|
| 🌐 Web App | [nutrimeal-ai.vercel.app](https://nutrimeal-ai.vercel.app) |
| 🤖 Model AI | [Hugging Face Spaces](https://huggingface.co/spaces/feryardnsyah/nutri-optimize) |
| 📊 Dashboard EDA | [nutrifood-dashboard.streamlit.app](https://nutrifood-dashboard.streamlit.app) |

---

## 🗂️ Struktur Repository

---

## ⚙️ Cara Menjalankan Lokal

### Prasyarat
- Python 3.9+
- Node.js 18+
- Git

### 1. Clone Repository
```bash
git clone https://github.com/bedildev/Nutrition-optimization.git
cd Nutrition-optimization
```

### 2. Jalankan Backend — Express.js
```bash
cd backend
npm install
npm start
# Server berjalan di http://localhost:5000
```

### 3. Jalankan Frontend — React + Vite
```bash
cd frontend
npm install
npm run dev
# Buka http://localhost:3000
```

### 4. Jalankan Model AI — FastAPI
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload
# Server berjalan di http://localhost:8000
```

### 5. (Opsional) Jalankan Dashboard Streamlit
```bash
pip install streamlit
streamlit run notebooks/dashboard.py
# Buka http://localhost:8501
```

---

## 🤖 Model Machine Learning

| Komponen | Detail |
|----------|--------|
| Framework | TensorFlow Functional API |
| Custom Layer | `NutritionFeatureLayer` |
| Custom Loss | `CustomHuberLoss` |
| Input | Budget maksimal (Rp) + Target kalori (kkal) |
| Output | Skor efisiensi gizi + Rekomendasi menu |
| **MAE** | **0.0032** ✅ (target maks. 0.02) |

#### Cara Replikasi Training Model
```bash
cd notebooks
pip install -r requirements.txt
jupyter notebook
# Buka file: NutriMeal_Training.ipynb
```

---

## 📦 Dataset

Dataset pangan lokal Indonesia tersedia di Google Drive:  
📁 [Akses Dataset](https://drive.google.com/drive/folders/18H7nUfSeM7zcYhsaZMpz5y6b_g--mgYL)

| Kolom | Keterangan |
|-------|-----------|
| `nama_makanan` | Nama bahan/menu makanan lokal |
| `harga` | Harga estimasi (Rupiah) |
| `kalori` | Kandungan kalori (kkal) |
| `protein` | Kandungan protein (gram) |
| `lemak` | Kandungan lemak (gram) |
| `karbohidrat` | Kandungan karbohidrat (gram) |

---

## 🛠️ Tech Stack

**Machine Learning & AI**
- TensorFlow · Keras · Scikit-learn · Google Gemini API

**Data Science**
- Pandas · NumPy · Matplotlib · Seaborn · Jupyter Notebook

**Backend**
- Express.js (Node.js) · FastAPI (Python)

**Frontend**
- React.js · Vite · Tailwind CSS

**Deployment**
- Vercel · Hugging Face Spaces · Streamlit Cloud

---

## 👥 Tim — Capstone PSU091

| ID Coding Camp | Nama | Peran |
|----------------|------|-------|
| CFCC335D6X1085 | Nayla Athifa | Frontend Developer (React/Vite) |
| CDCC335D6X1871 | Hilya Mardhya | Data Scientist (EDA & Data Cleaning) |
| CDCC293D6X1530 | Zefanya Maureen Nathania | Data Scientist (EDA & Data Cleaning) |
| CACC335D6Y2086 | Yahdillah | AI Engineer (TensorFlow Model) |
| CFCC335D6Y2462 | Fery Ardiansyah Djangkaru | Backend Developer (Express.js & API) |
| CACC225D6X1997 | Silviyana | AI Engineer (TensorFlow Model) |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan Capstone Project Coding Camp 2026.  
© 2026 Tim PSU091 — NutriMeal AI
