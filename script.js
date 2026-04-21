// ===================================================================
// PHOTO EDITOR APPLICATION
// Roll Number: i230855_D_
// Last 2 digits: 55 (ODD) - Step size: 3
// ===================================================================

// Global Variables - Store image data and current state
let originalImage = null;          // Original uploaded image
let canvas = null;                 // Canvas element reference
let ctx = null;                    // Canvas 2D context
let currentFilter = 'brightness';  // Currently active filter
let currentRotation = 0;           // Current rotation angle (from slider)
let flipHorizontal = 1;            // Horizontal flip state (1 or -1)
let flipVertical = 1;              // Vertical flip state (1 or -1)

// Filter values storage - Each filter has its own value
let filterValues = {
    brightness: 100,   // 0-200 range
    saturation: 100,   // 0-200 range
    inversion: 0,      // 0-100 range
    grayscale: 0,      // 0-100 range
    sepia: 0,          // 0-100 range
    blur: 0            // 0-20 range
};

// ===================================================================
// HISTORY AND UNDO/REDO SYSTEM
// ===================================================================
let historyStates = [];           // Array to store all states
let currentStateIndex = -1;       // Current position in history
let isRestoringState = false;     // Flag to prevent state saving during restoration

// ===================================================================
// INITIALIZATION - Set up the application when page loads
// ===================================================================
function initializeApp() {
    // Get canvas and context references
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    // Set up all event listeners
    setupEventListeners();
}

// ===================================================================
// EVENT LISTENERS - Connect UI elements to their functions
// ===================================================================
function setupEventListeners() {
    // Choose Image button
    document.getElementById('chooseImage').addEventListener('click', function() {
        document.getElementById('imageInput').click();
    });

    // File input change
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);

    // Filter buttons - Switch between different filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Switch to the selected filter
            currentFilter = this.getAttribute('data-filter');
            updateSliderForFilter();
        });
    });

    // Main filter slider
    document.getElementById('filterSlider').addEventListener('input', function(e) {
        const value = parseInt(e.target.value);
        filterValues[currentFilter] = value;
        updateFilterDisplay();
        applyAllFilters();
        saveState(currentFilter, value);
    });

    // Rotate slider
    document.getElementById('rotateSlider').addEventListener('input', function(e) {
        currentRotation = parseInt(e.target.value);
        document.getElementById('rotateValue').textContent = currentRotation + '°';
        applyAllFilters();
        saveState('rotate', currentRotation);
    });

    // Rotate Left button (-90 degrees)
    document.getElementById('rotateLeft').addEventListener('click', function() {
        currentRotation = (currentRotation - 90 + 360) % 360;
        document.getElementById('rotateSlider').value = currentRotation;
        document.getElementById('rotateValue').textContent = currentRotation + '°';
        applyAllFilters();
        saveState('rotate', currentRotation);
    });

    // Rotate Right button (+90 degrees)
    document.getElementById('rotateRight').addEventListener('click', function() {
        currentRotation = (currentRotation + 90) % 360;
        document.getElementById('rotateSlider').value = currentRotation;
        document.getElementById('rotateValue').textContent = currentRotation + '°';
        applyAllFilters();
        saveState('rotate', currentRotation);
    });

    // Flip Horizontal button
    document.getElementById('flipHorizontal').addEventListener('click', function() {
        flipHorizontal = flipHorizontal * -1;
        applyAllFilters();
        saveState('flipHorizontal', flipHorizontal === -1 ? 'flipped' : 'normal');
    });

    // Flip Vertical button
    document.getElementById('flipVertical').addEventListener('click', function() {
        flipVertical = flipVertical * -1;
        applyAllFilters();
        saveState('flipVertical', flipVertical === -1 ? 'flipped' : 'normal');
    });

    // Reset Filters button
    document.getElementById('resetFilters').addEventListener('click', resetAllFilters);

    // Save Image button
    document.getElementById('saveImage').addEventListener('click', saveImage);

    // Undo button
    document.getElementById('undoBtn').addEventListener('click', undoChange);

    // Redo button
    document.getElementById('redoBtn').addEventListener('click', redoChange);
}

