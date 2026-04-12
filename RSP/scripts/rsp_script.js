let limitador = 0;

// Função para obter nome da obra
function obterNomeObra() {
    const elemento = document.querySelector('td[data-v-9f2cdef4][colspan="3"]').textContent.slice(6);
    return elemento; // descontinuei essa forma externa a proxima função de extrair o nome da obra pq n funciona nunca. agora funciona colocando internamente na função
}

// Função para formatar texto usando a API do Gemini
async function formatarRSPComIA(texto) {
    try {
        const storageData = await chrome.storage.sync.get('geminiApiKey');
        const apiKey = storageData.geminiApiKey;
        if (!apiKey) throw new Error('Chave da API Gemini não encontrada.');

        const nomeObra = document.querySelector('td[data-v-9f2cdef4][colspan="3"]').textContent.slice(6);
        // texto antigo como prompt da formatação via llm:  text: `Organize e liste as informações do texto de forma clara e objetiva. Mescle repetições, separe atividades de ocorrências, inclua datas quando houver ocorrências. Inicie com "Realizado durante o período no ${nomeObra}" e finalize com "conforme relatórios em anexo." Não use asteriscos, negrito ou formatação especial.
        const init = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Organize e liste as informações do texto de forma clara e objetiva. Mescle repetições. Inicie com "Realizado durante o período no ${nomeObra}" e finalize com "Conforme relatórios anexos." Não use asteriscos, negrito ou formatação especial. No fim de cada linha das atapas do realizado, adicione ponto e virgula (;).

TEXTO PARA ORGANIZAR:
${texto}`
                    }]
                }]
            })
        };
        const { text } = await window.llmFetchGenerateContent(apiKey, init);
        return text || null;
    } catch (error) {
        console.error('(Contatar Diogo) Há algum erro. Ou você n tem a key a api ou deu algum erro do tipo:', error);
        return null;
    }
}

// Função para obter token da API
function obterTokenAPI() {
    try {
        const rdoEmpresa = JSON.parse(localStorage.getItem('RDOEmpresa'));
        return rdoEmpresa?.tokenApiExterna;
    } catch (error) {
        console.error('Erro ao obter token da API:', error);
        return null;
    }
}

// Função para identificar obra atual da URL
function identificarObraAtual() {
    const urlAtual = window.location.href;
    const regexObra = /\/obras\/([a-f0-9]{24})\//;
    const matchObra = urlAtual.match(regexObra);
    return matchObra ? matchObra[1] : null;
}

// Função para converter data BR para ISO
function converterDataParaISO(dataBR) {
    if (!dataBR) return null;
    const partes = dataBR.split('/');
    return partes.length === 3 ? `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}` : null;
}

// Função para coletar dados dos relatórios
async function coletarDadosRelatorios(dataInicio, dataFim) {
    try {
        const token = obterTokenAPI();
        if (!token) throw new Error('Token da API não encontrado.');

        const obraId = identificarObraAtual();
        if (!obraId) throw new Error('Não foi possível identificar a obra atual.');

        const dataInicioISO = converterDataParaISO(dataInicio);
        const dataFimISO = converterDataParaISO(dataFim);
        if (!dataInicioISO || !dataFimISO) throw new Error('Formato de data inválido.');

        const response = await fetch(`https://apiexterna.diariodeobra.app/v1/obras/${obraId}/relatorios?dataInicio=${dataInicioISO}&dataFim=${dataFimISO}&limite=100&ordem=asc`, {
            method: 'GET',
            headers: { 'token': token, 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Erro ao buscar relatórios: ${response.status}`);
        const relatorios = await response.json();
        
        const relatoriosRDO = relatorios.filter(rel => (rel.modeloDeRelatorioGlobal?.descricao || '').toLowerCase().includes('rdo'));
        if (relatoriosRDO.length === 0) return { comentarios: [], ocorrencias: [] };

        const todosComentarios = [];
        const todasOcorrencias = [];

        for (const relatorio of relatoriosRDO) {
            try {
                const responseRelatorio = await fetch(`https://apiexterna.diariodeobra.app/v1/obras/${obraId}/relatorios/${relatorio._id}`, {
                    method: 'GET',
                    headers: { 'token': token, 'Content-Type': 'application/json' }
                });

                if (responseRelatorio.ok) {
                    const detalhesRelatorio = await responseRelatorio.json();
                    
                    if (detalhesRelatorio.comentarios) {
                        detalhesRelatorio.comentarios.forEach(comentario => {
                            if (comentario.descricao?.trim()) {
                                todosComentarios.push(comentario.descricao.trim());
                            }
                        });
                    }
                    
                    // if (detalhesRelatorio.ocorrencias) { // Paulo pediu pra não adicionar ocorrencias nos rsps
                    //     detalhesRelatorio.ocorrencias.forEach(ocorrencia => {
                    //         if (ocorrencia.descricao?.trim()) {
                    //             todasOcorrencias.push(`${relatorio.data}:\n${ocorrencia.descricao.trim()}`);
                    //         }
                    //     });
                    // }
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`Erro ao coletar dados do relatório ${relatorio.numero}:`, error);
            }
        }

        return {
            comentarios: [...new Set(todosComentarios)],
            ocorrencias: [...new Set(todasOcorrencias)]
        };
    } catch (error) {
        console.error('Erro ao coletar dados:', error);
        throw error;
    }
}

