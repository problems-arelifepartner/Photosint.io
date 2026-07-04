// Register Interface Selectors
const dropzone = document.getElementById('dropzone');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('previewContainer');
const perfMeter = document.getElementById('perfMeter');
const msVal = document.getElementById('msVal');

// Event Triggers for Drag & Drop Functionality
dropzone.addEventListener('click', () => imageInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('border-blue-500', 'bg-blue-950/20'); });
dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('border-blue-500', 'bg-blue-950/20'); });
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-blue-500', 'bg-blue-950/20');
    if (e.dataTransfer.files.length) processMediaFile(e.dataTransfer.files[0]);
});
imageInput.addEventListener('change', (e) => { if (e.target.files.length) processMediaFile(e.target.files[0]); });

// Central Execution Pipeline
function processMediaFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Validation Failure: Input must be a structural image format.');
        return;
    }

    const initialTime = performance.now();
    
    // Memory Pointer creation for real-time local rendering
    const objectURL = URL.createObjectURL(file);
    preview.src = objectURL;
    previewContainer.classList.remove('hidden');

    const imageElement = new Image();
    imageElement.src = objectURL;
    imageElement.onload = function() {
        runBitwiseSteganalysis(imageElement);
        URL.revokeObjectURL(objectURL); // Free browser active runtime memory allocation
        
        const finalTime = performance.now();
        msVal.innerText = Math.round(finalTime - initialTime);
        perfMeter.classList.remove('hidden');
    };

    // Parse Image Header Segments via EXIF Engine
    EXIF.getData(file, function() {
        const osintDiv = document.getElementById('osintData');
        const gpsDiv = document.getElementById('gpsData');

        const deviceMake = EXIF.getTag(this, "Make") || "Not Found";
        const deviceModel = EXIF.getTag(this, "Model") || "Not Found";
        const dateCaptured = EXIF.getTag(this, "DateTime") || "Not Found";
        const softwareApplied = EXIF.getTag(this, "Software") || "Not Found";

        osintDiv.innerHTML = `
            <div><span class="text-slate-600">MANUFACTURER:</span> <span class="text-slate-200">${sanitizeHTML(deviceMake)}</span></div>
            <div><span class="text-slate-600">DEVICE MODEL:</span> <span class="text-slate-200">${sanitizeHTML(deviceModel)}</span></div>
            <div><span class="text-slate-600">CAPTURE DATE:</span> <span class="text-slate-200">${sanitizeHTML(dateCaptured)}</span></div>
            <div><span class="text-slate-600">SOFTWARE LAYER:</span> <span class="text-slate-200">${sanitizeHTML(softwareApplied)}</span></div>
        `;

        const latData = EXIF.getTag(this, "GPSLatitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lonData = EXIF.getTag(this, "GPSLongitude");
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (latData && lonData) {
            const calculatedLat = convertRationalToDecimal(latData, latRef);
            const calculatedLon = convertRationalToDecimal(lonData, lonRef);
            gpsDiv.innerHTML = `
                <div class="text-emerald-400 font-bold mb-1">✓ Coordinates Extracted Successfully</div>
                <span class="text-slate-300">${calculatedLat.toFixed(6)}, ${calculatedLon.toFixed(6)}</span>
                <a href="https://www.google.com/maps?q=${calculatedLat},${calculatedLon}" target="_blank" class="block text-xs text-blue-400 underline mt-2 hover:text-blue-300">
                    Open Coordinates in Google Maps External Target ↗
                </a>
            `;
        } else {
            gpsDiv.innerHTML = `<span class="text-slate-600">No geo-position coordinates embedded in this container.</span>`;
        }
    });
}

// Convert GPS Data Arrays to Coordinates
function convertRationalToDecimal(coordinateArray, coordinateRef) {
    let deg = coordinateArray[0].numerator / coordinateArray[0].denominator;
    let min = coordinateArray[1].numerator / coordinateArray[1].denominator;
    let sec = coordinateArray[2].numerator / coordinateArray[2].denominator;
    let decimalDegrees = deg + (min / 60) + (sec / 3600);
    return (coordinateRef === "S" || coordinateRef === "W") ? -decimalDegrees : decimalDegrees;
}

// Scan Pixels for LSB Steganographic Content
function runBitwiseSteganalysis(img) {
    const hiddenCanvas = document.createElement('canvas');
    const canvasContext = hiddenCanvas.getContext('2d');
    hiddenCanvas.width = img.width;
    hiddenCanvas.height = img.height;
    canvasContext.drawImage(img, 0, 0);

    const pixelDataArray = canvasContext.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height).data;
    let currentBitString = "";
    let accumulatedText = "";
    const analysisLimit = Math.min(pixelDataArray.length, 120000); // UI performance gate

    for (let i = 0; i < analysisLimit; i++) {
        if ((i + 1) % 4 === 0) continue; // Ignore Alpha channel bits

        currentBitString += (pixelDataArray[i] & 1);

        if (currentBitString.length === 8) {
            const characterCode = parseInt(currentBitString, 2);
            if (characterCode === 0) break; // Break execution if string terminator code hit
            
            if (characterCode >= 32 && characterCode <= 126) {
                accumulatedText += String.fromCharCode(characterCode);
            }
            currentBitString = "";
        }
        if (accumulatedText.length > 300) break;
    }

    const stegoOutputDiv = document.getElementById('stegoData');
    if (accumulatedText.trim().length > 2) {
        stegoOutputDiv.className = "text-xs font-mono text-emerald-400 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40 whitespace-pre-wrap break-all";
        stegoOutputDiv.innerText = `[Payload Decoded]\n"${accumulatedText}"`;
    } else {
        stegoOutputDiv.className = "text-xs font-mono text-slate-500 bg-black/40 p-3 rounded-lg border border-slate-900";
        stegoOutputDiv.innerText = "No readable standard text found encoded in the lower bitplanes.";
    }
}

// XSS Sanitizer Helper
function sanitizeHTML(str) {
    return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}
