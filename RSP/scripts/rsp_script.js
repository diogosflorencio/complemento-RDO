let limitador = 0;
<<<<<<< HEAD

// Função para obter nome da obra
function obterNomeObra() {
    const elemento = document.querySelector('td[data-v-9f2cdef4][colspan="3"]');
    return elemento?.textContent?.trim() || '[local não identificado]';
}

// Função para formatar texto usando a API do Gemini
async function formatarRSPComIA(texto) {
    try {
        const storageData = await chrome.storage.sync.get('geminiApiKey');
        const apiKey = storageData.geminiApiKey;
        if (!apiKey) throw new Error('Chave da API Gemini não encontrada.');

        const nomeObra = obterNomeObra();
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Organize e liste as informações do texto de forma clara e objetiva. Mescle repetições, separe atividades de ocorrências, inclua datas quando houver ocorrências. Inicie com "Realizado durante o período no ${nomeObra}" e finalize com "conforme relatórios em anexo." Não use asteriscos, negrito ou formatação especial.

TEXTO PARA ORGANIZAR:
${texto}`
                    }]
                }]
            })
        });

        if (!response.ok) throw new Error(`Erro na API: ${response.status}`);
        const responseData = await response.json();
        return responseData.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Erro ao formatar com IA:', error);
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
        
        const relatoriosRDO = relatorios.filter(rel => rel.modeloDeRelatorioGlobal?.descricao === 'Relatório Diário de Obra (RDO)');
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
                    
                    if (detalhesRelatorio.ocorrencias) {
                        detalhesRelatorio.ocorrencias.forEach(ocorrencia => {
                            if (ocorrencia.descricao?.trim()) {
                                todasOcorrencias.push(`${relatorio.data}:\n${ocorrencia.descricao.trim()}`);
                            }
                        });
                    }
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

// Função SIMPLES para adicionar botão
function adicionarBotaoFormatacaoRSP() {
    const textareas = document.querySelectorAll('textarea[name="descrica"].form-control');
    
    textareas.forEach(textarea => {
        if (textarea.parentElement.querySelector('.formatar-rsp')) return;
        
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'formatar-rsp btn btn-primary btn-sm';
        botao.innerHTML = 'RSP';
        botao.style.cssText = 'position: absolute; top: 5px; right: 5px; z-index: 999; padding: 2px 6px; font-size: 11px;';
        
        botao.onclick = async () => {
            try {
                const dataInicio = document.querySelector('#editarRelatorioDataInicio')?.value;
                const dataFim = document.querySelector('#editarRelatorioDataFim')?.value;
                
                if (!dataInicio || !dataFim) {
                    alert('Preencha as datas de início e fim do relatório.');
                    return;
                }
                
                botao.disabled = true;
                botao.innerHTML = '...';
                
                const dados = await coletarDadosRelatorios(dataInicio, dataFim);
                const todosOsDados = [...dados.comentarios, ...dados.ocorrencias];
                
                if (todosOsDados.length === 0) {
                    textarea.value = `Realizado durante o período no ${obterNomeObra()}.\n\nNenhuma atividade ou ocorrência registrada no período especificado.\n\nConforme relatórios em anexo.`;
                } else {
                    const textoCompleto = todosOsDados.join('\n\n');
                    const textoFormatado = await formatarRSPComIA(textoCompleto);
                    textarea.value = textoFormatado || 'Erro ao formatar com IA.';
                }
                
                botao.innerHTML = 'OK';
                setTimeout(() => {
                    botao.innerHTML = 'RSP';
                    botao.disabled = false;
                }, 1500);
                
            } catch (error) {
                alert('Erro: ' + error.message);
                botao.innerHTML = 'RSP';
                botao.disabled = false;
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
    if (titulo?.textContent?.includes('Relatório Semanal de Produção (RSP)')) {
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
=======
function ajustaAlturaTextarea() {
  const textareas = document.querySelectorAll('textarea[name="descrica"].form-control');

  if (textareas.length > 0) {
    textareas.forEach(textarea => {
      textarea.style.minHeight = '450px';

    });
    console.log(`Altura modificada em ${textareas.length} textareas`);
  } else {
    console.log('Textareas não encontrado. Nova tentiva em 1 segundo...');
    if(limitador >= 10){
      return;
    } 
    setTimeout(ajustaAlturaTextarea, 1000);
    limitador++; // limitador para não cair num loop com a função recursiva
  }
} 

function identificaRelatorioRSP() {
  const titulo = document.querySelector('td.rdo-title h5 b');
  if (titulo && titulo.textContent.includes('Relatório Semanal de Produção (RSP)')) {
    setTimeout(ajustaAlturaTextarea, 1000)
    return true;
  } else {
    console.log("n é rsp")
    return false;
  }
}


const observerRelatorioRSP = new MutationObserver(() => {
  identificaRelatorioRSP()
})

observerRelatorioRSP.observe(document.body, { childList: true, subtree: true})
>>>>>>> f7e33eade8739748070ab676dedbe6b382c4ccae
