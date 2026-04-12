const PDFLib = window.PDFLib; // cria o objeto PDFLib

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

/** Token lido no momento do fetch — o script pode carregar antes do login e o token só existir depois. */
function compiladorHeadersApiAtual() {
    const r = rdoEmpresaDoStorage() || {};
    return {
        token: r.tokenApiExterna || '',
        'Content-Type': 'application/json'
    };
}

// at the beginning of the file, i have to do that para que eu consiga usar a variavel em outros arquivos
let PDFExtractorAtivo = true;
let cardFiltroCreated = false;

// fazendo o carregamento inicial do estado
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

// manipula a mensagem do chrome
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

// ===== LIMITE 150 REQUISIÇÕES/MINUTO =====
const DELAY_ENTRE_REQS_MS = 500;
const LIMITE_REQS_ANTES_PAUSA = 100;
const PAUSA_MS = 60000;
const FETCH_TIMEOUT_MS = 300000; // 5 min
const MAX_TENTATIVAS_PDF = 5;
let contadorRequisicoes = 0;

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function ehPdfValido(buffer) {
    if (!buffer || buffer.byteLength < 5) return false;
    const arr = new Uint8Array(buffer);
    return arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46 && arr[4] === 0x2D;
}

function fetchComTimeout(url, msTimeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), msTimeout);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

async function antesDeRequisicao() {
    if (contadorRequisicoes > 0 && contadorRequisicoes % LIMITE_REQS_ANTES_PAUSA === 0) {
        await atualizarStatus('Limite de requisição! \nAguardando 1 minuto \n(API 150req/min)...', 60);
    }
    contadorRequisicoes++;
}

// ===== FUNÇÕES UTILITÁRIAS =====

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

