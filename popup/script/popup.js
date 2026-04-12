// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function () {
    console.log("Popup carregado");
    const defaultColor = '#000000';  // Cor padrão do tema (preto)

    // Aplica cor padrão imediatamente
    document.documentElement.style.setProperty('--theme-color', defaultColor);
    
    // Atualiza a versão automaticamente do manifest
    atualizarVersaoDoManifest();

    // Recupera configurações salvas
    chrome.storage.sync.get([
        'darkTheme',
        'cardRDOHH',
        'PDFExtractor',
        'themeColor1',
        'geminiApiKey',
        'keyboardShortcuts',
        'autoFormat',
        'touchScroll',  // Adicionado
        'obrasSlider',   // Adicionado
        'dashboardInicio'
    ], function (data) {
        // Inicializa cada funcionalidade com valores padrão caso não existam
        setupDarkTheme(data.darkTheme ?? false);
        setupHoursCard(data.cardRDOHH ?? true);
        setupPDFExtractor(data.PDFExtractor ?? false);
        setupThemeColor(data.themeColor1 ?? defaultColor);
        setupGeminiKey(data.geminiApiKey ?? '');
        setupKeyboardShortcuts(data.keyboardShortcuts ?? true);
        setupAutoFormat(data.autoFormat ?? true);
        setupTouchScroll(data.touchScroll ?? false); // Adicionado
        setupObrasSlider(data.obrasSlider ?? true);  // Adicionado
        setupDashboardInicio(data.dashboardInicio !== false);
    });

    // // Configuração do Disclaimer
    // const content = document.getElementById('disclaimer-content');
    // const subtitle = document.getElementById('disclaimer-subtitle');
    // const button = document.querySelector('.collapse-button-eye');
    // const header = document.querySelector('.disclaimer-header');

    // // Função para alternar visibilidade do disclaimer
    // function toggleDisclaimer() {
    //     if (content.style.display === 'none') {
    //         content.style.display = 'block';
    //         subtitle.style.display = 'none';
    //         button.classList.add('active');
    //     } else {
    //         content.style.display = 'none';
    //         subtitle.style.display = 'block';
    //         button.classList.remove('active');
    //     }
    // }

    // // Adiciona listener para o clique no header
    // header.addEventListener('click', toggleDisclaimer);
});

// Configuração da chave API do Gemini
function setupGeminiKey(initialKey) {
    const geminiKeyInput = document.getElementById('geminiKey');
    const toggleButton = document.getElementById('toggleKey');
    const visibilityIcon = toggleButton.querySelector('i');
    
    geminiKeyInput.value = initialKey;
    
    toggleButton.addEventListener('click', () => {
        const isVisible = geminiKeyInput.type === 'text';
        geminiKeyInput.type = isVisible ? 'password' : 'text';
        visibilityIcon.textContent = isVisible ? 'Mostrar' : 'Esconder';
    });
    
    function persistirGeminiKey() {
        const apiKey = geminiKeyInput.value;
        chrome.storage.sync.set({ geminiApiKey: apiKey });
    }

    geminiKeyInput.addEventListener('change', persistirGeminiKey);
    geminiKeyInput.addEventListener('input', persistirGeminiKey);
}

// Configuração do tema escuro
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

// Configuração do card de horas
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

// Configuração do extrator de PDF
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

// Configuração dos atalhos de teclado
function setupKeyboardShortcuts(initialState) {
    const keyboardShortcutsCheckbox = document.getElementById('keyboardShortcuts');
    if (!keyboardShortcutsCheckbox) return;

    keyboardShortcutsCheckbox.checked = initialState;

    keyboardShortcutsCheckbox.addEventListener('change', function () {
        const isShortcutsEnabled = keyboardShortcutsCheckbox.checked;
        chrome.storage.sync.set({ keyboardShortcuts: isShortcutsEnabled }, () => {
            notifyContentScript({ keyboardShortcuts: isShortcutsEnabled });
        });
    });
}

// Configuração da formatação automática
function setupAutoFormat(initialState) {
    const autoFormatCheckbox = document.getElementById('AutoFormat1');
    if (!autoFormatCheckbox) return;

    autoFormatCheckbox.checked = initialState;

    autoFormatCheckbox.addEventListener('change', function () {
        const isAutoFormatEnabled = autoFormatCheckbox.checked;
        chrome.storage.sync.set({ autoFormat: isAutoFormatEnabled }, () => {
            notifyContentScript({ autoFormat: isAutoFormatEnabled });
        });
    });
}

