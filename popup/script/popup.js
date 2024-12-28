document.addEventListener('DOMContentLoaded', function () {
    console.log("Popup carregado");
    const defaultColor = '#1d5b50';

    // Apply default color immediately
    document.documentElement.style.setProperty('--theme-color', defaultColor);

    chrome.storage.sync.get([
        'darkTheme',
        'cardRDOHH',
        'PDFExtractor',
        'themeColor',
        'geminiApiKey'
    ], function (data) {
        setupDarkTheme(data.darkTheme ?? false);
        setupHoursCard(data.cardRDOHH ?? true);
        setupPDFExtractor(data.PDFExtractor ?? false);
        setupThemeColor(data.themeColor ?? defaultColor);
        setupGeminiKey(data.geminiApiKey ?? '');
    });
});


// functio to setup the key value 

function setupGeminiKey(initialKey) {
    const geminiKeyInput = document.getElementById('geminiKey');
    const toggleButton = document.getElementById('toggleKey');
    const visibilityIcon = toggleButton.querySelector('i');
    
    geminiKeyInput.value = initialKey;
    
    toggleButton.addEventListener('click', () => {
        const isVisible = geminiKeyInput.type === 'text';
        geminiKeyInput.type = isVisible ? 'password' : 'text';
        visibilityIcon.textContent = isVisible ? 'visibility' : 'visibility_off';
    });
    
    geminiKeyInput.addEventListener('change', function() {
        const apiKey = geminiKeyInput.value;
        chrome.storage.sync.set({ geminiApiKey: apiKey });
    });
}


// the dark theme function
function setupDarkTheme(initialState) {
    const darkThemeCheckbox = document.getElementById('darkTheme');
    if (!darkThemeCheckbox) return;

    darkThemeCheckbox.checked = initialState;
    console.log("Dark theme state:", initialState);

    darkThemeCheckbox.addEventListener('change', function () {
        const isDarkTheme = darkThemeCheckbox.checked;
        chrome.storage.sync.set({ darkTheme: isDarkTheme }, () => {
            console.log("Dark theme saved as:", isDarkTheme);
            notifyContentScript({ darkTheme: isDarkTheme });
        });
    });
}

// hour card function
function setupHoursCard(initialState) {
    const hoursCardCheckbox = document.getElementById('hoursCard');
    if (!hoursCardCheckbox) return;

    hoursCardCheckbox.checked = initialState;
    
    hoursCardCheckbox.addEventListener('change', function () {
        const isCardEnabled = hoursCardCheckbox.checked;
        chrome.storage.sync.set({ cardRDOHH: isCardEnabled }, () => {
            notifyContentScript({ cardRDOHH: isCardEnabled });
        });
    });
}

// Funçõe do PDF Extractor 
function setupPDFExtractor(initialState) {
    const PDFExtractorCheckbox = document.getElementById('PDFExtractor');
    if (!PDFExtractorCheckbox) return;

    PDFExtractorCheckbox.checked = initialState;
    
    PDFExtractorCheckbox.addEventListener('change', function () {
        const isPDFExtractorEnabled = PDFExtractorCheckbox.checked;
        chrome.storage.sync.set({ PDFExtractor: isPDFExtractorEnabled }, () => {
            notifyContentScript({ PDFExtractor: isPDFExtractorEnabled });
        });
    });
}

// a função para aplicar a cor do tema
function setupThemeColor(initialColor) {
    applyThemeColor(initialColor);
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            const color = option.style.background;
            saveThemeColor(color);
        });
    });

    const customColorPicker = document.querySelector('.custom-color');
    customColorPicker.addEventListener('change', (e) => {
        saveThemeColor(e.target.value);
    });
}


function saveThemeColor(color) {
    chrome.storage.sync.set({ themeColor: color }, () => {
        applyThemeColor(color);
        notifyContentScript({ themeColor: color });
    });
}

function rgbToHex(rgb) {
    // Handle rgb(r, g, b) format
    const matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (matches) {
        const [_, r, g, b] = matches;
        return '#' + [r, g, b].map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    return rgb; // Return as-is if already hex
}

function applyThemeColor(color) {
    const hexColor = rgbToHex(color);
    
    // Update CSS variable in popup
    document.documentElement.style.setProperty('--theme-color', hexColor);
    
    // Update active state of color options
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        if (option.style.background === color) {
            option.classList.add('active');
        }
    });
    
    document.querySelector('.custom-color').value = hexColor;
}



// Utility Functions
function notifyContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}
