// Listen for theme color changes
chrome.runtime.onMessage.addListener((message) => {
    if (message.themeColor) {
        updateThemeColor(message.themeColor);
    }
});

// Load saved theme on page load
// Set default theme color if none is stored
chrome.storage.sync.get('themeColor', (data) => {
    const defaultColor = '#1d5b50';
    if (!data.themeColor) {
        chrome.storage.sync.set({ themeColor: defaultColor });
    }
    updateThemeColor(data.themeColor || defaultColor);
});


function updateThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    
    // Update specific elements that use the theme color
    const themeElements = document.querySelectorAll('.module-header, .beta-banner, .shortcutPanel');
    themeElements.forEach(element => {
        element.style.backgroundColor = color;
    });
}
// Função para mudar cores do header
function mudarCores() {
    const headerRDOApp = document.querySelectorAll('header.header');
    headerRDOApp.forEach(header => {
      header.style.backgroundColor = "var(--theme-color)";
    });
  }

  // Inicialização
mudarCores();
