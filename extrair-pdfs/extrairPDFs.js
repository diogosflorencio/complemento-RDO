const unificador_PDFLib = window.PDFLib; // cria o objeto PDFLib

const unificador_rdoEmpresa = JSON.parse(localStorage.getItem('RDOEmpresa'));
const unificador_tokenApiExterna = unificador_rdoEmpresa.tokenApiExterna;

const unificador_API_BASE_URL = "https://apiexterna.diariodeobra.app/v1";

const unificador_headers = {
    'token': unificador_tokenApiExterna,
    'Content-Type': 'application/json'
};

// At the beginning of the file
let unificador_PDFExtractorAtivo = true;
let unificador_cardFiltroCreated = false;

// Load initial state
chrome.storage.sync.get('PDFExtractor', function (data) {
    unificador_PDFExtractorAtivo = data.PDFExtractor ?? true;
    if (!unificador_PDFExtractorAtivo) {
        const container = document.querySelector('.container_pdf_filtro');
        if (container) {
            container.remove();
            unificador_cardFiltroCreated = false;
        }
    }
});

// Message listener
chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
    if ('PDFExtractor' in mensagem) {
        unificador_PDFExtractorAtivo = mensagem.PDFExtractor;
        if (!unificador_PDFExtractorAtivo) {
            const container = document.querySelector('.container_pdf_filtro');
            if (container) {
                container.remove();
                unificador_cardFiltroCreated = false;
            }
        } else if (window.location.href.match(/obras\/(.*?)\/relatorios$/)) {
            if (!unificador_cardFiltroCreated) {
                unificador_criarCardFiltro();
                unificador_cardFiltroCreated = true;
            }
        }
    }
});

function unificador_criarCardFiltro() {
    if (!unificador_PDFExtractorAtivo) return null;
    console.log('Criando card filtro');
    const container = document.createElement('div');
    container.classList = "container_pdf_filtro";

    container.innerHTML = `
        <div class="container" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; min-width: 300px; width: fit-content; box-sizing: border-box; background: rgb(255, 255, 255); padding: 20px; border-radius: 8px; border: 2px solid black; box-shadow: rgb(0, 0, 0) 4px 4px; font-family: Arial, sans-serif; content-align: center; flex-direction: column; gap: 10px; font-size: 14px;">
            <div class="unificador-aviso" style="background: #fffbe6; border: 1.5px solid #e6c200; color: #7a5c00; border-radius: 6px; padding: 10px 12px; margin: 10px 0; max-width: 300px; max-height: 90px; overflow-y: auto; font-size: 13px; line-height: 1.3; box-shadow: 0 2px 6px #0001;">
                <b>Aviso:</b> talvez seja descontinuado na próxima versão. Novo unificador ficará na parte de relatório e fará extração e processamento geral de PDF e dados considerando todas as obras que têm relatórios em certo período.<br><br>
                Além disso, aprendi uma nova forma de fazer fetch em API mais eficiente, fazendo com que a busca de relatório seja de forma paralela, o que leva menos tempo pra todo processo. A lógica usada nesse extrator e sua forma específica de funcionar se torna obsoleta. Talvez eu o atualize e mantenha, talvez apenas apague. <br><br>
                Depois de horas de trabalho...att diogo
            </div>
            <div class="wrapper-container" style="position: absolute; z-index: 99999; top: 3px; left: 15px; width: 25px; margin: 0px; padding: 0px; color: var(--theme-color); cursor: pointer;">
                <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(180deg);">
                    <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path>
                </svg>
            </div>
            <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="margin: 15px 0px 5px; color: var(--theme-color) !important; font-size: 25px; font-weight: 600">Unificador de Relatórios
                <p style="margin: 5px 0 5px 0; color:var(--theme-color); font-size: 0.70rem; font-style: italic;">Funciona de forma automática com 
                a API de qualquer<br> empresa, desde
                que tenha o token de integração gerado.</p>
                </div>
            </div>
            <div class="filtro-content" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                <div class="input-group" style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label for="pdf-data-inicio" style="display: block; margin-bottom: 4px; color: #444;">Data Inicial:</label>
                            <input type="date" id="pdf-data-inicio" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="flex: 1;">
                            <label for="pdf-data-fim" style="display: block; margin-bottom: 4px; color: #444;">Data Final:</label>
                            <input type="date" id="pdf-data-fim" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                    <div>
                        <label for="pdf-ordem" style="display: block; margin-bottom: 4px; color: #444;">Ordem:</label>
                        <select id="pdf-ordem" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="desc">Do fim ao início</option>
                            <option value="asc">Do início ao fim</option>
                        </select>
                    </div>
                    <div>
                        <label for="pdf-tipo" style="display: block; margin-bottom: 4px; color: #444;">Tipo de Relatório:</label>
                        <select id="pdf-tipo" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">
                            Todos ou (Selecione um tipo específico)</option>
                            <option value="semanal">
                            Relatório Semanal de Produção (RSP)</option>
                            <option value="diario">
                            Relatório Diário de Obra (RDO)</option>
                            <option value="orcamentos">
                            Orçamentos</option>
                        </select>
                    </div>
                    <button class="btn-extrair-pdf" style="width: 100%; padding: 8px; background: var(--theme-color); color: white; border: 2px solid black; border-radius: 8px; box-shadow: 2px 2px rgb(0, 0, 0); cursor: pointer; margin-top: 5px;">
                        EXTRAIR
                    </button>
                </div>
                <div id="status-extracao" style="margin-top: 10px; font-size: 14px; color: #666;"></div>
            </div>
        </div>
    `;

    document.body.appendChild(container);

    container.querySelector('.btn-extrair-pdf').addEventListener('click', unificador_processarRelatorios);
    container.querySelector('.wrapper-container').addEventListener('click', unificador_toggleCard);

    // Lógica de wrap: ao minimizar, só mostra aviso e cabeçalho, o resto some
    let unificador_colapsado = localStorage.getItem('unificador_pdf_card_colapsado') === 'true';
    aplicarEstadoColapsoUnificador(unificador_colapsado);
    container.querySelector('.wrapper-container').addEventListener('click', function (e) {
        e.stopPropagation();
        unificador_colapsado = !unificador_colapsado;
        localStorage.setItem('unificador_pdf_card_colapsado', unificador_colapsado);
        aplicarEstadoColapsoUnificador(unificador_colapsado);
    });

    function aplicarEstadoColapsoUnificador(colapsado) {
        const aviso = container.querySelector('.unificador-aviso');
        const cabecalho = container.querySelector('.cabecalho');
        const filtro = container.querySelector('.filtro-content');
        if (colapsado) {
            aviso.style.maxHeight = '50px';
            aviso.style.overflowY = 'auto';
            aviso.style.fontSize = '12px';
            if (cabecalho) cabecalho.style.display = 'none';
            if (filtro) filtro.style.display = 'none';
            container.style.minWidth = '180px';
            container.style.width = '220px';
            container.style.height = '70px';
            container.style.padding = '8px';
        } else {
            aviso.style.maxHeight = '90px';
            aviso.style.overflowY = 'auto';
            aviso.style.fontSize = '13px';
            if (cabecalho) cabecalho.style.display = '';
            if (filtro) filtro.style.display = '';
            container.style.minWidth = '300px';
            container.style.width = 'fit-content';
            container.style.height = '';
            container.style.padding = '20px';
        }
    }

    return container;
}

