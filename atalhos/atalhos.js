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

    // Aprovar relatório - Alt + A
    if (evento.altKey && evento.key.toLowerCase() === 'a') {
        aprovarRelatorio();
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

// Função para aprovar relatório automaticamente
async function aprovarRelatorio() {
    try {
        console.log('Iniciando processo de aprovação de relatório...');
        
        // Passo 1: Clicar em "Revisar Relatório"
        const radioRevisar = document.querySelector('input[name="status-rdo"][id="status-revisar"]');
        if (radioRevisar) {
            radioRevisar.click();
            console.log('Status alterado para "Revisar Relatório"');
            
            // Aguarda um pouco para o sistema processar
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
            console.log('Radio "Revisar Relatório" não encontrado');
            return;
        }
        
        // Passo 2: Clicar no botão "Aprovar"
        console.log('Procurando pelo botão "Aprovar"...');
        
        // Procura por todos os botões que podem ser o botão "Aprovar"
        const botoesAprovar = document.querySelectorAll('button.btn.btn-success.btn-icon.animation');
        let botaoAprovarEncontrado = null;
        
        for (const botao of botoesAprovar) {
            const icone = botao.querySelector('i.material-icons');
            if (icone && icone.textContent === 'done_all') {
                botaoAprovarEncontrado = botao;
                break;
            }
        }
        
        if (botaoAprovarEncontrado) {
            console.log('Botão "Aprovar" encontrado, clicando...');
            botaoAprovarEncontrado.click();
            console.log('Botão "Aprovar" clicado');
            
            // Aguarda o dropdown abrir
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Passo 3: Clicar em "Aprovar" no dropdown
            console.log('Procurando pelo link "Aprovar" no dropdown...');
            const linkAprovar = document.querySelector('a.aprovar');
            if (linkAprovar) {
                console.log('Link "Aprovar" encontrado, clicando...');
                linkAprovar.click();
                console.log('Confirmação "Aprovar" clicada');
                
                // Aguarda a confirmação final aparecer
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Passo 4: Clicar na confirmação final "Aprovar"
                console.log('Procurando pela confirmação final...');
                const confirmacaoFinal = document.querySelector('a.aprovar');
                if (confirmacaoFinal) {
                    console.log('Confirmação final encontrada, clicando...');
                    confirmacaoFinal.click();
                    console.log('Relatório aprovado com sucesso!');
                } else {
                    console.log('Confirmação final "Aprovar" não encontrada');
                }
            } else {
                console.log('Link "Aprovar" no dropdown não encontrado');
            }
        } else {
            console.log('Botão "Aprovar" não encontrado. Botões disponíveis:');
            botoesAprovar.forEach((botao, index) => {
                const icone = botao.querySelector('i.material-icons');
                const texto = botao.textContent.trim();
                console.log(`Botão ${index + 1}: texto="${texto}", ícone="${icone ? icone.textContent : 'não encontrado'}"`);
            });
        }
        
    } catch (error) {
        console.error('Erro durante a aprovação do relatório:', error);
    }
}

// Initial setup to ensure the correct state of keyboard shortcuts
if (keyboardShortcutsEnabled) {
    enableKeyboardShortcuts();
} else {
    disableKeyboardShortcuts();
}