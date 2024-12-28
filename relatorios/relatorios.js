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
    try {
        const data = await chrome.storage.sync.get('geminiApiKey');
        const apiKey = data.geminiApiKey;
        
        if (!apiKey) {
            throw new Error('API key not found. Please configure it in the extension settings.');
        }

        const prompt = `
            Formate o seguinte texto seguindo este padrão de formatação, mas considerando as informação passadas no campo "texto para formatar":
            
            Local/Equipamento ou Período do dia
            
            Atividades executadas no dia (uma por linha, com ponto e vírgula no final):
            - Tratamento St2; (por exemplo)
            - Limpeza com solvente; (por exemplo)
            - Aplicação de primer; (por exemplo)
            - Organização e limpeza. (este, mesmo que no texto original não tenha, ponha sempre este item na liste de serviços executados. lembrando que o ultimo item finaliza com ponto final.)
            
            COLABORADORES: Nome1, Nome2. (por exemplo)
            
            Texto para formatar: ${texto}
            
            Regras importantes:
            1. Mantenha TODAS as informações originais
            2. Use letras maiúsculas para títulos quando for o local da atividade ou equipamento
            3. Use ponto e vírgula no final de cada atividade
            4. Mantenha a formatação em lista simples
            5. Não adicione cabeçalhos ou seções extras
            6. Não adicione comentários ou sugestões
            7. Caso no texto original não tenha algo, como colaboradores, não precisa deixar o campo, simplesmente o remova`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

            if (!response.ok) {
                throw new Error('API request failed');
            }
    
            const responseData = await response.json();
            return responseData.candidates[0].content.parts[0].text;
        } catch (erro) {
            console.error('Erro na formatação:', erro);
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
    const linhasTabela = document.querySelectorAll('table.table-data tbody tr');

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
        botaoFormatar.title = 'Auto formatação';
        botaoFormatar.className = 'formatar';

        const iconeFormatar = document.createElement('i');
        iconeFormatar.className = 'material-icons';
        iconeFormatar.textContent = 'autorenew';
        botaoFormatar.appendChild(iconeFormatar);

        // Botão de restauração
        const botaoRestaurar = document.createElement('a');
        botaoRestaurar.href = '#';
        botaoRestaurar.title = 'Restaurar original';
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




const observerRelatorio = new MutationObserver(() => {
    identificaRelatorio();
});

observerRelatorio.observe(document.body, { childList: true, subtree: true });
// correção da cor inicial padrão do cabeçaalho, adicionado funcionalidade de auto formatação e restauração com key de api individual para cada usuario, ajustado tamanho das evidencias dos relatorios, ajustado wrap do card de horas, ajustado bug que não estava considerando as variações no tempo de intervalo de cada colaborador o codigo estava considerando 1h de intervalos quando o value do campo do mesmo estava vazio o que n faz o menor sentido., ajustado erro no observer devido ao reload da extensão.