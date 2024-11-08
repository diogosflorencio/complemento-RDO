document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup carregado");

    // Carrega o estado inicial do tema escuro ao abrir o popup
    chrome.storage.sync.get('darkTheme', function(data) {
        const isDarkTheme = data.darkTheme ?? false;
        console.log("Estado inicial do tema escuro:", isDarkTheme);

        const darkThemeCheckbox = document.getElementById('darkTheme');
        if (darkThemeCheckbox) {
            darkThemeCheckbox.checked = isDarkTheme;
            console.log("Checkbox do tema escuro configurado para:", isDarkTheme);
        }
    });

    // Listener para o checkbox
    const darkThemeCheckbox = document.getElementById('darkTheme');
    if (darkThemeCheckbox) {
        darkThemeCheckbox.addEventListener('change', function() {
            const isDarkTheme = darkThemeCheckbox.checked;
            chrome.storage.sync.set({ darkTheme: isDarkTheme }, () => {
                console.log("Tema escuro salvo como:", isDarkTheme);
            });
        });
    }
});

document.getElementById('darkThemeCheckbox').addEventListener('change', () => {
    const isChecked = this.checked;
    chrome.storage.sync.set({ darkTheme: isChecked }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { darkTheme: isChecked });
        });
    });
});
