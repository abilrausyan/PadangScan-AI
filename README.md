# 🍛 PadangScan - AI Culinary Recognition System

PadangScan adalah aplikasi web berbasis Artificial Intelligence yang dirancang untuk mengenali 9 jenis masakan khas Padang (Minangkabau) secara real-time. Aplikasi ini membantu wisatawan atau pecinta kuliner untuk mengidentifikasi nama makanan hanya melalui foto atau kamera smartphone.

## 🚀 Fitur Utama
- **Real-time Prediction**: Identifikasi makanan dalam waktu < 2 detik.
- **In-App Camera Integration**: Menggunakan WebRTC untuk membuka kamera langsung di browser tanpa aplikasi tambahan.
- **Smart Thresholding**: Sistem otomatis menampilkan "Objek Tidak Dikenali" jika tingkat kemiripan (confidence) di bawah **87%**, meminimalisir kesalahan prediksi.
- **High Accuracy**: Menggunakan model Deep Learning (CNN) dengan akurasi validasi 99.6%.
- **Responsive UI**: Desain modern (Glassmorphism) yang optimal untuk Desktop dan Mobile.

## 🛠️ Tech Stack
- **Deep Learning**: TensorFlow, Keras, CNN.
- **Backend**: Python, Flask.
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
- **Image Processing**: Pillow (PIL), NumPy.

## 📂 Struktur Project
├── app.py # Main Server Flask & AI Inference
├── padang_food_model.h5 # Model AI (Pre-trained)
├── static/
│ ├── script.js # Frontend Logic & Camera Handler
│ └── style.css # Responsive Styling
└── index.html # User Interface

## 🔧 Cara Menjalankan (Installation)
1. Clone repository ini:
   ```bash
   git clone [https://github.com/abilrausyan/PadangScan-AI.git](https://github.com/abilrausyan/PadangScan-AI.git)