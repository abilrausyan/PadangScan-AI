from flask import Flask, request, jsonify, send_from_directory
import io
from PIL import Image
import numpy as np
import tensorflow as tf
import os

app = Flask(__name__)

# === Class Names (9 Jenis Makanan) ===
CLASS_NAMES = [
    "ayam_goreng", "ayam_pop", "daging_rendang", "dendeng_batokok", "gulai_ikan",
    "gulai_tambusu", "gulai_tunjang", "telur_balado", "telur_dadar"
]

# === Load Model ===
MODEL_PATH = 'padang_food_model.h5'
if os.path.exists(MODEL_PATH):
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully.")
else:
    print("❌ Warning: Model file not found.")

IMG_SIZE = (150, 150) # Pastikan sama dengan training Anda (biasanya 150 atau 155, sesuaikan)

def prepare_image(image: Image.Image):
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image = image.resize(IMG_SIZE)
    arr = np.asarray(image).astype(np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr

# Route Halaman Utama
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Route untuk load file static (css/js/gambar)
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

# Route Prediksi
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return "File not found", 400
    
    file = request.files['file']
    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes))
        
        x = prepare_image(img)
        preds = model.predict(x)
        probs = preds[0].tolist()
        
        # Urutkan dari confidence tertinggi
        idxs = np.argsort(probs)[::-1]
        
        topk = []
        for i in idxs[:5]:
            topk.append({"label": CLASS_NAMES[i], "prob": float(probs[i])})
            
        best_idx = int(idxs[0])
        
        response = {
            "label": CLASS_NAMES[best_idx],
            "confidence": float(probs[best_idx]),
            "probs": topk
        }
        return jsonify(response)
        
    except Exception as e:
        return f"Error: {e}", 500

if __name__ == '__main__':
    # Host 0.0.0.0 agar bisa diakses device lain (HP) satu jaringan
    app.run(host='0.0.0.0', port=5000, debug=True)