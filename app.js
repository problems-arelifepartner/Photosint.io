// Register Interface Selectors
const dropzone = document.getElementById('dropzone');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const previewContainer = document.getElementById('previewContainer');
const perfMeter = document.getElementById('perfMeter');
const msVal = document.getElementById('msVal');

// Tab Configuration Panels
const tabAnalyzeBtn = document.getElementById('tabAnalyzeBtn');
const tabInjectBtn = document.getElementById('tabInjectBtn');
const panelAnalyze = document.getElementById('panelAnalyze');
const panelInject = document.getElementById('panelInject');

// Encoder Interface Hooks
const payloadText = document.getElementById('payloadText');
const generatePayloadBtn = document.getElementById('generatePayloadBtn');
const terminalScreen = document.getElementById('terminalScreen');
const bitplanePreview = document.getElementById('bitplanePreview');

let globalLoadedImage = null; 
let currentFileName = "unknown_file";

// Tab Interaction Handlers
tabAnalyzeBtn.addEventListener('click', () => switchTab('analyze'));
tabInjectBtn.addEventListener('click', () => switchTab('inject'));

function switchTab(mode) {
    if (mode === 'analyze') {
        tabAnalyzeBtn.className = "border-b-2 border-blue-500 pb-3 text-blue-400 font-bold px-1";
        tabInjectBtn.className = "border-b-2 border-transparent pb-3 text-slate-400 hover:text-slate-200 px-1";
        panelAnalyze.classList.remove('hidden');
        panelInject.classList.add('hidden');
        writeToTerminal("ui_state", "Switched panel interface context to: FORENSIC_DECODER");
    } else {
        tabInjectBtn.className = "border-b-2 border-purple-500 pb-3 text-purple-400 font-bold px-1";
        tabAnalyzeBtn.className = "border-b-2 border-transparent pb-3 text-slate-400 hover:text-slate-200 px-1";
        panelInject.classList.remove('hidden');
        panelAnalyze.classList.add('hidden');
        writeToTerminal("ui_state", "Switched panel interface context to: INJECT_PAYLOAD_MATRIX");
    }
}

// Low-Level Virtual Terminal Pipeline
function writeToTerminal(tag, message, colorClass = "text-emerald-400/90") {
    const timestamp = new Date().toISOString().substr(11, 8);
    const line = document.createElement('div');
    line.className = colorClass;
    line.innerHTML = `<span class="text-slate-600">[${timestamp}] [${sanitizeHTML(tag)}]</span> ${sanitizeHTML(message)}`;
    terminalScreen.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

// Event Triggers for Drag & Drop Functionality
dropzone.addEventListener('click', () => imageInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('border-blue-500', 'bg-blue-950/20'); });
dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('border-blue-500', 'bg-blue-950/20'); });
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-blue-500', 'bg-blue-950/20');
    if (e.dataTransfer.files.length) {
        currentFileName = e.dataTransfer.files[0].name;
        processMediaFile(e.dataTransfer.files[0]);
    }
});
imageInput.addEventListener('change', (e) => { 
    if (e.target.files.length) {
        currentFileName = e.target.files[0].name;
        processMediaFile(e.target.files[0]);
    }
});

