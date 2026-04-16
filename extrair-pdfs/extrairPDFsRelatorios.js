const PDFLib = window.PDFLib;



const unificador_svgCarregando = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="20" height="20"><path fill="#000000" stroke="#000000" stroke-width="12" transform-origin="center" d="m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="0.5" values="0;120" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></path></svg>';

function rdoEmpresaDoStorage() {
    try {
        const raw = localStorage.getItem('RDOEmpresa');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
const API_BASE_URL = 'https://apiexterna.diariodeobra.app/v1';

function compiladorHeadersApiAtual() {
    const r = rdoEmpresaDoStorage() || {};
    return {
        token: r.tokenApiExterna || '',
        'Content-Type': 'application/json'
    };
}

let PDFExtractorAtivo = true;
let cardFiltroCreated = false;

chrome.storage.sync.get('PDFExtractor', function (data) {
    PDFExtractorAtivo = data.PDFExtractor ?? true;
    if (!PDFExtractorAtivo) {
        const container = document.querySelector('.container_pdf_filtro');
        if (container) {
            container.remove();
            cardFiltroCreated = false;
        }
    }
});

chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
    if ('PDFExtractor' in mensagem) {
        PDFExtractorAtivo = mensagem.PDFExtractor;
        if (!PDFExtractorAtivo) {
            const container = document.querySelector('.container_pdf_filtro');
            if (container) {
                container.remove();
                cardFiltroCreated = false;
            }
        } else if (window.location.href.match(/obras\/(.*?)\/relatorios$/) || window.location.href.includes('/app/notificacoes')) {
            if (!cardFiltroCreated) {
                criarCardFiltro();
                cardFiltroCreated = true;
            }
        }
    }
});

const DELAY_ENTRE_REQS_MS = 600;
const LIMITE_REQS_ANTES_PAUSA = 100;
const PAUSA_MS = 60000;
const FETCH_TIMEOUT_MS = 300000;
const MAX_TENTATIVAS_PDF = 6;
let contadorRequisicoes = 0;

