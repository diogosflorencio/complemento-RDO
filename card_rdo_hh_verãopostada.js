function identificaRelatorioRDO() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    const nomeObra = document.querySelector('tr td[colspan="3"]')?.textContent || '';
    const datalhesRelatorio = document.querySelector(".card-header h4"); // Essa tag só aparce quando o RDO está no modo de edição

    if (titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && nomeObra.includes('HH') && datalhesRelatorio) {
        return true;
    } else {
        return false;
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

// Função para exibir dados dos funcionários
function exibirDadosFuncionarios() {
    const intervaloVerificacao = setInterval(() => {
        if (identificaRelatorioRDO()) { // Verifica se é RDO
            const linhas = document.querySelectorAll('table tbody tr');
            const containerDados = document.getElementById('containerDados');
            const mensagemCarregando = document.getElementById('mensagemCarregando');

            if (linhas.length > 0) {
                clearInterval(intervaloVerificacao);
                mensagemCarregando.style.display = 'none';

                // Função de conversão usando a função split pra separar a string de horas em duas por meio dos dois pontos 
                function converterTempoParaDecimal(tempoStr) {
                    if (!tempoStr) return 0;
                    const [horas, minutos] = tempoStr.split(':');
                    return parseFloat(horas) + parseFloat(minutos) / 60;
                }

                const totaisPorFuncao = {};

                // Apenas para deixar cada letra inicial das palavras da função em maiuscula
                function capitalize(str) {
                    return str.split(' ') // separa cada palavra da strip completa
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // faz um map na separação feita e, usando a função/metodo toUpperCase() e toLowerCase(), deixa a primeira e ultima letra maiuscula e minuscula respectivamente
                        .join(' ');
                }
                // pega cada linha da lista na table de horas trabalhas
                linhas.forEach(linha => {
                    const funcao = capitalize(linha.querySelector('td:nth-child(2)')?.textContent?.trim() || ''); // Joga cada função na função capitalize
                    const horasTrabalhadas = linha.querySelector('.horas-trabalhadas span')?.textContent || ''; // pega cada hora de cada função
                    const diaDaSemana = pegaDiaSemana(); // pega o dia da semana
                    const ehFimDeSemana = diaDaSemana.includes('Sábado') || diaDaSemana.includes('Domingo'); // verifica se é fim de semana

                    if (funcao) {
                        const horasDecimal = converterTempoParaDecimal(horasTrabalhadas); // Passa todas as horas da table (a cada iteração) para a função de conversão para decimal e salva em horasDecimal
                        if (horasDecimal > 0) {
                            const funcaoKey = ehFimDeSemana ? `${funcao} K2` : funcao; // se for fim de semana, a função será mostrada com K2. Salva todas as funções na funcaoKey (um por vez), que basicamente servirá como base pra fazer a soma total (se a função for igual)
                            totaisPorFuncao[funcaoKey] = (totaisPorFuncao[funcaoKey] || 0) + horasDecimal; // totais por função é colocado na variavel totaisPorFuncao onde o index é funcaoKey que é exatamente o nome da função
                        }
                    } // !!!!!!!!!!!!!!!!!!!!!!!!!!!! preciso trocar a forma como somo cada hora em sua função pra possibilitar a aplicação de mais regras de hora extra
                });

                Object.entries(totaisPorFuncao)
                    .filter(([_, total]) => total > 0)
                    .forEach(([funcao, total]) => {
                        const divFuncao = document.createElement('div');
                        divFuncao.className = 'cartao-funcao';
                        divFuncao.style.cssText = `
                            padding: 10px;
                            margin: 8px 0;
                            background: #f7f9fc;
                            border-left: 4px solid #1d5b50;
                            border-radius: 4px;
                            font-size: 14px;
                        `;
                        divFuncao.innerHTML = `<strong>${funcao}:</strong> ${total.toFixed(2)} horas`;
                        containerDados.appendChild(divFuncao);
                    });

                const totalGeral = Object.values(totaisPorFuncao).reduce((acc, curr) => acc + curr, 0);
                const divTotal = document.createElement('div');
                divTotal.className = 'cartao-total';
                divTotal.style.cssText = `
                    margin-top: 15px;
                    margin-bottom: 5px;
                    padding: 12px;
                    background: #1d5b50;
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
        } else {
            const containerExistente = document.querySelector('.container');
            if (containerExistente) {
            }
        }
    }, 0);

    setTimeout(() => {
        clearInterval(intervaloVerificacao);
        document.getElementById('mensagemCarregando').textContent = 'Por alguma razão as horas não puderam ser carregadas';
    }, 1000);
}

function criarContainer() {
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
        <div class="container" style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 99999;
            width: 300px;
            background: rgb(255,255,255,1);
            padding: 20px;
            border-radius: 8px;
            border: solid 2px black;
            box-shadow: 4px 4px rgb(0, 0, 0);
            font-family: Arial, sans-serif;
            transition: height 0.3s ease;
        ">
            <div class="wrapper-container" style="
                position: absolute;
                z-index: 99999;
                top: 3px;
                left: 15px;
                width: 25px;
                margin: 0px;
                padding: 0px;
                color: #1d5b50;
                cursor: pointer;
            "><svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s ease;"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="#1d5b50"></path></svg></div>
            <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 15px 0 5px 0; color:#1d5b50;">Horas/Função</h3>
                <button id="botaoCopiar" style="
                    padding: 5px 10px;
                    background: #1d5b50;
                    color: white;
                    cursor: pointer;
                    font-size: 12px;
                    border-radius: 8px;
                    border: solid 2px black;
                    box-shadow: 2px 2px rgb(0, 0, 0);
                    margin: 5px 0 15px 0;
                    outline: none;
                ">
                    Copiar
                </button>
            </div>
            <div id="mensagemCarregando" style="color: #7f8c8d;">pegando os dados do RDO...</div>
            <div id="containerDados" style="
                margin-top: 10px;
                max-height: 300px;
                overflow-y: auto;
                padding-right: 10px;">
            </div>
        </div>
        `;

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
            // Apply initial state
            if (isCollapsed) {
                applyCollapsedState();
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

        const botaoCopiar = document.getElementById('botaoCopiar');
        if (botaoCopiar) {
            botaoCopiar.addEventListener('click', copiarDados);
        }

        return container;
    } catch (error) {
        console.log('Container creation failed:', error);
        return null;
    }
}



// Função para copiar dados
function copiarDados() {
    const containerDados = document.getElementById('containerDados');
    let textoCopia = "RESUMO DE HORAS\n\n";

    const cartoesFuncao = containerDados.getElementsByClassName('cartao-funcao');
    Array.from(cartoesFuncao).forEach(cartao => {
        textoCopia += cartao.textContent + "\n";
    });

    const cartaoTotal = containerDados.getElementsByClassName('cartao-total')[0];
    if (cartaoTotal) {
        textoCopia += "\n" + cartaoTotal.textContent;
    }

    navigator.clipboard.writeText(textoCopia).then(() => {
        const botaoCopiar = document.getElementById('botaoCopiar');
        botaoCopiar.textContent = 'Copiado!';
        botaoCopiar.style.background = '#2c7f7c';
        setTimeout(() => {
            botaoCopiar.textContent = 'Copiar';
            botaoCopiar.style.background = '#1d5b50';
        }, 2000);
    });
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
