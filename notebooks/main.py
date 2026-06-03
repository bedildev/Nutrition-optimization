import os
import tensorflow as tf
import numpy as np
import joblib
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="Nutrition Optimization API",
    description="API Engine AI riil untuk tim PSU091 dengan Custom Layers & Gemini"
)

# --- 1. DEFINISI CUSTOM OBJECTS (WAJIB ADA) ---
# Ini agar FastAPI mengerti struktur lapisan dan loss buatanmu
@tf.keras.utils.register_keras_serializable(package='Custom', name='NutritionFeatureLayer')
class NutritionFeatureLayer(tf.keras.layers.Layer):
    def __init__(self, units=64, **kwargs):
        super(NutritionFeatureLayer, self).__init__(**kwargs)
        self.units = units
    def build(self, input_shape):
        self.w = self.add_weight(shape=(input_shape[-1], self.units), initializer='glorot_uniform', trainable=True, name='w_nutrition')
        self.b = self.add_weight(shape=(self.units,), initializer='zeros', trainable=True, name='b_nutrition')
    def call(self, inputs):
        return tf.nn.relu(tf.matmul(inputs, self.w) + self.b)
    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config

@tf.keras.utils.register_keras_serializable(package='Custom', name='CustomHuberLoss')
class CustomHuberLoss(tf.keras.losses.Loss):
    def __init__(self, delta=1.0, **kwargs):
        super().__init__(**kwargs)
        self.delta = delta
    def call(self, y_true, y_pred):
        y_true = tf.cast(y_true, dtype=tf.float32)
        y_pred = tf.cast(y_pred, dtype=tf.float32)
        error = y_true - y_pred
        is_small_error = tf.abs(error) <= self.delta
        small_error_loss = tf.square(error) / 2
        big_error_loss = self.delta * (tf.abs(error) - (0.5 * self.delta))
        return tf.where(is_small_error, small_error_loss, big_error_loss)
    def get_config(self):
        config = super().get_config()
        config.update({"delta": self.delta})
        return config


# --- 2. MEMUAT MODEL & DUA SCALER ---
# Mengambil dari lokasi di mana main.py dijalankan
MODEL_PATH = os.getenv("MODEL_PATH", "nutrition_model.keras")
X_SCALER_PATH = os.getenv("X_SCALER_PATH", "nutrition_X_scaler.pkl")
Y_SCALER_PATH = os.getenv("Y_SCALER_PATH", "nutrition_y_scaler.pkl")

try:
    model = tf.keras.models.load_model(
        MODEL_PATH,
        custom_objects={
            'NutritionFeatureLayer': NutritionFeatureLayer,
            'CustomHuberLoss': CustomHuberLoss
        }
    )
    x_scaler = joblib.load(X_SCALER_PATH)
    y_scaler = joblib.load(Y_SCALER_PATH)
    print(f"✅ Model AI Advanced dan DUA Scaler berhasil dimuat! ({MODEL_PATH})")
except Exception as e:
    print(f"❌ Error memuat model/scaler: {e}")
    model = None
    x_scaler = None
    y_scaler = None


# --- 3. KONFIGURASI GEMINI AI ---
API_KEY_GEMINI = os.getenv("GEMINI_API_KEY", "")
if not API_KEY_GEMINI:
    print("⚠️ GEMINI_API_KEY belum diatur. Saran AI Gemini akan dinonaktifkan.")


# --- 4. SKEMA DATA INPUT ---
class OptimizationRequest(BaseModel):
    budget_maksimal: int
    target_kalori: int

@app.get("/")
def read_root():
    return {"message": "Server AI Nutrition Optimization V2 Aktif!"}


# --- 5. ENDPOINT PREDIKSI FINAL ---
@app.post("/optimizes")
def optimize_menu(request: OptimizationRequest):
    if model is None or x_scaler is None or y_scaler is None:
        raise HTTPException(status_code=500, detail="Mesin AI belum siap di server.")
    
    try:
        # A. Siapkan data mentah (format disesuaikan dengan input model baru: harga_final, kalori, protein, lemak, karbo)
        # Karena endpoint API lama hanya menerima budget dan kalori, kita asumsikan protein, lemak, karbo memiliki nilai default 0 
        # Atau bisa disesuaikan, untuk amannya gunakan format 5 dimensi
        input_raw = np.array([[request.budget_maksimal, request.target_kalori, 0, 0, 0]], dtype=np.float32)
        
        # B. Normalisasi Input dengan X_scaler
        input_scaled = x_scaler.transform(input_raw)
        
        # C. Eksekusi Prediksi
        pred_scaled = model.predict(input_scaled)
        
        # D. Kembalikan Output ke Skala Asli dengan y_scaler
        final_score_array = y_scaler.inverse_transform(pred_scaled)
        skor_prediksi = float(final_score_array[0][0])
        
        # E. Minta Saran dari Gemini (REST API langsung)
        try:
            GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
            if not GEMINI_API_KEY:
                saran_gemini = "GEMINI_API_KEY belum dikonfigurasi."
            else:
                prompt = f"Seorang pengguna dengan budget Rp{request.budget_maksimal} dan target {request.target_kalori} kalori mendapat skor efisiensi nutrisi {skor_prediksi:.2f}. Berikan 2 kalimat saran singkat jenis makanan lokal Indonesia yang sebaiknya dibeli."
                
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }
                headers = {"Content-Type": "application/json"}
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                response_data = response.json()
                saran_gemini = response_data['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            saran_gemini = f"Gagal memuat saran AI: {e}"
        
        # F. Response JSON Lengkap untuk Backend
        return {
            "status": "success",
            "pesan": "Prediksi berhasil menggunakan model Advanced Nutrition Optimization.",
            "parameter_pencarian": {
                "budget": request.budget_maksimal,
                "kalori": request.target_kalori
            },
            "ringkasan": {
                "skor_nutrisi_prediksi": skor_prediksi,
                "catatan_ai": saran_gemini
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan prediksi: {str(e)}")
