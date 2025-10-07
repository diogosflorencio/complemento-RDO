const PDFLib = window.PDFLib; // cria o objeto PDFLib


const rdoEmpresa = JSON.parse(localStorage.getItem('RDOEmpresa'));
const tokenApiExterna = rdoEmpresa.tokenApiExterna;

const API_BASE_URL = "https://apiexterna.diariodeobra.app/v1";

const headers = {
    'token': tokenApiExterna,
    'Content-Type': 'application/json'
};

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
        statusElement.innerHTML = `${mensagem}`;
    }
}

async function fazerRequisicao(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
    }
    return await response.json();
}

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

async function mergePDFs(pdfUrls, statusCallback) {
    const PDFDocument = window.PDFLib.PDFDocument;
    const PdfJuntado = await PDFDocument.create();

    if (pdfUrls.length === 0) {
        throw new Error('Nenhum relatório encontrado no período.');
    }

    // Baixa todos os PDFs em paralelo, para que seja mais rapido. Anteriormente isso era feito de forma sequencial
    // ainda tenho que adicionar isso tbm na extração de dados, assim tudo será mais rapido
    const pdfBuffers = await Promise.all(pdfUrls.map(async (url, index) => {
        statusCallback(`Baixando PDF ${index + 1} de ${pdfUrls.length}`);
        const response = await fetch(url);
        return await response.arrayBuffer();
    }));

    // usando a libs, faço a mesclagem total
    for (let [index, buffer] of pdfBuffers.entries()) {
        statusCallback(`Processando PDF ${index + 1} de ${pdfBuffers.length}`);
        const pdfDoc = await PDFDocument.load(buffer);
        const paginas = await PdfJuntado.copyPages(pdfDoc, pdfDoc.getPageIndices());
        paginas.forEach(pagina => PdfJuntado.addPage(pagina));
    }

    return await PdfJuntado.save();
}

async function obterObrasPorPeriodo() {
    const dataInicioInput = document.getElementById('pdf-data-inicio');
    const dataFimInput = document.getElementById('pdf-data-fim');
    const obrasExcluidasInput = document.getElementById('obras-excluidas');
    const obraEspecificaInput = document.getElementById('obra-especifica');
    if (!dataInicioInput || !dataFimInput) return [];
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
        const obrasSelecionadas = obras.filter(o => idsObrasEspecificas.includes(o._id));
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
        
        // Lista para coletar relatórios não aprovados
        let relatoriosNaoAprovados = [];
        
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
            // Separar por tipo RDO e RSP
            const relatoriosRDO = relatoriosNoPeriodo.filter(r => r.modeloDeRelatorioGlobal && r.modeloDeRelatorioGlobal.descricao && r.modeloDeRelatorioGlobal.descricao.toUpperCase().includes('RDO'));
            const relatoriosRSP = relatoriosNoPeriodo.filter(r => r.modeloDeRelatorioGlobal && r.modeloDeRelatorioGlobal.descricao && r.modeloDeRelatorioGlobal.descricao.toUpperCase().includes('RSP'));
            
            // Obter tipo de extração selecionado
            const tipoExtrair = localStorage.getItem('tipoExtrairPDF') || 'tudo';
            
            // Função para processar cada grupo
            async function processarGrupoRelatorios(relatoriosGrupo, prefixoArquivo) {
                if (!relatoriosGrupo.length) return;
                const pdfUrls = [];
                for (let [index, relatorio] of relatoriosGrupo.entries()) {
                    await atualizarStatus(`Processando relatório ${index + 1}/${relatoriosGrupo.length} <br><b> (${obra.nome.substring(0,33)}) </b>`);
                    const detalhes = await obterDetalhesRelatorio(obra._id, relatorio._id);
                    pdfUrls.push(detalhes.linkPdf);
                }
                if (pdfUrls.length > 0) {
                    await atualizarStatus(`Preparando mesclagem dos PDFs <br><b> (${obra.nome.substring(0,33)}) </b>`, 1);
                    console.log(`Mesclando PDFs (${prefixoArquivo}):`, pdfUrls);
                    const mergedPdfBytes = await mergePDFs(pdfUrls, msg => atualizarStatus(msg));
                    let nomeObra = obra.nome
                        .toUpperCase()
                        .normalize('NFD')
                        .replace(/[^A-Z0-9]+/g, '_')
                        .replace(/_+/g, '_')
                        .replace(/^_|_$/g, '');
                    nomeObra = prefixoArquivo + nomeObra;
                    await atualizarStatus(`Finalizando download <br><b> (${obra.nome.substring(0,33)})</b>`, 1);
                    
                    // Usar download padrão do Chrome
                    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${nomeObra}.pdf`;
                    link.click();
                    console.log('Download concluído:', nomeObra);
                }
            }
            
            // Processa conforme o tipo selecionado
            if (tipoExtrair === 'tudo' || tipoExtrair === 'rdo') {
                await processarGrupoRelatorios(relatoriosRDO, 'RDO_');
            }
            if (tipoExtrair === 'tudo' || tipoExtrair === 'rsp') {
                await processarGrupoRelatorios(relatoriosRSP, 'RSP_');
            }
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
