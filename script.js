const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const asciiOutput = document.getElementById('ascii-output');
const resolutionSlider = document.getElementById('resolution');
const resVal = document.getElementById('res-val');
const dlBtn = document.getElementById('dl-btn');

// Density String: From Darkest (@) to Lightest (space)
// You can swap this string to invert colors
const DENSITY = "Ñ@#W$9876543210?!abc;:+=-,._                    ";

let currentImg = null;

// 1. Handle Upload
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                currentImg = img;
                dlBtn.disabled = false;
                renderAscii();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// 2. Render Logic
function renderAscii() {
    if (!currentImg) return;

    const width = parseInt(resolutionSlider.value);
    resVal.innerText = width + " chars";

    // Maintain Aspect Ratio
    // Characters are taller than they are wide (approx 1:2), 
    // so we scale height down by roughly 0.55 to prevent stretching
    const aspectRatio = currentImg.height / currentImg.width;
    const height = Math.floor(width * aspectRatio * 0.55);

    canvas.width = width;
    canvas.height = height;

    // Draw small version of image to canvas
    ctx.drawImage(currentImg, 0, 0, width, height);

    // Get Pixel Data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let asciiStr = "";

    // Loop through every pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const offset = (y * width + x) * 4;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];

            // Calculate Brightness (Luminance)
            // Human eye sees green as brighter, so we use weighted avg
            const avg = (0.21 * r + 0.72 * g + 0.07 * b);

            // Map brightness (0-255) to Character Index (0 - DENSITY.length)
            const len = DENSITY.length;
            const charIndex = Math.floor((avg / 255) * (len - 1));
            
            // To invert colors (Dark background), read from end of string
            // To normal colors (White background), read from start
            const char = DENSITY.charAt((len - 1) - charIndex);

            if (char === " ") asciiStr += "&nbsp;"; // HTML space
            else asciiStr += char;
        }
        asciiStr += "\n"; // New line at end of row
    }

    asciiOutput.innerHTML = asciiStr;
}

// 3. Listeners
resolutionSlider.addEventListener('input', renderAscii);

function downloadAscii() {
    const text = asciiOutput.innerText;
    navigator.clipboard.writeText(text);
    alert("ASCII Art copied to clipboard!");
}
