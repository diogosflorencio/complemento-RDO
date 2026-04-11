const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .formatar.loading i {
        animation: spin 1s linear infinite;
        animation-direction: reverse;
    }
    
    @keyframes spin {
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

async function identificaRelatorio() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    const detalhesRelatorio = document.querySelector(".card-header h4");
    

    if (titulo && (titulo.textContent || '').toLowerCase().includes('rdo') && detalhesRelatorio) {
        const available = await isServerAvailable();
        if (!available) {
            console.log('Servidor indisponível - funcionalidades de relatório não executadas');
            return false;
        }

        observerRelatorio.disconnect();

        adicionarBotoesFormatacao();
        adicionarBotaoHoraPadrao();
        adicionarBotoesEquipamentos();
        adicionarBotaoRevisaoGeral();

        observerRelatorio.observe(document.body, { childList: true, subtree: true });
        return true;
    }
    return false;
}

/** Garante uma quebra de linha após cada `;` (lista de atividades no RDO). */
function quebrarLinhasAtividadesPorPontoVirgula(texto) {
    if (!texto || typeof texto !== 'string') return texto;
    return texto.replace(/;(?!\s*\n)/g, ';\n').replace(/\n{3,}/g, '\n\n');
}

async function formatarTextoComIA(texto, tipoSecao = 'comentario') {
    let apiKey = '';
    try {
        const data = await chrome.storage.sync.get('geminiApiKey');
        apiKey = typeof data.geminiApiKey === 'string' ? data.geminiApiKey.trim() : '';

        if (typeof window.llmFetchGenerateContent !== 'function') {
            throw new Error(
                'Módulo de formatação não carregou (llmFetchGenerateContent). Recarregue a página do Diário de Obra com a extensão ativa.'
            );
        }

        if (!apiKey) {
            throw new Error('KEY_SYNC_VAZIA');
        }

        const contextoPrimeiraLinha =
            tipoSecao === 'atividade'
                ? 'Este trecho é do quadro de ATIVIDADES do dia.'
                : 'Este trecho é de COMENTÁRIO ou de OCORRÊNCIA (não é o quadro de atividades do dia).';

        const orientacaoAtividadesLista =
            tipoSecao === 'atividade'
                ? '\n- Nas listas de atividades terminadas em ponto e vírgula (;), use uma quebra de linha após cada ; (cada atividade numa linha). A última linha pode terminar em ponto (.) em vez de ;.\n'
                : '';

        const prompt = `
Você é um formatador profissional de textos de Relatório Diário de Obra (RDO) de pintura industrial. ${contextoPrimeiraLinha} Mantenha TODAS as informações originais; melhore clareza, tom profissional e corrija gramática e ortografia sem alterar o sentido técnico.

INSTRUÇÃO PRIORITÁRIA: Se houver texto entre duplos parênteses ((instrução)) no conteúdo, execute essa instrução específica e ignore todas as outras regras.

CONTEXTO: Serviços de pintura industrial e manutenção. Corrija termos mal escritos (ex: "trapiamento" → "trapeamento").

ORIENTAÇÕES:
- Mantenha o texto fiel ao original, com redação mais profissional e correta
- Corrija erros de digitação, concordância e pontuação
- Preserve especificações técnicas, códigos e normas (ex: "SA1-SA2½" exatamente assim)
- Se houver lista de pessoas relevante, pode organizar os nomes separados por vírgula (ex.: Diogo, Pedro e João) quando couber no contexto
- Não use * ou -. Não invente fatos. Retorne só o conteúdo pedido, sem prefácio do tipo "Aqui está…"
- Não esqueça do ponto final quando fizer sentido${orientacaoAtividadesLista}

EXEMPLO:
Texto: "Foi identificado um problema na aplicação da tinta. Necessario fazer retrabalho."
Resultado:
"Foi identificado um problema na aplicação da tinta. Necessário fazer retrabalho."

TEXTO PARA FORMATAR:
${texto}

Formate de modo profissional, preservando o conteúdo técnico.`;

        const init = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        };
        const { json: responseData, text: saidaDireta } = await window.llmFetchGenerateContent(apiKey, init);
        console.log('Resposta da API (formatação):', responseData);
        const saida =
            typeof saidaDireta === 'string' && saidaDireta.trim()
                ? saidaDireta.trim()
                : null;
        if (!saida) {
            const detalhe =
                (responseData && responseData.error && responseData.error.message) ||
                (responseData && responseData.promptFeedback && JSON.stringify(responseData.promptFeedback)) ||
                'A API respondeu sem texto utilizável (ex.: bloqueio de segurança ou resposta vazia).';
            throw new Error(detalhe);
        }
        return tipoSecao === 'atividade' ? quebrarLinhasAtividadesPorPontoVirgula(saida) : saida;
    } catch (erro) {
        const msg = erro && erro.message ? String(erro.message) : String(erro);
        const moduloNaoCarregou = /llmFetchGenerateContent|Módulo de formatação não carregou/i.test(msg);
        const chaveAusente =
            msg === 'KEY_SYNC_VAZIA' || /key não encontrada|api key ausente/i.test(msg);
        console.error('Erro na formatação:', erro, { chavePreenchida: Boolean(apiKey && String(apiKey).trim()) });

        if (moduloNaoCarregou) {
            alert(
                'O script de formatação não carregou nesta página.\n\nRecarregue o Diário de Obra (F5). Se persistir, em chrome://extensions confira se o Complemento RDO está ativo e atualizado.'
            );
        } else if (chaveAusente) {
            alert(
                'Chave de API não encontrada ou vazia na extensão.\n\nAbra o pop-up do Complemento RDO, cole a chave no campo da API, altere o foco (Tab/clique fora) para gravar no Chrome, e tente de novo.'
            );
        } else {
            alert(
                `Erro ao formatar texto:\n\n${msg.slice(0, 500)}${msg.length > 500 ? '…' : ''}\n\nConfira quota/modelo da API e o consola (F12) para mais detalhe.`
            );
        }
        return texto;
    }
}

