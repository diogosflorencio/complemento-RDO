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
        // Verifica se o servidor está disponível para funcionalidades
        const available = await isServerAvailable();
        if (!available) {
            console.log('Servidor indisponível - funcionalidades de relatório não executadas');
            return false;
        }

        // Desconecta o observer temporariamente antes de modificar o DOM
        observerRelatorio.disconnect();

        adicionarBotoesFormatacao();
        adicionarBotaoHoraPadrao();
        adicionarBotoesEquipamentos(); // Adiciona a nova função aqui

        // Reconecta o observer após as modificações
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

        // Defina o modelo Gemini a ser utilizado
        const GEMINI_MODEL = 'gemini-2.5-flash';
        // Endpoint da API Gemini
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

REGRAS IMPORTANTES:
- PRESERVE todas as informações técnicas do texto original
- NÃO simplifique ou reduza descrições técnicas
- NÃO remova detalhes importantes das ocorrências
- Mantenha especificações de materiais e processos completas
- Corrija apenas erros gramaticais e ortográficos

EXEMPLO:
Texto: "Foi identificado um problema na aplicação da tinta. Necessario fazer retrabalho."

Resultado:
"Foi identificado um problema na aplicação da tinta. Necessário fazer retrabalho."

TEXTO PARA FORMATAR:
${texto}

Formate preservando todas as informações técnicas originais, corrigindo apenas erros gramaticais e ortográficos.`;
        } else {
            // Prompt original para comentários
            prompt = `
Você é um formatador especializado em Relatórios Diários de Obra (RDO) de pintura industrial. Analise o texto e formate-o adequadamente mantendo TODAS as informações originais.

INSTRUÇÃO PRIORITÁRIA: Se houver texto entre duplos parênteses ((instrução)) no conteúdo, execute essa instrução específica e ignore todas as outras regras.

CONTEXTO: Serviços de pintura industrial e manutenção. Corrija apenas termos mal escritos (ex: "trapiamento" → "trapeamento").

FORMATAÇÃO DE TÍTULO:
- Se houver local/equipamento específico mencionado: "Realizado durante o dia na/no/em [local]:"
- Se NÃO houver local específico (apenas "Realizado durante o dia", "manhã", "tarde", etc.): "Realizado durante o dia:"
- Se tiver uma lista de pessoas, coloque o nome delas separados por vírgula, assim: Diogo, Pedro e João.

FORMATAÇÃO DAS ATIVIDADES:
- Mantenha o texto original das atividades, apenas ajustando a gramática
- Uma atividade por linha, terminando com ponto e vírgula
- Última atividade termina com ponto final
- Preserve especificações técnicas completas (ex: "Lavagem das estruturas" não vira apenas "Lavagem")
- Preserve códigos e normas (ex: "SA1-SA2½" mantém exatamente assim)

REGRAS IMPORTANTES:
- PRESERVE todas as informações técnicas do texto original
- NÃO simplifique ou reduza descrições técnicas
- NÃO remova detalhes importantes das atividades
- Se não houver "Organização e limpeza" mencionado, adicione "Organização e limpeza da área." no final
- Mantenha especificações de materiais e processos completas

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
    // Encontra o botão de editar do comentário atual
    const btnEditar = elementoOriginal.closest('tr').querySelector('[data-target="#modalComentariosForm"]');
    btnEditar.click();

    // Aguarda o modal abrir
    await new Promise(resolve => setTimeout(resolve, 200));

    const modal = document.querySelector('#modalComentariosForm');
    const form = modal.querySelector('form');
    const textarea = form.querySelector('textarea[name="descrica"]');
    const btnSalvar = form.querySelector('button[type="submit"]');

    // Atualiza o valor do textarea
    textarea.value = textoFormatado;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Submete o formulário de forma nativa
    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });
    form.dispatchEvent(submitEvent);

    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fecha o modal manualmente
    const btnFechar = modal.querySelector('[data-dismiss="modal"]');
    btnFechar.click();
}

