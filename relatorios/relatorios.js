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
    

    if (titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && detalhesRelatorio) {
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

async function formatarTextoComIA(texto, tipo = 'comentario') {
    let apiKey;
    try {
        const data = await chrome.storage.sync.get('geminiApiKey');
        apiKey = data.geminiApiKey;

        if (!apiKey) {
            throw new Error('Key não encontrada.');
        }

        const GEMINI_MODEL = 'gemini-2.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

        let prompt;
        
        if (tipo === 'ocorrencia') {
            prompt = `
Você é um formatador especializado em Relatórios Diários de Obra (RDO) de pintura industrial, especificamente para a seção de OCORRÊNCIAS. Analise o texto e formate-o adequadamente mantendo TODAS as informações originais.

INSTRUÇÃO PRIORITÁRIA: Se houver texto entre duplos parênteses ((instrução)) no conteúdo, execute essa instrução específica e ignore todas as outras regras.

CONTEXTO: Serviços de pintura industrial e manutenção. Corrija apenas termos mal escritos (ex: "trapiamento" → "trapeamento").

FORMATAÇÃO PARA OCORRÊNCIAS:
- Mantenha o texto original das ocorrências, apenas ajustando a gramática
- Corrija erros de digitação e ortografia
- Mantenha a estrutura informativa da ocorrência
- Preserve especificações técnicas completas
- Preserve códigos e normas (ex: "SA1-SA2½" mantém exatamente assim)
- Se a ocorrência for uma lista, mantenha a estrutura de lista
- Se tiver uma lista de pessoas, coloque o nome delas embaixo de tudo separados por vírgula, assim: Diogo, Pedro e João.


REGRAS IMPORTANTES:
- PRESERVE todas as informações técnicas do texto original
- NÃO simplifique ou reduza descrições técnicas
- NÃO remova detalhes importantes das ocorrências
- Mantenha especificações de materiais e processos completas
- Corrija apenas erros gramaticais e ortográficos
- Você não deve formatar, deve organizer e corrigir conforme as regras. não use * ou -. E você deve retornar apenas o conteudo conforme pedido, nada de "Aqui está o que você pediu..."!
- Não esqueça do ponto final.


EXEMPLO:
Texto: "Foi identificado um problema na aplicação da tinta. Necessario fazer retrabalho."

Resultado:
"Foi identificado um problema na aplicação da tinta. Necessário fazer retrabalho."

TEXTO PARA FORMATAR:
${texto}

Formate preservando todas as informações técnicas originais, corrigindo apenas erros gramaticais e ortográficos.`;
        } else {
            prompt = `
Você é um formatador especializado em Relatórios Diários de Obra (RDO) de pintura industrial. Analise o texto e formate-o adequadamente mantendo TODAS as informações originais.

INSTRUÇÃO PRIORITÁRIA: Se houver texto entre duplos parênteses ((instrução)) no conteúdo, execute essa instrução específica e ignore todas as outras regras.

CONTEXTO: Serviços de pintura industrial e manutenção. Corrija apenas termos mal escritos (ex: "trapiamento" → "trapeamento").

FORMATAÇÃO DE TÍTULO:
- Se houver local/equipamento específico mencionado: "Realizado durante o dia na/no/em [local]:"
- Se NÃO houver local específico (apenas "Realizado durante o dia", "manhã", "tarde", etc.): "Realizado durante o dia:"

FORMATAÇÃO DAS ATIVIDADES:
- Mantenha o texto original das atividades, apenas ajustando a gramática
- Uma atividade por linha, terminando com ponto e vírgula
- Última atividade termina com ponto final
- Preserve especificações técnicas completas (ex: "Lavagem das estruturas" não vira apenas "Lavagem")
- Preserve códigos e normas (ex: "SA1-SA2½" mantém exatamente assim)
- Se tiver uma lista de pessoas, coloque o nome delas embaixo de tudo separados por vírgula, assim: Diogo, Pedro e João.

REGRAS IMPORTANTES:
- PRESERVE todas as informações técnicas do texto original
- NÃO simplifique ou reduza descrições técnicas
- NÃO remova detalhes importantes das atividades
- Se não houver "Organização e limpeza" mencionado, adicione "Organização e limpeza da área." no final
- Mantenha especificações de materiais e processos completas
- Você não deve formatar, deve organizer e corrigir conforme as regras. não use * ou -. E você deve retornar apenas o conteudo conforme pedido, nada de "Aqui está o que você pediu..."!
- Não esqueça do ponto final.

EXEMPLO:
Texto: "Período do dia: Lavagem das estruturas. Jateamento abrasivo SA-1-SA-2½. Aplicação de Acabamento."

Resultado:
"Realizado período de trabalho:

Lavagem das estruturas;
Jateamento abrasivo SA-1-SA-2½;
Aplicação de acabamento;
Organização e limpeza da área."

TEXTO PARA FORMATAR:
${texto}

Formate preservando todas as informações técnicas originais.`;
        }

        const response = await fetch(endpoint, {
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
        });
        const responseData = await response.json();
        console.log('Resposta da API Gemini:', responseData);
        return responseData.candidates[0].content.parts[0].text;
    } catch (erro) {
        console.error('Erro na formatação:', erro, { apiKey });
        alert('Erro ao formatar texto. Para essa funcionalidade você precisa ter uma chave de API do Google Gemini. Verifique o campo "Gemini API Key" no menu de configurações da extensão (pop-up).');
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

const textosOriginais = new Map();

function adicionarBotoesFormatacao() {
    const linhasTabela = document.querySelectorAll('#rdo-ocorrencias table.table-data.table-hover tbody tr, #rdo-comentario table.table-data.table-hover tbody tr');

    linhasTabela.forEach(linha => {
        if (linha.querySelector('.formatar')) return;

        const containerBotoes = document.createElement('div');
        containerBotoes.style.cssText = `
            position: absolute;
            left: -60px;
            height: 100%;
            display: flex;
            align-items: center;
            gap: 5px;
        `;


        const botaoFormatar = document.createElement('a');
        botaoFormatar.href = '#';
        botaoFormatar.title = 'Auto formatação (nos comentários, faz formatação automática dos textos para o padrão de RDO do TAC. Nas ocorrências, corrige apenas erros de gramática e ortografia. Se usado (("Qualquer pedido")), faz o que foi ordenado entre parênteses duplo)';
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

            const conteudoOriginal = linha.querySelector('p.white-space');
            textosOriginais.set(conteudoOriginal, conteudoOriginal.textContent);

            const tipoSecao = verificarTipoSecao(linha);
            const textoFormatado = await formatarTextoComIA(conteudoOriginal.textContent, tipoSecao);

            if (textoFormatado && textoFormatado !== conteudoOriginal.textContent) {
                if (tipoSecao === 'ocorrencia') {
                    await atualizarOcorrencia(conteudoOriginal, textoFormatado);
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

            const conteudoOriginal = linha.querySelector('p.white-space');
            const textoOriginal = textosOriginais.get(conteudoOriginal);

            if (textoOriginal) {
                const tipoSecao = verificarTipoSecao(linha);
                if (tipoSecao === 'ocorrencia') {
                    await atualizarOcorrencia(conteudoOriginal, textoOriginal);
                } else {
                    await atualizarComentario(conteudoOriginal, textoOriginal);
                }
                botaoRestaurar.style.display = 'none';
                textosOriginais.delete(conteudoOriginal);
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
//             return titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && nomeObra.includes('HH');

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
            return titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && nomeObra.includes('HH');
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
                    if (args[0] && args[0].includes && args[0].includes('Resposta da API Gemini:')) {
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
    // Procura por botões de edição na linha
    const btnComentarios = linha.querySelector('[data-target="#modalComentariosForm"]');
    const btnOcorrencias = linha.querySelector('[data-target="#modalOcorrenciaForm"]');
    
    // Se encontrar botão de ocorrências, é uma ocorrência
    if (btnOcorrencias) {
        return 'ocorrencia';
    }
    
    // Se encontrar botão de comentários, é um comentário
    if (btnComentarios) {
        return 'comentario';
    }
    
    // Verifica se há outros indicadores na linha
    const textoLinha = linha.textContent.toLowerCase();
    if (textoLinha.includes('ocorrência') || textoLinha.includes('ocorrencia')) {
        return 'ocorrencia';
    }
    
    // Por padrão, assume que é comentário
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

            // Pega a URL atual da imagem de fundo
            const backgroundImage = imagem.style.backgroundImage;
            if (backgroundImage) {
                // Remove /miniatura da URL
                const urlAltaQualidade = backgroundImage.replace('/miniatura/', '/');
                // Define a nova URL da imagem em alta qualidade
                imagem.style.backgroundImage = urlAltaQualidade;
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
