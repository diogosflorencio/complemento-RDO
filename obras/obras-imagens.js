/**
 * Script pra fazer slider nas fotos das obras
 * usando a API e fazendo um fade suave entre as fotos
 */
(function() {
    // Configs básicas
    const URL_DA_API = 'https://apiexterna.diariodeobra.app/v1';
    const TEMPO_ENTRE_FOTOS = 2000;
    const TEMPO_PRA_ATUALIZAR_CACHE = 30 * 60 * 1000; // 30 minutos
    const IMAGEM_PADRAO = 'https://cdndiariodeobra.azureedge.net/obras-foto/607489ec47884751d57325e2/65afc3a3a0070f4e7407f052/0e3ed2d5.png';
    const cacheDeImagens = {};
    let jaInicializou = false;
    let sliderAtivado = true; // Estado padrão do slider

    // Fica de olho nas mudanças de configuração
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.obrasSlider) {
            sliderAtivado = changes.obrasSlider.newValue;
            if (!sliderAtivado) {
                // Remove os eventos de hover de todas as obras
                document.querySelectorAll('div.obra div.imagem.bg[data-hover-setup="true"]').forEach(divDaImagem => {
                    const imagemOriginal = divDaImagem.getAttribute('data-imagem-original');
                    if (imagemOriginal) {
                        divDaImagem.style.backgroundImage = `url("${imagemOriginal}")`;
                        divDaImagem.style.setProperty('--imagem-antes', `url("${imagemOriginal}")`);
                        divDaImagem.style.setProperty('--imagem-depois', `url("${imagemOriginal}")`);
                        divDaImagem.style.setProperty('--opacidade-antes', '1');
                    }
                });
            } else {
                // Reinicializa o slider para todas as obras
                configuraTodosOsSliders();
            }
        }
    });

    // Carrega o estado inicial do slider
    chrome.storage.sync.get(['obrasSlider'], function(result) {
        sliderAtivado = result.obrasSlider !== undefined ? result.obrasSlider : true;
        if (sliderAtivado) {
            inicializa();
        }
    });

    // Coloca o CSS pra fazer transição
    const estilos = document.createElement('style');
    estilos.textContent = `
        .imagem.bg {
            position: relative;
            background-size: cover !important;
            background-position: center !important;
            overflow: hidden;
        }
        .imagem.bg::before,
        .imagem.bg::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover !important;
            background-position: center !important;
            pointer-events: none;
        }
        .imagem.bg::before {
            background-image: var(--imagem-antes);
            transition: opacity 0.5s ease-in-out;
            opacity: var(--opacidade-antes, 1);
            z-index: 2;
        }
        .imagem.bg::after {
            background-image: var(--imagem-depois);
            z-index: 1;
        }
        .imagem.bg .badge {
            position: relative;
            z-index: 10 !important;
        }
        .obra .dropdown {
            position: relative;
            z-index: 20 !important;
        }
        .obra .dropdown-menu {
            z-index: 21 !important;
        }
    `;
    document.head.appendChild(estilos);

    // 1. Função pra carregar as imagens antes, pra não ficar travando
    function preCarregaImagens(urlsDasImagens) {
        urlsDasImagens.forEach(url => {
            const img = new Image();
            img.src = url;
            img.onerror = () => console.error(`[ScriptDeSliderDasObras-diogo-RDO-dev-0.8] Erro ao carregar imagem: ${url}`);
        });
    }

    // 2. Pega o token da API lá do localStorage
    function pegaTokenDaAPI() {
        try {
            const dadosDaEmpresa = localStorage.getItem('RDOEmpresa');
            if (!dadosDaEmpresa) return null;
            const dadosConvertidos = JSON.parse(dadosDaEmpresa);
            return dadosConvertidos?.tokenApiExterna || null;
        } catch (erro) {
            console.error('[ScriptDeSliderDasObras-diogo-RDO-dev-0.8] ERRO ao pegar o token:', erro);
            return null;
        }
    }

    // 3. Função pra fazer as chamadas na API
    async function chamadaAPI(endpoint) {
        const token = pegaTokenDaAPI();
        if (!token) throw new Error('Não achei o token pra acessar ao infos da API (favor ativar no perfil da empresa - token de integração)');

        try {
            const resposta = await fetch(`${URL_DA_API}${endpoint}`, {
                headers: { 'token': token }
            });
            if (!resposta.ok) throw new Error(`Deu ruim na api: ${resposta.status}`);
            return await resposta.json();
        } catch (erro) {
            console.warn(`[ScriptDeSliderDasObras-diogo-RDO-dev-0.8] Falhou a chamada pra ${endpoint}: ${erro.message}`);
            throw erro;
        }
    }

    // 4. Pega o ID da obra pela URL
    function pegaIdDaObra(url) {
        if (!url) return null;
        const encontrado = url.match(/\/app\/obras\/([a-f0-9]+)/);
        return encontrado ? encontrado[1] : null;
    }

    // 5. Busca as fotos da obra pela API
    async function buscaFotosDaAPI(idDaObra) {
        if (!idDaObra) return [IMAGEM_PADRAO];

        // Verifica se tem no cache e se ainda tá válido
        if (cacheDeImagens[idDaObra]?.timestamp && 
            (Date.now() - cacheDeImagens[idDaObra].timestamp) < TEMPO_PRA_ATUALIZAR_CACHE) {
            return cacheDeImagens[idDaObra].imagens;
        }

        try {
            const obra = await chamadaAPI(`/obras/${idDaObra}`);
            let imagens = [];

            if (obra?.visaoGeral?.ultimasFotos?.length) {
                imagens = obra.visaoGeral.ultimasFotos
                    .map(foto => foto?.url)
                    .filter(Boolean);
            }

            // Limpa duplicadas e links 
            const imagensLimpas = [...new Set(imagens)]
                .filter(url => url && !url.includes('miniatura') && /^https?:\/\//.test(url));

            const imagensFinais = imagensLimpas.length > 0 ? imagensLimpas : [IMAGEM_PADRAO];

            // guarda no cache
            cacheDeImagens[idDaObra] = {
                imagens: imagensFinais,
                timestamp: Date.now()
            };

            preCarregaImagens(imagensFinais);
            return imagensFinais;
        } catch (erro) {
            console.error(`[ScriptDeSliderDasObras-diogo-RDO-dev-0.8] ERRO ao buscar fotos da obra ${idDaObra}:`, erro);
            return [IMAGEM_PADRAO];
        }
    }

    // 6. Função faz o efeito de fade quando passa o mouse
    function configuraEfeitoHover(divDaImagem, fotosDaGaleria) {
        if (!divDaImagem || !fotosDaGaleria?.length) return;

        // Guarda a imagem original antes de mexer em qualquer coisa
        const imagemOriginalCSS = window.getComputedStyle(divDaImagem).backgroundImage;
        const imagemOriginal = imagemOriginalCSS.match(/url\(['"]?(.*?)['"]?\)/)?.[1];
        if (!imagemOriginal) return;

        // Configura as variáveis CSS com a imagem original e guarda em um atributo data pra não perder
        divDaImagem.setAttribute('data-imagem-original', imagemOriginal);
        
        // Aplica a imagem original em todas as camadas inicialmente
        function aplicaImagemOriginal() {
            divDaImagem.style.backgroundImage = `url("${imagemOriginal}")`;
            divDaImagem.style.setProperty('--imagem-antes', `url("${imagemOriginal}")`);
            divDaImagem.style.setProperty('--imagem-depois', `url("${imagemOriginal}")`);
            divDaImagem.style.setProperty('--opacidade-antes', '1');
        }
        
        aplicaImagemOriginal();

        // Deixa a tag "em andamento" sempre visível
        const tagEmAndamento = divDaImagem.querySelector('.badge');
        if (tagEmAndamento) {
            tagEmAndamento.style.position = 'relative';
            tagEmAndamento.style.zIndex = '10';
        }

        let indiceFoto = -1;
        let intervaloDeTroca = null;
        let estaEmTransicao = false;
        let timerDelay = null;
        let mouseEstaSobre = false;

        // Função que troca as fotos 
        function trocaFoto() {
            if (estaEmTransicao || !mouseEstaSobre) {
                voltarParaImagemOriginal();
                return;
            }
            
            indiceFoto = (indiceFoto + 1) % fotosDaGaleria.length;
            const novaFoto = fotosDaGaleria[indiceFoto];

            estaEmTransicao = true;
            
            // Mantém a imagem base enquanto faz a transição
            divDaImagem.style.backgroundImage = `url("${imagemOriginal}")`;
            divDaImagem.style.setProperty('--imagem-depois', `url("${novaFoto}")`);
            divDaImagem.style.setProperty('--opacidade-antes', '0');
            
            setTimeout(() => {
                if (!mouseEstaSobre) {
                    voltarParaImagemOriginal();
                    return;
                }
                divDaImagem.style.setProperty('--imagem-antes', `url("${novaFoto}")`);
                divDaImagem.style.setProperty('--opacidade-antes', '1');
                divDaImagem.style.backgroundImage = `url("${novaFoto}")`;
                estaEmTransicao = false;
            }, 500);
        }

        function voltarParaImagemOriginal() {
            // Limpa todos os timers primeiro
            if (intervaloDeTroca) {
                clearInterval(intervaloDeTroca);
                intervaloDeTroca = null;
            }
            if (timerDelay) {
                clearTimeout(timerDelay);
                timerDelay = null;
            }

            // Reseta estados
            estaEmTransicao = false;
            mouseEstaSobre = false;
            indiceFoto = -1;

            // Força a imagem original em todas as camadas
            aplicaImagemOriginal();
            
            // Força um reflow para garantir que as mudanças sejam aplicadas imediatamente
            void divDaImagem.offsetWidth;
        }

        // Quando passa o mouse, começa a trocar as fotos após um delay
        divDaImagem.addEventListener('mouseenter', () => {
            mouseEstaSobre = true;
            
            // Se já tiver um timer ou intervalo rodando, limpa tudo e começa de novo
            if (timerDelay || intervaloDeTroca) {
                clearTimeout(timerDelay);
                clearInterval(intervaloDeTroca);
                timerDelay = null;
                intervaloDeTroca = null;
            }
            
            // Garante que começa com a imagem original
            aplicaImagemOriginal();
            
            // Espera um pouquinho antes de começar o slider
            timerDelay = setTimeout(() => {
                if (mouseEstaSobre && fotosDaGaleria.length > 1) {
                    intervaloDeTroca = setInterval(trocaFoto, TEMPO_ENTRE_FOTOS);
                    trocaFoto();
                }
            }, 300);
        });

        // Quando tira o mouse, volta pra foto original imediatamente
        divDaImagem.addEventListener('mouseleave', () => {
            voltarParaImagemOriginal();
        });
    }

    // 7. Função principal que configura tudo
    async function configuraTodosOsSliders() {
        if (!sliderAtivado) return; // Não configura se o slider estiver desativado

        const todasAsObras = document.querySelectorAll('div.obra');

        for (const obra of todasAsObras) {
            try {
                const linkDaObra = obra.querySelector('a.router-link');
                if (!linkDaObra) continue;

                const url = linkDaObra.getAttribute('href');
                const idDaObra = pegaIdDaObra(url);
                if (!idDaObra) continue;

                const divDaImagem = obra.querySelector('div.imagem.bg');
                if (!divDaImagem) continue;

                const tagEmAndamento = divDaImagem.querySelector('span.badge.badge-primary');
                if (!tagEmAndamento || tagEmAndamento.textContent.trim() !== 'Em andamento') continue;

                obra.setAttribute('data-id', idDaObra);

                // Não configura duas vezes a mesma obra
                if (divDaImagem.hasAttribute('data-hover-setup')) continue;
                divDaImagem.setAttribute('data-hover-setup', 'true');

                const fotosDaGaleria = await buscaFotosDaAPI(idDaObra);

                if (fotosDaGaleria.length > 0) {
                    configuraEfeitoHover(divDaImagem, fotosDaGaleria);
                }
            } catch (erro) {
                console.error(`[ScriptDeSliderDasObras-diogo-RDO-dev-0.8] ERRO ao configurar obra:`, erro);
            }
        }
    }

    // 8. Configura pra funcionar mesmo quando muda de página (SPA)
    function configuraNavegacao() {
        if (jaInicializou) return;
        jaInicializou = true;

        if (!pegaTokenDaAPI()) {
            console.error('[ScriptDeSliderDasObras-diogo-RDO-dev-0.8] Sem token, não dá pra iniciar');
            return;
        }

        function estamosNaPaginaDeObras() {
            return window.location.href.includes('/app/obras');
        }

        function processaObras() {
            if (!estamosNaPaginaDeObras()) return;
            configuraTodosOsSliders();
        }

        // Primeira verificação
        processaObras();

        // Acampanha as mudanças de página pra não ficar procurando por obra atoa
        window.addEventListener('popstate', processaObras);
        window.addEventListener('hashchange', processaObras);

        // Fica de olho em mudanças na página, mas só processa se estiver na página certa
        const observador = new MutationObserver((mutacoes) => {
            if (estamosNaPaginaDeObras() && mutacoes.some(mutacao => mutacao.addedNodes.length)) {
                processaObras();
            }
        });

        observador.observe(document.body, { childList: true, subtree: true });
    }

    // 9. Inicia tudo
    function inicializa() {
        if (!sliderAtivado) return; // Não inicia se o slider estiver desativado
        configuraNavegacao();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        chrome.storage.sync.get(['obrasSlider'], function(result) {
            sliderAtivado = result.obrasSlider !== undefined ? result.obrasSlider : true;
            if (sliderAtivado) {
                inicializa();
            }
        });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            chrome.storage.sync.get(['obrasSlider'], function(result) {
                sliderAtivado = result.obrasSlider !== undefined ? result.obrasSlider : true;
                if (sliderAtivado) {
                    inicializa();
                }
            });
        });
    }
})();