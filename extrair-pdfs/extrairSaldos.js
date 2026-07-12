// extrairSaldos.js
// Módulo de extração de saldos da lista de tarefas para XLSX
// Não manipula container nem DOM além do necessário

// Usar variáveis globais se já existirem
function lerRdoEmpresaDoStorageSaldos() {
    try {
        const raw = localStorage.getItem('RDOEmpresa');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
window.rdoEmpresa = window.rdoEmpresa || lerRdoEmpresaDoStorageSaldos() || {};
window.tokenApiExterna = window.tokenApiExterna || window.rdoEmpresa.tokenApiExterna;
window.API_BASE_URL = window.API_BASE_URL || "https://apiexterna.diariodeobra.app/v1";
window.headers = window.headers || {
    'token': window.tokenApiExterna,
    'Content-Type': 'application/json'
};

const SALDOS_DELAY_ENTRE_REQS_MS = 500;
const SALDOS_LIMITE_REQS_ANTES_PAUSA = 100;
let contadorRequisicoesSaldos = 0;

function delaySaldos(ms) {
    return new Promise((resolve, reject) => {
        const id = setTimeout(() => {
            try {
                if (typeof complementoRdoLancarSeCancelado === 'function') complementoRdoLancarSeCancelado();
                resolve();
            } catch (e) {
                reject(e);
            }
        }, ms);
        const signal = typeof complementoRdoSignal === 'function' ? complementoRdoSignal() : null;
        if (signal) {
            const onAbort = () => {
                clearTimeout(id);
                const erro = new Error('Extração cancelada pelo usuário.');
                erro.name = 'ComplementoRdoCancelado';
                reject(erro);
            };
            if (signal.aborted) {
                onAbort();
                return;
            }
            signal.addEventListener('abort', onAbort, { once: true });
        }
    });
}

async function saldosAntesDeRequisicao() {
    if (typeof complementoRdoLancarSeCancelado === 'function') complementoRdoLancarSeCancelado();
    if (contadorRequisicoesSaldos > 0 && contadorRequisicoesSaldos % SALDOS_LIMITE_REQS_ANTES_PAUSA === 0) {
        await saldosAtualizarStatus('Mais de 100 requisições: aguardando 1 minuto (limite API 150/min)...', 60);
    }
    contadorRequisicoesSaldos++;
}

async function saldosAtualizarStatus(mensagem, contador = null) {
    const statusElement = document.getElementById('status-extracao');
    if (!statusElement) return;
    const comContagem = typeof contador === 'number' && contador > 0;
    if (comContagem) {
        let count = contador;
        statusElement.innerHTML = `${mensagem} ${count}`;
        return new Promise((resolve, reject) => {
            if (typeof complementoRdoLimparCountdown === 'function') complementoRdoLimparCountdown();
            const interval = setInterval(() => {
                try {
                    if (typeof complementoRdoLancarSeCancelado === 'function') complementoRdoLancarSeCancelado();
                } catch (e) {
                    clearInterval(interval);
                    if (window.__complementoRdoExtracao) window.__complementoRdoExtracao.countdownId = null;
                    reject(e);
                    return;
                }
                count--;
                statusElement.innerHTML = `${mensagem} ${count}`;
                if (count <= 0) {
                    clearInterval(interval);
                    if (window.__complementoRdoExtracao) window.__complementoRdoExtracao.countdownId = null;
                    resolve();
                }
            }, 1000);
            if (window.__complementoRdoExtracao) window.__complementoRdoExtracao.countdownId = interval;
        });
    } else {
        statusElement.innerHTML = `${mensagem}`;
    }
}

async function saldosFazerRequisicao(endpoint, params = {}) {
    await saldosAntesDeRequisicao();
    const url = new URL(`${window.API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const opts = { headers: window.headers };
    const signal = typeof complementoRdoSignal === 'function' ? complementoRdoSignal() : null;
    if (signal) opts.signal = signal;
    let response = await fetch(url, opts);
    if (response.status === 429) {
        await saldosAtualizarStatus('Limite da API (150/min). Aguardando 1 minuto...', 60);
        response = await fetch(url, opts);
    }
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
    return await response.json();
}

function saldosTokensNomeSomenteObras() {
    const el = document.getElementById('obras-somente-nome-contem');
    if (!el || el.value.trim() === '') return [];
    return el.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
}

function saldosObraNomePassaFiltroSomente(nomeObraUpper, tokensSomente) {
    if (!tokensSomente.length) return true;
    return tokensSomente.some(t => nomeObraUpper.includes(t));
}

// Busca todas as obras filtrando por status e exclusão
async function obterObrasFiltradas() {
    const obrasExcluidasInput = document.getElementById('obras-excluidas');
    const obraEspecificaInput = document.getElementById('obra-especifica');
    const somenteAndamentoCheckbox = document.getElementById('somente-obras-andamento');
    const tokensSomenteNome = saldosTokensNomeSomenteObras();
    let siglasExcluidas = [];
    if (obrasExcluidasInput && obrasExcluidasInput.value.trim() !== '') {
        siglasExcluidas = obrasExcluidasInput.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    }
    let idsObrasEspecificas = [];
    if (obraEspecificaInput && obraEspecificaInput.value.trim() !== '') {
        idsObrasEspecificas = obraEspecificaInput.value.split(',').map(s => s.trim()).filter(Boolean);
    }
    const somenteAndamento = somenteAndamentoCheckbox ? somenteAndamentoCheckbox.checked : false;
    const obras = await saldosFazerRequisicao('obras');
    if (idsObrasEspecificas.length > 0) {
        let sel = obras.filter(o => idsObrasEspecificas.includes(o._id));
        if (tokensSomenteNome.length > 0) {
            sel = sel.filter(o => saldosObraNomePassaFiltroSomente((o.nome || '').toUpperCase(), tokensSomenteNome));
        }
        return sel;
    }
    return obras.filter(obra => {
        const nomeObra = (obra.nome || '').toUpperCase();
        const excluida = siglasExcluidas.some(sigla => nomeObra.includes(sigla));
        if (excluida) return false;
        if (!saldosObraNomePassaFiltroSomente(nomeObra, tokensSomenteNome)) return false;
        if (somenteAndamento) {
            const statusOk = obra.status && obra.status.descricao && obra.status.descricao.toLowerCase() === 'em andamento';
            return statusOk;
        }
        return true;
    });
}

// Busca lista de tarefas da obra
async function obterListaDeTarefas(obraId) {
    return await saldosFazerRequisicao(`obras/${obraId}/lista-de-tarefas`);
}

// Busca detalhes de uma tarefa específica
async function obterDetalhesTarefa(obraId, tarefaId) {
    return await saldosFazerRequisicao(`obras/${obraId}/lista-de-tarefas/${tarefaId}`);
}

function saldosNormTexto(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function saldosLerFiltroModeloRelatorio() {
    const el = document.getElementById('pdf-tipo');
    const valor = el && el.value ? el.value.trim() : '';
    if (!valor) return localStorage.getItem('tipoExtrairSaldos') || 'todos-orcamentos';
    return valor;
}

function saldosModeloContemOrcamento(relatorio) {
    const descGlobal = saldosNormTexto(relatorio?.modeloDeRelatorioGlobal?.descricao);
    const descLocal = saldosNormTexto(relatorio?.modeloDeRelatorio?.descricao);
    const termos = ['orcamento', 'orcamentos'];
    return termos.some((t) => descGlobal.includes(t) || descLocal.includes(t));
}

function saldosRelatorioBateModelo(relatorio, tipoSelecionado) {
    const tipo = String(tipoSelecionado || 'todos-orcamentos').trim();
    if (!tipo || tipo === 'todos-orcamentos' || tipo === 'tudo') {
        return saldosModeloContemOrcamento(relatorio);
    }
    if (typeof compilador_idsModeloNoRelatorio === 'function') {
        const ids = compilador_idsModeloNoRelatorio(relatorio);
        if (ids.has(tipo)) return true;
    }
    if (typeof compilador_normDesc === 'function') {
        const nd = compilador_normDesc(tipo);
        const g = compilador_normDesc(relatorio?.modeloDeRelatorioGlobal?.descricao);
        const l = compilador_normDesc(relatorio?.modeloDeRelatorio?.descricao);
        if (nd && (g === nd || l === nd)) return true;
    }
    const descGlobal = saldosNormTexto(relatorio?.modeloDeRelatorioGlobal?.descricao);
    const descLocal = saldosNormTexto(relatorio?.modeloDeRelatorio?.descricao);
    const filtro = saldosNormTexto(tipo);
    return !!(filtro && (descGlobal.includes(filtro) || descLocal.includes(filtro)));
}

function saldosRelatorioNoPeriodo(relatorio, dataInicio, dataFim) {
    if (!dataInicio || !dataFim) return true;
    if (!relatorio?.data) return false;
    const partes = String(relatorio.data).split('/');
    if (partes.length !== 3) return false;
    const [dia, mes, ano] = partes;
    const dataRelatorio = new Date(`${ano}-${mes}-${dia}`);
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59, 999);
    return dataRelatorio >= inicio && dataRelatorio <= fim;
}

function saldosLinkObra(obraId) {
    if (!obraId) return '';
    return `https://web.diariodeobra.app/#/app/obras/${obraId}`;
}

function saldosLinkRelatorio(obraId, relatorioId) {
    if (!obraId || !relatorioId) return '';
    return `https://web.diariodeobra.app/#/app/obras/${obraId}/relatorios/${relatorioId}`;
}

function saldosAchatarAtividade(atividade, prefixo = 'atividade') {
    const destino = {};
    function walk(valor, caminho) {
        if (valor == null) {
            destino[caminho] = '';
            return;
        }
        if (typeof valor === 'boolean' || typeof valor === 'number' || typeof valor === 'string') {
            destino[caminho] = valor;
            return;
        }
        if (Array.isArray(valor)) {
            if (!valor.length) {
                destino[caminho] = '';
                return;
            }
            if (valor.every((v) => v == null || typeof v !== 'object')) {
                destino[caminho] = valor.join('; ');
                return;
            }
            destino[caminho] = JSON.stringify(valor);
            destino[`${caminho}.total`] = valor.length;
            return;
        }
        if (typeof valor === 'object') {
            const chaves = Object.keys(valor);
            if (!chaves.length) {
                destino[caminho] = '';
                return;
            }
            for (const chave of chaves) {
                walk(valor[chave], `${caminho}.${chave}`);
            }
            return;
        }
        destino[caminho] = String(valor);
    }
    if (atividade == null || typeof atividade !== 'object') {
        destino[prefixo] = atividade == null ? '' : String(atividade);
        return destino;
    }
    for (const chave of Object.keys(atividade)) {
        walk(atividade[chave], `${prefixo}.${chave}`);
    }
    return destino;
}

function saldosNormalizarLinhasPlanilha(linhas) {
    if (!Array.isArray(linhas) || !linhas.length) return linhas;
    const chaves = [];
    const visto = new Set();
    for (const linha of linhas) {
        for (const k of Object.keys(linha || {})) {
            if (!visto.has(k)) {
                visto.add(k);
                chaves.push(k);
            }
        }
    }
    return linhas.map((linha) => {
        const out = {};
        for (const k of chaves) out[k] = linha && linha[k] != null ? linha[k] : '';
        return out;
    });
}

function saldosPrimeiroComentario(detalhes) {
    const comentarios = Array.isArray(detalhes?.comentarios) ? detalhes.comentarios : [];
    for (const comentario of comentarios) {
        const texto = (comentario?.descricao || '').trim();
        if (texto) return texto;
    }
    return '';
}

function saldosNormalizarListaRelatorios(resposta) {
    if (Array.isArray(resposta)) return resposta;
    if (Array.isArray(resposta?.data)) return resposta.data;
    if (Array.isArray(resposta?.relatorios)) return resposta.relatorios;
    return [];
}

async function obterRelatoriosObraSaldos(obraId, dataInicio, dataFim) {
    const params = {
        limite: 2000,
        ordem: 'desc'
    };
    if (dataInicio && dataFim) {
        params.dataInicio = dataInicio;
        params.dataFim = dataFim;
    }
    const resposta = await saldosFazerRequisicao(`obras/${obraId}/relatorios`, params);
    return saldosNormalizarListaRelatorios(resposta);
}

async function obterDetalhesRelatorioSaldos(obraId, relatorioId) {
    return await saldosFazerRequisicao(`obras/${obraId}/relatorios/${relatorioId}`);
}

function saldosAdicionarLinhasOrcamento(abaOrcamento, obra, relatorio, detalhes) {
    const obraId = obra._id || '';
    const relatorioId = relatorio._id || detalhes?._id || '';
    const base = {
        'Obra ID': obraId,
        'Obra': obra.nome || '',
        'Link Obra': saldosLinkObra(obraId),
        'Número': relatorio.numero ?? detalhes?.numero ?? '',
        'Status (Aprovações intermediárias não são consideradas nem retornadas pelo Diário de Obra)': detalhes?.status?.descricao || relatorio.status?.descricao || '',
        'Data': relatorio.data || detalhes?.data || '',
        'Modelo': relatorio.modeloDeRelatorioGlobal?.descricao
            || detalhes?.modeloDeRelatorio?.descricao
            || detalhes?.modeloDeRelatorioGlobal?.descricao
            || '',
        'Primeiro Comentário (Normalmente o primeiro comentário é o nome do orçamento, não existe outra forma de associar o orçamento ao seu escopo na lista de tarefas. Seria interessante se o nome da Etapa da lista de tarefas tivesse o número do relatório de orçamento)': saldosPrimeiroComentario(detalhes),
        'Link Relatório': saldosLinkRelatorio(obraId, relatorioId)
    };
    const atividades = Array.isArray(detalhes?.atividades) ? detalhes.atividades : [];
    if (!atividades.length) {
        abaOrcamento.push({ ...base });
        return;
    }
    for (const atividade of atividades) {
        abaOrcamento.push({
            ...base,
            ...saldosAchatarAtividade(atividade, 'atividade')
        });
    }
}

// Função auxiliar para calcular saldo
function calcularSaldo(quantidadeTotal, realizado) {
    const total = parseFloat(quantidadeTotal) || 0;
    const exec = parseFloat(realizado) || 0;
    return (total - exec).toFixed(2);
}

// Função principal: extrai saldos e exporta XLSX
async function processarExtracaoSaldos() {
    // Verifica se o servidor está disponível
    const available = await isServerAvailable();
    if (!available) {
        console.log('Servidor indisponível - extração de saldos não executada');
        return;
    }
    
    const btnExtrair = document.querySelector('.btn-extrair-saldos');
    try {
        if (btnExtrair) btnExtrair.disabled = true;
        contadorRequisicoesSaldos = 0;
        if (typeof complementoRdoIniciarControleCancelamento === 'function') {
            complementoRdoIniciarControleCancelamento();
        }
        
        const dataInicio = document.getElementById('pdf-data-inicio')?.value || '';
        const dataFim = document.getElementById('pdf-data-fim')?.value || '';
        const tipoModeloSelecionado = saldosLerFiltroModeloRelatorio();
        if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
            throw new Error('Informe data inicial e final, ou deixe ambas vazias para extrair todos os relatórios.');
        }

        await saldosAtualizarStatus('Iniciando extração de saldos...');
        
        const obras = await obterObrasFiltradas();
        if (!obras.length) throw new Error('Nenhuma obra encontrada.');
        
        // Arrays para cada aba
        let abaSaldos = [];           // Aba 1: Saldos (principal para BI)
        let abaCronograma = [];  // Aba 2: Cronograma
        let abaHistorico = [];        // Aba 3: Histórico dos relatórios
        let abaProgressoObra = [];         // Aba 4: Progresso da Obra
        let abaOrcamento = [];             // Aba 5: Orçamento
        
        const dataExtracao = new Date().toISOString().split('T')[0];
        
        for (let obra of obras) {
            if (typeof complementoRdoLancarSeCancelado === 'function') complementoRdoLancarSeCancelado();
            await saldosAtualizarStatus(`Processando obra:<br><b> ${obra.nome.substring(0,33)} </b>`);
            
            const listaTarefas = await obterListaDeTarefas(obra._id);
            
            // Aba 4: Progresso da Obra
            abaProgressoObra.push({
                'Obra ID': obra._id || '',
                'Obra': obra.nome || '',
                'Link Obra': saldosLinkObra(obra._id),
                'Total Tarefas': listaTarefas.totalTarefas || 0,
                'Não Iniciadas': listaTarefas.totalTarefasNaoIniciada || 0,
                'Em Andamento': listaTarefas.totalTarefasEmAndamento || 0,
                'Concluídas': listaTarefas.totalTarefasConcluida || 0,
                'Realizado %': listaTarefas.realizado || '0',
                'Data Extração': dataExtracao
            });
            
            // Processa cronograma (etapas e tarefas)
            if (Array.isArray(listaTarefas.cronograma)) {
                for (let etapa of listaTarefas.cronograma) {
                    // Aba 2: Cronograma - linha por etapa
                    abaCronograma.push({
                        'Obra ID': obra._id || '',
                        'Obra': obra.nome || '',
                        'Link Obra': saldosLinkObra(obra._id),
                        'Etapa ID': etapa._id || '',
                        'Posição': etapa.posicao || '',
                        'Item': etapa.item || '',
                        'Descrição': etapa.descricao || '',
                        'Porcentagem': etapa.porcentagem || '0',
                        'Tipo': 'Etapa'
                    });
                    
                    // Processa tarefas dentro da etapa
                    if (Array.isArray(etapa.tarefas)) {
                        for (let tarefa of etapa.tarefas) {
                            // Aba 2: Cronograma - linha por tarefa
                            abaCronograma.push({
                                'Obra ID': obra._id || '',
                                'Obra': obra.nome || '',
                                'Link Obra': saldosLinkObra(obra._id),
                                'Tarefa ID': tarefa._id || '',
                                'Etapa ID': etapa._id || '',
                                'Posição': tarefa.posicao || '',
                                'Item': tarefa.item || '',
                                'Descrição': tarefa.descricao || '',
                                'Porcentagem': tarefa.porcentagem || 0,
                                'Unidade': tarefa.controleDeProducao?.unidade || '',
                                'Quantidade': tarefa.controleDeProducao?.quantidade || '',
                                'Realizado': tarefa.controleDeProducao?.realizado || '',
                                'Tipo': 'Tarefa'
                            });
                            
                            // Aba 1: Saldos - linha por tarefa/etapa
                            const quantidadeTotal = parseFloat(tarefa.controleDeProducao?.quantidade) || 0;
                            const realizado = parseFloat(tarefa.controleDeProducao?.realizado) || 0;
                            const saldo = calcularSaldo(quantidadeTotal, realizado);
                            const statusDescricao = tarefa.porcentagem === 0 ? 'Não iniciada' : 
                                                   tarefa.porcentagem === 100 ? 'Concluída' : 'Em andamento';
                            
                            abaSaldos.push({
                                'Obra ID': obra._id || '',
                                'Obra': obra.nome || '',
                                'Link Obra': saldosLinkObra(obra._id),
                                'Tarefa ID': tarefa._id || '',
                                'Item Tarefa': tarefa.item || '',
                                'Nome Tarefa': tarefa.descricao || '',
                                'Etapa ID': etapa._id || '',
                                'Item Etapa': etapa.item || '',
                                'Nome Etapa': etapa.descricao || '',
                                'Unidade': tarefa.controleDeProducao?.unidade || '',
                                'Escopo Total': quantidadeTotal,
                                'Realizado': realizado,
                                'Saldo': saldo,
                                '% Concluído': tarefa.porcentagem || 0,
                                'Status': statusDescricao,
                                'Total Fotos': tarefa.totalFotos || 0,
                                'Data Extração': dataExtracao
                            });
                            
                            // Aba 3: Histórico dos relatórios - busca detalhes da tarefa
                            if (tarefa._id) {
                                if (typeof complementoRdoLancarSeCancelado === 'function') complementoRdoLancarSeCancelado();
                                await delaySaldos(SALDOS_DELAY_ENTRE_REQS_MS);
                                await saldosAtualizarStatus(`Extraindo histórico da tarefa:<br><b>${tarefa.item} - ${tarefa.descricao.substring(0,30)}...</b>`);
                                
                                try {
                                    const detalhesTarefa = await obterDetalhesTarefa(obra._id, tarefa._id);
                                    
                                    if (Array.isArray(detalhesTarefa.relatorios)) {
                                        for (let relatorio of detalhesTarefa.relatorios) {
                                            const porcentagemAnterior = relatorio.porcentagemAnterior || 0;
                                            const porcentagemAtual = relatorio.porcentagem || 0;
                                            const incremento = porcentagemAtual - porcentagemAnterior;
                                            const relatorioId = relatorio._id || relatorio.relatorioId || relatorio.relatorio?._id || '';
                                            
                                            abaHistorico.push({
                                                'Obra ID': obra._id || '',
                                                'Obra': obra.nome || '',
                                                'Link Obra': saldosLinkObra(obra._id),
                                                'Etapa': etapa.descricao || '',
                                                'Item Etapa': etapa.item || '',
                                                'Tarefa': tarefa.descricao || '',
                                                'Item Tarefa': tarefa.item || '',
                                                'Data': relatorio.data || '',
                                                'Data Fim': relatorio.dataFim || '',
                                                '% Anterior': porcentagemAnterior,
                                                '% Atual': porcentagemAtual,
                                                'Incremento': incremento,
                                                'Horas': relatorio.horario?.descricao || '',
                                                'Total Fotos': relatorio.fotos?.length || 0,
                                                'Observação': relatorio.observacao || '',
                                                'Unidade': tarefa.controleDeProducao?.unidade || '',
                                                'Realizado': relatorio.controleDeProducao?.realizado || '',
                                                'Realizado Anterior': relatorio.controleDeProducao?.realizadoAnterior || '',
                                                'Acumulado': relatorio.controleDeProducao?.acumulado || '',
                                                'Link Relatório': saldosLinkRelatorio(obra._id, relatorioId)
                                            });
                                        }
                                    }
                                } catch (error) {
                                    console.warn(`Erro ao buscar detalhes da tarefa ${tarefa._id}:`, error);
                                }
                            }
                        }
                    }
                }
            }

            // Aba Orçamento: relatórios do período cujo modelo contém o filtro informado
            try {
                await saldosAtualizarStatus(`Buscando orçamentos:<br><b>${obra.nome.substring(0, 33)}</b>`);
                const relatorios = await obterRelatoriosObraSaldos(obra._id, dataInicio, dataFim);
                const relatoriosOrcamento = relatorios.filter(
                    (r) => saldosRelatorioNoPeriodo(r, dataInicio, dataFim) && saldosRelatorioBateModelo(r, tipoModeloSelecionado)
                );
                for (let i = 0; i < relatoriosOrcamento.length; i++) {
                    if (typeof complementoRdoLancarSeCancelado === 'function') complementoRdoLancarSeCancelado();
                    const relatorio = relatoriosOrcamento[i];
                    if (i > 0) await delaySaldos(SALDOS_DELAY_ENTRE_REQS_MS);
                    await saldosAtualizarStatus(
                        `Extraindo orçamento ${i + 1}/${relatoriosOrcamento.length}<br><b>${obra.nome.substring(0, 33)}</b>`
                    );
                    try {
                        const detalhes = await obterDetalhesRelatorioSaldos(obra._id, relatorio._id);
                        saldosAdicionarLinhasOrcamento(abaOrcamento, obra, relatorio, detalhes);
                    } catch (error) {
                        console.warn(`Erro ao buscar relatório ${relatorio._id}:`, error);
                    }
                }
            } catch (error) {
                console.warn(`Erro ao buscar orçamentos da obra ${obra._id}:`, error);
            }
        }
        
        if (
            abaSaldos.length === 0 &&
            abaCronograma.length === 0 &&
            abaHistorico.length === 0 &&
            abaProgressoObra.length === 0 &&
            abaOrcamento.length === 0
        ) {
            await saldosAtualizarStatus('Nenhum dado encontrado para exportar.');
            return;
        }
        
        await saldosAtualizarStatus('Compilando dados e gerando o arquivo .xlsx');
        
        // Cria o workbook
        const wb = XLSX.utils.book_new();
        
        // Aba 1: Saldos (principal para BI)
        if (abaSaldos.length > 0) {
            const wsSaldos = XLSX.utils.json_to_sheet(saldosNormalizarLinhasPlanilha(abaSaldos));
            XLSX.utils.book_append_sheet(wb, wsSaldos, 'Saldos');
        }
        
        // Aba 2: Cronograma
        if (abaCronograma.length > 0) {
            const wsCronograma = XLSX.utils.json_to_sheet(saldosNormalizarLinhasPlanilha(abaCronograma));
            XLSX.utils.book_append_sheet(wb, wsCronograma, 'Cronograma');
        }
        
        // Aba 3: Histórico dos relatórios
        if (abaHistorico.length > 0) {
            const wsHistorico = XLSX.utils.json_to_sheet(saldosNormalizarLinhasPlanilha(abaHistorico));
            XLSX.utils.book_append_sheet(wb, wsHistorico, 'Histórico');
        }
        
        // Aba 4: Progresso da Obra
        if (abaProgressoObra.length > 0) {
            const wsProgressoObra = XLSX.utils.json_to_sheet(saldosNormalizarLinhasPlanilha(abaProgressoObra));
            XLSX.utils.book_append_sheet(wb, wsProgressoObra, 'Progresso da Obra');
        }

        // Aba 5: Orçamento
        if (abaOrcamento.length > 0) {
            const wsOrcamento = XLSX.utils.json_to_sheet(saldosNormalizarLinhasPlanilha(abaOrcamento));
            XLSX.utils.book_append_sheet(wb, wsOrcamento, 'Orçamento');
        }
        
        XLSX.writeFile(wb, 'saldos_lista_tarefas_complemento_rdo_@diogosflorencio.xlsx');
        await saldosAtualizarStatus('Pronto! Todos os saldos extraídos.');
        
    } catch (error) {
        if (typeof complementoRdoFoiCancelamento === 'function' && complementoRdoFoiCancelamento(error)) {
            await saldosAtualizarStatus('Extração cancelada.');
        } else {
            await saldosAtualizarStatus(`Erro: ${error.message}`);
            console.error('Erro no processamento:', error);
        }
    } finally {
        if (typeof complementoRdoFinalizarControleCancelamento === 'function') {
            complementoRdoFinalizarControleCancelamento();
        }
        if (btnExtrair) btnExtrair.disabled = false;
    }
}

window.processarExtracaoSaldos = processarExtracaoSaldos;
