function identificaRelatorioRDO() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    const nomeObra = document.querySelector('tr td[colspan="3"]')?.textContent || '';
    const datalhesRelatorio = document.querySelector(".card-header h4"); // Essa tag só aparce quando o RDO está no modo de edição serve pra apenas mostrar o card no momento certo

    if (titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && datalhesRelatorio && nomeObra.includes('HH')) { // condicionais pra fazer o dito a cima // 
        return true;
    } else {
        return false; // else quase que desnecessario
    }
}

// Função pra pegar o dia da semana de uma lista de ths
function pegaDiaSemana() {
    const thElementos = document.querySelectorAll('tr th');
    let diaDaSemana = '';

    thElementos.forEach(th => {
        if (th.textContent.includes("Dia da semana")) {
            const targetTd = th.nextElementSibling;
            if (targetTd && targetTd.tagName === 'TD') {
                diaDaSemana = targetTd.textContent.trim();
            }
        }
    });

    return diaDaSemana;
}

// função para exibir horas trabalhadas por função por funcionario (criando um card para isso)
function exibirDadosFuncionarios() {
    // Cria um intervalo de verificação que roda a cada 1 segundo
    const intervaloVerificacao = setInterval(() => {
        // Só executa se o relatório RDO estiver aberto
        if (identificaRelatorioRDO()) {
            // Seleciona elementos necessários
            const linhas = document.querySelectorAll('table tbody tr');
            const containerDados = document.getElementById('containerDados');
            const mensagemCarregando = document.getElementById('mensagemCarregando');
            const mensagemAviso = document.getElementById('mensagemAviso');

            // Verifica se a tabela tem linhas E se a mensagem de carregamento existe
            if (linhas.length > 0 && mensagemCarregando) {
                // Limpa o intervalo e esconde mensagem de carregamento
                clearInterval(intervaloVerificacao);
                mensagemCarregando.style.display = 'none';
                mensagemAviso.style.display = 'block';

                // função para capitalizar a primeira letra de cada palavra
                function capitalize(str) {
                    if (!str) return '';
                    const minusculas = ['de', 'da', 'do', 'das', 'dos', 'e'];

                    return str.toLowerCase().split(' ')
                        .map((word, index) => {
                            if (index === 0 || !minusculas.includes(word)) {
                                return word.charAt(0).toUpperCase() + word.slice(1);
                            }
                            return word;
                        })
                        .join(' ');
                }

                // função para converter tempo em horas para decimal
                function converterTempoParaDecimal(tempoStr) {
                    if (!tempoStr) return 0;
                    const [horas, minutos] = tempoStr.split(':').map(Number);
                    return parseFloat((horas + (minutos / 60)).toFixed(2));
                }

                function categorizaHoras(intervalo, horaEntrada, horaSaida, ehFimDeSemana) {
                    const JORNADA_NORMAL = 8.8; // Jornada padrão
                    const LIMITE_K1 = 2.0; // Máximo de 2 horas para K1
                    const INICIO_K1_OUTRA_OBRA = 16; // Início do K1 outra frente
                    const LIMITE_ENTRADA_K1_OUTRA_OBRA = 17; // Limite máximo para entrada do K1 outra frente
                    const LIMITE_SAIDA_K1_OUTRA_OBRA = 20; // Limite para saída do K1 outra frente
                    const INICIO_K3 = 22; // Início do noturno

                    let horas = {
                        hn: 0,
                        k1: 0,
                        k2: 0,
                        k3: 0
                    };

                    // Converter horaEntrada, horaSaida e intervalo para números decimais
                    const [entradaHora, entradaMinuto] = horaEntrada.split(':').map(Number);
                    const [saidaHora, saidaMinuto] = horaSaida.split(':').map(Number);
                    const [intervaloHora, intervaloMinuto] = intervalo.split(':').map(Number);

                    // Função para converter horas e minutos para decimal
                    const tempoDecimal = (h, m) => h + m / 60;

                    // Converter horas e minutos para decimal
                    let inicio = tempoDecimal(entradaHora, entradaMinuto);
                    let fim = tempoDecimal(saidaHora, saidaMinuto);
                    let intervaloDecimal = tempoDecimal(intervaloHora, intervaloMinuto);

                    if (fim < inicio) fim += 24; // Corrige para casos de virada do dia

                    // Calcular o total trabalhado
                    let totalTrabalhado = Number((fim - inicio - intervaloDecimal).toFixed(2));

                    // Verificar se é elegível para K1 de outra frente
                    const elegivelK1OutraFrente =
                        entradaHora >= 16 &&
                        entradaHora <= 17 &&
                        saidaHora >= 17 &&
                        saidaHora <= 20;
                        
                    console.log("é", elegivelK1OutraFrente)// isso deve me retornar true quando for um colaborador de outra frente indo fazer horas extras 

                    while (totalTrabalhado > 0) {
                        // K3 (noturno) - Primeira verificação pois é independente das outras regras
                        if (saidaHora >= INICIO_K3 || saidaHora <= 7) {
                            let horasAposK3;
                            if (saidaHora >= INICIO_K3) {
                                horasAposK3 = (saidaHora - INICIO_K3) + (saidaMinuto / 60);
                            } else {
                                horasAposK3 = ((saidaHora + 24) - INICIO_K3) + (saidaMinuto / 60);
                            }
                            horas.k3 = Math.min(horasAposK3, 7);
                        }
                    
                        // Jornada normal (apenas se não for K1 outra frente)
                        if (horas.hn < JORNADA_NORMAL && !elegivelK1OutraFrente) {
                            const restanteNormal = Math.min(totalTrabalhado, JORNADA_NORMAL - horas.hn);
                            horas.hn += restanteNormal;
                            totalTrabalhado -= restanteNormal;
                            inicio += restanteNormal;
                            continue;
                        }
                    
                        // K1 (regular ou outra frente)
                        if (horas.k1 < LIMITE_K1 && totalTrabalhado > 0) {
                            const restanteK1 = Math.min(totalTrabalhado, LIMITE_K1 - horas.k1);
                            horas.k1 += restanteK1;
                            totalTrabalhado -= restanteK1;
                            inicio += restanteK1;
                            continue;
                        }
                    
                        // K2 (todas as horas extras restantes)
                        horas.k2 += totalTrabalhado;
                        break;
                    }
                    
                    return horas;
                    
                }



                const totaisPorFuncao = {};

                linhas.forEach(linha => {
                    const funcao = capitalize(linha.querySelector('td:nth-child(2)')?.textContent?.trim() || '');
                    const horasTotais = linha.querySelector('.horas-trabalhadas span')?.textContent?.trim() || '';
                    const horaEntrada = linha.querySelector('td.horario input[name="hInicio"]')?.value || '';
                    const horaSaida = linha.querySelector('td.horario input[name="hFim"]')?.value || '';



                    const intervalo = linha.querySelector('input[name="horasIntervalo"]')?.value || '00:00';



                    const diaDaSemana = pegaDiaSemana();
                    const ehFimDeSemana = diaDaSemana.includes('Sábado') || diaDaSemana.includes('Domingo');

                    if (funcao && horasTotais) {
                        const horasDecimal = converterTempoParaDecimal(horasTotais);

                        if (!totaisPorFuncao[funcao]) {
                            totaisPorFuncao[funcao] = {
                                hn: 0,
                                k1: 0,
                                k2: 0,
                                k3: 0
                            };
                        }

                        const horasCategorizadas = categorizaHoras(intervalo, horaEntrada, horaSaida, ehFimDeSemana);

                        // Converte HN e K1 para K2 se for fim de semana
                        if (ehFimDeSemana) {
                            horasCategorizadas.k2 += horasCategorizadas.hn + horasCategorizadas.k1;
                            horasCategorizadas.hn = 0;
                            horasCategorizadas.k1 = 0;
                        }

                        Object.keys(horasCategorizadas).forEach(categoria => {
                            totaisPorFuncao[funcao][categoria] += horasCategorizadas[categoria];
                        });
                    }
                });

                // Cria arrays para cada tipo de hora
                const listaHoras = [];

                Object.entries(totaisPorFuncao).forEach(([funcao, horas]) => {
                    Object.entries(horas).forEach(([tipo, valor]) => {
                        if (valor > 0) {
                            listaHoras.push({ funcao, tipo, valor });
                        }
                    });
                });

                // Mapeamento de cores para diferentes tipos de hora
                const coresPorTipo = {
                    'hn': '#1d5b50',  // verde original
                    'k1': '#2980b9',  // azul
                    'k2': '#c0392b',  // vermelho
                    'k3': '#8e44ad',  // roxo
                    'k4': '#d35400'   // laranja
                };

                // Ordena e exibe os itens
                listaHoras.forEach(item => {
                    const divFuncao = document.createElement('div');
                    divFuncao.className = 'cartao-funcao';
                    divFuncao.style.cssText = `
                    padding: 10px;
                    margin: 8px 0;
                    background: #f7f9fc;
                    border-left: 4px solid ${coresPorTipo[item.tipo]};
                    border-radius: 4px;
                    font-size: 14px;
                `;

                    divFuncao.innerHTML = `<strong>${item.funcao} - ${item.tipo.toUpperCase()}: </strong>${item.valor.toFixed(2)} HH`;
                    containerDados.appendChild(divFuncao);
                });



                const totalGeral = Object.values(totaisPorFuncao)
                    .reduce((acc, horas) =>
                        acc + Object.values(horas).reduce((sum, val) => sum + val, 0), 0);

                const divTotal = document.createElement('div');
                divTotal.className = 'cartao-total';
                divTotal.style.cssText = `
                    margin-top: 15px;
                    margin-bottom: 5px;
                    padding: 12px;
                    background: var(--theme-color);
                    color: white;
                    font-weight: bold;
                    text-align: center;
                    border-radius: 8px;
                    border: solid 2px black;
                    box-shadow: 2px 2px rgb(0, 0, 0);
                `;
                divTotal.innerHTML = `Total Geral: ${totalGeral.toFixed(2)} horas`;
                containerDados.appendChild(divTotal);
            }
        }
    }, 100);
    setTimeout(() => {
        clearInterval(intervaloVerificacao);
        document.getElementById('mensagemCarregando').textContent = 'Por alguma razão as horas não puderam ser carregadas. Se o problema persistir, por favor, entre em contato comigo: diogosflorencio@gmail.com';
    }, 1000);
}
// muda cor quando o card surge
chrome.storage.sync.get('themeColor', (data) => {
    if (data.themeColor) {
        document.documentElement.style.setProperty('--theme-color', data.themeColor);
    }
});