// Central Ingestion Engine
function processMediaFile(file) {
    if (!file.type.startsWith('image/')) {
        writeToTerminal("core_error", "Ingestion aborted: Target context descriptor is not a valid image frame.", "text-red-400 font-bold");
        alert('Validation Failure: Input must be a structural image format.');
        return;
    }

    writeToTerminal("file_io", `Intercepted file handle array allocation: "${file.name}" (${file.size} bytes)`);
    const initialTime = performance.now();
    const objectURL = URL.createObjectURL(file);
    preview.src = objectURL;
    previewContainer.classList.remove('hidden');

    const imageElement = new Image();
    imageElement.src = objectURL;
    imageElement.onload = function() {
        globalLoadedImage = imageElement; 
        
        payloadText.disabled = false;
        payloadText.placeholder = "Type custom secret message to embed here...";
        generatePayloadBtn.disabled = false;

        runBitwiseSteganalysis(imageElement);
        URL.revokeObjectURL(objectURL); 
        
        const finalTime = performance.now();
        msVal.innerText = Math.round(finalTime - initialTime);
        perfMeter.classList.remove('hidden');
        writeToTerminal("perf_clock", `Image array loaded completely inside sandbox context in ${Math.round(finalTime - initialTime)}ms`);
    };

    // Parse Image Header Segments via EXIF Engine
    EXIF.getData(file, function() {
        const osintDiv = document.getElementById('osintData');
        const gpsDiv = document.getElementById('gpsData');

        const deviceMake = EXIF.getTag(this, "Make") || "Not Found";
        const deviceModel = EXIF.getTag(this, "Model") || "Not Found";
        const dateCaptured = EXIF.getTag(this, "DateTime") || "Not Found";
        const softwareApplied = EXIF.getTag(this, "Software") || "Not Found";
        const profile = EXIF.getTag(this, "InteroperabilityIndex") || "None Checked";
        const uniqueID = EXIF.getTag(this, "ImageUniqueID") || "None Gen-1";

        writeToTerminal("exif_miner", `Parsing complete metadata markers. Make: ${deviceMake} | Model: ${deviceModel}`);

        let diagnosticNote = "";
        if (deviceMake === "Not Found" && deviceModel === "Not Found") {
            diagnosticNote = `
                <div class="sm:col-span-2 text-amber-500 text-[11px] mt-2 border border-amber-900/30 bg-amber-950/10 p-2 rounded leading-relaxed">
                    ⚠️ <strong>Forensic Notice:</strong> Binary headers are blank. This suggests image distribution compression (e.g., download via WhatsApp or a local device screenshot).
                </div>
            `;
            writeToTerminal("forensic_alert", "Header signatures match compressed distribution profiles (Metadata missing).", "text-amber-400 font-bold");
        }

        osintDiv.innerHTML = `
            <div><span class="text-slate-600">MANUFACTURER:</span> <span class="text-slate-200">${sanitizeHTML(deviceMake)}</span></div>
            <div><span class="text-slate-600">DEVICE MODEL:</span> <span class="text-slate-200">${sanitizeHTML(deviceModel)}</span></div>
            <div><span class="text-slate-600">CAPTURE DATE:</span> <span class="text-slate-200">${sanitizeHTML(dateCaptured)}</span></div>
            <div><span class="text-slate-600">SOFTWARE LAYER:</span> <span class="text-slate-200">${sanitizeHTML(softwareApplied)}</span></div>
            <div><span class="text-slate-600">MATRIX PROFILE:</span> <span class="text-slate-300 font-bold">${sanitizeHTML(profile)}</span></div>
            <div><span class="text-slate-600">IMAGE UNIQUE ID:</span> <span class="text-slate-300 text-[11px]">${sanitizeHTML(uniqueID)}</span></div>
            ${diagnosticNote}
        `;

        const latData = EXIF.getTag(this, "GPSLatitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lonData = EXIF.getTag(this, "GPSLongitude");
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (latData && lonData) {
            const calculatedLat = convertRationalToDecimal(latData, latRef);
            const calculatedLon = convertRationalToDecimal(lonData, lonRef);
            writeToTerminal("geoint_match", `Found valid tracking coordinate map coordinates: ${calculatedLat}, ${calculatedLon}`, "text-emerald-400 font-bold");
            gpsDiv.innerHTML = `
                <div class="text-emerald-400 font-bold mb-1">✓ Coordinates Extracted Successfully</div>
                <span class="text-slate-300">${calculatedLat.toFixed(6)}, ${calculatedLon.toFixed(6)}</span>
                <a href="https://maps.google.com/?q=${calculatedLat},${calculatedLon}" target="_blank" class="block text-xs text-blue-400 underline mt-2 hover:text-blue-300">
                    Open Coordinates in Google Maps External Target ↗
                </a>
            `;
        } else {
            gpsDiv.innerHTML = `<span class="text-slate-600">No geo-position coordinates embedded in this container.</span>`;
            writeToTerminal("geoint_scan", "Zero positional coordinate data located in image directory tags.");
        }
    });
}

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
    let previewBits = "";
    const analysisLimit = Math.min(pixelDataArray.length, 120000); 

    writeToTerminal("stego_scan", `Analyzing pixel matrix bit arrays... Bound threshold set to ${analysisLimit} bytes.`);

    for (let i = 0; i < analysisLimit; i++) {
        if ((i + 1) % 4 === 0) continue; 

        const activeBit = (pixelDataArray[i] & 1);
        currentBitString += activeBit;
        
        // Populate display monitor array with first 48 bits analyzed
        if (previewBits.length < 48) {
            previewBits += activeBit;
            if (previewBits.length % 8 === 0) previewBits += " ";
        }

        if (currentBitString.length === 8) {
            const characterCode = parseInt(currentBitString, 2);
            if (characterCode === 0) break; 
            
            if (characterCode >= 32 && characterCode <= 126) {
                accumulatedText += String.fromCharCode(characterCode);
            }
            currentBitString = "";
        }
        if (accumulatedText.length > 300) break;
    }

    bitplanePreview.innerText = previewBits;
    const stegoOutputDiv = document.getElementById('stegoData');
    
    if (accumulatedText.trim().length > 2) {
        stegoOutputDiv.className = "text-xs font-mono text-emerald-400 bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/40 whitespace-pre-wrap break-all";
        stegoOutputDiv.innerText = `[Payload Decoded]\n"${accumulatedText}"`;
        writeToTerminal("stego_found", `Successfully decoded hidden standard text block payload match: "${accumulatedText.substring(0, 20)}..."`, "text-purple-400 font-bold");
    } else {
        stegoOutputDiv.className = "text-xs font-mono text-slate-500 bg-black/40 p-3 rounded-lg border border-slate-900";
        stegoOutputDiv.innerText = "No readable standard text found encoded in the lower bitplanes.";
        writeToTerminal("stego_scan", "Bitplane signature scan complete: Clean state verified.");
    }
}

