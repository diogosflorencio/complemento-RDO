const unificador_PDFLib = window.PDFLib; // cria o objeto PDFLib

function unificador_rdoEmpresaDoStorage() {
    try {
        const raw = localStorage.getItem('RDOEmpresa');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
const unificador_rdoEmpresa = unificador_rdoEmpresaDoStorage() || {};
const unificador_tokenApiExterna = unificador_rdoEmpresa.tokenApiExterna;

const unificador_API_BASE_URL = "https://apiexterna.diariodeobra.app/v1";

const unificador_headers = {
    'token': unificador_tokenApiExterna,
    'Content-Type': 'application/json'
};

let unificador_PDFExtractorAtivo = true;
let unificador_cardFiltroCreated = false;

// Função para inicializar o extrator apenas se o servidor estiver disponível
async function initializePDFExtractor() {
    const available = await isServerAvailable();
    if (!available) {
        console.log('Servidor indisponível - extrator de PDFs não habilitado');
        return;
    }

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
}

// Inicializa o extrator
initializePDFExtractor();

// Message listener
chrome.runtime.onMessage.addListener(async (mensagem, sender, sendResponse) => {
    if ('PDFExtractor' in mensagem) {
        // Verifica se o servidor está disponível antes de processar
        const available = await isServerAvailable();
        if (!available) {
            console.log('Servidor indisponível - mensagem PDFExtractor ignorada');
            return;
        }

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

async function unificador_criarCardFiltro() {
    // Verifica se o servidor está disponível para funcionalidades
    const available = await isServerAvailable();
    if (!available) {
        console.log('Servidor indisponível - card de filtro não criado');
        return null;
    }

    if (!unificador_PDFExtractorAtivo) return null;
    console.log('Criando card filtro');
    const container = document.createElement('div');
    container.classList = "container_pdf_filtro";

    container.innerHTML = `
        <div class="container complemento-card-fixo" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; box-sizing: border-box; background: rgb(255, 255, 255); padding: 20px; border-radius: 8px; border: 2px solid black; box-shadow: rgb(0, 0, 0) 4px 4px; font-family: Arial, sans-serif; content-align: center; flex-direction: column; gap: 10px; font-size: 14px;">
           <!-- <details class="unificador-aviso-collapse" style="overflow-y: auto;  max-height: 210px; background: rgb(255, 236, 230); border: 1.5px solid rgb(230, 46, 0); color: rgb(122, 35, 0); border-radius: 6px; padding: 0; margin: 10px 0; max-width: 100%; font-size: 13px; line-height: 1.3; box-shadow: 0 2px 6px #0001;">
                <summary style="padding: 10px 12px; font-weight: bold; cursor: pointer; outline: none;">
                    AVISO
                </summary>
                <div style="padding: 8px 12px 12px 12px; border-top: 1px solid #e6a394;">
                    <span style="display: block; margin-bottom: 7px;">
                        O ideal é usar o novo unificador de relatórios, localizado em <b>"Relatórios"</b> com o nome <b>"Compilador de Medição"</b>.
                        Este aqui permanece por legado e continuará funcionando por um tempo, mas todas as melhorias e novas funcionalidades serão concentradas no novo unificador, que é mais completo e eficiente. O script disso foi refatorado e melhorado para suprir as instabilidades do diario de obra, e agora as requisições são feitas em paralelo e com timeout de 5 minutos por requisição.
                    </span>
                    <span style="display: block; margin-bottom: 7px;">
                        O novo compilador realiza <b>fetch paralelo</b>, tornando o processo muito mais rápido.<br>
                        Nele você pode extrair todos os relatórios de todas as obras em um período específico. Ou pode especificar um periodo e uma obra e extrair apenas os relatórios dessa obra (através do ID da obra que pode ser copiado na URL da obra)
                    </span>
                    <span style="display: block;">
                        Att,<br>
                        Diogo
                    </span>
                </div>
            </details>-->
            <div class="wrapper-container" style="position: absolute; z-index: 99999; top: 3px; left: 15px; width: 25px; margin: 0px; padding: 0px; color: var(--theme-color); cursor: pointer; height: 10px; ">
                <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(180deg);">
                    <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path>
                </svg>
            </div>
            <div class="unificador-titulo-colapsado" style="display: none; margin: 15px 2px 0px 10px; padding-left: 10px; color: var(--theme-color); font-size: 18px; font-weight: 600;">Unificador de PDF</div>
            <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="margin: 15px 0px 5px; color: var(--theme-color) !important; font-size: 25px; font-weight: 600">Unificador de PDFs/Obra
                <p style="margin: 5px 0 5px 0; color:var(--theme-color); font-size: 0.70rem; font-style: italic;">Funciona de forma automática com 
                a API de qualquer<br> empresa, desde
                que tenha o token de integração gerado.</p>
                </div>
            </div>
            <div class="filtro-content" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                <div class="input-group" style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label for="unificador-pdf-data-inicio" style="display: block; margin-bottom: 4px; color: #444;">Data Inicial:</label>
                            <input type="date" id="unificador-pdf-data-inicio" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="flex: 1;">
                            <label for="unificador-pdf-data-fim" style="display: block; margin-bottom: 4px; color: #444;">Data Final:</label>
                            <input type="date" id="unificador-pdf-data-fim" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                    <div>
                        <label for="unificador-pdf-ordem" style="display: block; margin-bottom: 4px; color: #444;">Ordem:</label>
                        <select id="unificador-pdf-ordem" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="desc">Do fim ao início</option>
                            <option value="asc">Do início ao fim</option>
                        </select>
                    </div>
                    <div>
                        <label for="unificador-pdf-tipo" style="display: block; margin-bottom: 4px; color: #444;">Modelo de relatório:</label>
                        <select id="unificador-pdf-tipo" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Todos os modelos</option>
                        </select>
                        <span style="font-size: 0.75rem; color: #666;">Modelos da obra (automatico conforme api).</span>
                    </div>
                    <button class="btn-extrair-pdf" style="width: 100%; padding: 8px; background: var(--theme-color); color: white; border: 2px solid black; border-radius: 8px; box-shadow: 2px 2px rgb(0, 0, 0); cursor: pointer; margin-top: 5px;">
                        EXTRAIR
                    </button>
                </div>
                <div id="unificador-status-extracao" style="margin-top: 10px; font-size: 14px; color: #666;"></div>
            </div>
        </div>
    `;

    document.body.appendChild(container);
    const _crvUnif = container.querySelector('.container');
    if (_crvUnif && typeof complementoRdoMountVersionStrip === 'function') complementoRdoMountVersionStrip(_crvUnif);

    void unificador_preencherSelectModelosRelatorio(container).catch((err) => console.warn('Unificador: modelos', err));

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
        const aviso = container.querySelector('.unificador-aviso-collapse');
        const tituloColapsado = container.querySelector('.unificador-titulo-colapsado');
        const cabecalho = container.querySelector('.cabecalho');
        const filtro = container.querySelector('.filtro-content');
        const box = container.querySelector('.container');
        if (colapsado) {
            if (aviso) aviso.style.display = 'none';
            if (tituloColapsado) tituloColapsado.style.display = 'block';
            if (cabecalho) cabecalho.style.display = 'none';
            if (filtro) filtro.style.display = 'none';
            if (box) { box.style.minWidth = '180px'; box.style.width = '220px'; box.style.height = '65px'; box.style.padding = '8px'; box.style.paddingLeft = '10px'; }
        } else {
            if (aviso) aviso.style.display = '';
            if (tituloColapsado) tituloColapsado.style.display = 'none';
            if (cabecalho) cabecalho.style.display = '';
            if (filtro) filtro.style.display = '';
            if (box) {
                box.style.width = '340px';
                box.style.minWidth = '340px';
                box.style.maxWidth = '340px';
                box.style.height = '';
                box.style.padding = '20px';
                box.style.overflowX = 'hidden';
            }
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

function unificador_extrairObraIdDaUrl() {
    const m = window.location.href.match(/obras\/([^/]+)\/relatorios/);
    return m ? m[1] : null;
}

/** Preenche o select com modelos retornados em GET /obras/{obraId} (campo modelosDeRelatorios). */
async function unificador_preencherSelectModelosRelatorio(container) {
    const select = container.querySelector('#unificador-pdf-tipo');
    if (!select) return;

    const montarSoTodos = () => {
        select.innerHTML = '';
        const o0 = document.createElement('option');
        o0.value = '';
        o0.textContent = 'Todos os modelos';
        select.appendChild(o0);
    };

    montarSoTodos();
    const obraId = unificador_extrairObraIdDaUrl();
    if (!obraId) {
        const hint = document.createElement('option');
        hint.value = '';
        hint.disabled = true;
        hint.textContent = 'Entre na lista de relatórios de uma obra para carregar os modelos.';
        select.appendChild(hint);
        return;
    }

    try {
        const obra = await unificador_fazerRequisicao(`obras/${obraId}`);
        const modelos = obra && Array.isArray(obra.modelosDeRelatorios) ? obra.modelosDeRelatorios : [];
        montarSoTodos();
        const seen = new Set();
        for (const modelo of modelos) {
            if (!modelo || modelo._id == null) continue;
            const id = String(modelo._id);
            if (seen.has(id)) continue;
            seen.add(id);
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = modelo.descricao || modelo.nome || `Modelo ${id}`;
            select.appendChild(opt);
        }
        if (modelos.length === 0) {
            const hint = document.createElement('option');
            hint.value = '';
            hint.disabled = true;
            hint.textContent = 'Nenhum modelo cadastrado nesta obra.';
            select.appendChild(hint);
        }
    } catch (e) {
        console.warn('Unificador: erro ao buscar modelos da obra', e);
        montarSoTodos();
        const hint = document.createElement('option');
        hint.value = '';
        hint.disabled = true;
        hint.textContent = 'Não foi possível carregar os modelos (token ou API).';
        select.appendChild(hint);
    }
}

async function unificador_atualizarStatus(mensagem, contador = null) {
    const statusElement = document.querySelector('.container_pdf_filtro #unificador-status-extracao');
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
        statusElement.innerHTML = `${mensagem} <svg style="padding-bottom: 3px" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_d9Sa{transform-origin:center}.spinner_qQQY{animation:spinner_ZpfF 9s linear infinite}.spinner_pote{animation:spinner_ZpfF .75s linear infinite}@keyframes spinner_ZpfF{100%{transform:rotate(360deg)}}</style><path fill="rgb(127, 140, 141)" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"/><rect fill="rgb(127, 140, 141)" class="spinner_d9Sa spinner_qQQY" x="11" y="6" rx="1" width="2" height="7"/><rect fill="rgb(127, 140, 141)" class="spinner_d9Sa spinner_pote" x="11" y="11" rx="1" width="2" height="9"/></svg>`;
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

    const idAlvo = String(tipoRelatorio);
    return response.filter((relatorio) => {
        const mid = relatorio.modeloDeRelatorioGlobal && relatorio.modeloDeRelatorioGlobal._id != null
            ? String(relatorio.modeloDeRelatorioGlobal._id)
            : '';
        return mid === idAlvo;
    });
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

function unificador_ehPdfValido(buffer) {
    if (!buffer || buffer.byteLength < 5) return false;
    const arr = new Uint8Array(buffer);
    return arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46 && arr[4] === 0x2D;
}

// Delay entre requisições para respeitar limite da API (150 req/min)
const UNIFICADOR_DELAY_ENTRE_REQS_MS = 500;
const UNIFICADOR_FETCH_TIMEOUT_MS = 300000; // 5 min – antes não havia timeout no código; algo no meio (proxy/servidor) fechava em ~45s–1min

function unificador_delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function unificador_fetchComTimeout(url, msTimeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), msTimeout);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

const UNIFICADOR_CONCORRENCIA = 5;
const UNIFICADOR_MAX_TENTATIVAS = 5;

// Função pra fazer o merge com fetch paralelo (limite de concorrência) e lista de falhas
async function unificador_mergePDFs(pdfItems, statusCallback) {
    const PDFDocument = window.PDFLib.PDFDocument;
    const PdfJuntado = await PDFDocument.create();
    const falhas = [];
    const resultados = new Array(pdfItems.length).fill(null);

    if (pdfItems.length === 0) {
        throw new Error('Nenhum relatório encontrado no período.');
    }

    const baixarUm = async (index) => {
        const item = pdfItems[index];
        const numRelatorio = index + 1;
        for (let tentativa = 1; tentativa <= UNIFICADOR_MAX_TENTATIVAS; tentativa++) {
            statusCallback(tentativa === 1 ? `Baixando PDF ${numRelatorio} de ${pdfItems.length}` : `Relatório ${numRelatorio} erro. Tentativa ${tentativa}/${UNIFICADOR_MAX_TENTATIVAS}...`);
            try {
                const response = await unificador_fetchComTimeout(item.url, UNIFICADOR_FETCH_TIMEOUT_MS);
                if (response.status === 429) {
                    statusCallback('Limite da API (150/min). Aguardando 1 minuto...');
                    await unificador_delay(60000);
                    tentativa--;
                    continue;
                }
                if (!response.ok) {
                    if (tentativa < UNIFICADOR_MAX_TENTATIVAS) continue;
                    falhas.push({ obraId: item.obraId, relatorioId: item.relatorioId });
                    return;
                }
                const binarioPdf = await response.arrayBuffer();
                if (!unificador_ehPdfValido(binarioPdf)) {
                    if (tentativa < UNIFICADOR_MAX_TENTATIVAS) continue;
                    falhas.push({ obraId: item.obraId, relatorioId: item.relatorioId });
                    return;
                }
                resultados[index] = binarioPdf;
                return;
            } catch (e) {
                const msgErro = e.name === 'AbortError' ? 'timeout' : 'erro na requisição';
                if (tentativa < UNIFICADOR_MAX_TENTATIVAS) {
                    statusCallback(`Relatório ${numRelatorio} ${msgErro}. Tentativa ${tentativa}/${UNIFICADOR_MAX_TENTATIVAS}...`);
                    await unificador_delay(2000);
                } else {
                    falhas.push({ obraId: item.obraId, relatorioId: item.relatorioId });
                    return;
                }
            }
        }
    };

    for (let start = 0; start < pdfItems.length; start += UNIFICADOR_CONCORRENCIA) {
        const fim = Math.min(start + UNIFICADOR_CONCORRENCIA, pdfItems.length);
        const chunk = [];
        for (let i = start; i < fim; i++) chunk.push(baixarUm(i));
        await Promise.all(chunk);
    }

    statusCallback('Montando PDF na ordem...');
    for (let i = 0; i < resultados.length; i++) {
        if (!resultados[i]) continue;
        const pdfDoc = await PDFDocument.load(resultados[i]);
        const paginas = await PdfJuntado.copyPages(pdfDoc, pdfDoc.getPageIndices());
        paginas.forEach(p => PdfJuntado.addPage(p));
    }

    if (PdfJuntado.getPageCount() === 0) {
        throw new Error('Nenhum PDF válido obtido. Os links dos relatórios podem estar indisponíveis, ter expirado (timeout) ou a API pode ter atingido o limite de 150 requisições/minuto.');
    }
    if (falhas.length > 0) {
        statusCallback(`${falhas.length} relatório(s) não baixado(s). Foi gerado um arquivo HTML com os links.`);
    }
    return { mergedBytes: await PdfJuntado.save(), falhas };
}

function unificador_gerarHtmlRelatoriosNaoBaixados(falhas) {
    const base = 'https://web.diariodeobra.app/#/app/obras';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatórios não baixados (Unificador)</title></head><body>
<h1>Relatórios que não foram baixados (${falhas.length})</h1>
<p>Erro na requisição, timeout ou arquivo não era PDF válido.</p>
${falhas.map(f => `<p><a href="${base}/${f.obraId}/relatorios/${f.relatorioId}" target="_blank">Obra ${f.obraId} – Relatório ${f.relatorioId}</a></p>`).join('')}
</body></html>`;
}

async function unificador_processarRelatorios() {
    const card = document.querySelector('.container_pdf_filtro');
    const btnExtrair = card && card.querySelector('.btn-extrair-pdf');
    try {
        if (!window.PDFLib) {
            throw new Error('Biblioteca de merge dos PDFs não carregada. Recarregue a página.');
        }
        if (!card || !btnExtrair) {
            throw new Error('Card do Unificador não encontrado.');
        }

        btnExtrair.disabled = true;

        await unificador_atualizarStatus("Iniciando conexão com API", 3);

        const obraId = unificador_extrairObraIdDaUrl();
        if (!obraId) {
            throw new Error('Não foi possível identificar a obra na URL (…/obras/{id}/relatorios).');
        }

        const dataInicio = card.querySelector('#unificador-pdf-data-inicio').value;
        const dataFim = card.querySelector('#unificador-pdf-data-fim').value;
        const ordem = card.querySelector('#unificador-pdf-ordem').value;

        if (!dataInicio || !dataFim) {
            throw new Error('Selecione as datas de início e fim');
        }

        await unificador_atualizarStatus("Buscando relatórios");
        const tipo = card.querySelector('#unificador-pdf-tipo').value;
        const relatorios = await unificador_obterRelatoriosObra(obraId, dataInicio, dataFim, ordem, tipo);

        await unificador_atualizarStatus(`Encontrados ${relatorios.length} relatórios`, 2);

        const pdfItems = [];
        for (let index = 0; index < relatorios.length; index++) {
            await unificador_atualizarStatus(`Buscando link ${index + 1}/${relatorios.length}`);
            let detalhes;
            for (let tentativa = 0; ; tentativa++) {
                try {
                    detalhes = await unificador_obterDetalhesRelatorio(obraId, relatorios[index]._id);
                    break;
                } catch (err) {
                    if (err.message && err.message.includes('429') && tentativa < 3) {
                        await unificador_atualizarStatus('Limite da API (150/min). Aguardando 1 minuto...');
                        await unificador_delay(60000);
                    } else throw err;
                }
            }
            pdfItems.push({ url: detalhes.linkPdf, obraId, relatorioId: relatorios[index]._id });
            if (index < relatorios.length - 1) await unificador_delay(UNIFICADOR_DELAY_ENTRE_REQS_MS);
        }

        await unificador_atualizarStatus("Preparando mesclagem", 2);
        const { mergedBytes, falhas } = await unificador_mergePDFs(pdfItems, msg => unificador_atualizarStatus(msg));

        const nomeObra = await unificador_obterNomeObra(obraId);

        await unificador_atualizarStatus("Finalizando download", 2);
        const blob = new Blob([mergedBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${nomeObra}.pdf`;
        link.click();

        if (falhas.length > 0) {
            const htmlBlob = new Blob([unificador_gerarHtmlRelatoriosNaoBaixados(falhas)], { type: 'text/html' });
            const linkHtml = document.createElement('a');
            linkHtml.href = URL.createObjectURL(htmlBlob);
            linkHtml.download = 'unificador_relatorios_nao_baixados.html';
            linkHtml.click();
        }
        await unificador_atualizarStatus("Download concluído!");
    } catch (error) {
        unificador_atualizarStatus(`Erro: ${error.message}`);
    } finally {
        if (btnExtrair) btnExtrair.disabled = false;
    }
}

if (!window.__unificadorHashchangeModelos) {
    window.__unificadorHashchangeModelos = true;
    window.addEventListener('hashchange', () => {
        const c = document.querySelector('.container_pdf_filtro');
        if (c && unificador_extrairObraIdDaUrl()) {
            void unificador_preencherSelectModelosRelatorio(c).catch(() => {});
        }
    });
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