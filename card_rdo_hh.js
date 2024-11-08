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

function exibirDadosFuncionarios() {
    const intervaloVerificacao = setInterval(() => {
        if (identificaRelatorioRDO()) {
            const linhas = document.querySelectorAll('table tbody tr');
            const containerDados = document.getElementById('containerDados');
            const mensagemCarregando = document.getElementById('mensagemCarregando');

            if (linhas.length > 0) {
                clearInterval(intervaloVerificacao);
                mensagemCarregando.style.display = 'none';

                function capitalize(str) {
                    if (!str) return '';
                    return str.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                }

                function converterParaMinutos(hora) {
                    if (!hora) return 0;
                    const partes = hora.split(':');
                    if (partes.length !== 2) return 0;
                    const [h, m] = partes.map(Number);
                    return h * 60 + m;
                }

                function calcularHorasCategorizadas(horaEntrada, horaSaida, horaIntervalo, isFimDeSemana) {
                    const JORNADA_NORMAL = 528; // 8.8h
                    const LIMITE_K1 = 120; // 2h
                    const INICIO_NOTURNO = converterParaMinutos('22:00');
                    const FIM_NOTURNO = converterParaMinutos('05:00');
                    const INICIO_HORA_EXTRA_DIRETA = converterParaMinutos('16:00');
                    const FIM_HORA_EXTRA_DIRETA = converterParaMinutos('20:00');
                
                    let entrada = converterParaMinutos(horaEntrada);
                    let saida = converterParaMinutos(horaSaida);
                    let intervalo = converterParaMinutos(horaIntervalo);
                    
                    if (saida < entrada) saida += 24 * 60;
                
                    const totalMinutos = saida - entrada - intervalo;
                    let horasNormais = 0;
                    let horasK1 = 0;
                    let horasK2 = 0;
                    let horasK3 = 0;
                
                    // Check for special case: entry after 16:00 and before 20:00
                    const isHoraExtraDireta = entrada >= INICIO_HORA_EXTRA_DIRETA && 
                                             entrada <= FIM_HORA_EXTRA_DIRETA && 
                                             saida <= FIM_HORA_EXTRA_DIRETA;
                
                    if (isFimDeSemana) {
                        horasK2 = totalMinutos;
                    } else if (isHoraExtraDireta) {
                        // Direct overtime calculation
                        horasK1 = Math.min(LIMITE_K1, totalMinutos);
                        if (totalMinutos > LIMITE_K1) {
                            horasK2 = totalMinutos - LIMITE_K1;
                        }
                    } else {
                        horasNormais = Math.min(JORNADA_NORMAL, totalMinutos);
                        if (totalMinutos > JORNADA_NORMAL) {
                            horasK1 = Math.min(LIMITE_K1, totalMinutos - JORNADA_NORMAL);
                            if (totalMinutos > JORNADA_NORMAL + LIMITE_K1) {
                                horasK2 = totalMinutos - JORNADA_NORMAL - LIMITE_K1;
                            }
                        }
                    }
                
                    let periodoAtual = entrada;
                    while (periodoAtual < saida) {
                        let horaAtual = periodoAtual % (24 * 60);
                        if ((horaAtual >= INICIO_NOTURNO) || (horaAtual < FIM_NOTURNO)) {
                            horasK3++;
                        }
                        periodoAtual++;
                    }
                
                    return {
                        normal: horasNormais / 60,
                        k1: horasK1 / 60,
                        k2: horasK2 / 60,
                        k3: horasK3 / 60
                    };
                }
                

                const totaisPorFuncao = {};

                linhas.forEach(linha => {
                    const funcao = capitalize(linha.querySelector('td:nth-child(2)')?.textContent?.trim() || '');
                    const horaEntrada = linha.querySelector('td.horario input[name="hInicio"]')?.value || '';
                    const horaSaida = linha.querySelector('td.horario input[name="hFim"]')?.value || '';
                    const horaIntervalo = linha.querySelector('td.horario-intervalo input[name="horasIntervalo"]')?.value || '0';
                    const diaDaSemana = pegaDiaSemana();
                    const ehFimDeSemana = diaDaSemana.includes('Sábado') || diaDaSemana.includes('Domingo');
                
                    console.log('Função:', funcao, 'Hora de Entrada:', horaEntrada, 'Hora de Saída:', horaSaida, 'Intervalo:', horaIntervalo);
                
                    if (funcao && horaEntrada && horaSaida) {
                        const horas = calcularHorasCategorizadas(horaEntrada, horaSaida, horaIntervalo, ehFimDeSemana);
                        
                        if (!totaisPorFuncao[funcao]) {
                            totaisPorFuncao[funcao] = {
                                normal: 0,
                                k1: 0,
                                k2: 0,
                                k3: 0
                            };
                        }

                        Object.keys(horas).forEach(categoria => {
                            totaisPorFuncao[funcao][categoria] += horas[categoria];
                        });
                    }
                });

                // Código para exibir os totais por função e total geral
                Object.entries(totaisPorFuncao).forEach(([funcao, horas]) => {
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

                    const horasDetalhadas = Object.entries(horas)
                        .filter(([_, valor]) => valor > 0)
                        .map(([tipo, valor]) => `${tipo.toUpperCase()}: ${valor.toFixed(2)}`)
                        .join(' | ');

                    divFuncao.innerHTML = `<strong>${funcao}:</strong> ${horasDetalhadas}`;
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
        }
    }, 1000); // Mudei o intervalo para 1000 ms como exemplo

    setTimeout(() => {
        clearInterval(intervaloVerificacao);
        document.getElementById('mensagemCarregando').textContent = 'Por alguma razão as horas não puderam ser carregadas';
    }, 10000); // Aumentei o tempo de espera para evitar a limpeza prematura
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