async function atualizarComentario(elementoOriginal, textoFormatado) {
    const btnEditar = elementoOriginal.closest('tr').querySelector('[data-target="#modalComentariosForm"]');
    btnEditar.click();

    await new Promise(resolve => setTimeout(resolve, 200));

    const modal = document.querySelector('#modalComentariosForm');
    const form = modal.querySelector('form');
    const textarea = form.querySelector('textarea[name="descrica"]');
    const btnSalvar = form.querySelector('button[type="submit"]');

    textarea.value = textoFormatado;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });
    form.dispatchEvent(submitEvent);

    await new Promise(resolve => setTimeout(resolve, 500));

    const btnFechar = modal.querySelector('[data-dismiss="modal"]');
    btnFechar.click();
}

async function atualizarOcorrencia(elementoOriginal, textoFormatado) {
    const btnEditar = elementoOriginal.closest('tr').querySelector('[data-target="#modalOcorrenciaForm"]');
    btnEditar.click();

    await new Promise(resolve => setTimeout(resolve, 200));

    const modal = document.querySelector('#modalOcorrenciaForm');
    const form = modal.querySelector('form');
    const textarea = form.querySelector('textarea[name="descrica"]');
    const btnSalvar = form.querySelector('button[type="submit"]');

    textarea.value = textoFormatado;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });
    form.dispatchEvent(submitEvent);

    await new Promise(resolve => setTimeout(resolve, 500));

    const btnFechar = modal.querySelector('[data-dismiss="modal"]');
    btnFechar.click();
}

async function atualizarAtividade(elementoOriginal, textoFormatado) {
    const tr = elementoOriginal.closest('tr');
    const btnEditar = tr.querySelector('[data-target^="#modalAtividades"]');
    if (!btnEditar) {
        throw new Error('Botão de edição de atividades não encontrado na linha.');
    }
    const alvoModal = btnEditar.getAttribute('data-target');
    btnEditar.click();

    await new Promise(resolve => setTimeout(resolve, 200));

    const modal = document.querySelector(alvoModal);
    if (!modal) {
        throw new Error(`Modal de atividades não encontrado: ${alvoModal}`);
    }
    const form = modal.querySelector('form');
    const textarea = form.querySelector('textarea[name="descrica"]');
    if (!textarea) {
        throw new Error('Campo de descrição (textarea) não encontrado no modal de atividades.');
    }

    textarea.value = textoFormatado;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });
    form.dispatchEvent(submitEvent);

    await new Promise(resolve => setTimeout(resolve, 500));

    const btnFechar = modal.querySelector('[data-dismiss="modal"]');
    if (btnFechar) btnFechar.click();
}

/** Texto guardado antes de formatar, por linha da tabela (o <p> pode ser recriado pelo Vue após gravar). */
const textosOriginais = new Map();

function tituloBotaoFormatarPorTipo(tipoSecao) {
    switch (tipoSecao) {
        case 'atividade':
            return 'Formatar atividades: redação profissional, corrige gramática e ortografia, mantém o técnico. Texto entre (( )) manda nas regras.';
        case 'ocorrencia':
            return 'Formatar ocorrência: redação profissional, corrige gramática e ortografia, mantém o técnico. Texto entre (( )) manda nas regras.';
        default:
            return 'Formatar comentário: redação profissional, corrige gramática e ortografia, mantém o técnico. Texto entre (( )) manda nas regras.';
    }
}

/**
 * Parágrafo visível com o texto do relatório (comentário / ocorrência / atividade).
 * Em atividades há vários `p.white-space` (etapa, descrição, observação); o primeiro match
 * de querySelector era o de etapa, muitas vezes vazio — a API recebia texto errado.
 */
function paragrafoTextoRelatorioNaLinha(linha) {
    if (!linha) return null;
    const principal = linha.querySelector('p.white-space:not(.sub-titulo-etapa):not(.observacao)');
    if (principal) return principal;
    const todos = linha.querySelectorAll('p.white-space');
    if (!todos.length) return null;
    let melhor = todos[0];
    let max = (melhor.textContent || '').trim().length;
    for (let i = 1; i < todos.length; i++) {
        const len = (todos[i].textContent || '').trim().length;
        if (len > max) {
            melhor = todos[i];
            max = len;
        }
    }
    return melhor;
}