function unificador_toggleCard(e) {
    const container = e.currentTarget.closest('.container');
    const content = container.querySelector('.filtro-content');
    const arrow = container.querySelector('.down');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }

    localStorage.setItem('unificador_pdfFilterState', content.style.display);
}

async function unificador_atualizarStatus(mensagem, contador = null) {
    const statusElement = document.getElementById('status-extracao');
    if (!statusElement) return;

    if (contador) {
        let count = contador;
        statusElement.textContent = `${mensagem} ${count}`;

        return new Promise(resolve => {
            const interval = setInterval(() => {
                count--;
                statusElement.innerHTML = `${mensagem} ${count} <svg style="padding-bottom: 3px" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_d9Sa{transform-origin:center}.spinner_qQQY{animation:spinner_ZpfF 9s linear infinite}.spinner_pote{animation:spinner_ZpfF .75s linear infinite}@keyframes spinner_ZpfF{100%{transform:rotate(360deg)}}</style><path fill="rgb(127, 140, 141)" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"/><rect fill="rgb(127, 140, 141)" class="spinner_d9Sa spinner_qQQY" x="11" y="6" rx="1" width="2" height="7"/><rect fill="rgb(127, 140, 141)" class="spinner_d9Sa spinner_pote" x="11" y="11" rx="1" width="2" height="9"/></svg>`;

                if (count <= 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    } else {
        statusElement.textContent = `${mensagem}`;
    }
}

async function unificador_fazerRequisicao(endpoint, params = {}) {
    const url = new URL(`${unificador_API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url, { headers: unificador_headers });
    if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
    }
    return await response.json();
}

async function unificador_obterRelatoriosObra(obraId, dataInicio, dataFim, ordem, tipoRelatorio) {
    const params = {
        limite: 100,
        ordem: ordem,
        dataInicio: dataInicio,
        dataFim: dataFim
    };

    const response = await unificador_fazerRequisicao(`obras/${obraId}/relatorios`, params);

    if (tipoRelatorio === '') {
        return response;
    }

    return response.filter(relatorio =>
        relatorio.modeloDeRelatorioGlobal?.descricao.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(tipoRelatorio)
    );
}

async function unificador_obterDetalhesRelatorio(obraId, relatorioId) {
    return await unificador_fazerRequisicao(`obras/${obraId}/relatorios/${relatorioId}`);
}

async function unificador_obterNomeObra(obraId) {
    const response = await unificador_fazerRequisicao(`obras/${obraId}`);
    return response.nome
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

// Função pra fazer o merge (com retorno do status no callback pra o usuario)
async function unificador_mergePDFs(pdfUrls, statusCallback) {
    // faço o acesso a lib depois que ela for carregada
    const PDFDocument = window.PDFLib.PDFDocument;
    const PdfJuntado = await PDFDocument.create();
    
    // verificação para caso não haja relatorios no periodo selecionado
    if (pdfUrls.length === 0) {	
        throw new Error('Nenhum relatório encontrado no período.');
    }
    
    for (let [index, url] of pdfUrls.entries()) {
        statusCallback(`Processando PDF ${index + 1} de ${pdfUrls.length}`);
        const response = await fetch(url);
        const binarioPdf = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(binarioPdf);
        const paginas = await PdfJuntado.copyPages(pdfDoc, pdfDoc.getPageIndices());
        paginas.forEach(pagina => PdfJuntado.addPage(pagina));
    }

    return await PdfJuntado.save();
}

async function unificador_processarRelatorios() {
    const btnExtrair = document.querySelector('.btn-extrair-pdf');
    try {
        if (!window.PDFLib) {
            throw new Error('Biblioteca de merge dos PDFs não carregada. Recarregue a página.');
        }

        btnExtrair.disabled = true;

        await unificador_atualizarStatus("Iniciando conexão com API", 3);

        const url = window.location.href;
        const match = url.match(/obras\/(.*?)\/relatorios/);
        const obraId = match[1];

        const dataInicio = document.getElementById('pdf-data-inicio').value;
        const dataFim = document.getElementById('pdf-data-fim').value;
        const ordem = document.getElementById('pdf-ordem').value;

        if (!dataInicio || !dataFim) {
            throw new Error('Selecione as datas de início e fim');
        }

        await unificador_atualizarStatus("Buscando relatórios");
        const tipo = document.getElementById('pdf-tipo').value;
        const relatorios = await unificador_obterRelatoriosObra(obraId, dataInicio, dataFim, ordem, tipo);

        await unificador_atualizarStatus(`Encontrados ${relatorios.length} relatórios`, 2);

        const pdfUrls = [];
        for (let [index, relatorio] of relatorios.entries()) {
            await unificador_atualizarStatus(`Processando relatório ${index + 1}/${relatorios.length}`);
            const detalhes = await unificador_obterDetalhesRelatorio(obraId, relatorio._id);
            pdfUrls.push(detalhes.linkPdf);
        }

        await unificador_atualizarStatus("Preparando mesclagem", 2);
        const mergedPdfBytes = await unificador_mergePDFs(pdfUrls, msg => unificador_atualizarStatus(msg));

        const nomeObra = await unificador_obterNomeObra(obraId);

        await unificador_atualizarStatus("Finalizando download", 2);
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${nomeObra}.pdf`;
        link.click();

        await unificador_atualizarStatus("Download concluído!");
    } catch (error) {
        unificador_atualizarStatus(`Erro: ${error.message}`);
    } finally {
        btnExtrair.disabled = false;
    }
}

const unificador_observerRelatorios = new MutationObserver(() => {
    if (!unificador_cardFiltroCreated && unificador_PDFExtractorAtivo && window.location.href.match(/obras\/(.*?)\/relatorios$/)) {
        unificador_criarCardFiltro();
        unificador_cardFiltroCreated = true;
    }
});

const unificador_observerNaoRelatorios = new MutationObserver(() => {
    if (unificador_cardFiltroCreated && !window.location.href.match(/obras\/(.*?)\/relatorios$/)) {
        const cardFiltro = document.querySelector('.container_pdf_filtro');
        if (cardFiltro) {
            cardFiltro.remove();
            unificador_cardFiltroCreated = false;
        }
    }
});

unificador_observerRelatorios.observe(document.body, {
    childList: true,
    subtree: true
});

unificador_observerNaoRelatorios.observe(document.body, {
    childList: true,
    subtree: true
});

if (window.location.href.includes('/relatorios') && unificador_PDFExtractorAtivo) {
    unificador_criarCardFiltro();
    unificador_cardFiltroCreated = true;
}