// add buuuutão
function adicionarBotaoFormatacaoRSP() {
    const textareas = document.querySelectorAll('textarea[name="descrica"].form-control');
    
    textareas.forEach(textarea => {
        if (textarea.parentElement.querySelector('.formatar-rsp')) return;
        
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'formatar-rsp btn btn-primary btn-sm';
        botao.innerHTML = 'Adicionar comentário';
        botao.title = 'Essa função organiza os comentarios dos RDOs no período especificado e formata para o padrão de RSP do TAC. Ela não gera informações, apenas organiza e formata. Qualquer dúvida, me perguntar ou leia todo o codigo no github. (disclaimer necessário)';
        botao.style.cssText = `
            position: absolute; 
            top: 5px; 
            right: 5px; 
            z-index: 999; 
            padding: 6px 12px; 
            font-size: 11px; 
            font-weight: 600;
            background: var(--theme-color, #000000); 
            color: white; 
            border: 2px solid black; 
            border-radius: 6px; 
            box-shadow: 2px 2px rgb(0, 0, 0); 
            cursor: pointer; 
            transition: all 0.2s ease;
            font-family: Arial, sans-serif;
        `;
        
     
        
        botao.onclick = async () => {
            try {
                const dataInicio = document.querySelector('#editarRelatorioDataInicio')?.value;
                const dataFim = document.querySelector('#editarRelatorioDataFim')?.value;
                
                if (!dataInicio || !dataFim) {
                    alert('Esse relatorio não tem data de inicio e fim');
                    return;
                }
                
                botao.disabled = true;
                botao.innerHTML = 'Fazendo o fetch das infos';
                botao.style.opacity = '0.7';
                botao.style.cursor = 'not-allowed';
                
                const dados = await coletarDadosRelatorios(dataInicio, dataFim);
                const todosOsDados = [...dados.comentarios, ...dados.ocorrencias];
                
                if (todosOsDados.length === 0) {
                    textarea.value = `Realizado durante o período no ${obterNomeObra()}.\n\nNenhuma atividade ou ocorrência registrada no período especificado.\n\nConforme relatórios em anexo.`;
                } else {
                    const textoCompleto = todosOsDados.join('\n\n');
                    const textoFormatado = await formatarRSPComIA(textoCompleto);
                    textarea.value = textoFormatado || 'Deu algum erro. Provavelemento os comentarios dos RDOs no perido estão vazios.';
                }
                
                botao.innerHTML = 'pronto';
                botao.style.opacity = '1';
                botao.style.cursor = 'pointer';
                setTimeout(() => {
                    botao.innerHTML = 'RSP';
                    botao.disabled = false;
                }, 1500);
                
            } catch (error) {
                alert('Erro: ' + error.message);
                botao.innerHTML = 'RSP';
                botao.disabled = false;
                botao.style.opacity = '1';
                botao.style.cursor = 'pointer';
            }
        };
        
        textarea.parentElement.style.position = 'relative';
        textarea.parentElement.appendChild(botao);
    });
}

function ajustaAlturaTextarea() {
    const textareas = document.querySelectorAll('textarea[name="descrica"].form-control');
    if (textareas.length > 0) {
        textareas.forEach(textarea => textarea.style.minHeight = '450px');
        adicionarBotaoFormatacaoRSP();
    } else if (limitador < 10) {
        setTimeout(ajustaAlturaTextarea, 1000);
        limitador++;
    }
}

function identificaRelatorioRSP() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    if (titulo?.textContent && titulo.textContent.toLowerCase().includes('rsp')) {
        setTimeout(ajustaAlturaTextarea, 1000);
        return true;
    }
    return false;
}

const observerRelatorioRSP = new MutationObserver(() => {
    identificaRelatorioRSP();
    // Também tenta adicionar botão em qualquer textarea que aparecer
    // adicionarBotaoFormatacaoRSP();
});

observerRelatorioRSP.observe(document.body, { childList: true, subtree: true });