// ===================================================================
// IMAGE UPLOAD HANDLER
// ===================================================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file!');
        return;
    }

    // Create FileReader to read the image
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // Store the original image
            originalImage = img;
            
            // Reset all filters and transformations
            resetAllFilters();
            
            // Enable all controls
            enableAllControls();
            
            // Hide "no image" message and show canvas
            document.getElementById('noImageMessage').style.display = 'none';
            canvas.style.display = 'block';
            
            // Initialize history with original state
            initializeHistory();
            
            // Apply filters and draw the image
            applyAllFilters();
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

// ===================================================================
// ENABLE ALL CONTROLS - After image is loaded
// ===================================================================
function enableAllControls() {
    // Enable filter buttons
    document.getElementById('btnBrightness').disabled = false;
    document.getElementById('btnSaturation').disabled = false;
    document.getElementById('btnInversion').disabled = false;
    document.getElementById('btnGrayscale').disabled = false;
    document.getElementById('btnSepia').disabled = false;
    document.getElementById('btnBlur').disabled = false;

    // Enable sliders
    document.getElementById('filterSlider').disabled = false;
    document.getElementById('rotateSlider').disabled = false;

    // Enable rotate and flip buttons
    document.getElementById('rotateLeft').disabled = false;
    document.getElementById('rotateRight').disabled = false;
    document.getElementById('flipHorizontal').disabled = false;
    document.getElementById('flipVertical').disabled = false;

    // Enable action buttons
    document.getElementById('resetFilters').disabled = false;
    document.getElementById('saveImage').disabled = false;
}

// ===================================================================
// UPDATE SLIDER - When switching between filters
// ===================================================================
function updateSliderForFilter() {
    const slider = document.getElementById('filterSlider');
    const filterName = document.getElementById('filterName');
    const currentValue = filterValues[currentFilter];

    // Update filter name
    filterName.textContent = currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);

    // Set slider range and value based on filter type
    if (currentFilter === 'brightness' || currentFilter === 'saturation') {
        slider.min = 0;
        slider.max = 200;
        slider.value = currentValue;
    } else if (currentFilter === 'blur') {
        slider.min = 0;
        slider.max = 20;
        slider.value = currentValue;
    } else {
        // inversion, grayscale, sepia
        slider.min = 0;
        slider.max = 100;
        slider.value = currentValue;
    }

    updateFilterDisplay();
}

// ===================================================================
// UPDATE FILTER DISPLAY - Show current filter value
// ===================================================================
function updateFilterDisplay() {
    const value = filterValues[currentFilter];
    let displayValue;

    if (currentFilter === 'blur') {
        displayValue = value + 'px';
    } else {
        displayValue = value + '%';
    }

    document.getElementById('filterValue').textContent = displayValue;
}

// ===================================================================
// APPLY ALL FILTERS - Main rendering function
// ===================================================================
function applyAllFilters() {
    if (!originalImage) return;

    // Calculate canvas dimensions based on rotation
    let width = originalImage.width;
    let height = originalImage.height;

    // Swap width and height for 90 or 270 degree rotations
    if (currentRotation === 90 || currentRotation === 270) {
        width = originalImage.height;
        height = originalImage.width;
    }

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations (rotate and flip)
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(currentRotation * Math.PI / 180);
    ctx.scale(flipHorizontal, flipVertical);

    // Draw the original image
    ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);

    // Restore context
    ctx.restore();

    // Get image data for pixel manipulation
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;

    // Apply blur effect (if needed) before other filters
    if (filterValues.blur > 0) {
        imageData = applyBlurFilter(imageData, filterValues.blur);
        pixels = imageData.data;
    }

    // Apply pixel-based filters
    applyPixelFilters(pixels);

    // Put the modified image data back to canvas
    ctx.putImageData(imageData, 0, 0);
}

