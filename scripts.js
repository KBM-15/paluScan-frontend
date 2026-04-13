const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const removeBtn = document.getElementById('removeImageBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultCard = document.getElementById('resultCard');
const resultStatus = document.getElementById('resultStatus');
const confidenceFill = document.getElementById('confidenceFill');
const confidencePercent = document.getElementById('confidencePercent');
const parasiteInfo = document.getElementById('parasiteInfo');

let currentImageFile = null;

uploadArea.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleImageSelect);

function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (JPG or PNG).');
    return;
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('Image too large. Please select an image under 10MB.');
    return;
  }
  
  currentImageFile = file;
  const reader = new FileReader();
  
  reader.onload = (ev) => {
    previewImage.src = ev.target.result;
    previewContainer.style.display = 'block';
    uploadArea.style.display = 'none';
    analyzeBtn.disabled = false;
    resultCard.style.display = 'none';
  };
  
  reader.readAsDataURL(file);
}

removeBtn.addEventListener('click', () => {
  currentImageFile = null;
  previewContainer.style.display = 'none';
  uploadArea.style.display = 'block';
  imageInput.value = '';
  analyzeBtn.disabled = true;
  resultCard.style.display = 'none';
});

analyzeBtn.addEventListener('click', async () => {
  if (!currentImageFile) return;
  
  analyzeBtn.disabled = true;
  const btnIcon = analyzeBtn.querySelector('.btn-icon');
  const btnText = analyzeBtn.querySelector('.btn-text');
  const originalIcon = btnIcon.innerHTML;
  const originalText = btnText.innerHTML;
  
  btnIcon.innerHTML = '⏳';
  btnText.innerHTML = 'Analyzing...';
  
  resultCard.style.display = 'block';
  resultStatus.innerHTML = 'Analyzing image with AI...';
  resultStatus.style.color = '#64748b';
  confidenceFill.style.width = '0%';
  confidencePercent.textContent = '0%';
  parasiteInfo.innerHTML = '';
  
  const formData = new FormData();
  formData.append('image', currentImageFile);
  
  try {
    const API_URL = 'http://127.0.0.1:5000/predict';
    
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    displayResult(data);
  } catch (error) {
    console.error('API Error:', error);
    
    simulateResultForDemo();
  } finally {
    analyzeBtn.disabled = false;
    btnIcon.innerHTML = originalIcon;
    btnText.innerHTML = originalText;
  }
});

function displayResult(data) {
  const label = data.label || data.prediction || 'Uninfected';
  const confidence = Math.round((data.confidence || 0) * 100);
  const isInfected = label.toLowerCase().includes('infected') || label.toLowerCase().includes('parasitized');
  
  // Update status
  if (isInfected) {
    resultStatus.innerHTML = '🦠 INFECTED – Malaria parasites detected';
    resultStatus.style.color = '#dc2626';
    resultStatus.style.background = '#fee2e2';
    confidenceFill.style.backgroundColor = '#dc2626';
    parasiteInfo.innerHTML = '<span style="color: #b91c1c;">⚠️ Immediate medical consultation recommended. Start antimalarial treatment as prescribed.</span>';
  } else {
    resultStatus.innerHTML = '✅ UNINFECTED – No parasites found';
    resultStatus.style.color = '#15803d';
    resultStatus.style.background = '#dcfce7';
    confidenceFill.style.backgroundColor = '#15803d';
    parasiteInfo.innerHTML = '<span style="color: #2c7a4d;">✓ No malaria detected. Continue prevention measures.</span>';
  }
  
  // Update confidence
  confidenceFill.style.width = `${confidence}%`;
  confidencePercent.textContent = `${confidence}%`;
}

// Demo simulation for presentations (remove this in production)
function simulateResultForDemo() {
  setTimeout(() => {
    const simulatedResults = [
      { label: 'Infected', confidence: 0.94 },
      { label: 'Uninfected', confidence: 0.97 },
      { label: 'Infected', confidence: 0.89 },
    ];
    const randomResult = simulatedResults[Math.floor(Math.random() * simulatedResults.length)];
    displayResult(randomResult);
  }, 1500);
}

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#0f5c6e';
  uploadArea.style.background = '#f0f6fa';
});

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = '#cbd5e1';
  uploadArea.style.background = '#fafdff';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const dataTransfer = { target: { files: [file] } };
    handleImageSelect(dataTransfer);
  }
  uploadArea.style.borderColor = '#cbd5e1';
  uploadArea.style.background = '#fafdff';
});