// muda a cor do tema quando usuario escolhe
chrome.runtime.onMessage.addListener((message) => {
    if (message.themeColor) {
        document.documentElement.style.setProperty('--theme-color', message.themeColor);
    }
});

// função pra adicionar as atividades a partir das horas no campo de atividades avulsas
function addActivitiesFromHours() {
    const containerDados = document.getElementById('containerDados');
    const cartoesFuncao = containerDados.getElementsByClassName('cartao-funcao');

    async function addActivity(funcao, tipo, valor) {
        return new Promise((resolve) => {
            const addButton = document.querySelector('[data-target="#modalAtividadesAvulsaForm"]');
            addButton.click();

            // const modal = document.getElementById("modalAtividadesAvulsaForm");
            // modal.style.position = 'fixed';
            // modal.style.top = '-9999px';
            // modal.style.left = '-9999px';
            // modal.style.opacity = '0';


            setTimeout(() => {
                const form = document.querySelector('#modalAtividadesAvulsaForm form');
                const descricao = form.querySelector('textarea[name="descrica"]');

                const funcaoMap = {
                    "Pintor Jatista": "Jatista",
                    "Pintor de Rolo": "Pintor",
                    "Ajudante": "Ajudante",
                    "Encarregado de Pintura": "Encarregado",
                    "Técnico de Segurança do Trabalho": "Seguranca"
                };

                const funcaoFormatada = funcaoMap[funcao] || funcao;

                descricao.value = `${funcaoFormatada}_${tipo.toUpperCase()}`; // na proxima medição, deixar nome normal da função e apenas separar esse underline
                descricao.dispatchEvent(new Event('input', { bubbles: true }));

                const checkbox = form.querySelector('#producao');
                checkbox.click();
                setTimeout(() => {
                    const quantidade = form.querySelector('input[name="realizada"]');
                    const unidade = form.querySelector('input[name="unidade"]');
                    const status = form.querySelector('select[name="status"]');

                    quantidade.value = valor.toFixed(2);
                    unidade.value = "HH"; //tipo.toUpperCase();

                    status.value = status.options[0].value;


                    [quantidade, unidade, status].forEach(field => {
                        field.dispatchEvent(new Event('input', { bubbles: true }));
                        field.dispatchEvent(new Event('change', { bubbles: true }));
                    });


                    // salvaa o formulário
                    form.querySelector('.btn-success').click();

                    // fecha o modal
                    setTimeout(() => {
                        const modalBackdrop = document.querySelector('.modal-backdrop');
                        if (modalBackdrop) {
                            modalBackdrop.remove();
                        }
                        document.body.classList.remove('modal-open');
                        resolve();
                    }, 500);
                }, 100);
            }, 100);
        });
    }


    // essa função faz a adição das atividades de forma assíncrona para cada cartão de função
    async function processActivities() {
        for (const cartao of cartoesFuncao) {
            const texto = cartao.textContent;
            const [funcao, tipo, valor] = texto.match(/(.+) - (\w+): (\d+\.?\d*)/i).slice(1);
            await addActivity(funcao.trim(), tipo.toLowerCase(), parseFloat(valor));
            // um de cada vez
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    processActivities();
}

// verifica se o checkbox está ativo no popup pra criar ou nao o card/container
let cardRDOAtivo = true;

chrome.storage.sync.get('cardRDOHH', function (data) {
    cardRDOAtivo = data.cardRDOHH ?? true;
});

chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
    if ('cardRDOHH' in mensagem) {
        cardRDOAtivo = mensagem.cardRDOHH;
        if (!cardRDOAtivo) {
            const container = document.querySelector('.conteiner_hora');
            if (container) {
                container.remove();
                containerCriado = false;
            }
        } else if (identificaRelatorioRDO()) {
            const container = criarContainer();
            if (container) {
                containerCriado = true;
                reiniciarObservacaoTabela();
                atualizarDados();
            }
        }
    }
});