// ===================================================================
// APPLY PIXEL FILTERS - Modify each pixel based on filter values
// ===================================================================
function applyPixelFilters(pixels) {
    // Process each pixel (RGBA = 4 values per pixel)
    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        // 1. Apply Brightness
        // Brightness multiplier ranges from 0 to 2 (0% to 200%)
        const brightnessFactor = filterValues.brightness / 100;
        r = r * brightnessFactor;
        g = g * brightnessFactor;
        b = b * brightnessFactor;

        // 2. Apply Saturation
        // Calculate grayscale value for saturation
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        const saturationFactor = filterValues.saturation / 100;
        r = gray + (r - gray) * saturationFactor;
        g = gray + (g - gray) * saturationFactor;
        b = gray + (b - gray) * saturationFactor;

        // 3. Apply Inversion
        // Invert colors based on inversion percentage
        if (filterValues.inversion > 0) {
            const inversionFactor = filterValues.inversion / 100;
            r = r + (255 - r - r) * inversionFactor;
            g = g + (255 - g - g) * inversionFactor;
            b = b + (255 - b - b) * inversionFactor;
        }

        // 4. Apply Grayscale
        // Convert to grayscale based on percentage
        if (filterValues.grayscale > 0) {
            const grayValue = 0.299 * r + 0.587 * g + 0.114 * b;
            const grayscaleFactor = filterValues.grayscale / 100;
            r = r + (grayValue - r) * grayscaleFactor;
            g = g + (grayValue - g) * grayscaleFactor;
            b = b + (grayValue - b) * grayscaleFactor;
        }

        // 5. Apply Sepia
        // Apply sepia tone effect based on percentage
        if (filterValues.sepia > 0) {
            const sepiaR = (r * 0.393) + (g * 0.769) + (b * 0.189);
            const sepiaG = (r * 0.349) + (g * 0.686) + (b * 0.168);
            const sepiaB = (r * 0.272) + (g * 0.534) + (b * 0.131);
            const sepiaFactor = filterValues.sepia / 100;
            r = r + (sepiaR - r) * sepiaFactor;
            g = g + (sepiaG - g) * sepiaFactor;
            b = b + (sepiaB - b) * sepiaFactor;
        }

        // Clamp values to valid range (0-255)
        pixels[i] = clampValue(r, 0, 255);
        pixels[i + 1] = clampValue(g, 0, 255);
        pixels[i + 2] = clampValue(b, 0, 255);
    }
}

// ===================================================================
// BLUR FILTER - Apply box blur algorithm
// ===================================================================
function applyBlurFilter(imageData, radius) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const output = new Uint8ClampedArray(pixels);

    // Simple box blur algorithm
    const diameter = Math.round(radius * 2) + 1;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            let count = 0;

            // Sample surrounding pixels
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = x + kx;
                    const py = y + ky;

                    // Check boundaries
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const idx = (py * width + px) * 4;
                        r += pixels[idx];
                        g += pixels[idx + 1];
                        b += pixels[idx + 2];
                        a += pixels[idx + 3];
                        count++;
                    }
                }
            }

            // Calculate average and store in output
            const idx = (y * width + x) * 4;
            output[idx] = r / count;
            output[idx + 1] = g / count;
            output[idx + 2] = b / count;
            output[idx + 3] = a / count;
        }
    }

    return new ImageData(output, width, height);
}

// ===================================================================
// CLAMP VALUE - Ensure value is within min and max range
// ===================================================================
function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// ===================================================================
// RESET ALL FILTERS - Restore to default values
// ===================================================================
function resetAllFilters() {
    // Reset all filter values
    filterValues = {
        brightness: 100,
        saturation: 100,
        inversion: 0,
        grayscale: 0,
        sepia: 0,
        blur: 0
    };

    // Reset transformations
    currentRotation = 0;
    flipHorizontal = 1;
    flipVertical = 1;

    // Reset rotate slider
    document.getElementById('rotateSlider').value = 0;
    document.getElementById('rotateValue').textContent = '0°';

    // Reset current filter to brightness
    currentFilter = 'brightness';
    
    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById('btnBrightness').classList.add('active');

    // Update slider
    updateSliderForFilter();

    // Reapply filters
    if (originalImage) {
        applyAllFilters();
    }
}