function compiladorLog(...args) {
    console.log('[Complemento RDO][Compilador PDF]', ...args);
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function ehPdfValido(buffer) {
    if (!buffer || buffer.byteLength < 5) return false;
    const arr = new Uint8Array(buffer);
    return arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46 && arr[4] === 0x2D;
}

function fetchComTimeout(urlPdf, milissegundosTimeout) {
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

async function antesDeRequisicao() {
    if (contadorRequisicoes > 0 && contadorRequisicoes % LIMITE_REQS_ANTES_PAUSA === 0) {
        await atualizarStatus('Limite de requisição! \nAguardando 1 minuto \n(API 150req/min)...', 60);
    }
    contadorRequisicoes++;
}

function toggleCard(e) {
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
    localStorage.setItem('pdfFilterState', content.style.display);
}

function compilador_montarHtmlStatus(mensagemHtml) {
    return `<div class="complemento-rdo-status-linha" style="font-size:14px;color:#666;line-height:1.45;width:100%;box-sizing:border-box">${mensagemHtml}</div>`;
}

async function atualizarStatus(mensagem, modoOuContagem = null) {
    const elementoStatus = document.getElementById('status-extracao');
    if (!elementoStatus) return;

    const texto =
        typeof mensagem === 'string' ? mensagem : mensagem == null ? '' : String(mensagem);

    if (typeof modoOuContagem === 'number' && modoOuContagem > 0) {
        let segundosRestantes = modoOuContagem;
        elementoStatus.innerHTML = compilador_montarHtmlStatus(`${texto} ${segundosRestantes}`);
        return new Promise((resolve) => {
            const intervalo = setInterval(() => {
                segundosRestantes--;
                elementoStatus.innerHTML = compilador_montarHtmlStatus(`${texto} ${segundosRestantes}`);
                if (segundosRestantes <= 0) {
                    clearInterval(intervalo);
                    resolve();
                }
            }, 1000);
        });
    }

    elementoStatus.innerHTML = compilador_montarHtmlStatus(texto);
}

async function fazerRequisicao(endpoint, params = {}) {
    await antesDeRequisicao();
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const headers = compiladorHeadersApiAtual();
    let response = await fetch(url, { headers });
    if (response.status === 429) {
        compiladorLog('429 no endpoint', endpoint, ', aguardando 1 min');
        await atualizarStatus('Limite da API (150req/min)! \nAguardando 1 minuto...', 60);
        response = await fetch(url, { headers: compiladorHeadersApiAtual() });
    }
    if (!response.ok) {
        compiladorLog('Erro HTTP', endpoint, response.status);
        throw new Error(`Erro na API: ${response.status}`);
    }
    return await response.json();
}

function compilador_prefixoArquivoDeModelo(desc) {
    const base = (desc || 'REL').substring(0, 40)
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || 'REL';
    return `${base}_`;
}

function compilador_chaveRotuloModelo(m) {
    if (!m) return '';
    const a = (
        m.descricao ||
        (m.modeloDeRelatorioGlobal && m.modeloDeRelatorioGlobal.descricao) ||
        ''
    ).trim();
    const b = (m.nome || (m.modeloDeRelatorioGlobal && m.modeloDeRelatorioGlobal.nome) || '').trim();
    const combined = `${a}\u0000${b}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (combined) return combined;
    const idVal = compilador_idModeloParaValorSelect(m);
    return idVal ? `__id_${idVal}` : '';
}

function compilador_dedupeModelosPorRotulo(modelos) {
    const seen = new Set();
    const out = [];
    for (const m of modelos) {
        if (!m) continue;
        const idVal = compilador_idModeloParaValorSelect(m);
        if (!idVal) continue;
        const k = compilador_chaveRotuloModelo(m);
        const key = k || `__id_${idVal}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(m);
    }
    return out;
}

function compilador_ordenarModelosPorDescricao(modelos) {
    const rotulo = (m) =>
        (m.descricao ||
            (m.modeloDeRelatorioGlobal && m.modeloDeRelatorioGlobal.descricao) ||
            m.nome ||
            '') + '';
    return [...modelos].sort((a, b) => rotulo(a).localeCompare(rotulo(b), 'pt-BR'));
}

function compilador_normalizarListaModelos(modelosDeRelatorios) {
    if (!Array.isArray(modelosDeRelatorios)) return [];
    const map = new Map();
    for (const m of modelosDeRelatorios) {
        if (m && m._id != null) map.set(String(m._id), m);
    }
    const sorted = compilador_ordenarModelosPorDescricao([...map.values()]);
    return compilador_dedupeModelosPorRotulo(sorted);
}

function compilador_idModeloParaValorSelect(m) {
    if (!m) return '';
    const g = m.modeloDeRelatorioGlobal;
    if (g && g._id != null) return String(g._id).trim();
    if (m._id != null) return String(m._id).trim();
    return '';
}

function compilador_idsModeloNoRelatorio(relatorio) {
    const ids = new Set();
    const add = (v) => {
        if (v == null || v === '') return;
        const s = String(v).trim();
        if (s) ids.add(s);
    };
    const from = (x) => {
        if (x == null || x === '') return;
        if (typeof x === 'string') add(x);
        else if (typeof x === 'object') {
            add(x._id);
            add(x.$oid);
        }
    };
    from(relatorio && relatorio.modeloDeRelatorioGlobal);
    from(relatorio && relatorio.modeloDeRelatorio);
    return ids;
}

function compilador_chaveAgrupamentoModelo(r) {
    const ids = compilador_idsModeloNoRelatorio(r);
    if (!ids.size) return '_sem_modelo';
    return [...ids][0];
}

function compilador_normDesc(s) {
    return String(s || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function compilador_chaveCacheModelos() {
    return 'cadastros-modeloDeRelatorioGlobal:v2-dedupe-id-global';
}

/**
 * Lista global de modelos: `GET /cadastros` → campo(s) com modelos globais (uma requisição).
 * Formato da API pode variar; normalizamos abaixo.
 */
function compilador_extrairArrayModelosGlobalDoCadastros(resp) {
    if (resp == null) return [];
    if (Array.isArray(resp)) return resp;
    if (typeof resp !== 'object') return [];

    const candidatos = [
        resp.modeloDeRelatorioGlobal,
        resp.modelosDeRelatorioGlobal,
        resp.modeloDeRelatoriosGlobais,
        resp.modelosDeRelatorio,
        resp.data && resp.data.modeloDeRelatorioGlobal,
        resp.cadastros && resp.cadastros.modeloDeRelatorioGlobal
    ];
    for (const c of candidatos) {
        if (Array.isArray(c)) return c;
    }
    if (resp.modeloDeRelatorioGlobal && typeof resp.modeloDeRelatorioGlobal === 'object' && resp.modeloDeRelatorioGlobal._id) {
        return [resp.modeloDeRelatorioGlobal];
    }
    return [];
}

/** Garante objeto compatível com `compilador_idModeloParaValorSelect` e rótulo no select. */
function compilador_normalizarItemModeloParaSelect(item) {
    if (!item || typeof item !== 'object') return null;
    if (item.modeloDeRelatorioGlobal && typeof item.modeloDeRelatorioGlobal === 'object') {
        return item;
    }
    return { modeloDeRelatorioGlobal: item };
}

async function compilador_fetchModelosListaNaRede() {
    let cad;
    try {
        cad = await fazerRequisicao('cadastros');
    } catch (e) {
        compiladorLog('modelos: GET /cadastros falhou', e && e.message);
        return [];
    }

    const brutos = compilador_extrairArrayModelosGlobalDoCadastros(cad);
    const normalizados = brutos.map(compilador_normalizarItemModeloParaSelect).filter(Boolean);

    if (normalizados.length === 0) {
        compiladorLog(
            'modelos: /cadastros sem array reconhecido; chaves no topo',
            cad && typeof cad === 'object' ? Object.keys(cad).slice(0, 25) : typeof cad
        );
    } else {
        compiladorLog('modelos: GET /cadastros →', normalizados.length, 'itens (após normalizar)');
    }

    const sorted = compilador_ordenarModelosPorDescricao(
        normalizados.map((m) => ({
            ...m,
            descricao:
                m.descricao ||
                m.nome ||
                (m.modeloDeRelatorioGlobal && m.modeloDeRelatorioGlobal.descricao) ||
                ''
        }))
    );
    return compilador_dedupeModelosPorRotulo(sorted);
}

let compiladorModelosCache = null;
let compiladorModelosListaPromise = null;

async function compilador_obterModelosListaEmCache(force = false) {
    const key = compilador_chaveCacheModelos();
    if (!force && compiladorModelosCache && compiladorModelosCache.key === key) {
        return compiladorModelosCache.modelos;
    }
    if (!force && compiladorModelosListaPromise && compiladorModelosListaPromise.key === key) {
        const modelos = await compiladorModelosListaPromise.promise;
        if (compilador_chaveCacheModelos() === key) return modelos;
    }
    if (force) {
        compiladorModelosCache = null;
    }
    const promise = compilador_fetchModelosListaNaRede()
        .then((modelos) => {
            if (compilador_chaveCacheModelos() === key) {
                compiladorModelosCache = { key, modelos };
            }
            return modelos;
        })
        .finally(() => {
            if (compiladorModelosListaPromise && compiladorModelosListaPromise.promise === promise) {
                compiladorModelosListaPromise = null;
            }
        });
    compiladorModelosListaPromise = { key, promise };
    return promise;
}

let compiladorPopulateSelectGen = 0;

async function compiladorPopularSelectModelosRelatorio(container) {
    const myGen = ++compiladorPopulateSelectGen;
    const select = container.querySelector('#pdf-tipo');
    if (!select) return;

    let salvo = localStorage.getItem('tipoExtrairPDF') || 'tudo';
    if (salvo === 'rdo' || salvo === 'rsp') {
        salvo = 'tudo';
        localStorage.setItem('tipoExtrairPDF', 'tudo');
    }

    select.innerHTML = '';
    const optTodos = document.createElement('option');
    optTodos.value = 'tudo';
    optTodos.textContent = 'Todos os modelos';
    select.appendChild(optTodos);

    try {
        compiladorLog('compiladorPopularSelectModelosRelatorio: buscando lista de modelos (gen ' + myGen + ')');
        const modelos = compilador_dedupeModelosPorRotulo(
            compilador_ordenarModelosPorDescricao(await compilador_obterModelosListaEmCache(false))
        );
        compiladorLog('select modelos recebidos', modelos.length);
        if (myGen !== compiladorPopulateSelectGen || !select.isConnected) return;
        for (const mod of modelos) {
            const idVal = compilador_idModeloParaValorSelect(mod);
            if (!idVal) continue;
            const opt = document.createElement('option');
            opt.value = idVal;
            opt.textContent =
                mod.descricao ||
                mod.nome ||
                (mod.modeloDeRelatorioGlobal && mod.modeloDeRelatorioGlobal.descricao) ||
                `Modelo ${idVal}`;
            select.appendChild(opt);
        }
        const validos = new Set(['tudo', ...modelos.map((m) => compilador_idModeloParaValorSelect(m)).filter(Boolean)]);
        select.value = validos.has(salvo) ? salvo : 'tudo';
        if (select.value !== salvo) localStorage.setItem('tipoExtrairPDF', select.value);
    } catch (e) {
        compiladorLog('compiladorPopularSelectModelosRelatorio: ERRO', e);
        if (myGen !== compiladorPopulateSelectGen || !select.isConnected) return;
        const hint = document.createElement('option');
        hint.value = '';
        hint.disabled = true;
        hint.textContent = 'Não foi possível carregar os modelos; use “Todos os modelos”.';
        select.appendChild(hint);
        select.value = 'tudo';
        localStorage.setItem('tipoExtrairPDF', 'tudo');
    }
}

window.compiladorPopularSelectModelosRelatorio = compiladorPopularSelectModelosRelatorio;

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    const wrap = document.querySelector('.container_pdf_filtro');
    if (!wrap || typeof window.compiladorPopularSelectModelosRelatorio !== 'function') return;
    const r = rdoEmpresaDoStorage() || {};
    if (!r.tokenApiExterna) return;
    compiladorModelosCache = null;
    void window.compiladorPopularSelectModelosRelatorio(wrap).catch(() => {});
});

let __compiladorTokenAnterior = (rdoEmpresaDoStorage() || {}).tokenApiExterna || '';
setInterval(() => {
    const t = (rdoEmpresaDoStorage() || {}).tokenApiExterna || '';
    if (t === __compiladorTokenAnterior) return;
    __compiladorTokenAnterior = t;
    if (!t) return;
    compiladorModelosCache = null;
    const wrap = document.querySelector('.container_pdf_filtro');
    if (wrap && typeof window.compiladorPopularSelectModelosRelatorio === 'function') {
        void window.compiladorPopularSelectModelosRelatorio(wrap).catch(() => {});
    }
}, 1500);

async function obterDetalhesRelatorio(obraId, relatorioId) {
    return await fazerRequisicao(`obras/${obraId}/relatorios/${relatorioId}`);
}

async function obterNomeObra(obraId) {
    const response = await fazerRequisicao(`obras/${obraId}`);
    return response.nome
        .toUpperCase()
        .normalize('NFD')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

function compilador_normalizarListaRelatorios(respostaApi) {
    if (Array.isArray(respostaApi)) return respostaApi;
    if (respostaApi && Array.isArray(respostaApi.relatorios)) return respostaApi.relatorios;
    if (respostaApi && Array.isArray(respostaApi.data)) return respostaApi.data;
    if (respostaApi != null && typeof respostaApi === 'object') {
        compiladorLog(
            'compilador_normalizarListaRelatorios: formato inesperado, chaves',
            Object.keys(respostaApi).slice(0, 12)
        );
    }
    return [];
}

async function mergePDFs(pdfItems, statusCallback) {
    const PDFDocument = window.PDFLib.PDFDocument;
    const PdfJuntado = await PDFDocument.create();
    const falhas = [];

    if (pdfItems.length === 0) {
        throw new Error('Nenhum relatório encontrado no período.');
    }

    const emitirStatus = (texto, comIndicadorCarregamento = false) => {
        if (typeof statusCallback === 'function') {
            statusCallback(texto, comIndicadorCarregamento);
        }
    };

    emitirStatus(
        pdfItems.length === 1
            ? 'Obtendo binário do PDF no servidor...'
            : `Obtendo binários dos PDFs (${pdfItems.length} relatórios)...`,
        true
    );

    const pdfBuffers = [];
    for (let index = 0; index < pdfItems.length; index++) {
        const item = pdfItems[index];
        if (index > 0) await delay(DELAY_ENTRE_REQS_MS);
        let buffer = null;
        for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_PDF; tentativa++) {
            emitirStatus(
                tentativa === 1
                    ? `Relatório ${index + 1}/${pdfItems.length} obtendo binário... ${unificador_svgCarregando}`
                    : `Relatório ${index + 1} nova tentativa ${tentativa}/${MAX_TENTATIVAS_PDF}...`,
                false
            );
            try {
                const response = await fetchComTimeout(item.url, FETCH_TIMEOUT_MS);
                if (response.status === 429) {
                    await atualizarStatus('Limite da API (150/min). Aguardando 1 minuto...', 60);
                    tentativa--;
                    continue;
                }
                if (!response.ok) {
                    if (tentativa < MAX_TENTATIVAS_PDF) continue;
                    falhas.push(item);
                    break;
                }
                buffer = await response.arrayBuffer();
                if (!ehPdfValido(buffer)) {
                    if (tentativa < MAX_TENTATIVAS_PDF) continue;
                    falhas.push(item);
                }
                break;
            } catch (e) {
                const msgErro = e.name === 'AbortError' ? 'timeout' : 'erro na requisição (rede/servidor)';
                if (tentativa < MAX_TENTATIVAS_PDF) {
                    emitirStatus(
                        `Relatório ${index + 1} ${msgErro}. Tentativa ${tentativa}/${MAX_TENTATIVAS_PDF}...`,
                        false
                    );
                } else {
                    falhas.push(item);
                }
            }
        }
        if (buffer && ehPdfValido(buffer)) pdfBuffers.push(buffer);
    }

    emitirStatus(`Mesclando binários em um único PDF... ${unificador_svgCarregando}`, true);
    for (let [index, buffer] of pdfBuffers.entries()) {
        emitirStatus(`Unindo origem ${index + 1}/${pdfBuffers.length}... ${unificador_svgCarregando}`, false);
        const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const paginas = await PdfJuntado.copyPages(pdfDoc, pdfDoc.getPageIndices());
        paginas.forEach(pagina => PdfJuntado.addPage(pagina));
    }

    if (PdfJuntado.getPageCount() === 0 && pdfItems.length > 0) {
        throw new Error('Nenhum PDF válido obtido. Verifique os links ou tente novamente.');
    }
    if (falhas.length > 0) {
        emitirStatus(`${falhas.length} relatório(s) sem binário válido. Será gerado HTML com os links.`, false);
    }
    return { mergedBytes: await PdfJuntado.save(), falhas };
}

function gerarHtmlRelatoriosNaoBaixados(falhas) {
    const base = 'https://web.diariodeobra.app/#/app/obras';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relatórios não baixados (Compilador)</title></head><body>
<h1>Relatórios que não foram baixados (${falhas.length})</h1>
<p>Erro na requisição, timeout ou arquivo não era PDF válido.</p>
${falhas.map(f => `<p><strong>${f.obra || ''}</strong> – ${f.tipo || ''} – ${f.data || ''}<br><a href="${base}/${f.obraId}/relatorios/${f.relatorioId}" target="_blank">Abrir relatório</a></p>`).join('')}
</body></html>`;
}

function tokensNomeSomenteObras() {
    const el = document.getElementById('obras-somente-nome-contem');
    if (!el || el.value.trim() === '') return [];
    return el.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
}

function obraNomePassaFiltroSomente(nomeObraUpper, tokensSomente) {
    if (!tokensSomente.length) return true;
    return tokensSomente.some(t => nomeObraUpper.includes(t));
}

async function obterObrasPorPeriodo() {
    const dataInicioInput = document.getElementById('pdf-data-inicio');
    const dataFimInput = document.getElementById('pdf-data-fim');
    const obrasExcluidasInput = document.getElementById('obras-excluidas');
    const obraEspecificaInput = document.getElementById('obra-especifica');
    if (!dataInicioInput || !dataFimInput) return [];
    const tokensSomenteNome = tokensNomeSomenteObras();
    let siglasExcluidas = [];
    if (obrasExcluidasInput && obrasExcluidasInput.value.trim() !== '') {
        siglasExcluidas = obrasExcluidasInput.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    }
    let idsObrasEspecificas = [];
    if (obraEspecificaInput && obraEspecificaInput.value.trim() !== '') {
        idsObrasEspecificas = obraEspecificaInput.value.split(',').map(s => s.trim()).filter(Boolean);
    }
    const obras = await fazerRequisicao('obras');
    if (!Array.isArray(obras)) return [];
    if (idsObrasEspecificas.length > 0) {
        let obrasSelecionadas = obras.filter(o => idsObrasEspecificas.includes(o._id));
        if (tokensSomenteNome.length > 0) {
            obrasSelecionadas = obrasSelecionadas.filter(o => {
                const nomeObra = (o.nome || '').toUpperCase();
                const ok = obraNomePassaFiltroSomente(nomeObra, tokensSomenteNome);
                return ok;
            });
        }
        if (obrasSelecionadas.length) {
            return obrasSelecionadas;
        } else {
            return [];
        }
    }
    return obras.filter(obra => {
        const statusOk = obra.status && obra.status.descricao && obra.status.descricao.toLowerCase() === 'em andamento';
        const nomeObra = (obra.nome || '').toUpperCase();
        const excluida = siglasExcluidas.some(sigla => nomeObra.includes(sigla));
        if (excluida) {
            return false;
        }
        if (!obraNomePassaFiltroSomente(nomeObra, tokensSomenteNome)) {
            return false;
        }
        return statusOk;
    });
}

async function obterRelatoriosObra(obraId, dataInicio, dataFim, ordem) {
    const params = {
        limite: 2000,
        ordem: ordem,
        dataInicio: dataInicio,
        dataFim: dataFim
    };
    const respostaLista = await fazerRequisicao(`obras/${obraId}/relatorios`, params);
    const lista = compilador_normalizarListaRelatorios(respostaLista);
    compiladorLog('obterRelatoriosObra', obraId, '→ itens na lista normalizada', lista.length);
    return lista;
}

async function processarRelatorios() {
    const available = await isServerAvailable();
    if (!available) {
        return;
    }
    
    const btnExtrair = document.querySelector('.btn-extrair-pdf');
    try {
        if (!window.PDFLib) {
            throw new Error('A biblioteca que o codigo usa para realizar o merge dos PDFs não foi carregada. Recarrega a página. Caso persistir, me contatar: diogosflorencio@gmail.com');
        }
        btnExtrair.disabled = true;
        contadorRequisicoes = 0;
        await atualizarStatus("Iniciando conexão com API", 3);
        const dataInicio = document.getElementById('pdf-data-inicio').value;
        const dataFim = document.getElementById('pdf-data-fim').value;
        const ordem = document.getElementById('pdf-ordem').value;
        const apenasAprovados = document.getElementById('aprovados-100')?.checked;
        if (!dataInicio) {
            throw new Error('Você precisa selecionar ao menos a data de início');
        }
        await atualizarStatus('Buscando todas as obras...', true);
        const obras = await obterObrasPorPeriodo();
        compiladorLog('processarRelatorios: obras após filtros', obras.length);
        if (!obras.length) {
            throw new Error('Nenhuma obra encontrada.');
        }
        let relatoriosNaoAprovados = [];
        let relatoriosNaoBaixados = [];
        
        for (let obra of obras) {
            await atualizarStatus(`Relatórios da obra:<br><b> ${obra.nome.substring(0,33)}</b>`);
            const relatorios = await obterRelatoriosObra(obra._id, dataInicio, dataFim, ordem);
            compiladorLog(
                'obra',
                obra.nome,
                obra._id,
                'relatórios (API) length',
                relatorios.length,
                'amostra primeiro item',
                relatorios[0] ? { data: relatorios[0].data, id: relatorios[0]._id } : null
            );
            let relatoriosNoPeriodo = relatorios.filter(relatorio => {
                if (!relatorio.data) return false;
                const [dia, mes, ano] = relatorio.data.split('/');
                const dataRelatorio = new Date(`${ano}-${mes}-${dia}`);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataRelatorio >= inicio && dataRelatorio <= fim;
            });
            if (apenasAprovados) {
                const relatoriosNaoAprovadosObra = relatoriosNoPeriodo.filter(r => !(r.status && r.status.descricao && r.status.descricao.toLowerCase() === 'aprovado'));
                relatoriosNaoAprovadosObra.forEach(relatorio => {
                    relatoriosNaoAprovados.push({
                        obra: obra.nome,
                        data: relatorio.data,
                        tipo: relatorio.modeloDeRelatorioGlobal?.descricao || 'N/A',
                        link: `https://web.diariodeobra.app/#/app/obras/${obra._id}/relatorios/${relatorio._id}`
                    });
                });
                relatoriosNoPeriodo = relatoriosNoPeriodo.filter(r => r.status && r.status.descricao && r.status.descricao.toLowerCase() === 'aprovado');
            }
            await atualizarStatus(`Achados ${relatoriosNoPeriodo.length} relatórios em:<br><b> ${obra.nome.substring(0,33)}</b>`);

            let tipoExtrair = localStorage.getItem('tipoExtrairPDF') || 'tudo';
            if (tipoExtrair === 'rdo' || tipoExtrair === 'rsp') {
                tipoExtrair = 'tudo';
                localStorage.setItem('tipoExtrairPDF', 'tudo');
            }

            async function processarGrupoRelatorios(relatoriosGrupo, prefixoArquivo, listaFalhas) {
                if (!relatoriosGrupo.length) return;
                const pdfItems = [];
                for (let index = 0; index < relatoriosGrupo.length; index++) {
                    const relatorio = relatoriosGrupo[index];
                    if (index > 0) await delay(DELAY_ENTRE_REQS_MS);
                    await atualizarStatus(`Processando relatório ${index + 1}/${relatoriosGrupo.length} <br><b> (${obra.nome.substring(0,33)}) ${unificador_svgCarregando} </b>`);
                    const detalhes = await obterDetalhesRelatorio(obra._id, relatorio._id);
                    pdfItems.push({
                        url: detalhes.linkPdf,
                        obra: obra.nome,
                        tipo: prefixoArquivo.replace('_', ''),
                        data: relatorio.data,
                        obraId: obra._id,
                        relatorioId: relatorio._id
                    });
                }
                if (pdfItems.length > 0) {
                    await atualizarStatus(
                        `Preparando mesclagem de binários <br><b> (${obra.nome.substring(0,33)}) </b>`,
                        true
                    );
                    const { mergedBytes, falhas } = await mergePDFs(pdfItems, (texto, comIndicador) => {
                        if (comIndicador === true) return atualizarStatus(String(texto), true);
                        return atualizarStatus(String(texto));
                    });
                    falhas.forEach(f => listaFalhas.push(f));
                    let nomeObra = obra.nome
                        .toUpperCase()
                        .normalize('NFD')
                        .replace(/[^A-Z0-9]+/g, '_')
                        .replace(/_+/g, '_')
                        .replace(/^_|_$/g, '');
                    nomeObra = prefixoArquivo + nomeObra;
                    await atualizarStatus(`Finalizando download <br><b> (${obra.nome.substring(0,33)})</b>`);
                    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${nomeObra}.pdf`;
                    link.click();
                }
            }

            if (tipoExtrair === 'tudo') {
                const grupos = new Map();
                for (const r of relatoriosNoPeriodo) {
                    const idMod = compilador_chaveAgrupamentoModelo(r);
                    if (!grupos.has(idMod)) grupos.set(idMod, []);
                    grupos.get(idMod).push(r);
                }
                for (const [idMod, lista] of grupos) {
                    const desc =
                        lista[0]?.modeloDeRelatorioGlobal?.descricao ||
                        (idMod === '_sem_modelo' ? 'Sem modelo' : 'REL');
                    const prefixo = compilador_prefixoArquivoDeModelo(desc);
                    await processarGrupoRelatorios(lista, prefixo, relatoriosNaoBaixados);
                }
            } else {
                let lista = relatoriosNoPeriodo.filter((r) =>
                    compilador_idsModeloNoRelatorio(r).has(String(tipoExtrair).trim())
                );
                if (lista.length === 0 && relatoriosNoPeriodo.length) {
                    const sel = document.querySelector('.container_pdf_filtro #pdf-tipo');
                    const rotulo =
                        sel && sel.selectedIndex >= 0 && sel.options[sel.selectedIndex]
                            ? sel.options[sel.selectedIndex].textContent.trim()
                            : '';
                    if (rotulo && tipoExtrair !== 'tudo') {
                        const nd = compilador_normDesc(rotulo);
                        lista = relatoriosNoPeriodo.filter(
                            (r) =>
                                compilador_normDesc(r.modeloDeRelatorioGlobal && r.modeloDeRelatorioGlobal.descricao) ===
                                nd
                        );
                    }
                }
                const desc = lista[0]?.modeloDeRelatorioGlobal?.descricao || 'REL';
                const prefixo = compilador_prefixoArquivoDeModelo(desc);
                await processarGrupoRelatorios(lista, prefixo, relatoriosNaoBaixados);
            }
        }
        
        if (relatoriosNaoBaixados.length > 0) {
            await atualizarStatus(
                `${relatoriosNaoBaixados.length} relatório(s) não baixado(s). Gerando arquivo HTML com os links...`,
                true
            );
            const htmlBlob = new Blob([gerarHtmlRelatoriosNaoBaixados(relatoriosNaoBaixados)], { type: 'text/html' });
            const linkHtml = document.createElement('a');
            linkHtml.href = URL.createObjectURL(htmlBlob);
            linkHtml.download = 'compilador_relatorios_nao_baixados.html';
            linkHtml.click();
        }
        await atualizarStatus("Downloads concluídos");
        if (apenasAprovados && relatoriosNaoAprovados.length > 0) {
            await atualizarStatus(`${relatoriosNaoAprovados.length} relatórios não aprovados!!!!`);
            const conteudoHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Relatórios não aprovados por algum motivo</title>
</head>
<body>
    <h1>Relatórios não aprovados por algum motivo: (${relatoriosNaoAprovados.length}) no total</h1>
    ${relatoriosNaoAprovados.map(item => `
        <div>
            <p><strong>Obra:</strong> ${item.obra}</p>
           <p><strong>Tipo:</strong> ${item.tipo} (depois vou criar um filtro por tipo)</p>
            <p><strong>Link:</strong> <a href="${item.link}" target="_blank">${item.link}</a></p>
        </div>
        <hr>
    `).join('')}
</body>
</html>`;
            
            const blob = new Blob([conteudoHTML], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'relatorios_nao_aprovados.html';
            link.click();
            
            await atualizarStatus(`Download concluído! <br> Mas houveram ${relatoriosNaoAprovados.length} relatórios não aprovados!`);
        }
    } catch (error) {
        atualizarStatus(`Erro: ${error.message}`);
    } finally {
        btnExtrair.disabled = false;
    }
}
if (!window.__compiladorHashchangeModelos) {
    window.__compiladorHashchangeModelos = true;
    window.addEventListener('hashchange', () => {
        const select = document.querySelector('.container_pdf_filtro #pdf-tipo');
        if (!select) return;
        const wrap = select.closest('.container_pdf_filtro');
        const key = compilador_chaveCacheModelos();
        if (compiladorModelosCache && compiladorModelosCache.key !== key) {
            compiladorModelosCache = null;
        }
        if (compiladorModelosListaPromise && compiladorModelosListaPromise.key !== key) {
            compiladorModelosListaPromise = null;
        }
        if (wrap && typeof window.compiladorPopularSelectModelosRelatorio === 'function') {
            void window.compiladorPopularSelectModelosRelatorio(wrap).catch(() => {});
        }
    });
}

const observerRelatorios = new MutationObserver(() => {
    if (!cardFiltroCreated && PDFExtractorAtivo && window.location.href.includes('/app/notificacoes')) {
        criarCardFiltro();
        cardFiltroCreated = true;
    }
});

const observerNaoRelatorios = new MutationObserver(() => {
    if (cardFiltroCreated && !window.location.href.includes('/app/notificacoes')) {
        const cardFiltro = document.querySelector('.container_pdf_filtro');
        if (cardFiltro) {
            cardFiltro.remove();
            cardFiltroCreated = false;
        }
    }
});

observerRelatorios.observe(document.body, {
    childList: true,
    subtree: true
});

observerNaoRelatorios.observe(document.body, {
    childList: true,
    subtree: true
});

if (window.location.href.includes('/app/notificacoes') && PDFExtractorAtivo) {
    criarCardFiltro();
    cardFiltroCreated = true;
}