async function atualizarStatus(mensagem, contador = null) {
    const statusElement = document.getElementById('status-extracao');
    if (!statusElement) return;
    if (contador) {
        let count = contador;
        statusElement.innerHTML = `${mensagem} ${count}`;
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

async function fazerRequisicao(endpoint, params = {}) {
    await antesDeRequisicao();
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const headers = compiladorHeadersApiAtual();
    let response = await fetch(url, { headers });
    if (response.status === 429) {
        await atualizarStatus('Limite da API (150req/min)! \nAguardando 1 minuto...', 60);
        response = await fetch(url, { headers: compiladorHeadersApiAtual() });
    }
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
    return await response.json();
}

// ----- Modelos de relatório no Compilador (GET /obras → modelosDeRelatorios em cada obra) -----

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
    const a = (m.descricao || '').trim();
    const b = (m.nome || '').trim();
    const combined = `${a}\u0000${b}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (combined) return combined;
    return m._id != null ? `__id_${String(m._id)}` : '';
}

/** União por obra pode trazer o mesmo nome com _id diferentes; no select mostramos uma linha por rótulo (mantém o primeiro). */
function compilador_dedupeModelosPorRotulo(modelos) {
    const seen = new Set();
    const out = [];
    for (const m of modelos) {
        if (!m || m._id == null) continue;
        const k = compilador_chaveRotuloModelo(m);
        const key = k || `__id_${String(m._id)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(m);
    }
    return out;
}

function compilador_ordenarModelosPorDescricao(modelos) {
    return [...modelos].sort((a, b) => (a.descricao || '').localeCompare(b.descricao || '', 'pt-BR'));
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

function compilador_chaveCacheModelos() {
    // Bump ao mudar estratégia de fetch (ex. v3 = só GET /obras, sem GET por obra).
    return 'obras-list:v3';
}

/** Rede: GET /obras e união de modelosDeRelatorios de todas as obras devolvidas. */
async function compilador_fetchModelosListaNaRede() {
    const obras = await fazerRequisicao('obras');
    if (!Array.isArray(obras)) return [];
    const merged = new Map();
    for (const o of obras) {
        for (const m of o.modelosDeRelatorios || []) {
            if (m && m._id != null) merged.set(String(m._id), m);
        }
    }
    const sorted = compilador_ordenarModelosPorDescricao([...merged.values()]);
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
        const modelos = compilador_dedupeModelosPorRotulo(
            compilador_ordenarModelosPorDescricao(await compilador_obterModelosListaEmCache(false))
        );
        if (myGen !== compiladorPopulateSelectGen || !select.isConnected) return;
        for (const mod of modelos) {
            const opt = document.createElement('option');
            opt.value = String(mod._id);
            opt.textContent = mod.descricao || mod.nome || `Modelo ${mod._id}`;
            select.appendChild(opt);
        }
        const validos = new Set(['tudo', ...modelos.map((m) => String(m._id))]);
        select.value = validos.has(salvo) ? salvo : 'tudo';
        if (select.value !== salvo) localStorage.setItem('tipoExtrairPDF', select.value);
    } catch (e) {
        if (myGen !== compiladorPopulateSelectGen || !select.isConnected) return;
        console.warn('Compilador: erro ao listar modelos', e);
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

/** Login no mesmo separador não dispara `storage`; ao voltar o foco ou após token novo, tenta de novo. */
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
// faz a extração em serie dos relatorios
// async function mergePDFs(pdfUrls, statusCallback) {
//     const PDFDocument = window.PDFLib.PDFDocument;
//     const PdfJuntado = await PDFDocument.create();
//     if (pdfUrls.length === 0) {
//         throw new Error('Nenhum relatório encontrado no período.');
//     }
//     for (let [index, url] of pdfUrls.entries()) {
//         statusCallback(`Processando PDF ${index + 1} de ${pdfUrls.length}`);
//         const response = await fetch(url);
//         const binarioPdf = await response.arrayBuffer();
//         const pdfDoc = await PDFDocument.load(binarioPdf);
//         const paginas = await PdfJuntado.copyPages(pdfDoc, pdfDoc.getPageIndices());
//         paginas.forEach(pagina => PdfJuntado.addPage(pagina));
//     }
//     return await PdfJuntado.save();
// }

async function mergePDFs(pdfItems, statusCallback) {
    const PDFDocument = window.PDFLib.PDFDocument;
    const PdfJuntado = await PDFDocument.create();
    const falhas = [];

    if (pdfItems.length === 0) {
        throw new Error('Nenhum relatório encontrado no período.');
    }

    const pdfBuffers = [];
    for (let index = 0; index < pdfItems.length; index++) {
        const item = pdfItems[index];
        if (index > 0) await delay(DELAY_ENTRE_REQS_MS);
        await antesDeRequisicao();
        let buffer = null;
        for (let tentativa = 1; tentativa <= MAX_TENTATIVAS_PDF; tentativa++) {
            statusCallback(tentativa === 1 ? `Baixando PDF ${index + 1} de ${pdfItems.length}` : `Relatório ${index + 1} erro. Tentativa ${tentativa}/${MAX_TENTATIVAS_PDF}...`);
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
                    statusCallback(`Relatório ${index + 1} ${msgErro}. Tentativa ${tentativa}/${MAX_TENTATIVAS_PDF}...`);
                } else {
                    falhas.push(item);
                }
            }
        }
        if (buffer && ehPdfValido(buffer)) pdfBuffers.push(buffer);
    }

    for (let [index, buffer] of pdfBuffers.entries()) {
        statusCallback(`Processando PDF ${index + 1} de ${pdfBuffers.length}`);
        const pdfDoc = await PDFDocument.load(buffer);
        const paginas = await PdfJuntado.copyPages(pdfDoc, pdfDoc.getPageIndices());
        paginas.forEach(pagina => PdfJuntado.addPage(pagina));
    }

    if (PdfJuntado.getPageCount() === 0 && pdfItems.length > 0) {
        throw new Error('Nenhum PDF válido obtido. Verifique os links ou tente novamente.');
    }
    if (falhas.length > 0) {
        statusCallback(`${falhas.length} relatório(s) não baixado(s). Será gerado HTML com os links.`);
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
    // selecionando as obras especificas
    let idsObrasEspecificas = [];
    if (obraEspecificaInput && obraEspecificaInput.value.trim() !== '') {
        idsObrasEspecificas = obraEspecificaInput.value.split(',').map(s => s.trim()).filter(Boolean);
    }
    const obras = await fazerRequisicao('obras');
    console.log('Obras retornadas da API:', obras);
    if (idsObrasEspecificas.length > 0) {
        // retorna os ids
        let obrasSelecionadas = obras.filter(o => idsObrasEspecificas.includes(o._id));
        if (tokensSomenteNome.length > 0) {
            obrasSelecionadas = obrasSelecionadas.filter(o => {
                const nomeObra = (o.nome || '').toUpperCase();
                const ok = obraNomePassaFiltroSomente(nomeObra, tokensSomenteNome);
                if (!ok) console.log('Obra específica ignorada (não bate “somente nome”):', nomeObra);
                return ok;
            });
        }
        if (obrasSelecionadas.length) {
            return obrasSelecionadas;
        } else {
            console.log('Nenhuma obra específica encontrada:', idsObrasEspecificas);
            return [];
        }
    }
    return obras.filter(obra => {
        const statusOk = obra.status && obra.status.descricao && obra.status.descricao.toLowerCase() === 'em andamento';
        const nomeObra = (obra.nome || '').toUpperCase();
        const excluida = siglasExcluidas.some(sigla => nomeObra.includes(sigla));
        if (excluida) {
            console.log('Obra excluída pelo filtro de siglas:', nomeObra);
            return false;
        }
        if (!obraNomePassaFiltroSomente(nomeObra, tokensSomenteNome)) {
            console.log('Obra fora do filtro “somente nome contém”:', nomeObra);
            return false;
        }
        return statusOk;
    });
}

async function obterRelatoriosObra(obraId, dataInicio, dataFim, ordem) {
    const params = {
        limite: 100,
        ordem: ordem,
        dataInicio: dataInicio,
        dataFim: dataFim
    };
    const response = await fazerRequisicao(`obras/${obraId}/relatorios`, params);
    return response;
}

// processo principal

async function processarRelatorios() {
    // Verifica se o servidor está disponível para funcionalidades (essencial!!!!!!!!!!!!!!!!!!!!!!!)
    const available = await isServerAvailable();
    if (!available) {
        console.log('Servidor indisponível - processamento de relatórios não executado');
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
        await atualizarStatus("Buscando todas as obras...");
        const obras = await obterObrasPorPeriodo();
        console.log('Obras após filtro:', obras);
        if (!obras.length) {
            throw new Error('Nenhuma obra encontrada.');
        }
        
        // Lista para coletar relatórios não aprovados e não baixados (erro/timeout)
        let relatoriosNaoAprovados = [];
        let relatoriosNaoBaixados = [];
        
        for (let obra of obras) {
            await atualizarStatus(`Relatórios da obra:<br><b> ${obra.nome.substring(0,33)}</b>`);
            console.log('Processando obra:', obra.nome, obra._id);
            const relatorios = await obterRelatoriosObra(obra._id, dataInicio, dataFim, ordem);
            console.log('Relatórios retornados:', relatorios);
            let relatoriosNoPeriodo = relatorios.filter(relatorio => {
                if (!relatorio.data) return false;
                const [dia, mes, ano] = relatorio.data.split('/');
                const dataRelatorio = new Date(`${ano}-${mes}-${dia}`);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataRelatorio >= inicio && dataRelatorio <= fim;
            });
            // Filtro de aprovados 100% e coleta de não aprovados
            if (apenasAprovados) {
                // Coletar relatórios não aprovados para lista
                const relatoriosNaoAprovadosObra = relatoriosNoPeriodo.filter(r => !(r.status && r.status.descricao && r.status.descricao.toLowerCase() === 'aprovado'));
                relatoriosNaoAprovadosObra.forEach(relatorio => {
                    relatoriosNaoAprovados.push({
                        obra: obra.nome,
                        data: relatorio.data,
                        tipo: relatorio.modeloDeRelatorioGlobal?.descricao || 'N/A',
                        link: `https://web.diariodeobra.app/#/app/obras/${obra._id}/relatorios/${relatorio._id}`
                    });
                });
                
                // Filtrar apenas aprovados para processamento
                relatoriosNoPeriodo = relatoriosNoPeriodo.filter(r => r.status && r.status.descricao && r.status.descricao.toLowerCase() === 'aprovado');
            }
            await atualizarStatus(`Achados ${relatoriosNoPeriodo.length} relatórios em:<br><b> ${obra.nome.substring(0,33)}</b>`, 0);
            console.log('Relatórios no período:', relatoriosNoPeriodo);

            let tipoExtrair = localStorage.getItem('tipoExtrairPDF') || 'tudo';
            if (tipoExtrair === 'rdo' || tipoExtrair === 'rsp') {
                tipoExtrair = 'tudo';
                localStorage.setItem('tipoExtrairPDF', 'tudo');
            }

            // Função para processar cada grupo
            async function processarGrupoRelatorios(relatoriosGrupo, prefixoArquivo, listaFalhas) {
                if (!relatoriosGrupo.length) return;
                const pdfItems = [];
                for (let index = 0; index < relatoriosGrupo.length; index++) {
                    const relatorio = relatoriosGrupo[index];
                    if (index > 0) await delay(DELAY_ENTRE_REQS_MS);
                    await atualizarStatus(`Processando relatório ${index + 1}/${relatoriosGrupo.length} <br><b> (${obra.nome.substring(0,33)}) </b>`);
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
                    await atualizarStatus(`Preparando mesclagem dos PDFs <br><b> (${obra.nome.substring(0,33)}) </b>`, 1);
                    const { mergedBytes, falhas } = await mergePDFs(pdfItems, msg => atualizarStatus(msg));
                    falhas.forEach(f => listaFalhas.push(f));
                    let nomeObra = obra.nome
                        .toUpperCase()
                        .normalize('NFD')
                        .replace(/[^A-Z0-9]+/g, '_')
                        .replace(/_+/g, '_')
                        .replace(/^_|_$/g, '');
                    nomeObra = prefixoArquivo + nomeObra;
                    await atualizarStatus(`Finalizando download <br><b> (${obra.nome.substring(0,33)})</b>`, 1);
                    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${nomeObra}.pdf`;
                    link.click();
                    console.log('Download concluído:', nomeObra);
                }
            }

            if (tipoExtrair === 'tudo') {
                const grupos = new Map();
                for (const r of relatoriosNoPeriodo) {
                    const idMod =
                        r.modeloDeRelatorioGlobal && r.modeloDeRelatorioGlobal._id != null
                            ? String(r.modeloDeRelatorioGlobal._id)
                            : '_sem_modelo';
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
                const lista = relatoriosNoPeriodo.filter(
                    (r) => String(r.modeloDeRelatorioGlobal?._id) === tipoExtrair
                );
                const desc = lista[0]?.modeloDeRelatorioGlobal?.descricao || 'REL';
                const prefixo = compilador_prefixoArquivoDeModelo(desc);
                await processarGrupoRelatorios(lista, prefixo, relatoriosNaoBaixados);
            }
        }
        
        if (relatoriosNaoBaixados.length > 0) {
            await atualizarStatus(`${relatoriosNaoBaixados.length} relatório(s) não baixado(s). Gerando arquivo HTML com os links...`);
            const htmlBlob = new Blob([gerarHtmlRelatoriosNaoBaixados(relatoriosNaoBaixados)], { type: 'text/html' });
            const linkHtml = document.createElement('a');
            linkHtml.href = URL.createObjectURL(htmlBlob);
            linkHtml.download = 'compilador_relatorios_nao_baixados.html';
            linkHtml.click();
        }
        await atualizarStatus("Downloads concluídos");
        
        // Gerar lista de relatórios não aprovados se houver
        if (apenasAprovados && relatoriosNaoAprovados.length > 0) {
            await atualizarStatus(`${relatoriosNaoAprovados.length} relatórios não aprovados!!!!`);
            
            // Criar arquivo HTML com links clicáveis
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
        
        console.log('Processo finalizado.');
    } catch (error) {
        atualizarStatus(`Erro: ${error.message}`);
        console.error('Erro no processamento:', error);
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

// observers pra saber quando o conteiner deve ser criado ou removido

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