function adicionarBotoesFormatacao() {
    const linhasTabela = document.querySelectorAll(
        '#rdo-ocorrencias table.table-data.table-hover tbody tr, ' +
            '#rdo-comentario table.table-data.table-hover tbody tr, ' +
            '#rdo-atividades table.table-data.table-hover tbody tr, ' +
            '#rdo-atividade table.table-data.table-hover tbody tr'
    );

    linhasTabela.forEach(linha => {
        if (linha.querySelector('.formatar')) return;
        if (!paragrafoTextoRelatorioNaLinha(linha)) return;

        const containerBotoes = document.createElement('div');
        containerBotoes.style.cssText = `
            position: absolute;
            left: -60px;
            height: 100%;
            display: flex;
            align-items: center;
            gap: 5px;
        `;


        const tipoLinha = verificarTipoSecao(linha);

        const botaoFormatar = document.createElement('a');
        botaoFormatar.href = '#';
        botaoFormatar.title = tituloBotaoFormatarPorTipo(tipoLinha);
        botaoFormatar.className = 'formatar';

        const iconeFormatar = document.createElement('i');
        iconeFormatar.className = 'material-icons';
        iconeFormatar.textContent = 'autorenew';
        botaoFormatar.appendChild(iconeFormatar);

        const botaoRestaurar = document.createElement('a');
        botaoRestaurar.href = '#';
        botaoRestaurar.title = 'Restaurar anterior (restaura a formatação imediatamente anterior a esta)';
        botaoRestaurar.className = 'restaurar-formato';
        botaoRestaurar.style.cssText = `
        color: var(--theme-color)`;
        botaoRestaurar.style.display = 'none';

        const iconeRestaurar = document.createElement('i');
        iconeRestaurar.className = 'material-icons';
        iconeRestaurar.textContent = 'restore';
        botaoRestaurar.appendChild(iconeRestaurar);

        containerBotoes.appendChild(botaoFormatar);
        containerBotoes.appendChild(botaoRestaurar);
        linha.style.position = 'relative';
        linha.appendChild(containerBotoes);
        botaoFormatar.style.cssText = `
            color: var(--theme-color);
        `;

        botaoFormatar.addEventListener('click', async (e) => {
            e.preventDefault();

            botaoFormatar.classList.add('loading');
            iconeFormatar.textContent = 'sync';

            const conteudoOriginal = paragrafoTextoRelatorioNaLinha(linha);
            if (!conteudoOriginal) {
                botaoFormatar.classList.remove('loading');
                iconeFormatar.textContent = 'autorenew';
                return;
            }
            textosOriginais.set(linha, conteudoOriginal.textContent);

            const tipoSecao = verificarTipoSecao(linha);
            const textoFormatado = await formatarTextoComIA(conteudoOriginal.textContent, tipoSecao);

            if (textoFormatado && textoFormatado !== conteudoOriginal.textContent) {
                if (tipoSecao === 'ocorrencia') {
                    await atualizarOcorrencia(conteudoOriginal, textoFormatado);
                } else if (tipoSecao === 'atividade') {
                    await atualizarAtividade(conteudoOriginal, textoFormatado);
                } else {
                    await atualizarComentario(conteudoOriginal, textoFormatado);
                }
                botaoRestaurar.style.display = 'block';
            }

            botaoFormatar.classList.remove('loading');
            iconeFormatar.textContent = 'autorenew';
        });

        botaoRestaurar.addEventListener('click', async (e) => {
            e.preventDefault();

            botaoRestaurar.classList.add('loading');
            iconeRestaurar.textContent = 'sync';

            const conteudoOriginal = paragrafoTextoRelatorioNaLinha(linha);
            const textoOriginal = textosOriginais.get(linha);

            if (textoOriginal && conteudoOriginal) {
                const tipoSecao = verificarTipoSecao(linha);
                if (tipoSecao === 'ocorrencia') {
                    await atualizarOcorrencia(conteudoOriginal, textoOriginal);
                } else if (tipoSecao === 'atividade') {
                    await atualizarAtividade(conteudoOriginal, textoOriginal);
                } else {
                    await atualizarComentario(conteudoOriginal, textoOriginal);
                }
                botaoRestaurar.style.display = 'none';
                textosOriginais.delete(linha);
            }

            botaoRestaurar.classList.remove('loading');
            iconeRestaurar.textContent = 'restore';
        });
    });
}

function adicionarBotaoHoraPadrao() {
    const divHoraPadrao = document.querySelector('div[data-v-7997c890].card-header');
    
    if (divHoraPadrao && !divHoraPadrao.querySelector('.hora-padrao')) {
        // Cria o botão de hora padrão
        const botaoHoraPadrao = document.createElement('button');
        botaoHoraPadrao.type = 'button';
        botaoHoraPadrao.className = 'btn btn-primary btn-sm hora-padrao';
        botaoHoraPadrao.style.cssText = `
            margin-top: 4px; 
            padding: 2px 8px; 
            border-radius: 8px; 
            background: var(--theme-color); 
            color: #fff; 
            border: 2px solid black; 
            box-shadow: 2px 2px #000; 
            cursor: pointer; 
            font-size: 11px;
            line-height: 1.2;
            text-align: center;
            margin: 4px 10px;
        `;

         
        botaoHoraPadrao.innerHTML = '<b>Hora Padrão</b><br><small>06:30 16:18 10:45 11:45</small>';

        function simularDigitacao(elemento, valor) {
            if (!elemento) return;

            elemento.focus();
            elemento.value = '';

            for (let i = 0; i < valor.length; i++) {
                setTimeout(() => {
                    elemento.value = valor.substring(0, i + 1);
                    
                    elemento.dispatchEvent(new KeyboardEvent('keydown', { 
                        key: valor[i], 
                        bubbles: true 
                    }));
                    elemento.dispatchEvent(new Event('input', { bubbles: true }));
                    elemento.dispatchEvent(new KeyboardEvent('keyup', { 
                        key: valor[i], 
                        bubbles: true 
                    }));

                    if (i === valor.length - 1) {
                        setTimeout(() => {
                            elemento.dispatchEvent(new Event('change', { bubbles: true }));
                            elemento.blur();
                        }, 50);
                    }
                }, i * 100);
            }
        }

        botaoHoraPadrao.addEventListener('click', () => {
            const entrada = document.querySelector('input[name="expedienteInicio"]');
            const saida = document.querySelector('input[name="expedienteFim"]');
            const intervaloEntrada = document.querySelector('input[name="intervaloInicio"]');
            const intervaloSaida = document.querySelector('input[name="intervaloFim"]');

            const campos = [
                { elemento: entrada, valor: '06:30' },
                { elemento: saida, valor: '16:18' },
                { elemento: intervaloEntrada, valor: '10:45' },
                { elemento: intervaloSaida, valor: '11:45' }
            ];

            campos.forEach((campo, index) => {
                if (campo.elemento) {
                    setTimeout(() => {
                        simularDigitacao(campo.elemento, campo.valor);
                    }, index * 500);
                }
            });
        });

        divHoraPadrao.appendChild(botaoHoraPadrao);
    }
}

