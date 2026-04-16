// extrairDadosRelatorios.js
// Módulo de extração de dados dos relatórios para XLSX
// Não manipula container nem DOM além do necessário

// Usar variáveis globais se já existirem; RDOEmpresa ausente/inválido não pode derrubar o script (senão processarExtracaoDados não registra no window).
function lerRdoEmpresaDoStorage() {
    try {
        const raw = localStorage.getItem('RDOEmpresa');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
window.rdoEmpresa = window.rdoEmpresa || lerRdoEmpresaDoStorage() || {};
window.tokenApiExterna = window.tokenApiExterna || window.rdoEmpresa.tokenApiExterna;
window.API_BASE_URL = window.API_BASE_URL || "https://apiexterna.diariodeobra.app/v1";
window.headers = window.headers || {
    'token': window.tokenApiExterna,
    'Content-Type': 'application/json'
};

const DADOS_DELAY_ENTRE_REQS_MS = 500;
const DADOS_LIMITE_REQS_ANTES_PAUSA = 100;
let contadorRequisicoesAPI = 0;

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/** Não usar nome global `antesDeRequisicao`  o Compilador (extrairPDFsRelatorios) declara o seu. */
async function dadosAntesDeRequisicao() {
    if (contadorRequisicoesAPI > 0 && contadorRequisicoesAPI % DADOS_LIMITE_REQS_ANTES_PAUSA === 0) {
        await dadosAtualizarStatus('Mais de 100 requisições: aguardando 1 minuto (limite API 150/min)...', 60);
    }
    contadorRequisicoesAPI++;
}

/** Status só do modo Dados  não sobrescrever `atualizarStatus` do Compilador. */
async function dadosAtualizarStatus(mensagem, contador = null) {
    const statusElement = document.getElementById('status-extracao');
    if (!statusElement) return;
    const comContagem = typeof contador === 'number' && contador > 0;
    if (comContagem) {
        let count = contador;
        statusElement.innerHTML = `${mensagem} ${count}`;
        return new Promise(resolve => {
            const interval = setInterval(() => {
                count--;
                statusElement.innerHTML = `${mensagem} ${count}`;
                if (count <= 0) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    } else {
        statusElement.innerHTML = `${mensagem}`;
    }
}

async function dadosFazerRequisicao(endpoint, params = {}) {
    await dadosAntesDeRequisicao();
    const url = new URL(`${window.API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    let response = await fetch(url, { headers: window.headers });
    if (response.status === 429) {
        await dadosAtualizarStatus('Limite da API (150/min). Aguardando 1 minuto...', 60);
        response = await fetch(url, { headers: window.headers });
    }
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
    return await response.json();
}

async function dadosObterDetalhesRelatorio(obraId, relatorioId) {
    return await dadosFazerRequisicao(`obras/${obraId}/relatorios/${relatorioId}`);
}

function dadosTokensNomeSomenteObras() {
    const el = document.getElementById('obras-somente-nome-contem');
    if (!el || el.value.trim() === '') return [];
    return el.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
}

function dadosObraNomePassaFiltroSomente(nomeObraUpper, tokensSomente) {
    if (!tokensSomente.length) return true;
    return tokensSomente.some(t => nomeObraUpper.includes(t));
}

// Busca todas as obras filtrando por status e exclusão
async function obterObrasFiltradas() {
    const obrasExcluidasInput = document.getElementById('obras-excluidas');
    const obraEspecificaInput = document.getElementById('obra-especifica');
    const tokensSomenteNome = dadosTokensNomeSomenteObras();
    let siglasExcluidas = [];
    if (obrasExcluidasInput && obrasExcluidasInput.value.trim() !== '') {
        siglasExcluidas = obrasExcluidasInput.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    }
    let idsObrasEspecificas = [];
    if (obraEspecificaInput && obraEspecificaInput.value.trim() !== '') {
        idsObrasEspecificas = obraEspecificaInput.value.split(',').map(s => s.trim()).filter(Boolean);
    }
    const obras = await dadosFazerRequisicao('obras');
    if (idsObrasEspecificas.length > 0) {
        let sel = obras.filter(o => idsObrasEspecificas.includes(o._id));
        if (tokensSomenteNome.length > 0) {
            sel = sel.filter(o => dadosObraNomePassaFiltroSomente((o.nome || '').toUpperCase(), tokensSomenteNome));
        }
        return sel;
    }
    return obras.filter(obra => {
        const statusOk = obra.status && obra.status.descricao && obra.status.descricao.toLowerCase() === 'em andamento';
        const nomeObra = (obra.nome || '').toUpperCase();
        const excluida = siglasExcluidas.some(sigla => nomeObra.includes(sigla));
        return statusOk && !excluida && dadosObraNomePassaFiltroSomente(nomeObra, tokensSomenteNome);
    });
}

// Busca relatórios de uma obra no período
async function obterRelatoriosObra(obraId, dataInicio, dataFim, ordem) {
    const semLimite = document.getElementById('sem-limite')?.checked;

    const params = {
        limite: semLimite ? 1000000 : 100,
        ordem: ordem,
        dataInicio: dataInicio,
        dataFim: dataFim
    };
    return await dadosFazerRequisicao(`obras/${obraId}/relatorios`, params);
}

// Função principal: extrai dados dos relatórios e exporta XLSX
async function processarExtracaoDados() {
    // Verifica se o servidor está disponível para funcionalidades
    const available = await isServerAvailable();
    if (!available) {
        console.log('Servidor indisponível - extração de dados não executada');
        return;
    }
    
    const btnExtrair = document.querySelector('.btn-extrair-dados');
    try {
        if (btnExtrair) btnExtrair.disabled = true;
        contadorRequisicoesAPI = 0;
        await dadosAtualizarStatus('Iniciando extração de dados...');
        const dataInicio = document.getElementById('pdf-data-inicio').value;
        const dataFim = document.getElementById('pdf-data-fim').value;
        const ordem = document.getElementById('pdf-ordem').value;
        const apenasAprovados = document.getElementById('aprovados-100')?.checked;
        if (!dataInicio) throw new Error('Selecione a data de início.');
        const obras = await obterObrasFiltradas();
        if (!obras.length) throw new Error('Nenhuma obra encontrada.');
        let atividadesExtraidas = [];
        let maoDeObraHH = [];
        for (let obra of obras) {
            await dadosAtualizarStatus(`Processando obra:<br><b> ${obra.nome.substring(0,33)} </b>`);
            const relatorios = await obterRelatoriosObra(obra._id, dataInicio, dataFim, ordem);
            let relatoriosNoPeriodo = relatorios.filter(relatorio => {
                if (!relatorio.data) return false;
                const [dia, mes, ano] = relatorio.data.split('/');
                const dataRelatorio = new Date(`${ano}-${mes}-${dia}`);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataRelatorio >= inicio && dataRelatorio <= fim;
            });
            if (apenasAprovados) {
                relatoriosNoPeriodo = relatoriosNoPeriodo.filter(r => r.status && r.status.descricao && r.status.descricao.toLowerCase() === 'aprovado');
            }
            for (let i = 0; i < relatoriosNoPeriodo.length; i++) {
                const relatorio = relatoriosNoPeriodo[i];
                if (i > 0) await delay(DADOS_DELAY_ENTRE_REQS_MS);
                await dadosAtualizarStatus(`Extraindo relatório ${i + 1}/${relatoriosNoPeriodo.length} <br><b> (${obra.nome.substring(0,33)}) </b>`);
                const detalhes = await dadosObterDetalhesRelatorio(obra._id, relatorio._id);
                // Atividades (aba Atividades)
                if (Array.isArray(detalhes.atividades)) {
                    for (let atividade of detalhes.atividades) {
                        atividadesExtraidas.push({
                            'Data': relatorio.data,
                            'Item': atividade.item || '',
                            'Atividade': atividade.descricao || '',
                            'Realizado': atividade.controleDeProducao?.realizado ?? '',
                            'Unidade': atividade.controleDeProducao?.unidade ?? '',
                            'Modelo do Relatório': relatorio.modeloDeRelatorioGlobal?.descricao || '',
                            'Obra': obra.nome || '',
                            'Link': `https://web.diariodeobra.app/#/app/obras/${obra._id}/relatorios/${relatorio._id}`
                        });
                    }
                }
                // Mão de obra personalizada (aba HH)
                if ((obra.nome || '').toUpperCase().includes('HH') && detalhes.maoDeObra && Array.isArray(detalhes.maoDeObra.personalizada)) {
                    for (let pessoa of detalhes.maoDeObra.personalizada) {
                        maoDeObraHH.push({
                            'Data': relatorio.data || '', // Coluna A
                            'Nome': pessoa.nome || '',     // Coluna D
                            'Funcao': pessoa.funcao || '', // Coluna E
                            'HoraInicio': pessoa.horaInicio || '', // Coluna F
                            'HoraFim': pessoa.horaFim || '',       // Coluna G
                            'Intervalo': pessoa.horasIntervalo || '', // Coluna H
                            'Obra': obra.nome || ''        // Coluna P
                        });
                    }
                }
            }
        }
        if (atividadesExtraidas.length === 0 && maoDeObraHH.length === 0) {
            await dadosAtualizarStatus('Nenhuma atividade ou mão de obra encontrada para exportar.');
            return;
        }
        await dadosAtualizarStatus('Compilando dados e gerando o arquivo .xlsx');
        const ws = XLSX.utils.json_to_sheet(atividadesExtraidas);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Atividades');
        // Se houver dados de HH, cria a aba HH com colunas específicas
        if (maoDeObraHH.length > 0) {
            const dadosHHParaPlanilha = [
                // Cabeçalho - Linha 1
                [
                    'Data', // A
                    'Nome', // B
                    'Função', // C
                    'Hora de Entrada', // D
                    'Hora de Saída', // E
                    'Intervalo', // F
                    'Obra', // G
                ]
            ];

            // Adiciona os dados
            maoDeObraHH.forEach(item => {
                dadosHHParaPlanilha.push([
                    item.Data,
                    item.Nome,
                    item.Funcao,
                    item.HoraInicio,
                    item.HoraFim,
                    item.Intervalo,
                    item.Obra
                ]);
            });

            const wsHH = XLSX.utils.aoa_to_sheet(dadosHHParaPlanilha);
            XLSX.utils.book_append_sheet(wb, wsHH, 'HH');
        }
        XLSX.writeFile(wb, 'relatorio_geral_atividades_complemento_rdo_@diogosflorencio.xlsx');
        await dadosAtualizarStatus('Pronto! Tudo extraído.');
    } catch (error) {
        await dadosAtualizarStatus(`Erro: ${error.message}`);
        console.error('Erro no processamento:', error);
    } finally {
        if (btnExtrair) btnExtrair.disabled = false;
    }
}

window.processarExtracaoDados = processarExtracaoDados;
