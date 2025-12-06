const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const manualUploadBtn = document.getElementById('manualUploadBtn');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const fileNameDiv = document.getElementById('fileName');
const predictBtn = document.getElementById('predictBtn');
const clearBtn = document.getElementById('clearBtn');
const loading = document.getElementById('loading');
const resultCard = document.getElementById('resultCard');
const resultLabel = document.getElementById('resultLabel');
const resultConfidence = document.getElementById('resultConfidence');
const resultList = document.getElementById('resultList');
const resultDetails = document.getElementById('resultDetails');

// --- Variabel Kamera ---
const openCameraBtn = document.getElementById('openCameraBtn');
const cameraModal = document.getElementById('cameraModal');
const cameraFeed = document.getElementById('cameraFeed');
const cameraCanvas = document.getElementById('cameraCanvas');
const snapBtn = document.getElementById('snapBtn');
const closeCameraBtn = document.getElementById('closeCameraBtn');
let videoStream = null;

// --- EVENT LISTENER UPLOAD ---
// 1. Klik tombol "Pilih File"
manualUploadBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    fileInput.click();
});

// 2. Drag & Drop Area
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('active'); });
uploadZone.addEventListener('dragleave', e => { e.preventDefault(); uploadZone.classList.remove('active'); });
uploadZone.addEventListener('drop', e => { 
    e.preventDefault(); 
    uploadZone.classList.remove('active'); 
    const file = e.dataTransfer.files[0]; 
    if (file) handleFile(file); 
});

// 3. Input Change
fileInput.addEventListener('change', e => { 
    const file = e.target.files[0]; 
    if (file) handleFile(file); 
});

// --- FUNGSI UTAMA ---

function handleFile(file) {
    if (!file.type.startsWith('image/')) { 
        alert('Mohon pilih file gambar (JPG/PNG)!'); 
        return; 
    }
    if (file.size > 8 * 1024 * 1024) { 
        alert('Ukuran file terlalu besar (Maks 8MB).'); 
        return; 
    }   
    
    fileNameDiv.style.display = 'block';
    fileNameDiv.textContent = "File: " + file.name;
    
    const reader = new FileReader();
    reader.onload = ev => {
        previewImage.src = ev.target.result;
        previewContainer.style.display = 'flex';
        resultCard.classList.remove('show');
        previewContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    reader.readAsDataURL(file);
    window._selectedFile = file;
}

clearBtn.addEventListener('click', () => {
    previewContainer.style.display = 'none';
    fileInput.value = '';
    fileNameDiv.style.display = 'none';
    window._selectedFile = null;
    resultCard.classList.remove('show');
    document.getElementById('scan').scrollIntoView({ behavior: 'smooth' });
});

predictBtn.addEventListener('click', async () => {
    if (!window._selectedFile) { 
        alert('Silakan pilih atau ambil gambar terlebih dahulu.'); 
        return; 
    }
    
    const fd = new FormData();
    fd.append('file', window._selectedFile);
    
    try {
        loading.style.display = 'block';
        predictBtn.disabled = true;
        resultCard.classList.remove('show');

        const res = await fetch('/predict', { method: 'POST', body: fd });
        
        loading.style.display = 'none';
        predictBtn.disabled = false;
        
        if (!res.ok) { 
            throw new Error(await res.text()); 
        }
        
        const data = await res.json();
        showResult(data);
        
    } catch (err) { 
        loading.style.display = 'none'; 
        predictBtn.disabled = false; 
        alert('Terjadi kesalahan: ' + err.message); 
    }
});

// --- LOGIKA MENAMPILKAN HASIL (THRESHOLD 87%) ---
function showResult(data) {
    // === BAGIAN INI YANG DIUBAH ===
    const THRESHOLD = 0.87; // Batas minimal 87%
    const confidence = data.confidence || 0;

    resultList.innerHTML = '';

    // Cek apakah confidence < 87%
    if (confidence < THRESHOLD) {
        // KASUS: Objek Tidak Dikenali
        resultLabel.textContent = "Objek Tidak Dikenali";
        resultLabel.style.color = "#C41E3A"; // Merah
        
        // Tampilkan pesan error yang jelas
        resultConfidence.textContent = `Akurasi rendah (${(confidence*100).toFixed(1)}%). Pastikan foto makanan Padang jelas.`;
        resultConfidence.style.color = "#666";
        
        // Sembunyikan detail prediksi
        resultDetails.style.display = 'none';
        
    } else {
        // KASUS: Objek Dikenali (Akurasi >= 87%)
        resultLabel.textContent = prettifyLabel(data.label || '-');
        resultLabel.style.color = "#2D5016"; // Hijau
        
        resultConfidence.textContent = 'Akurasi: ' + (confidence * 100).toFixed(2) + '%';
        resultConfidence.style.color = "#666";
        
        // Tampilkan detail prediksi
        resultDetails.style.display = 'block';
        
        if (Array.isArray(data.probs)) {
            data.probs.forEach(p => {
                const d = document.createElement('div');
                d.className = 'result-item';
                d.textContent = `${prettifyLabel(p.label)} — ${(p.prob * 100).toFixed(2)}%`;
                resultList.appendChild(d);
            });
        }
    }

    resultCard.classList.add('show');
}

function prettifyLabel(lbl) { 
    return lbl.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); 
}

// --- LOGIKA KAMERA (Webcam) ---

openCameraBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        cameraFeed.srcObject = videoStream;
        cameraModal.classList.add('active');
    } catch (err) {
        console.error(err);
        alert("Gagal buka kamera: " + err.message);
    }
});

closeCameraBtn.addEventListener('click', stopCamera);

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    cameraModal.classList.remove('active');
}

snapBtn.addEventListener('click', () => {
    cameraCanvas.width = cameraFeed.videoWidth;
    cameraCanvas.height = cameraFeed.videoHeight;
    const ctx = cameraCanvas.getContext('2d');
    ctx.drawImage(cameraFeed, 0, 0);
    
    cameraCanvas.toBlob((blob) => {
        const file = new File([blob], "hasil_kamera.jpg", { type: "image/jpeg" });
        handleFile(file);
        stopCamera();
    }, 'image/jpeg', 0.9);
});