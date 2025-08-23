let keyboardShortcutsEnabled = true;

// Função para inicializar atalhos apenas se o servidor estiver disponível
async function initializeKeyboardShortcuts() {
    const available = await isServerAvailable();
    if (!available) {
        console.log('Servidor indisponível - atalhos de teclado não habilitados');
        return;
    }

    chrome.storage.sync.get('keyboardShortcuts', function (data) {
        keyboardShortcutsEnabled = data.keyboardShortcuts ?? true;
        if (keyboardShortcutsEnabled) {
            enableKeyboardShortcuts();
        }
    });
}

// Inicializa os atalhos
initializeKeyboardShortcuts();

chrome.runtime.onMessage.addListener(async (message) => {
    if ('keyboardShortcuts' in message) {
        // Verifica se o servidor está disponível antes de processar
        const available = await isServerAvailable();
        if (!available) {
            console.log('Servidor indisponível - mensagem keyboardShortcuts ignorada');
            return;
        }

        keyboardShortcutsEnabled = message.keyboardShortcuts;
        if (keyboardShortcutsEnabled) {
            enableKeyboardShortcuts();
        } else {
            disableKeyboardShortcuts();
        }
    }
});

function enableKeyboardShortcuts() {
    document.addEventListener("keydown", handleKeydown);
}

function disableKeyboardShortcuts() {
    document.removeEventListener("keydown", handleKeydown);
}

function handleKeydown(evento) {
    // Botão para salvar - Alt + S
    if (document.querySelector('button.btn.btn-success.btn-icon.animation')) {
        if (evento.key && evento.key.toLowerCase() == "s" && evento.altKey) {
            document.querySelector('button.btn.btn-success.btn-icon.animation').click();
        }
    }
    
    // Botão para acessar Obras - Alt + H
    if(document.querySelector('[title="Obras"]')){
        if (evento.key && evento.key.toLowerCase() == "h" && evento.altKey) {
            document.querySelector('[title="Obras"]').click();
        }
    }

    // Exibir o painel ao pressionar Alt + ;
    if (evento.altKey && evento.key === ';') {
        shortcutPanel.style.display = 'block';
    }

    // Fechar o painel ao pressionar ESC
    if (evento.key === 'Escape') {
        shortcutPanel.style.display = 'none';
    }
}

// Initial setup to ensure the correct state of keyboard shortcuts
if (keyboardShortcutsEnabled) {
    enableKeyboardShortcuts();
} else {
    disableKeyboardShortcuts();
}