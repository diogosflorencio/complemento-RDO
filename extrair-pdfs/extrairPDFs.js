const unificador_PDFLib = window.PDFLib;
// No topo de extrairPDFs.js, substitui a linha do svgCarregando

const svgCarregando = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="20" height="20"><path fill="#000000" stroke="#000000" stroke-width="12" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.5" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>';

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

async function initializePDFExtractor() {
    const available = await isServerAvailable();
    if (!available) {
        return;
    }

    chrome.storage.sync.get('PDFExtractor', function (data) {
        unificador_PDFExtractorAtivo = data.PDFExtractor ?? true;
        if (!unificador_PDFExtractorAtivo) {
            const cardUnificador = document.getElementById('unificador-status-extracao')?.closest('.container_pdf_filtro');
            if (cardUnificador) {
                cardUnificador.remove();
                unificador_cardFiltroCreated = false;
            }
        }
    });
}

initializePDFExtractor();

chrome.runtime.onMessage.addListener(async (mensagem, sender, sendResponse) => {
    if ('PDFExtractor' in mensagem) {
        const available = await isServerAvailable();
        if (!available) {
            return;
        }

        unificador_PDFExtractorAtivo = mensagem.PDFExtractor;
        if (!unificador_PDFExtractorAtivo) {
            const cardUnificador = document.getElementById('unificador-status-extracao')?.closest('.container_pdf_filtro');
            if (cardUnificador) {
                cardUnificador.remove();
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
    const available = await isServerAvailable();
    if (!available) {
        return null;
    }

    if (!unificador_PDFExtractorAtivo) return null;
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

    void unificador_preencherSelectModelosRelatorio(container).catch(() => {});

    container.querySelector('.btn-extrair-pdf').addEventListener('click', unificador_processarRelatorios);
    container.querySelector('.wrapper-container').addEventListener('click', unificador_toggleCard);

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
            if (!modelo) continue;
            const id = unificador_idModeloParaValorSelect(modelo);
            if (!id || seen.has(id)) continue;
            seen.add(id);
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent =
                modelo.descricao ||
                modelo.nome ||
                (modelo.modeloDeRelatorioGlobal && modelo.modeloDeRelatorioGlobal.descricao) ||
                `Modelo ${id}`;
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
        montarSoTodos();
        const hint = document.createElement('option');
        hint.value = '';
        hint.disabled = true;
        hint.textContent = 'Não foi possível carregar os modelos (token ou API).';
        select.appendChild(hint);
    }
}

function unificador_montarHtmlStatus(mensagemHtml) {
    return `<div class="complemento-rdo-status-linha" style="font-size:14px;color:#666;line-height:1.45;width:100%;box-sizing:border-box">${mensagemHtml}</div>`;
}

async function unificador_atualizarStatus(mensagem, modoOuContagem = null) {
    const elementoStatus = document.getElementById('unificador-status-extracao');
    if (!elementoStatus) return;

    const texto =
        typeof mensagem === 'string' ? mensagem : mensagem == null ? '' : String(mensagem);

    if (typeof modoOuContagem === 'number' && modoOuContagem > 0) {
        let segundosRestantes = modoOuContagem;
        elementoStatus.innerHTML = unificador_montarHtmlStatus(`${texto} ${segundosRestantes}`);
        return new Promise((resolve) => {
            const intervalo = setInterval(() => {
                segundosRestantes--;
                elementoStatus.innerHTML = unificador_montarHtmlStatus(`${texto} ${segundosRestantes}`);
                if (segundosRestantes <= 0) {
                    clearInterval(intervalo);
                    resolve();
                }
            }, 1000);
        });
    }

    elementoStatus.innerHTML = unificador_montarHtmlStatus(texto);
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

function unificador_normalizarListaRelatorios(response) {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.relatorios)) return response.relatorios;
    if (response && Array.isArray(response.data)) return response.data;
    return [];
}

function unificador_relatorioDentroDoPeriodo(rel, dataInicioISO, dataFimISO) {
    if (!rel || !rel.data) return false;
    const p = String(rel.data).split('/');
    if (p.length !== 3) return false;
    const t = new Date(`${p[2]}-${p[1]}-${p[0]}`);
    if (Number.isNaN(t.getTime())) return false;
    const ini = new Date(dataInicioISO);
    const fim = new Date(dataFimISO);
    fim.setHours(23, 59, 59, 999);
    return t >= ini && t <= fim;
}

function unificador_idModeloParaValorSelect(modeloObra) {
    if (!modeloObra) return '';
    const g = modeloObra.modeloDeRelatorioGlobal;
    if (g && g._id != null) return String(g._id).trim();
    if (modeloObra._id != null) return String(modeloObra._id).trim();
    return '';
}

function unificador_idsModeloNoRelatorio(relatorio) {
    const ids = new Set();
    const add = (v) => {
        if (v == null || v === '') return;
        const s = String(v).trim();
        if (s) ids.add(s);
    };
    const from = (m) => {
        if (m == null || m === '') return;
        if (typeof m === 'string') add(m);
        else if (typeof m === 'object') {
            add(m._id);
            add(m.$oid);
        }
    };
    from(relatorio && relatorio.modeloDeRelatorioGlobal);
    from(relatorio && relatorio.modeloDeRelatorio);
    return ids;
}

function unificador_normDesc(s) {
    return String(s || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

async function unificador_obterRelatoriosObra(obraId, dataInicio, dataFim, ordem, tipoRelatorio, rotuloModeloSelecionado) {
    const params = {
        limite: 2000,
        ordem: ordem,
        dataInicio: dataInicio,
        dataFim: dataFim
    };

    const raw = await unificador_fazerRequisicao(`obras/${obraId}/relatorios`, params);
    let lista = unificador_normalizarListaRelatorios(raw);
    lista = lista.filter((r) => unificador_relatorioDentroDoPeriodo(r, dataInicio, dataFim));

    if (tipoRelatorio === '') {
        return lista;
    }

    const idModeloAlvo = String(tipoRelatorio).trim();
    let relatoriosFiltrados = lista.filter((relatorio) =>
        unificador_idsModeloNoRelatorio(relatorio).has(idModeloAlvo)
    );

    if (
        relatoriosFiltrados.length === 0 &&
        lista.length > 0 &&
        idModeloAlvo &&
        rotuloModeloSelecionado &&
        unificador_normDesc(rotuloModeloSelecionado)
    ) {
        const descricaoNormalizadaAlvo = unificador_normDesc(rotuloModeloSelecionado);
        const porDescricao = lista.filter(
            (relatorio) =>
                unificador_normDesc(relatorio.modeloDeRelatorioGlobal && relatorio.modeloDeRelatorioGlobal.descricao) ===
                descricaoNormalizadaAlvo
        );
        if (porDescricao.length > 0) {
            relatoriosFiltrados = porDescricao;
        }
    }

    return relatoriosFiltrados;
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

const UNIFICADOR_DELAY_ENTRE_REQS_MS = 500;
const UNIFICADOR_FETCH_TIMEOUT_MS = 300000;

function unificador_delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function unificador_fetchComTimeout(urlPdf, milissegundosTimeout) {
    const controladorAborto = new AbortController();
    const identificadorTimeout = setTimeout(() => controladorAborto.abort(), milissegundosTimeout);
    return fetch(urlPdf, {
        signal: controladorAborto.signal,
        credentials: 'omit',
        mode: 'cors',
        cache: 'no-store',
        referrerPolicy: 'no-referrer-when-downgrade',
        headers: {
            Accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8',
        },
    }).finally(() => clearTimeout(identificadorTimeout));
}

const UNIFICADOR_CONCORRENCIA = 2;
const UNIFICADOR_MAX_TENTATIVAS = 6;

async function unificador_mergePDFs(pdfItems, statusCallback) {
    const PDFDocument = window.PDFLib.PDFDocument;
    const PdfJuntado = await PDFDocument.create();
    const falhas = [];
    const resultados = new Array(pdfItems.length).fill(null);

    if (pdfItems.length === 0) {
        throw new Error('Nenhum relatório encontrado no período.');
    }

    const emitirStatus = (texto, comIndicadorCarregamento = false) => {
        if (typeof statusCallback === 'function') {
            statusCallback(texto, comIndicadorCarregamento);
        }
    };

    // Fase 1 (binários na rede): relógio só neste bloco; texto de progresso sem ícone
    emitirStatus(
        pdfItems.length === 1
            ? 'Obtendo binário do PDF no servidor...'
            : `Obtendo binários dos PDFs (${pdfItems.length} relatórios)... ${svgCarregando}`,
        true
    );

    const baixarUm = async (index) => {
        const item = pdfItems[index];
        const numRelatorio = index + 1;
        for (let tentativa = 1; tentativa <= UNIFICADOR_MAX_TENTATIVAS; tentativa++) {
            emitirStatus(
                tentativa === 1
                    ? `Relatório ${numRelatorio}/${pdfItems.length} obtendo binário... ${svgCarregando}`
                    : `Relatório ${numRelatorio} nova tentativa ${tentativa}/${UNIFICADOR_MAX_TENTATIVAS}...`,
                false
            );
            try {
                const response = await unificador_fetchComTimeout(item.url, UNIFICADOR_FETCH_TIMEOUT_MS);
                if (response.status === 429) {
                    await unificador_atualizarStatus('Limite da API (150/min). Aguardando 1 minuto...', 60);
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
                    emitirStatus(
                        `Relatório ${numRelatorio} ${msgErro}. Tentativa ${tentativa}/${UNIFICADOR_MAX_TENTATIVAS}... ${svgCarregando}`,
                        false
                    );
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

    // Fase 2 (mesclagem local): relógio só neste bloco
    emitirStatus('Mesclando binários em um único PDF...', true);
    const totalValidos = resultados.filter(Boolean).length;
    let ordemUniao = 0;
    for (let i = 0; i < resultados.length; i++) {
        if (!resultados[i]) continue;
        ordemUniao++;
        emitirStatus(`Unindo origem ${ordemUniao}/${totalValidos}... ${svgCarregando}`, false);
        const pdfDoc = await PDFDocument.load(resultados[i], { ignoreEncryption: true });
        const paginas = await PdfJuntado.copyPages(pdfDoc, pdfDoc.getPageIndices());
        paginas.forEach(p => PdfJuntado.addPage(p));
    }

    if (PdfJuntado.getPageCount() === 0) {
        throw new Error('Nenhum PDF válido obtido. Os links dos relatórios podem estar indisponíveis, ter expirado (timeout) ou a API pode ter atingido o limite de 150 requisições/minuto.');
    }
    if (falhas.length > 0) {
        emitirStatus(`${falhas.length} relatório(s) sem binário válido. Foi gerado um arquivo HTML com os links. ${svgCarregando}`, false);
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
    const card =
        document.getElementById('unificador-pdf-tipo')?.closest('.container_pdf_filtro') ||
        document.getElementById('unificador-status-extracao')?.closest('.container_pdf_filtro');
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

        await unificador_atualizarStatus('Buscando todas as obras...', true);
        const modeloRelatorioSelect = card.querySelector('#unificador-pdf-tipo');
        const tipoModeloValor = modeloRelatorioSelect ? modeloRelatorioSelect.value : '';
        const opcaoSelecionada =
            modeloRelatorioSelect &&
            modeloRelatorioSelect.selectedIndex >= 0 &&
            modeloRelatorioSelect.options[modeloRelatorioSelect.selectedIndex]
                ? modeloRelatorioSelect.options[modeloRelatorioSelect.selectedIndex]
                : null;
        const textoModeloSelecionado = opcaoSelecionada ? opcaoSelecionada.textContent.trim() : '';
        const relatorios = await unificador_obterRelatoriosObra(
            obraId,
            dataInicio,
            dataFim,
            ordem,
            tipoModeloValor,
            textoModeloSelecionado
        );

        await unificador_atualizarStatus(`Encontrados ${relatorios.length} relatórios`);

        const pdfItems = [];
        for (let index = 0; index < relatorios.length; index++) {
        await unificador_atualizarStatus(`Buscando relatório ${index + 1} de ${relatorios.length}... ${svgCarregando}`);
        
            let detalhes;
            for (let tentativa = 0; ; tentativa++) {
                try {
                    detalhes = await unificador_obterDetalhesRelatorio(obraId, relatorios[index]._id);
                    break;
                } catch (err) {
                    if (err.message && err.message.includes('429') && tentativa < 3) {
                        await unificador_atualizarStatus('Limite da API (150/min). Aguardando 1 minuto...', 60);
                        await unificador_delay(60000);
                    } else throw err;
                }
            }

            pdfItems.push({ url: detalhes.linkPdf, obraId, relatorioId: relatorios[index]._id });
            if (index < relatorios.length - 1) await unificador_delay(UNIFICADOR_DELAY_ENTRE_REQS_MS);
        
     
        }

        await unificador_atualizarStatus('Preparando mesclagem de binários...', true);
        const { mergedBytes, falhas } = await unificador_mergePDFs(pdfItems, (texto, comIndicador) => {
            if (comIndicador === true) return unificador_atualizarStatus(String(texto), true);
            return unificador_atualizarStatus(String(texto));
        });

        const nomeObra = await unificador_obterNomeObra(obraId);

        await unificador_atualizarStatus('Finalizando download');
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
        const cardUnificador = document.getElementById('unificador-pdf-tipo')?.closest('.container_pdf_filtro');
        if (cardUnificador && unificador_extrairObraIdDaUrl()) {
            void unificador_preencherSelectModelosRelatorio(cardUnificador).catch(() => {});
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
        const cardUnificador = document.getElementById('unificador-status-extracao')?.closest('.container_pdf_filtro');
        if (cardUnificador) {
            cardUnificador.remove();
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