function adicionarBotoesEquipamentos() {
    const listaEquipamentos = document.querySelector('div[data-v-3ac1f292].lista ul');
    
    if (listaEquipamentos) {
        const itensEquipamentos = listaEquipamentos.querySelectorAll('li');
        
        itensEquipamentos.forEach(item => {
            if (item.querySelector('.adicionar-equipamento')) return;
            
            const descricaoElement = item.querySelector('.descricao p');
            const nomeEquipamento = descricaoElement ? descricaoElement.textContent.trim() : '';
            
            const botaoAdicionar = document.createElement('button');
            botaoAdicionar.type = 'button';
            botaoAdicionar.className = 'btn btn-success btn-sm adicionar-equipamento';
            botaoAdicionar.style.cssText = `
            padding: 0 2px;
            margin-left: 3px;
            height: 24px; 
            background: var(--theme-color); 
            color: #fff; 
            border: 2px solid black; 
            box-shadow: 2px 2px #000; 
            cursor: pointer; 
            font-size: 11px;
            line-height: 1.2;
            text-align: center;
            `;
            botaoAdicionar.textContent = 'ADD';
            botaoAdicionar.title = `Adicionar "${nomeEquipamento}" como atividade`;
            
       
            
            async function adicionarEquipamentoComoAtividade() {
                try {
                    const btnAdicionarAtividade = document.querySelector('[data-target="#modalAtividadesAvulsaForm"]');
                    if (!btnAdicionarAtividade) return;
                    
                    btnAdicionarAtividade.click();
                    
                
                    await new Promise(resolve => setTimeout(resolve, 250));
                    
                    // Preenche apenas a descrição
                    const form = document.querySelector('#modalAtividadesAvulsaForm form');
                    const descricao = form.querySelector('textarea[name="descrica"]');
                    
                    if (descricao) {
                        descricao.value = nomeEquipamento;
                        descricao.dispatchEvent(new Event('input', { bubbles: true }));
                        descricao.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    // Marca o checkbox para mostrar mais opções
                    const checkboxProducao = form.querySelector('#producao');
                    if (checkboxProducao && !checkboxProducao.checked) {
                        checkboxProducao.click();
                    }
                    
                    // Aguarda os campos aparecerem
                    setTimeout(() => {
                        // Preenche quantidade e unidade
                        const quantidade = form.querySelector('input[name="realizada"]');
                        const unidade = form.querySelector('input[name="unidade"]');
                        
                        if (quantidade) {
                            quantidade.value = '1';
                            quantidade.dispatchEvent(new Event('input', { bubbles: true }));
                            quantidade.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        
                        if (unidade) {
                            unidade.value = 'und';
                            unidade.dispatchEvent(new Event('input', { bubbles: true }));
                            unidade.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        
                        // Define status como "Em andamento"
                        const status = form.querySelector('select[name="status"]');
                        if (status) {
                            // Procura pela opção "Em andamento"
                            for (let i = 0; i < status.options.length; i++) {
                                if (status.options[i].textContent.includes('')) {
                                    status.selectedIndex = i;
                                    break;
                                }
                            }
                            status.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        
                        // Salva automaticamente
                        const btnSalvar = form.querySelector('.btn-success');
                        if (btnSalvar) {
                            btnSalvar.click();
                        }
                        
                    }, 50);
                    
                } catch (error) {
                    console.error('Erro ao adicionar equipamento:', error);
                }
            }
            
            botaoAdicionar.addEventListener('click', adicionarEquipamentoComoAtividade);
            
            const divAcao = item.querySelector('.acao');
            if (divAcao) {
                divAcao.appendChild(botaoAdicionar);
            }
        });
    }
}

// function adicionarBotaoRevisaoGeral() {
//     const divRevisaoGeral = document.querySelector('div[data-v-8de8991a] .row');
    
//     if (divRevisaoGeral && !divRevisaoGeral.querySelector('.revisao-geral')) {
//         const botaoRevisaoGeral = document.createElement('button');
//         botaoRevisaoGeral.type = 'button';
//         botaoRevisaoGeral.className = 'btn btn-success btn-sm revisao-geral';
//         botaoRevisaoGeral.style.cssText = `
//             margin-top: 4px; 
//             padding: 2px 8px; 
//             border-radius: 8px; 
//             background: var(--theme-color); 
//             color: #fff; 
//             border: 2px solid black; 
//             box-shadow: 2px 2px #000; 
//             cursor: pointer; 
//             font-size: 11px;
//             line-height: 1.2;
//             text-align: center;
//             margin: 4px 10px;
//         `;

//         botaoRevisaoGeral.innerHTML = '<b>Revisão Geral</b><br><small>Automática</small>';

//         function isRelatorioHH() {
//             const titulo = document.querySelector('td.rdo-title h5 b');
//             const nomeObra = document.querySelector('tr td[colspan="3"]')?.textContent || '';
//             return titulo && (titulo.textContent || '').toLowerCase().includes('rdo') && nomeObra.includes('HH');

//         }

//         async function adicionarEquipamentosEspecificos(isHH) {
//             const listaEquipamentos = document.querySelector('div[data-v-3ac1f292].lista ul');
//             if (listaEquipamentos && isHH) {
//                 const itensEquipamentos = listaEquipamentos.querySelectorAll('li');
//                 let adicionados = 0;
                
//                 for (const item of itensEquipamentos) {
//                     const textoEquipamento = item.textContent.toLowerCase();
//                     if (textoEquipamento.includes('compressor') || textoEquipamento.includes('pta')) {
//                         const botaoAdicionar = item.querySelector('.adicionar-equipamento');
//                         botaoAdicionar.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                         if (botaoAdicionar) {
//                             botaoAdicionar.click();
//                             adicionados++;
//                             await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 500ms entre cada adição
//                         }
//                     }
//                 }
                
//                 console.log(`Adicionados ${adicionados} equipamentos específicos`);
//                 return adicionados;
//             }else if (listaEquipamentos && !isHH) {
//                 const itensEquipamentos = listaEquipamentos.querySelectorAll('li');
//                 let adicionados = 0;
                
//                 for (const item of itensEquipamentos) {
//                     const textoEquipamento = item.textContent.toLowerCase();
//                     if (textoEquipamento.includes('pta')) {
//                         const botaoAdicionar = item.querySelector('.adicionar-equipamento');
//                         botaoAdicionar.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                         if (botaoAdicionar) {
//                             botaoAdicionar.click();
//                             adicionados++;
//                             await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 500ms entre cada adição
//                         }
//                     }
//                 }
                
//                 console.log(`Adicionados ${adicionados} equipamentos específicos`);
//                 return adicionados;
//             } 
//             return 0;
//         }

//         // Função para formatar comentários e ocorrências
//         async function formatarComentariosEOcorrencias() {
//             const linhasTabela = document.querySelectorAll('table.table-data.table-hover tbody tr');
//             let formatados = 0;
            
//             for (const linha of linhasTabela) {
//                 const botaoFormatar = linha.querySelector('.formatar');
//                 if (botaoFormatar) {
//                     // Scroll para a linha
//                     linha.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                     await new Promise(resolve => setTimeout(resolve, 600));
                    
//                     // Clica no botão de formatação
//                     botaoFormatar.click();
//                     formatados++;
                    
//                     // Aguarda a formatação
//                     await new Promise(resolve => setTimeout(resolve, 15000));
//                 }
//             }
            
//             console.log(`Formatados ${formatados} comentários/ocorrências`);
//             return formatados;
//         }

//         // Função para adicionar horas do card HH linha a linha
//         async function adicionarHorasHH() {
//             const cardHH = document.querySelector('.conteiner_hora_linhaalinha');
//             if (cardHH) {
//                 // Procura pelo botão que contém "Adicionar todos"
//                 const botoes = cardHH.querySelectorAll('button');
//                 const botaoAdicionarTodos = Array.from(botoes).find(btn => 
//                     btn.textContent.includes('Adicionar todos')
//                 );
                
//                 if (botaoAdicionarTodos) {
//                     // Scroll para o card
//                     cardHH.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                     await new Promise(resolve => setTimeout(resolve, 300));
                    
//                     botaoAdicionarTodos.click();
//                     console.log('Horas HH adicionadas automaticamente');
//                     return true;
//                 }
//             }
//             return false;
//         }

//         // Função para adicionar horas no card de análise
//         async function adicionarHorasAnalise() {
//             const botaoAdicionar = document.querySelector('#botaoAdicionar');
//             if (botaoAdicionar) {
//                 // Scroll para o botão
//                 botaoAdicionar.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                 await new Promise(resolve => setTimeout(resolve, 300));
                
//                 botaoAdicionar.click();
//                 console.log('Horas de análise adicionadas automaticamente');
//                 return true;
//             }
//             return false;
//         }

//         // Função principal de revisão
//         async function executarRevisaoGeral() {
//             try {
//                 botaoRevisaoGeral.disabled = true;
//                 botaoRevisaoGeral.innerHTML = '<b>Executando</b><br><small>Revisão em andamento</small>';
                
//                 const isHH = isRelatorioHH();
//                 console.log(`iniciando revisão geral - relatório (esse é hh) ${isHH}`);
                
               
//                 console.log('aplicando hora de acordo com o ponto (se o ponto n tiver, vai pular esse tbm)');
//                 const botaoHoraPadrao = document.querySelector('.hora-padrao');
//                 if (botaoHoraPadrao) {
//                     botaoHoraPadrao.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                     await new Promise(resolve => setTimeout(resolve, 300));
//                     botaoHoraPadrao.click();
//                     await new Promise(resolve => setTimeout(resolve, 3000));
//                 }
                
               
//                 console.log('add equipamentos');
//                 await adicionarEquipamentosEspecificos(isHH);
//                 await new Promise(resolve => setTimeout(resolve, 1000));
                
                
//                 console.log('formatando hora, se a bearer key n tiver, vai pular esse');
//                 await formatarComentariosEOcorrencias();
//                 await new Promise(resolve => setTimeout(resolve, 1000));
                
                
//                 if (isHH) {
//                     console.log('adicionando horas HH');
//                     await adicionarHorasHH();
//                     await new Promise(resolve => setTimeout(resolve, 1000));
                    
//                     console.log('adicionando h/f');
//                     await adicionarHorasAnalise();
//                     await new Promise(resolve => setTimeout(resolve, 1000));
//                 }
                
                
//                 if (!isHH) {
//                     console.log('salvando relatório antes da aprovação...');
//                     const botaoSalvar = document.querySelector('button.btn.btn-success.btn-icon.animation');
//                     if (botaoSalvar) {
//                         botaoSalvar.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                         await new Promise(resolve => setTimeout(resolve, 300));
//                         botaoSalvar.click();
//                         console.log('Relatório salvo automaticamente');
//                         await new Promise(resolve => setTimeout(resolve, 1000));
//                     }
//                 }
                
                
//                 console.log('iniciando aprovação')
//                 await aprovarRelatorioAutomatico();
                
//                 console.log('revisão geral concluida');
//                 botaoRevisaoGeral.innerHTML = '<b>Concluído!</b><br><small>Revisão finalizada</small>';
                
                
//                 setTimeout(() => {
//                     botaoRevisaoGeral.disabled = false;
//                     botaoRevisaoGeral.innerHTML = '<b>Revisão Geral</b><br><small>Automática</small>';
//                 }, 3000);
                
//             } catch (error) {
//                 console.error('Erro durante a revisão geral:', error);
//                 botaoRevisaoGeral.innerHTML = '<b>Erro!</b><br><small>Tente novamente</small>';
//                 botaoRevisaoGeral.disabled = false;
                
                
//                 setTimeout(() => {
//                     botaoRevisaoGeral.innerHTML = '<b>Revisão Geral</b><br><small>Automática</small>';
//                 }, 3000);
//             }
//         }

//         async function aprovarRelatorioAutomatico() {
//             try {
//                 const radioRevisar = document.querySelector('input[name="status-rdo"][id="status-revisar"]');
//                 if (radioRevisar) {
//                     radioRevisar.click();
//                     await new Promise(resolve => setTimeout(resolve, 500));
//                 } else {
//                     return;
//                 }
                
//                 const botoesAprovar = document.querySelectorAll('button.btn.btn-success.btn-icon.animation');
//                 let botaoAprovarEncontrado = null;
                
//                 for (const botao of botoesAprovar) {
//                     const icone = botao.querySelector('i.material-icons');
//                     if (icone && icone.textContent === 'done_all') {
//                         botaoAprovarEncontrado = botao;
//                         break;
//                     }
//                 }
                
//                 if (botaoAprovarEncontrado) {
//                     botaoAprovarEncontrado.click();
//                     await new Promise(resolve => setTimeout(resolve, 500));
                    
//                     const linkAprovar = document.querySelector('a.aprovar');
//                     if (linkAprovar) {
//                         linkAprovar.click();
//                         await new Promise(resolve => setTimeout(resolve, 500));
                        
//                         const confirmacaoFinal = document.querySelector('a.aprovar');
//                         if (confirmacaoFinal) {
//                             confirmacaoFinal.click();
//                         }
//                     }
//                 }
                
//             } catch (error) {
//                 console.error('Erro durante a aprovação automática:', error);
//             }
//         }

//         // Evento de clique do botão
//         botaoRevisaoGeral.addEventListener('click', executarRevisaoGeral);

//         // Adiciona o botão à div
//         divRevisaoGeral.appendChild(botaoRevisaoGeral);
//     }
// }

// Função para verificar se o TR está em comentários ou ocorrências

function adicionarBotaoRevisaoGeral() {
    const divRevisaoGeral = document.querySelector('div[data-v-8de8991a] .row');
    
    if (divRevisaoGeral && !divRevisaoGeral.querySelector('.revisao-geral')) {
        // Container principal do botão
        const containerBotao = document.createElement('div');
        containerBotao.style.cssText = `
           display: flex; 
           gap: 10px;
           align-items: center;
        `;

        const botaoRevisaoGeral = document.createElement('button');
        botaoRevisaoGeral.type = 'button';
        botaoRevisaoGeral.className = 'btn btn-success btn-sm revisao-geral';
        botaoRevisaoGeral.style.cssText = `
            margin-top: 4px; 
            padding: 2px 8px; 
            border-radius: 8px; 
            background: var(--theme-color); 
            color: #fff; 
            border: 2px solid black; 
            box-shadow: 2px 2px #000; 
            cursor: pointer; 
            font-size: 11px;
            line-height: 1.2;
            text-align: center;
            margin-bottom: 5px;
        `;

        botaoRevisaoGeral.innerHTML = '<b>Revisão Geral</b><br><small>Automática</small>';

        // Checkbox para aprovar ou não
        const containerCheckbox = document.createElement('div');
        containerCheckbox.style.cssText = `
            padding: 4px 8px; 
            border-radius: 8px; 
            background: var(--theme-color); 
            color: #fff; 
            border: 2px solid black; 
            box-shadow: 2px 2px #000; 
            cursor: pointer; 
            font-size: 11px;
            line-height: 1.2;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            min-height: 35px;
        `;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'aprovar-relatorio';
        checkbox.checked = localStorage.getItem('aprovarRelatorio') !== 'false'; // Padrão: marcado
        checkbox.style.cssText = `
            margin: 0;
            width: 16px;
            height: 16px;
            cursor: pointer;
        `;

        const label = document.createElement('label');
        label.htmlFor = 'aprovar-relatorio';
        label.textContent = 'Aprovar';
        label.style.cssText = `
            cursor: pointer;
            user-select: none;
            margin: 0;
        `;

        // Salvar preferência do checkbox
        checkbox.addEventListener('change', function() {
            localStorage.setItem('aprovarRelatorio', this.checked);
            console.log(`Preferência salva: ${this.checked ? 'Aprovar' : 'Não aprovar'} relatório`);
        });

        containerCheckbox.appendChild(checkbox);
        containerCheckbox.appendChild(label);
        containerBotao.appendChild(botaoRevisaoGeral);
        containerBotao.appendChild(containerCheckbox);

        function isRelatorioHH() {
            const titulo = document.querySelector('td.rdo-title h5 b');
            const nomeObra = document.querySelector('tr td[colspan="3"]')?.textContent || '';
            return titulo && (titulo.textContent || '').toLowerCase().includes('rdo') && nomeObra.includes('HH');
        }

        async function adicionarEquipamentosEspecificos(isHH) {
            const listaEquipamentos = document.querySelector('div[data-v-3ac1f292].lista ul');
            if (listaEquipamentos && isHH) {
                const itensEquipamentos = listaEquipamentos.querySelectorAll('li');
                let adicionados = 0;
                
                for (const item of itensEquipamentos) {
                    const textoEquipamento = item.textContent.toLowerCase();
                    if (textoEquipamento.includes('compressor') || textoEquipamento.includes('pta')) {
                        const botaoAdicionar = item.querySelector('.adicionar-equipamento');
                        botaoAdicionar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (botaoAdicionar) {
                            botaoAdicionar.click();
                            adicionados++;
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                }
                
                console.log(`Adicionados ${adicionados} equipamentos específicos`);
                return adicionados;
            } else if (listaEquipamentos && !isHH) {
                const itensEquipamentos = listaEquipamentos.querySelectorAll('li');
                let adicionados = 0;
                
                for (const item of itensEquipamentos) {
                    const textoEquipamento = item.textContent.toLowerCase();
                    if (textoEquipamento.includes('pta')) {
                        const botaoAdicionar = item.querySelector('.adicionar-equipamento');
                        botaoAdicionar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        if (botaoAdicionar) {
                            botaoAdicionar.click();
                            adicionados++;
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                }
                
                console.log(`Adicionados ${adicionados} equipamentos específicos`);
                return adicionados;
            } 
            return 0;
        }

        // Função para aguardar a resposta da API do Gemini monitorando o console
        async function aguardarRespostaGemini() {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.log('aguardando até 30 segundos para resposta da api');
                    resolve(false);
                }, 30000); // 30 segundos timeout
                
                // Intercepta logs do console para detectar a resposta do Gemini
                const originalLog = console.log;
                console.log = function(...args) {
                    originalLog.apply(console, args);
                    
                    // Verifica se é a mensagem de resposta da API Gemini
                    if (args[0] && args[0].includes && args[0].includes('Resposta da API (formatação):')) {
                        console.log = originalLog; // Restaura console.log original
                        clearTimeout(timeout);
                        resolve(true);
                    }
                };
            });
        }

        // Função para formatar comentários e ocorrências com espera inteligente
        async function formatarComentariosEOcorrencias() {
            const linhasTabela = document.querySelectorAll('table.table-data.table-hover tbody tr');
            let formatados = 0;
            
            for (const linha of linhasTabela) {
                const botaoFormatar = linha.querySelector('.formatar');
                if (botaoFormatar) {
                    console.log(`formantando linha ${formatados + 1} de ${linhasTabela.length}`);
                    
                    // Scroll para a linha
                    linha.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await new Promise(resolve => setTimeout(resolve, 600));
                    
                    // Clica no botão de formatação
                    botaoFormatar.click();
                    formatados++;
                    
                    // Aguarda a resposta do Gemini antes de prosseguir
                    console.log(`aguardando resposta da requisão http para autoformataçãp ${formatados}...`);
                    await aguardarRespostaGemini();
                    
                    // Pequena pausa antes da próxima linha
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            console.log(`Formatados ${formatados} comentários/ocorrências`);
            return formatados;
        }

        // Conta itens genéricos dentro de um container (linhas, listas, etc.)
        function contarItensNoContainer(container) {
            if (!container) return 0;

            console.log('contarItensNoContainer - container recebido:', container);
            console.log('contarItensNoContainer - classes do container:', container.className);

            // Caso específico: Análise H/F -> conta cartões de função
            let conteinerAnalise = container.closest('.conteiner_hora');
            if (!conteinerAnalise) {
                conteinerAnalise = container.querySelector('.conteiner_hora');
            }
            if (!conteinerAnalise && container.classList.contains('conteiner_hora')) {
                conteinerAnalise = container;
            }
            
            console.log('contarItensNoContainer - conteinerAnalise encontrado:', conteinerAnalise);
            
            if (conteinerAnalise) {
                const area = conteinerAnalise.querySelector('#containerDados');
                console.log('contarItensNoContainer - area encontrada:', area);
                if (area) {
                    const funcoes = area.querySelectorAll('.cartao-funcao');
                    console.log('contarItensNoContainer - funcoes encontradas:', funcoes.length);
                    if (funcoes.length > 0) return funcoes.length;
                }
            }

            // Caso específico: Linha a linha -> conta colaboradores
            const conteinerLinha = container.closest('.conteiner_hora_linhaalinha') || container.querySelector('.conteiner_hora_linhaalinha');
            if (conteinerLinha) {
                const lista = conteinerLinha.querySelector('#listaColaboradoresLinhaALinha');
                if (lista) {
                    const colaboradores = lista.querySelectorAll(':scope > div');
                    if (colaboradores.length > 0) return colaboradores.length;
                    
                }
            }

            // Fallback genérico
            const colecoes = [
                container.querySelectorAll('tbody tr'),
                container.querySelectorAll('li'),
                container.querySelectorAll('.row'),
                container.querySelectorAll('.linha'),
                container.querySelectorAll('.item'),
            ];
            return colecoes.reduce((maior, lista) => Math.max(maior, lista.length), 0);
        }

        async function adicionarHorasHH() {
            const cardHH = document.querySelector('.conteiner_hora_linhaalinha');
            if (cardHH) {
                const botoes = cardHH.querySelectorAll('button');
                const botaoAdicionarTodos = Array.from(botoes).find(btn => 
                    btn.textContent.includes('Adicionar todos')
                );
                
                if (botaoAdicionarTodos) {
                    // calcula atraso dinâmico: ~550ms por item no container
                    const quantidadeItens = contarItensNoContainer(cardHH) || 1;
                    const atrasoMs = Math.max(300, quantidadeItens * 600);

                    cardHH.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    botaoAdicionarTodos.click();
                    console.log('Horas HH adicionadas');

                    // espera proporcional ao número de itens para evitar atropelos
                    await new Promise(resolve => setTimeout(resolve, atrasoMs));
                    //salva
                    return true;
                }
            }
            return false;
        }

        async function adicionarHorasAnalise() {
            const botaoAdicionar = document.querySelector('#botaoAdicionar');
            if (botaoAdicionar) {
                // Busca o container correto da análise de forma mais robusta
                let container = botaoAdicionar.closest('.conteiner_hora');
                if (!container) {
                    // Se não encontrar com closest, busca de outras formas
                    container = document.querySelector('.conteiner_hora');
                }
                if (!container) {
                    // Fallback: busca ascendente até encontrar o container correto
                    let elementoAtual = botaoAdicionar.parentElement;
                    while (elementoAtual && !elementoAtual.classList.contains('conteiner_hora')) {
                        elementoAtual = elementoAtual.parentElement;
                    }
                    container = elementoAtual;
                }
                
                const quantidadeItens = contarItensNoContainer(container) || 1;
                const atrasoMs = Math.max(300, quantidadeItens * 600);

                botaoAdicionar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await new Promise(resolve => setTimeout(resolve, 300));
                
                botaoAdicionar.click();
                console.log('adicionamento as horas analisadas');

                // espera proporcional ao número de itens para evitar atropelos
                await new Promise(resolve => setTimeout(resolve, atrasoMs));
                
                // Verifica se o processo foi concluído verificando se há alguma mudança visual
                console.log('Verificando se as horas foram processadas...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return true;
            }
            return false;
        }

        // Função principal de revisão
        async function executarRevisaoGeral() {
            try {
                const deveAprovar = checkbox.checked;
                console.log(`Iniciando processo ${deveAprovar ? 'com' : 'sem'} aprovação final`);
                
                botaoRevisaoGeral.disabled = true;
                botaoRevisaoGeral.innerHTML = '<b>Executando</b><br><small>Revisão em andamento</small>';
                
                const isHH = isRelatorioHH();
                console.log(`relatorio: ${isHH}`);
                
                console.log('Aplicando as horas do ponto csv');
                const botaoHoraPadrao = document.querySelector('.hora-padrao');
                if (botaoHoraPadrao) {
                    botaoHoraPadrao.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    await new Promise(resolve => setTimeout(resolve, 300));
                    botaoHoraPadrao.click();
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                
                console.log('adicionando equipamentos');
                await adicionarEquipamentosEspecificos(isHH);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('formatando comentarios e ocorrencias (tenho que tirar todos os logs depois TUDO)');
                await formatarComentariosEOcorrencias();
                await new Promise(resolve => setTimeout(resolve, 1000));

                console.log('Adicionando horas hh');
                    await adicionarHorasHH();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const botaoSalvar = document.querySelector('button.btn.btn-success.btn-icon.animation');
                    if (botaoSalvar) {
                        botaoSalvar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        await new Promise(resolve => setTimeout(resolve, 100));
                        botaoSalvar.click();
                        console.log('Salvando relatorio');
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }

                if (isHH) {
                    console.log('adicionando h/f');
                    await adicionarHorasAnalise();
                    console.log('Horas H/F adicionadas, aguardando processamento...');
                    // Aguarda mais tempo para garantir que as horas foram processadas
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
                if (!isHH) {
                    console.log('Salvando antes de aprovar');
                    const botaoSalvar = document.querySelector('button.btn.btn-success.btn-icon.animation');
                    if (botaoSalvar) {
                        botaoSalvar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        await new Promise(resolve => setTimeout(resolve, 300));
                        botaoSalvar.click();
                        console.log('Salvando relatorio');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                
                // Aguarda um tempo adicional antes de aprovar para garantir que tudo foi processado
                console.log('Aguardando processamento final antes da aprovação...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Aprovação condicional
                if (deveAprovar) {
                    console.log('Iniciando aprovação...');
                    await aprovarRelatorioAutomatico();
                    console.log('Revisão geral e aprovação concluídas');
                    botaoRevisaoGeral.innerHTML = '<b>Concluído!</b><br><small>Aprovado</small>';
                } else {
                    console.log('Revisão geral concluída (sem aprovação)');
                    botaoRevisaoGeral.innerHTML = '<b>Concluído!</b><br><small>Não aprovado</small>';
                }
                
                setTimeout(() => {
                    botaoRevisaoGeral.disabled = false;
                    botaoRevisaoGeral.innerHTML = '<b>Revisão Geral</b><br><small>Automática</small>';
                }, 3000);
                
            } catch (error) {
                console.error('Erro durante a revisão geral:', error);
                botaoRevisaoGeral.innerHTML = '<b>Erro!</b><br><small>Tente novamente</small>';
                botaoRevisaoGeral.disabled = false;
                
                setTimeout(() => {
                    botaoRevisaoGeral.innerHTML = '<b>Revisão Geral</b><br><small>Automática</small>';
                }, 3000);
            }
        }

        async function aprovarRelatorioAutomatico() {
            try {
                const radioRevisar = document.querySelector('input[name="status-rdo"][id="status-revisar"]');
                if (radioRevisar) {
                    radioRevisar.click();
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    return;
                }
                
                const botoesAprovar = document.querySelectorAll('button.btn.btn-success.btn-icon.animation');
                let botaoAprovarEncontrado = null;
                
                for (const botao of botoesAprovar) {
                    const icone = botao.querySelector('i.material-icons');
                    if (icone && icone.textContent === 'done_all') {
                        botaoAprovarEncontrado = botao;
                        break;
                    }
                }
                
                if (botaoAprovarEncontrado) {
                    botaoAprovarEncontrado.click();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    const linkAprovar = document.querySelector('a.aprovar');
                    if (linkAprovar) {
                        linkAprovar.click();
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const confirmacaoFinal = document.querySelector('a.aprovar');
                        if (confirmacaoFinal) {
                            confirmacaoFinal.click();
                        }
                    }
                }
                
            } catch (error) {
                console.error('Erro durante a aprovação automática:', error);
            }
        }

        // Evento de clique do botão
        botaoRevisaoGeral.addEventListener('click', executarRevisaoGeral);

        // Adiciona o container à div
        divRevisaoGeral.appendChild(containerBotao);
    }
}

function verificarTipoSecao(linha) {
    const btnOcorrencias = linha.querySelector('[data-target="#modalOcorrenciaForm"]');
    if (btnOcorrencias) {
        return 'ocorrencia';
    }

    const btnAtividades = linha.querySelector('[data-target^="#modalAtividades"]');
    if (btnAtividades) {
        return 'atividade';
    }

    const btnComentarios = linha.querySelector('[data-target="#modalComentariosForm"]');
    if (btnComentarios) {
        return 'comentario';
    }

    const textoLinha = linha.textContent.toLowerCase();
    if (textoLinha.includes('ocorrência') || textoLinha.includes('ocorrencia')) {
        return 'ocorrencia';
    }

    return 'comentario';
}

// personalizando o tamanho das imagens e descrições
function personalizarTamanhoEvidencias() {
    const observer = new MutationObserver(() => {
        const imagens = document.querySelectorAll('.galeria .box .imagem');
        const descricoes = document.querySelectorAll('.galeria .box .descricao .form-control[data-v-6babf22e]');
        const botaoAcao = document.querySelectorAll('.galeria .box .acao[data-v-6babf22e]');

        imagens.forEach(imagem => {
            imagem.style.width = '222px';
            imagem.style.height = '148px';

            const backgroundImage = imagem.style.backgroundImage;
            if (backgroundImage && backgroundImage.includes('/miniatura/')) {
                const urlAltaQualidade = backgroundImage.replace('/miniatura/', '/');
                const match = urlAltaQualidade.match(/url\(['"]?([^'"]+)['"]?\)/);
                const src = match ? match[1] : null;
                if (src) {
                    const img = new Image();
                    img.onload = () => { imagem.style.backgroundImage = urlAltaQualidade; };
                    img.onerror = () => { /* mantém miniatura */ };
                    img.src = src;
                }
            }
        });


        descricoes.forEach(descricao => {
            descricao.style.cssText = `
                height: 148px !important;
                min-height: 100px !important;
            `;
        });

        botaoAcao.forEach(acao => {
            acao.style.left = '178px';
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

personalizarTamanhoEvidencias();

let autoFormatEnabled = true;

chrome.storage.sync.get('autoFormat', function (data) {
    autoFormatEnabled = data.autoFormat ?? true;
    if (autoFormatEnabled) {
        enableAutoFormat();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if ('autoFormat' in message) {
        autoFormatEnabled = message.autoFormat;
        if (autoFormatEnabled) {
            enableAutoFormat();
        } else {
            disableAutoFormat();
        }
    }
});

async function enableAutoFormat() {
    observerRelatorio.observe(document.body, { childList: true, subtree: true });
    await identificaRelatorio();
}

function disableAutoFormat() {
    observerRelatorio.disconnect();
    removeFormatButtons();
}

function removeFormatButtons() {
    const formatButtons = document.querySelectorAll('.formatar, .restaurar-formato, .hora-padrao, .adicionar-equipamento, .revisao-geral');
    formatButtons.forEach(button => button.remove());
}

const observerRelatorio = new MutationObserver(async () => {
    if (autoFormatEnabled) {
        await identificaRelatorio();
    }
});

if (autoFormatEnabled) {
    observerRelatorio.observe(document.body, { childList: true, subtree: true });
}