// ===================================================================
// SAVE IMAGE - Download the edited image
// ===================================================================
function saveImage() {
    if (!originalImage) return;

    // Create a temporary link element
    const link = document.createElement('a');
    
    // Set download filename
    link.download = 'edited-photo.png';
    
    // Convert canvas to data URL
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    link.click();
}

// ===================================================================
// HISTORY MANAGEMENT FUNCTIONS
// ===================================================================

// Initialize history when image is loaded
function initializeHistory() {
    historyStates = [];
    currentStateIndex = -1;
    
    // Save initial state
    saveInitialState();
    updateHistoryUI();
    updateUndoRedoButtons();
}

// Save initial state (original image)
function saveInitialState() {
    const state = {
        filterValues: { ...filterValues },
        rotation: currentRotation,
        flipH: flipHorizontal,
        flipV: flipVertical,
        actionType: 'original',
        actionValue: 'Original Image'
    };
    
    historyStates.push(state);
    currentStateIndex = 0;
}

// Save current state to history
function saveState(actionType, actionValue) {
    // Don't save state if we're restoring from history
    if (isRestoringState) return;

    // Remove all states after current index (when applying new change after undo)
    if (currentStateIndex < historyStates.length - 1) {
        historyStates = historyStates.slice(0, currentStateIndex + 1);
    }

    // Create new state object
    const state = {
        filterValues: { ...filterValues },
        rotation: currentRotation,
        flipH: flipHorizontal,
        flipV: flipVertical,
        actionType: actionType,
        actionValue: actionValue
    };

    // Add to history
    historyStates.push(state);
    currentStateIndex = historyStates.length - 1;

    // Update UI
    updateHistoryUI();
    updateUndoRedoButtons();
}

// Undo to previous state
function undoChange() {
    if (currentStateIndex > 0) {
        currentStateIndex--;
        restoreState(currentStateIndex);
    }
}

// Redo to next state
function redoChange() {
    if (currentStateIndex < historyStates.length - 1) {
        currentStateIndex++;
        restoreState(currentStateIndex);
    }
}

// Restore state from history
function restoreState(index) {
    isRestoringState = true;

    const state = historyStates[index];

    // Restore filter values
    filterValues = { ...state.filterValues };
    currentRotation = state.rotation;
    flipHorizontal = state.flipH;
    flipVertical = state.flipV;

    // Update UI controls
    updateUIFromState();

    // Redraw canvas
    applyAllFilters();

    // Update history UI
    updateHistoryUI();
    updateUndoRedoButtons();

    isRestoringState = false;
}

// Update UI controls from current state
function updateUIFromState() {
    // Update rotation slider
    document.getElementById('rotateSlider').value = currentRotation;
    document.getElementById('rotateValue').textContent = currentRotation + '°';

    // Update filter slider if needed
    updateSliderForFilter();
}

// Update history panel UI
function updateHistoryUI() {
    const historyPanel = document.getElementById('historyPanel');
    historyPanel.innerHTML = '';

    if (historyStates.length === 0) {
        historyPanel.innerHTML = '<div class="history-empty">No changes yet</div>';
        return;
    }

    // Create history items
    historyStates.forEach((state, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        if (index === currentStateIndex) {
            historyItem.classList.add('active');
        }

        // Format the action value for display
        let displayValue = state.actionValue;
        if (typeof displayValue === 'number') {
            if (state.actionType === 'rotate') {
                displayValue = displayValue + '°';
            } else if (state.actionType === 'blur') {
                displayValue = displayValue + 'px';
            } else {
                displayValue = displayValue + '%';
            }
        }

        historyItem.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-name">${state.actionType}</span>
                <span class="history-item-value">${displayValue}</span>
            </div>
        `;

        // Click handler to restore to this state
        historyItem.addEventListener('click', function() {
            currentStateIndex = index;
            restoreState(index);
        });

        historyPanel.appendChild(historyItem);
    });
}

// Update undo/redo button states
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // Enable/disable undo button
    undoBtn.disabled = currentStateIndex <= 0;

    // Enable/disable redo button
    redoBtn.disabled = currentStateIndex >= historyStates.length - 1;
}

// ===================================================================
// START APPLICATION - Initialize when page loads
// ===================================================================
window.addEventListener('load', initializeApp);
