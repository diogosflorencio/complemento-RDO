// extrairDadosRelatorios.js
// Módulo de extração de dados dos relatórios para XLSX
// Não manipula container nem DOM além do necessário

// Usar variáveis globais se já existirem, senão definir
window.rdoEmpresa = window.rdoEmpresa || JSON.parse(localStorage.getItem('RDOEmpresa'));
window.tokenApiExterna = window.tokenApiExterna || window.rdoEmpresa.tokenApiExterna;
window.API_BASE_URL = window.API_BASE_URL || "https://apiexterna.diariodeobra.app/v1";
window.headers = window.headers || {
    'token': window.tokenApiExterna,
    'Content-Type': 'application/json'
};

// Utilitário para atualizar status na interface (opcional)
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
        statusElement.innerHTML = `${mensagem}`;
    }
}

// Requisição genérica para a API
async function fazerRequisicao(endpoint, params = {}) {
    const url = new URL(`${window.API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const response = await fetch(url, { headers: window.headers });
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
    return await response.json();
}

// Busca detalhes de um relatório
async function obterDetalhesRelatorio(obraId, relatorioId) {
    return await fazerRequisicao(`obras/${obraId}/relatorios/${relatorioId}`);
}

// Busca todas as obras filtrando por status e exclusão
async function obterObrasFiltradas() {
    const obrasExcluidasInput = document.getElementById('obras-excluidas');
    const obraEspecificaInput = document.getElementById('obra-especifica');
    let siglasExcluidas = [];
    if (obrasExcluidasInput && obrasExcluidasInput.value.trim() !== '') {
        siglasExcluidas = obrasExcluidasInput.value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    }
    let idsObrasEspecificas = [];
    if (obraEspecificaInput && obraEspecificaInput.value.trim() !== '') {
        idsObrasEspecificas = obraEspecificaInput.value.split(',').map(s => s.trim()).filter(Boolean);
    }
    const obras = await fazerRequisicao('obras');
    if (idsObrasEspecificas.length > 0) {
        return obras.filter(o => idsObrasEspecificas.includes(o._id));
    }
    return obras.filter(obra => {
        const statusOk = obra.status && obra.status.descricao && obra.status.descricao.toLowerCase() === 'em andamento';
        const nomeObra = (obra.nome || '').toUpperCase();
        const excluida = siglasExcluidas.some(sigla => nomeObra.includes(sigla));
        return statusOk && !excluida;
    });
}

// Busca relatórios de uma obra no período
async function obterRelatoriosObra(obraId, dataInicio, dataFim, ordem) {
    const params = {
        limite: 100,
        ordem: ordem,
        dataInicio: dataInicio,
        dataFim: dataFim
    };
    return await fazerRequisicao(`obras/${obraId}/relatorios`, params);
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
        await atualizarStatus('Iniciando extração de dados...');
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
            await atualizarStatus(`Processando obra:<br><b> ${obra.nome.substring(0,33)} </b>`, 0);
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
                await atualizarStatus(`Extraindo relatório ${i + 1}/${relatoriosNoPeriodo.length} <br><b> (${obra.nome.substring(0,33)}) </b>`);
                const detalhes = await obterDetalhesRelatorio(obra._id, relatorio._id);
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
<<<<<<< HEAD
                            'Obra': obra.nome || '',
                            'Link (teste - adicionando link com hyperlinks usando o nome da obra)': { 
                                v: `LINK DO ${obra.nome || ''}`, // texto que aparece na célula
                                l: { Target: `https://web.diariodeobra.app/#/app/obras/${obra._id}/relatorios/${relatorio._id}` }},
                            'Link (teste - link direto, facilita na identificação do que já foi clicado)': `https://web.diariodeobra.app/#/app/obras/${obra._id}/relatorios/${relatorio._id}`
=======
                            'Obra': obra.nome || ''
>>>>>>> f7e33eade8739748070ab676dedbe6b382c4ccae
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
            await atualizarStatus('Nenhuma atividade ou mão de obra encontrada para exportar.');
            return;
        }
        await atualizarStatus('Compilando dados e gerando o arquivo .xlsx');
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
<<<<<<< HEAD
        XLSX.writeFile(wb, 'relatorio_geral_atividades_complemento_rdo_@diogosflorencio.xlsx');
        await atualizarStatus('Pronto! Tudo extraído.');
=======
        XLSX.writeFile(wb, 'relatorio_geral_atividades_complemento_rdo_diogosflorencio.xlsx');
        await atualizarStatus('Extração completa gerada. Hmm, acho que é isso');
>>>>>>> f7e33eade8739748070ab676dedbe6b382c4ccae
    } catch (error) {
        await atualizarStatus(`Erro: ${error.message}`);
        console.error('Erro no processamento:', error);
    } finally {
        if (btnExtrair) btnExtrair.disabled = false;
    }
}

window.processarExtracaoDados = processarExtracaoDados;
