const styleSheet = document.createElement("style");
styleSheet.textContent = `
    .formatar.loading i {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

function identificaRelatorio() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    const detalhesRelatorio = document.querySelector(".card-header h4");

    if (titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && detalhesRelatorio) {
        // Desconecta o observer temporariamente antes de modificar o DOM
        observerRelatorio.disconnect();

        adicionarBotoesFormatacao();

        // Reconecta o observer após as modificações
        observerRelatorio.observe(document.body, { childList: true, subtree: true });
        return true;
    }
    return false;
}

async function formatarTextoComIA(texto) {
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

        const prompt = `
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

// Armazena os textos originais
const textosOriginais = new Map();

function adicionarBotoesFormatacao() {
    const linhasTabela = document.querySelectorAll('#rdo-comentario table.table-data.table-hover  tbody tr');

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
        botaoFormatar.title = 'Auto formatação (ainda estou desenvolvendo, mas funciona bem)';
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

            const textoFormatado = await formatarTextoComIA(conteudoOriginal.textContent);

            if (textoFormatado && textoFormatado !== conteudoOriginal.textContent) {
                await atualizarComentario(conteudoOriginal, textoFormatado);
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
                await atualizarComentario(conteudoOriginal, textoOriginal);
                botaoRestaurar.style.display = 'none';
                textosOriginais.delete(conteudoOriginal);
            }

            botaoRestaurar.classList.remove('loading');
            iconeRestaurar.textContent = 'restore';
        });
    });
}

// personalizando o tamanho das imagens e descrições
function personalizarTamanhoEvidencias() {
    const observer = new MutationObserver(() => {
        const imagens = document.querySelectorAll('.galeria .box .imagem');
        const descricoes = document.querySelectorAll('.galeria .box .descricao textarea[data-v-c0ee0298]');
        const botaoAcao = document.querySelectorAll('.galeria .box .acao[data-v-c0ee0298]');

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

function enableAutoFormat() {
    observerRelatorio.observe(document.body, { childList: true, subtree: true });
    identificaRelatorio();
}

function disableAutoFormat() {
    observerRelatorio.disconnect();
    removeFormatButtons();
}

function removeFormatButtons() {
    const formatButtons = document.querySelectorAll('.formatar, .restaurar-formato');
    formatButtons.forEach(button => button.remove());
}

const observerRelatorio = new MutationObserver(() => {
    if (autoFormatEnabled) {
        identificaRelatorio();
    }
});

if (autoFormatEnabled) {
    observerRelatorio.observe(document.body, { childList: true, subtree: true });
}