function criarContainer() {
    if (!cardRDOAtivo) return null;
    try {
        if (!identificaRelatorioRDO()) {
            return null;
        }

        const existingContainer = document.querySelector('.conteiner_hora');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.classList = "conteiner_hora";
        container.innerHTML = `
        <div class="container" style="position: fixed; bottom: 20px; left: 20px; z-index: 99999; width: 300px; background: rgb(255, 255, 255); padding: 20px; border-radius: 8px; border: 2px solid black; box-shadow: rgb(0, 0, 0) 4px 4px; font-family: Arial, sans-serif; transition: height 0.3s;">
    <div class="wrapper-container" style="position: absolute; z-index: 99999; top: 3px; left: 15px; width: 25px; margin: 0px; padding: 0px; color: var(--theme-color); cursor: pointer;">
        <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(180deg);">
            <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path>
        </svg>
    </div>
    <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="margin: 15px 0px 5px; color: var(--theme-color);font-size: 25px !important; font-weight: 550 !important">Horas/Função</div>
        <!-- Deslocando apenas o botão com margin-top -->
        <button id="botaoAdicionar" style="padding: 5px 10px; background: var(--theme-color); color: white; cursor: pointer; font-size: 12px; border-radius: 8px; border: solid 2px black; box-shadow: 2px 2px rgb(0, 0, 0); outline: none; height: 30px; margin-top: 5px;">Adicionar</button>
    </div>
    <p id="mensagemAviso" style="margin: 5px 0 5px 0; color:var(--theme-color); font-size: 0.70em; font-style: italic; display: none;">(Em teste)</p>
    <div id="mensagemCarregando" style="color: rgb(127, 140, 141); ">pegando os dados do RDO   
    
  <svg style="padding-bottom: 3px" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_d9Sa{transform-origin:center}.spinner_qQQY{animation:spinner_ZpfF 9s linear infinite}.spinner_pote{animation:spinner_ZpfF .75s linear infinite}@keyframes spinner_ZpfF{100%{transform:rotate(360deg)}}</style><path  fill="rgb(127, 140, 141)" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z" /><rect fill="rgb(127, 140, 141)" class="spinner_d9Sa spinner_qQQY" x="11" y="6" rx="1" width="2" height="7"/><rect fill="rgb(127, 140, 141)" class="spinner_d9Sa spinner_pote" x="11" y="11" rx="1" width="2" height="9"/></svg>
    
    </div>
    <div id="containerDados" style="margin-top: 10px; max-height: 300px; overflow-y: auto; padding-right: 10px; color: inherit;"></div>
        </div>`;

        document.body.appendChild(container);

        let isCollapsed = localStorage.getItem('rdoWrapperState') === 'collapsed';
        const wrapperContainer = container.querySelector('.wrapper-container');
        const containerElement = container.querySelector('.container');
        const svgArrow = wrapperContainer.querySelector('.down');

        function applyCollapsedState() {
            containerElement.style.height = '30px';
            containerElement.style.width = '30px';
            containerElement.style.padding = '5px';
            containerElement.style.overflow = 'hidden';
            containerElement.style.borderRadius = '5px';
            svgArrow.style.transform = 'rotate(180deg)';
            wrapperContainer.style.position = 'absolute';
            wrapperContainer.style.left = '0';
            wrapperContainer.style.top = '0';
            containerElement.style.alignItems = 'center';
            containerElement.style.justifyContent = 'center';
        }

        function applyExpandedState() {
            containerElement.style.height = 'auto';
            containerElement.style.width = '300px';
            containerElement.style.padding = '20px';
            containerElement.style.overflow = 'visible';
            containerElement.style.borderRadius = '8px';
            svgArrow.style.transform = 'rotate(0deg)';
            wrapperContainer.style.position = 'absolute';
            wrapperContainer.style.left = '15px';
            wrapperContainer.style.top = '3px';
        }

        if (wrapperContainer && containerElement && svgArrow) {
            if (isCollapsed) {
                applyCollapsedState();
            } else {
                applyExpandedState();
            }

            wrapperContainer.addEventListener('click', () => {
                isCollapsed = !isCollapsed;
                localStorage.setItem('rdoWrapperState', isCollapsed ? 'collapsed' : 'expanded');

                if (isCollapsed) {
                    applyCollapsedState();
                } else {
                    applyExpandedState();
                }
            });
        }

        const botaoAdicionar = document.getElementById('botaoAdicionar');
        if (botaoAdicionar) {
            botaoAdicionar.addEventListener('click', () => {
                addActivitiesFromHours();

                // Visual feedback
                botaoAdicionar.textContent = 'Adicionado!';
                botaoAdicionar.style.background = 'color-mix(in srgb, var(--theme-color) 70%, #ffffff)';

                setTimeout(() => {
                    botaoAdicionar.textContent = 'Adicionar';
                    botaoAdicionar.style.background = 'var(--theme-color)';
                }, 2000);
            });
        }

        return container;
    } catch (error) {
        console.log('Deu esse erro ao tentar criar o container do card:', error);
        return null;
    }
}

