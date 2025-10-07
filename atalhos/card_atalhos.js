/**
 * Módulo de Atalhos de Teclado
 * Cria e gerencia um painel flutuante que exibe os atalhos de teclado disponíveis na aplicação
 */
(async function() {
    // Verifica se o servidor está disponível para funcionalidades
    const available = await isServerAvailable();
    if (!available) {
        console.log('Servidor indisponível - painel de atalhos não criado');
        return;
    }

    // Cria o elemento principal do painel de atalhos
    const shortcutPanel = document.createElement('div');
    shortcutPanel.id = 'shortcutPanel';
    shortcutPanel.innerHTML = `
                <div class="cabecalho-atalhos">
            <h3>ATALHOS</h3>
        </div>
        <div class="shortcut-list">
            <div class="shortcut-item">
                <span>Voltar para Home</span>
                <span class="shortcut-key">Alt + H</span>
            </div>
            <div class="shortcut-item">
                <span>Salvar Relatório</span>
                <span class="shortcut-key">Alt + S</span>
            </div>
            <div class="shortcut-item">
<<<<<<< HEAD
                <span>Aprovar Relatório</span>
                <span class="shortcut-key">Alt + A</span>
            </div>
            <div class="shortcut-item">
=======
>>>>>>> f7e33eade8739748070ab676dedbe6b382c4ccae
                <span>Novo Relatório [NOK]</span>
                <span class="shortcut-key">Alt + N</span>
            </div>
            <div class="shortcut-item">
                <span>Visualizar PDF [NOK]</span>
                <span class="shortcut-key">Alt + P</span>
            </div>
            <div class="shortcut-item">
                <span>Editar Relatório [NOK]</span>
                <span class="shortcut-key">Alt + E</span>
            </div>
            <div class="shortcut-item">
                <span>Buscar Relatório [NOK]</span>
                <span class="shortcut-key">Alt + F</span>
            </div>
            <div class="shortcut-item">
                <span>Fechar Painel</span>
                <span class="shortcut-key">ESC</span>
            </div>
        </div>
    `;

    // Define os estilos CSS do painel e seus componentes
    const style = document.createElement('style');
    style.innerHTML = `
        /* Estilo do painel principal */
        #shortcutPanel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgb(255, 255, 255, 1);
            padding: 20px;
            border-radius: 8px;
            border: solid 2px black;
            box-shadow: 4px 4px rgb(0, 0, 0);
            z-index: 9999;
            width: 300px;
            font-family: Arial, sans-serif;
            transition: height 0.3s ease;
            display: none;
        }
        /* Estilo do cabeçalho do painel */
        .cabecalho-atalhos {
            margin-top: 10px;
            text-align: center;
        }

        /* Estilo do título do painel */
        .cabecalho-atalhos h3 {
            margin: 0 0 15px 0;
            color: var(--theme-color);
            font-weight: bold;
        }

        /* Estilo da lista de atalhos */
        .shortcut-list {
            max-height: 350px;
            overflow-y: auto;
            padding-right: 10px;
        }

        /* Estilo de cada item da lista de atalhos */
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            color: black;
        }

        /* Estilo da tecla de atalho */
        .shortcut-key {
            background: rgba(0, 0, 0, 0.1);
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
            color: var(--theme-color);
            color: black;
        }
    `;

    // Adiciona os elementos ao DOM
    document.head.appendChild(style);
    document.body.appendChild(shortcutPanel);
})();