// --- LSB ENCODER MACHINE ---
generatePayloadBtn.addEventListener('click', () => {
    if (!globalLoadedImage) return;

    const messageToHide = payloadText.value;
    if (!messageToHide) {
        writeToTerminal("stego_err", "Injection rejected: Missing payload stream content buffer input.", "text-red-400");
        alert("Payload processing rejected: Text buffer cannot be empty.");
        return;
    }

    writeToTerminal("stego_inject", "Initializing payload bitwise injection engine sequence...");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = globalLoadedImage.width;
    canvas.height = globalLoadedImage.height;
    ctx.drawImage(globalLoadedImage, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let binaryPayload = "";
    for (let i = 0; i < messageToHide.length; i++) {
        let binChar = messageToHide.charCodeAt(i).toString(2);
        binaryPayload += "0".repeat(8 - binChar.length) + binChar;
    }
    binaryPayload += "00000000"; // Null terminator stop sign string array marker

    if (binaryPayload.length > (data.length * 0.75)) {
        writeToTerminal("stego_fail", "Memory exception: Payload array density limits overflow container capacity.", "text-red-500 font-bold");
        alert("Payload volume overflow: Message string size is too large for this image dimensions.");
        return;
    }

    let payloadBitIndex = 0;
    let trackingMonitorBits = "";
    
    for (let i = 0; i < data.length; i++) {
        if ((i + 1) % 4 === 0) continue; 

        if (payloadBitIndex < binaryPayload.length) {
            data[i] = (data[i] & 0xFE) | parseInt(binaryPayload[payloadBitIndex], 10);
            
            if (trackingMonitorBits.length < 48) {
                trackingMonitorBits += binaryPayload[payloadBitIndex];
                if (trackingMonitorBits.length % 8 === 0) trackingMonitorBits += " ";
            }
            payloadBitIndex++;
        } else {
            break;
        }
    }

    ctx.putImageData(imgData, 0, 0);
    bitplanePreview.className = "bg-purple-950/20 p-3 rounded-xl border border-purple-900/40 font-mono text-purple-400 text-xs tracking-wider break-all min-h-[4rem]";
    bitplanePreview.innerText = trackingMonitorBits + "... [Payload Latched]";

    writeToTerminal("stego_success", `Injected ${binaryPayload.length} bits smoothly into lossless RGBA mapping structure. Packaging data container...`, "text-purple-400 font-bold");

    // Process immediate automatic file download wrapper execution link
    const link = document.createElement('a');
    link.download = 'photosint_stego_payload.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    writeToTerminal("file_export", "Compiled matrix output package piped directly out to browser download stream: photosint_stego_payload.png");
});

// XSS Sanitizer Helper
function sanitizeHTML(str) {
    return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}