let containerCriado = false;
let updateTimeout = null;
let observerTabelaInstance = null;

function atualizarDados() {
    // Remove all existing containerDados before adding new one
    const containerDadosAntigos = document.querySelectorAll('#containerDados');
    containerDadosAntigos.forEach(container => container.innerHTML = '');

    // Get the first containerDados (should be the only one)
    const containerDados = document.getElementById('containerDados');
    if (containerDados) {
        exibirDadosFuncionarios();
    }
}

function reiniciarObservacaoTabela() {
    if (observerTabelaInstance) {
        observerTabelaInstance.disconnect();
    }

    const tabela = document.querySelector(".table.table-hover.table-sm");
    if (tabela) {
        observerTabelaInstance = new MutationObserver(() => {
            if (identificaRelatorioRDO()) {
                if (updateTimeout) {
                    clearTimeout(updateTimeout);
                }
                updateTimeout = setTimeout(() => {
                    atualizarDados();
                }, 0);
            }
        });

        observerTabelaInstance.observe(tabela, {
            subtree: true,
            characterData: true,
        });
    }
}

const observerRDO = new MutationObserver(() => {
    if (!containerCriado && identificaRelatorioRDO()) {
        const container = criarContainer();
        if (container) {
            containerCriado = true;
            reiniciarObservacaoTabela();
            atualizarDados();
        }
    }
});

observerRDO.observe(document.body, {
    childList: true,
    subtree: true
});

const observernaoRDO = new MutationObserver(() => {
    if (containerCriado && !identificaRelatorioRDO()) {
        const container = document.querySelector('.conteiner_hora');
        if (container) {
            container.remove();
            containerCriado = false;
            if (observerTabelaInstance) {
                observerTabelaInstance.disconnect();
                observerTabelaInstance = null;
            }
        }
    }
});

observernaoRDO.observe(document.body, {
    childList: true,
    subtree: true
});


if (identificaRelatorioRDO()) {
    const container = criarContainer();
    if (container) {
        containerCriado = true;
        reiniciarObservacaoTabela();
        atualizarDados();
    }
}
