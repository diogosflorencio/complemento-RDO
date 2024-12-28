document.addEventListener("keydown", (evento) => {
    // Botão para salvar - Alt + S
    if (document.querySelector('button.btn.btn-success.btn-icon.animation')) {
        if ((evento.key).toLowerCase() == "s" && evento.altKey) {
            document.querySelector('button.btn.btn-success.btn-icon.animation').click()
        }
    }
    
    // Botão para acessar Obras - Alt + H
    if(document.querySelector('[title="Obras"]')){
        if ((evento.key).toLowerCase() == "h" && evento.altKey) {
            document.querySelector('[title="Obras"]').click();
        }
    }
});

 // Adiciona o comportamento de mostrar e esconder o painel
 document.addEventListener('keydown', function(e) {
    // Exibir o painel ao pressionar Alt + ;
    if (e.altKey && e.key === ';') {
        shortcutPanel.style.display = 'block';
    }

    // Fechar o painel ao pressionar ESC
    if (e.key === 'Escape') {
        shortcutPanel.style.display = 'none';
    }
});