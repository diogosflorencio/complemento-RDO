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
    return new Promise(r => setTimeout(r, ms));
}

async function saldosAntesDeRequisicao() {
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

async function saldosFazerRequisicao(endpoint, params = {}) {
    await saldosAntesDeRequisicao();
    const url = new URL(`${window.API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    let response = await fetch(url, { headers: window.headers });
    if (response.status === 429) {
        await saldosAtualizarStatus('Limite da API (150/min). Aguardando 1 minuto...', 60);
        response = await fetch(url, { headers: window.headers });
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
        
        await saldosAtualizarStatus('Iniciando extração de saldos...');
        
        const obras = await obterObrasFiltradas();
        if (!obras.length) throw new Error('Nenhuma obra encontrada.');
        
        // Arrays para cada aba
        let abaSaldos = [];           // Aba 1: Saldos (principal para BI)
        let abaCronograma = [];  // Aba 2: Cronograma
        let abaHistorico = [];        // Aba 3: Histórico dos relatórios
        let abaProgressoObra = [];         // Aba 4: Progresso da Obra
        
        const dataExtracao = new Date().toISOString().split('T')[0];
        
        for (let obra of obras) {
            await saldosAtualizarStatus(`Processando obra:<br><b> ${obra.nome.substring(0,33)} </b>`);
            
            const listaTarefas = await obterListaDeTarefas(obra._id);
            
            // Aba 4: Progresso da Obra
            abaProgressoObra.push({
                'Obra ID': obra._id || '',
                'Obra': obra.nome || '',
                'Código OM': obra.codigoOM || '',
                'Cliente': obra.cliente?.nome || '',
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
                                'Código OM': obra.codigoOM || '',
                                'Cliente': obra.cliente?.nome || '',
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
                                await delaySaldos(SALDOS_DELAY_ENTRE_REQS_MS);
                                await saldosAtualizarStatus(`Extraindo histórico da tarefa:<br><b>${tarefa.item} - ${tarefa.descricao.substring(0,30)}...</b>`);
                                
                                try {
                                    const detalhesTarefa = await obterDetalhesTarefa(obra._id, tarefa._id);
                                    
                                    if (Array.isArray(detalhesTarefa.relatorios)) {
                                        for (let relatorio of detalhesTarefa.relatorios) {
                                            const porcentagemAnterior = relatorio.porcentagemAnterior || 0;
                                            const porcentagemAtual = relatorio.porcentagem || 0;
                                            const incremento = porcentagemAtual - porcentagemAnterior;
                                            
                                            abaHistorico.push({
                                                'Obra ID': obra._id || '',
                                                'Obra': obra.nome || '',
                                                'Código OM': obra.codigoOM || '',
                                                'Cliente': obra.cliente?.nome || '',
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
                                                'Acumulado': relatorio.controleDeProducao?.acumulado || ''
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
        }
        
        if (abaSaldos.length === 0 && abaCronograma.length === 0 && abaHistorico.length === 0 && abaProgressoObra.length === 0) {
            await saldosAtualizarStatus('Nenhum dado encontrado para exportar.');
            return;
        }
        
        await saldosAtualizarStatus('Compilando dados e gerando o arquivo .xlsx');
        
        // Cria o workbook
        const wb = XLSX.utils.book_new();
        
        // Aba 1: Saldos (principal para BI)
        if (abaSaldos.length > 0) {
            const wsSaldos = XLSX.utils.json_to_sheet(abaSaldos);
            XLSX.utils.book_append_sheet(wb, wsSaldos, 'Saldos');
        }
        
        // Aba 2: Cronograma
        if (abaCronograma.length > 0) {
            const wsCronograma = XLSX.utils.json_to_sheet(abaCronograma);
            XLSX.utils.book_append_sheet(wb, wsCronograma, 'Cronograma');
        }
        
        // Aba 3: Histórico dos relatórios
        if (abaHistorico.length > 0) {
            const wsHistorico = XLSX.utils.json_to_sheet(abaHistorico);
            XLSX.utils.book_append_sheet(wb, wsHistorico, 'Histórico');
        }
        
        // Aba 4: Progresso da Obra
        if (abaProgressoObra.length > 0) {
            const wsProgressoObra = XLSX.utils.json_to_sheet(abaProgressoObra);
            XLSX.utils.book_append_sheet(wb, wsProgressoObra, 'Progresso da Obra');
        }
        
        XLSX.writeFile(wb, 'saldos_lista_tarefas_complemento_rdo_@diogosflorencio.xlsx');
        await saldosAtualizarStatus('Pronto! Todos os saldos extraídos.');
        
    } catch (error) {
        await saldosAtualizarStatus(`Erro: ${error.message}`);
        console.error('Erro no processamento:', error);
    } finally {
        if (btnExtrair) btnExtrair.disabled = false;
    }
}

window.processarExtracaoSaldos = processarExtracaoSaldos;