async function atualizarOcorrencia(elementoOriginal, textoFormatado) {
    // Encontra o botão de editar da ocorrência atual
    const btnEditar = elementoOriginal.closest('tr').querySelector('[data-target="#modalOcorrenciaForm"]');
    btnEditar.click();

    // Aguarda o modal abrir
    await new Promise(resolve => setTimeout(resolve, 200));

    const modal = document.querySelector('#modalOcorrenciaForm');
    const form = modal.querySelector('form');
    const textarea = form.querySelector('textarea[name="descrica"]');
    const btnSalvar = form.querySelector('button[type="submit"]');

    // Atualiza o valor do textarea
    textarea.value = textoFormatado;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Submete o formulário de forma nativa
    const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true
    });
    form.dispatchEvent(submitEvent);

    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fecha o modal manualmente
    const btnFechar = modal.querySelector('[data-dismiss="modal"]');
    btnFechar.click();
}

// Armazena os textos originais
const textosOriginais = new Map();

function adicionarBotoesFormatacao() {
    const linhasTabela = document.querySelectorAll('table.table-data.table-hover  tbody tr');

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


        // Botão de formatação
        const botaoFormatar = document.createElement('a');
        botaoFormatar.href = '#';
        botaoFormatar.title = 'Auto formatação (nos comentários, faz formatação automática dos textos para o padrão de RDO do TAC. Nas ocorrências, corrige apenas erros de gramática e ortografia. Se usado (("Qualquer pedido")), faz o que foi ordenado entre parênteses duplo)';
        botaoFormatar.className = 'formatar';

        const iconeFormatar = document.createElement('i');
        iconeFormatar.className = 'material-icons';
        iconeFormatar.textContent = 'autorenew';
        botaoFormatar.appendChild(iconeFormatar);

        // Botão de restauração
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

            // Verifica se é comentário ou ocorrência
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
                // Verifica se é comentário ou ocorrência para usar a função apropriada
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
    // Procura pela div específica onde o botão deve ser adicionado
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

        // Função para simular digitação
        function simularDigitacao(elemento, valor) {
            if (!elemento) return;

            elemento.focus();
            elemento.value = '';

            // Simula digitação caractere por caractere
            for (let i = 0; i < valor.length; i++) {
                setTimeout(() => {
                    elemento.value = valor.substring(0, i + 1);
                    
                    // Dispara eventos de digitação
                    elemento.dispatchEvent(new KeyboardEvent('keydown', { 
                        key: valor[i], 
                        bubbles: true 
                    }));
                    elemento.dispatchEvent(new Event('input', { bubbles: true }));
                    elemento.dispatchEvent(new KeyboardEvent('keyup', { 
                        key: valor[i], 
                        bubbles: true 
                    }));

                    // No último caractere
                    if (i === valor.length - 1) {
                        setTimeout(() => {
                            elemento.dispatchEvent(new Event('change', { bubbles: true }));
                            elemento.blur();
                        }, 50);
                    }
                }, i * 100);
            }
        }

        // Evento de clique do botão
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

        // Adiciona o botão à div
        divHoraPadrao.appendChild(botaoHoraPadrao);
    }
}

function adicionarBotoesEquipamentos() {
    // Procura pela lista de equipamentos
    const listaEquipamentos = document.querySelector('div[data-v-3ac1f292].lista ul');
    
    if (listaEquipamentos) {
        const itensEquipamentos = listaEquipamentos.querySelectorAll('li');
        
        itensEquipamentos.forEach(item => {
            // Verifica se já tem o botão adicionado
            if (item.querySelector('.adicionar-equipamento')) return;
            
            // Pega a descrição do equipamento
            const descricaoElement = item.querySelector('.descricao p');
            const nomeEquipamento = descricaoElement ? descricaoElement.textContent.trim() : '';
            
            // Cria o botão "Adicionar"
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
            
       
            
            // Função para adicionar equipamento como atividade
            async function adicionarEquipamentoComoAtividade() {
                try {
                    // Abre o modal de atividade avulsa
                    const btnAdicionarAtividade = document.querySelector('[data-target="#modalAtividadesAvulsaForm"]');
                    if (!btnAdicionarAtividade) return;
                    
                    btnAdicionarAtividade.click();
                    
                    // Aguarda o modal abrir
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
            
            // Adiciona o evento de clique
            botaoAdicionar.addEventListener('click', adicionarEquipamentoComoAtividade);
            
            // Adiciona o botão na div de ações
            const divAcao = item.querySelector('.acao');
            if (divAcao) {
                divAcao.appendChild(botaoAdicionar);
            }
        });
    }
}

// Função para verificar se o TR está em comentários ou ocorrências
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
    const formatButtons = document.querySelectorAll('.formatar, .restaurar-formato, .hora-padrao, .adicionar-equipamento');
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
