function identificaRelatorio() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    const detalhesRelatorio = document.querySelector(".card-header h4");

    if (titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && detalhesRelatorio) {  
        console.log("é rdo");
        return true;
    }
    return false;
}

const observerRelatorio = new MutationObserver(() => {
    identificaRelatorio();
});

observerRelatorio.observe(document.body, { childList: true, subtree: true });
