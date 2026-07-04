// DOM Element Registry
const dropzone = document.getElementById('dropzone');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('previewContainer');
const perfMeter = document.getElementById('perfMeter');
const msVal = document.getElementById('msVal');

// Setup Drag & Drop Handlers for Ease of Use
dropzone.addEventListener('click', () => imageInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('border-blue-500', 'bg-blue-950/20'); });
dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('border-blue-500', 'bg-blue-950/20'); });
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-blue-500', 'bg-blue-950/20');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});
imageInput.addEventListener('change', (e) => { if (e.target.files.length) handleFile(e.target.files[0]); });

// Central Processing Engine
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Security Alert: Target file must be a valid image container.');
        return;
    }

    const startTime = performance.now();
    
    // Create ObjectURL - faster than FileReader base64 execution
    const objectURL = URL.createObjectURL(file);
    preview.src = objectURL;
    previewContainer.classList.remove('hidden');

    const img = new Image();
    img.src = objectURL;
    img.onload = function() {
        executeSteganalysis(img);
        // Clean up memory payload allocation
        URL.revokeObjectURL(objectURL);
        
        // Track response time metrics
        const endTime = performance.now();
        msVal.innerText = Math.round(endTime - startTime);
        perfMeter.classList.remove('hidden');
    };

    // Fast Header Processing via EXIF Pipeline
    EXIF.getData(file, function() {
        const osintDiv = document.getElementById('osintData');
        const gpsDiv = document.getElementById('gpsData');

        const make = EXIF.getTag(this, "Make") || "N/A";
        const model = EXIF.getTag(this, "Model") || "N/A";
        const date = EXIF.getTag(this, "DateTime") || "N/A";
        const software = EXIF.getTag(this, "Software") || "N/A";

        osintDiv.innerHTML = `
            <div><span class="text-slate-600">MANUFACTURER:</span> <span class="text-slate-200">${escapeHtml(make)}</span></div>
            <div><span class="text-slate-600">DEVICE MODEL:</span> <span class="text-slate-200">${escapeHtml(model)}</span></div>
            <div><span class="text-slate-600">CAPTURE DATE:</span> <span class="text-slate-200">${escapeHtml(date)}</span></div>
            <div><span class="text-slate-600">SOFTWARE REF:</span> <span class="text-slate-200">${escapeHtml(software)}</span></div>
        `;

        const lat = EXIF.getTag(this, "GPSLatitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lon = EXIF.getTag(this, "GPSLongitude");
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (lat && lon) {
            const latDec = parseGpsRational(lat, latRef);
            const lonDec = parseGpsRational(lon, lonRef);
            gpsDiv.innerHTML = `
                <div class="text-emerald-400 font-bold mb-1">✓ Coordinates Extracted</div>
                <span class="text-slate-300">${latDec.toFixed(6)}, ${lonDec.toFixed(6)}</span>
                <a href="https://www.google.com/maps?q=${latDec},${lonDec}" target="_blank" class="block text-xs text-blue-400 underline mt-2 hover:text-blue-300">
                    Map Link Generator ↗
                </a>
            `;
        } else {
            gpsDiv.innerHTML = `<span class="text-slate-600">No geographic metadata array tags located.</span>`;
        }
    });
}

// Convert GPS Data Structs
function parseGpsRational(coord, ref) {
    let d = coord[0].numerator / coord[0].denominator;
    let m = coord[1].numerator / coord[1].denominator;
    let s = coord[2].numerator / coord[2].denominator;
    let decimal = d + (m / 60) + (s / 3600);
    return (ref === "S" || ref === "W") ? -decimal : decimal;
}

// High-Speed Steganalysis (Scan first 120,000 components maximum for UI safety)
function executeSteganalysis(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let bitString = "";
    let decodedOutput = "";
    const executionBound = Math.min(data.length, 120000);

    for (let i = 0; i < executionBound; i++) {
        if ((i + 1) % 4 === 0) continue; // Bypass Alpha configuration byte

        bitString += (data[i] & 1);

        if (bitString.length === 8) {
            const characterCode = parseInt(bitString, 2);
            if (characterCode === 0) break; // Terminate execution block on null stop byte
            
            if (characterCode >= 32 && characterCode <= 126) {
                decodedOutput += String.fromCharCode(characterCode);
            }
            bitString = "";
        }
        if (decodedOutput.length > 300) break;
    }

    const stegoDiv = document.getElementById('stegoData');
    if (decodedOutput.trim().length > 2) {
        stegoDiv.className = "text-xs font-mono text-emerald-400 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40 whitespace-pre-wrap break-all";
        stegoDiv.innerText = `[Payload Cracked]\n"${decodedOutput}"`;
    } else {
        stegoDiv.className = "text-xs font-mono text-slate-500 bg-black/40 p-3 rounded-lg border border-slate-900";
        stegoDiv.innerText = "No clean text matches verified within standard bit boundaries.";
    }
}

// Security Helper: Protect HTML Context rendering against script injection vectors
function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