// Funções de gerenciamento de cores do tema
function setupThemeColor(initialColor) {
    applyThemeColor(initialColor);
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            const color = option.dataset.themeColor || option.style.backgroundColor || option.style.background;
            saveThemeColor(color);
        });
    });

    const customColorPicker = document.querySelector('.custom-color');
    if (customColorPicker) {
        customColorPicker.addEventListener('change', (e) => {
            saveThemeColor(e.target.value);
        });
    }
}

function saveThemeColor(color) {
    const hex = rgbToHex(color).toLowerCase();
    if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return;
    chrome.storage.sync.set({ themeColor1: hex }, () => {
        applyThemeColor(hex);
        notifyContentScript({ themeColor: hex });
    });
}

// Função auxiliar para converter RGB para Hexadecimal (peguei do stackoverflow)
function rgbToHex(rgb) {
    if (rgb == null || rgb === '') return '';
    // Handle rgb(r, g, b) format
    const matches = String(rgb).match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
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
    let hexColor = rgbToHex(color).toLowerCase();
    if (!hexColor || !/^#[0-9a-f]{6}$/i.test(hexColor)) {
        hexColor = '#000000';
    }

    document.documentElement.style.setProperty('--theme-color', hexColor);

    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
        const raw = option.dataset.themeColor || option.style.backgroundColor || option.style.background || '';
        if (rgbToHex(raw).toLowerCase() === hexColor) {
            option.classList.add('active');
        }
    });

    const customColorPicker = document.querySelector('.custom-color');
    if (customColorPicker && /^#[0-9a-f]{6}$/i.test(hexColor)) {
        customColorPicker.value = hexColor;
    }
}

// Função utilitária para notificar content script
function notifyContentScript(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message);
    });
}

// Adicionar nova função de setup
function setupTouchScroll(initialState) {
    const touchScrollCheckbox = document.getElementById('touchScroll');
    if (!touchScrollCheckbox) return;

    touchScrollCheckbox.checked = initialState;
    
    touchScrollCheckbox.addEventListener('change', function () {
        const isTouchScrollEnabled = touchScrollCheckbox.checked;
        chrome.storage.sync.set({ touchScroll: isTouchScrollEnabled }, () => {
            notifyContentScript({ touchScroll: isTouchScrollEnabled });
        });
    });
}

// Card dashboard na tela inicial (lista de obras)
function setupDashboardInicio(initialState) {
    const el = document.getElementById('dashboardInicio');
    if (!el) return;

    el.checked = initialState;

    el.addEventListener('change', function () {
        const on = el.checked;
        chrome.storage.sync.set({ dashboardInicio: on }, () => {
            notifyContentScript({ dashboardInicio: on });
        });
    });
}

// Configuração do slider de imagens
function setupObrasSlider(initialState) {
    const obrasSliderCheckbox = document.getElementById('obrasSlider');
    if (!obrasSliderCheckbox) return;

    obrasSliderCheckbox.checked = initialState;
    
    obrasSliderCheckbox.addEventListener('change', function () {
        const isObrasSliderEnabled = obrasSliderCheckbox.checked;
        chrome.storage.sync.set({ obrasSlider: isObrasSliderEnabled }, () => {
            notifyContentScript({ obrasSlider: isObrasSliderEnabled });
        });
    });
}

// Configurações padrão
const defaultSettings = {
    darkTheme: false,
    cardRDOHH: true,
    PDFExtractor: false,
    themeColor1: '#000000',
    geminiApiKey: '',
    keyboardShortcuts: true,
    autoFormat: true,
    touchScroll: false,
    obrasSlider: true,
    dashboardInicio: true,
};

// Lista de IDs dos elementos de configuração
const configIds = [
    'darkTheme',
    'cardRDOHH',
    'PDFExtractor',
    'themeColor1',
    'geminiApiKey',
    'keyboardShortcuts',
    'autoFormat',
    'touchScroll',
    'obrasSlider',
    'dashboardInicio',
];

function atualizarVersaoDoManifest() {
    fetch(chrome.runtime.getURL('manifest.json'))
        .then(resposta => resposta.json())
        .then(manifest => {
            const elementoVersao = document.querySelector('.version-tag');
            if (elementoVersao && manifest.version) {
                elementoVersao.textContent = manifest.version;
            }
        })
        .catch(erro => {
            console.error('erro ao carregar manifest:', erro);
        });
}
