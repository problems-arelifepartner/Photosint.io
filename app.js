document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show Image Preview
    const reader = new FileReader();
    reader.onload = function(event) {
        const preview = document.getElementById('preview');
        preview.src = event.target.result;
        preview.classList.remove('hidden');
        
        // Trigger Steganography Detection once image is loaded into canvas
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            decodeLSB(img);
        };
    };
    reader.readAsDataURL(file);

    // --- OSINT / EXIF EXTRACTION ---
    EXIF.getData(file, function() {
        const osintDiv = document.getElementById('osintData');
        const gpsDiv = document.getElementById('gpsData');

        // Extract metadata attributes
        const make = EXIF.getTag(this, "Make") || "Unknown";
        const model = EXIF.getTag(this, "Model") || "Unknown";
        const date = EXIF.getTag(this, "DateTime") || "Unknown";
        const software = EXIF.getTag(this, "Software") || "None detected";

        osintDiv.innerHTML = `
            <p><strong>📷 Manufacturer:</strong> ${make}</p>
            <p><strong>📱 Model:</strong> ${model}</p>
            <p><strong>📅 Captured On:</strong> ${date}</p>
            <p><strong>💻 Software Signature:</strong> ${software}</p>
        `;

        // Extract GPS Coordinates
        const lat = EXIF.getTag(this, "GPSLatitude");
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        const lon = EXIF.getTag(this, "GPSLongitude");
        const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (lat && lon) {
            // Convert EXIF Rational formats to Decimal Degrees
            const latDec = convertToDecimal(lat, latRef);
            const lonDec = convertToDecimal(lon, lonRef);

            gpsDiv.innerHTML = `
                <span class="text-emerald-400 font-semibold">📍 Coordinates Found:</span> ${latDec.toFixed(6)}, ${lonDec.toFixed(6)}<br>
                <a href="https://www.google.com/maps?q=${latDec},${lonDec}" target="_blank" class="text-blue-400 underline mt-2 inline-block">
                    Open target coordinates in Google Maps →
                </a>
            `;
        } else {
            gpsDiv.innerHTML = `<span class="text-gray-500">No geo-tags found embedded in file headers.</span>`;
        }
    });
});

// Helper: Convert EXIF GPS to Decimal Degrees
function convertToDecimal(coord, ref) {
    let degrees = coord[0].numerator / coord[0].denominator;
    let minutes = coord[1].numerator / coord[1].denominator;
    let seconds = coord[2].numerator / coord[2].denominator;
    let decimal = degrees + (minutes / 60) + (seconds / 3600);
    if (ref === "S" || ref === "W") decimal = -decimal;
    return decimal;
}

// --- STEGANOGRAPHY DECODER (Extracts Hidden Text from Binary Pixels) ---
function decodeLSB(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data; // Flat array containing Red, Green, Blue, Alpha bytes
    
    let binaryMessage = "";
    let extractedText = "";

    // Iterate through the red, green, and blue channels of pixels to pick up the 0th bit
    for (let i = 0; i < data.length; i++) {
        if ((i + 1) % 4 === 0) continue; // Skip the Alpha channel bit entirely
        
        binaryMessage += (data[i] & 1); // Get the Lowest Significant Bit

        if (binaryMessage.length === 8) {
            const charCode = parseInt(binaryMessage, 2);
            
            // Stop parsing if we hit a null terminator byte (Standard end-of-string indicator)
            if (charCode === 0) break; 
            
            // Filter printable characters
            if (charCode >= 32 && charCode <= 126) {
                extractedText += String.fromCharCode(charCode);
            }
            binaryMessage = ""; // Reset for next character block
        }
        
        // Fail-safe limit so browser loops don't lock up on huge images
        if (extractedText.length > 500) break;
    }

    const stegoDiv = document.getElementById('stegoData');
    if (extractedText.trim().length > 2) {
        stegoDiv.innerHTML = `<span class="text-green-400 font-bold">🔓 Hidden Content Cracked:</span>\n"${extractedText}"`;
    } else {
        stegoDiv.innerText = "No hidden standard LSB text markers flagged in the pixel array payload.";
    }
}

