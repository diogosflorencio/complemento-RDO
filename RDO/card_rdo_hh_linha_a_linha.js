// card_rdo_hh_linha_a_linha.js - NOVO WORKFLOW

// Identifica se está em um RDO de HH
function identificaRelatorioRDO_HH() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    const nomeObra = document.querySelector('tr td[colspan="3"]')?.textContent || '';
    const datalhesRelatorio = document.querySelector(".card-header h4");
    return !!(titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && datalhesRelatorio && nomeObra.includes('HH'));
}

// Utilitário para persistir e recuperar CSV do localStorage
const CSV_STORAGE_KEY = 'csv_hh_linha_a_linha';
const REVISADOS_KEY = 'csv_hh_linha_a_linha_revisados';

function salvarCSVLocal(csv) {
    localStorage.setItem(CSV_STORAGE_KEY, csv);
}
function lerCSVLocal() {
    return localStorage.getItem(CSV_STORAGE_KEY) || '';
}
function salvarRevisados(revisados) {
    localStorage.setItem(REVISADOS_KEY, JSON.stringify(revisados));
}
function lerRevisados() {
    try {
        return JSON.parse(localStorage.getItem(REVISADOS_KEY)) || [];
    } catch {
        return [];
    }
}

// Parseia o relatório de colaboradores no formato da CONAMI
function parseCSVColaboradores(csv) {
    const linhas = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const colaboradores = {};
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Busca por linhas que contêm ID e nome do colaborador
        // Formato: "    11127,ABDIEL MILAGRE GAMBINE"
        const matchColaborador = linha.match(/^\s*(\d+),(.+)$/);
        
        if (matchColaborador) {
            const id = matchColaborador[1].trim();
            const nome = matchColaborador[2].trim();
            
            // Procura pela linha de marcações nas próximas linhas
            // Busca por linha que contém data, dia da semana e horários
            for (let j = i + 1; j < Math.min(i + 5, linhas.length); j++) {
                const linhaMarcacao = linhas[j];
                
                // Formato: "10/12,Ter, 06:29 11:00 12:00 16:14,001,Trabalhando,   008:48"
                const matchMarcacao = linhaMarcacao.match(/^\d{2}\/\d{2},\w+,\s*([^,]+),/);
                
                if (matchMarcacao) {
                    const horariosStr = matchMarcacao[1].trim();
                    const horarios = horariosStr.split(/\s+/).filter(h => h.match(/^\d{2}:\d{2}$/));
                    
                    if (horarios.length >= 4) {
                        const entrada = horarios[0] || '';
                        const intervaloIni = horarios[1] || '';
                        const intervaloFim = horarios[2] || '';
                        const saida = horarios[3] || '';
                        
                        // Calcula intervalo em minutos
                        let intervalo = calcularIntervalo(entrada, intervaloIni, intervaloFim, saida);
                        
                        colaboradores[nome] = {
                            id,
                            entrada,
                            intervaloIni,
                            intervaloFim,
                            saida,
                            intervalo
                        };
                    } else if (horarios.length >= 2) {
                        // Casos com menos horários (saída antecipada, etc.)
                        const entrada = horarios[0] || '';
                        const ultimoHorario = horarios[horarios.length - 1] || '';
                        
                        colaboradores[nome] = {
                            id,
                            entrada,
                            intervaloIni: horarios[1] || '',
                            intervaloFim: horarios[2] || '',
                            saida: ultimoHorario,
                            intervalo: horarios.length < 4 ? 'Incompleto' : ''
                        };
                    }
                    break; // Encontrou a marcação, sai do loop interno
                }
            }
        }
    }
    
    return colaboradores;
}

// Função auxiliar para calcular o intervalo
function calcularIntervalo(entrada, intervaloIni, intervaloFim, saida) {
    if (!entrada || !intervaloIni || !intervaloFim || !saida) {
        return '';
    }
    
    try {
        const [hEnt, mEnt] = entrada.split(':').map(Number);
        const [hSai, mSai] = saida.split(':').map(Number);
        const [hIntIni, mIntIni] = intervaloIni.split(':').map(Number);
        const [hIntFim, mIntFim] = intervaloFim.split(':').map(Number);
        
        let minEntrada = hEnt * 60 + mEnt;
        let minSaida = hSai * 60 + mSai;
        let minIntIni = hIntIni * 60 + mIntIni;
        let minIntFim = hIntFim * 60 + mIntFim;
        
        // Ajusta para casos onde o horário cruza a meia-noite
        if (minSaida < minEntrada) minSaida += 24 * 60;
        if (minIntFim < minIntIni) minIntFim += 24 * 60;
        
        // Verifica se o expediente é muito curto (menos de 4h30)
        if ((minSaida - minEntrada) < 270) {
            return '00:00';
        }
        
        // Calcula o intervalo
        const minIntervalo = minIntFim - minIntIni;
        const horas = Math.floor(minIntervalo / 60);
        const minutos = minIntervalo % 60;
        
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    } catch (error) {
        return 'Erro';
    }
}

// Busca os colaboradores do DOM
function getColaboradoresDOM() {
    // Considera apenas quem está dentro de #rdo-maodeobra
    const rdoMaoDeObra = document.querySelector('#rdo-maodeobra');
    if (!rdoMaoDeObra) return [];
    const linhas = rdoMaoDeObra.querySelectorAll('table.table tbody tr');
    const colaboradores = [];
    linhas.forEach(linha => {
        const nomeTd = linha.querySelector('td');
        const nome = nomeTd?.childNodes[0]?.textContent?.trim() || '';
        const funcao = linha.querySelector('td:nth-child(2)')?.textContent?.trim() || '';
        const entrada = linha.querySelector('input[name="hInicio"]')?.value || '';
        const saida = linha.querySelector('input[name="hFim"]')?.value || '';
        const intervalo = linha.querySelector('input[name="horasIntervalo"]')?.value || '';
        const horasTrabalhadas = linha.querySelector('.horas-trabalhadas span')?.textContent?.trim() || '';
        colaboradores.push({
            nome,
            funcao,
            entrada,
            saida,
            intervalo,
            horasTrabalhadas,
            linha
        });
    });
    return colaboradores;
}

// Aplica as horas do CSV no DOM
function aplicarHorasNoDOM(colab, dadosCSV) {
    if (!dadosCSV) return;
    // Preenche os campos
    if (colab.linha.querySelector('input[name="hInicio"]'))
        colab.linha.querySelector('input[name="hInicio"]').value = dadosCSV.entrada || '';
    if (colab.linha.querySelector('input[name="hFim"]'))
        colab.linha.querySelector('input[name="hFim"]').value = dadosCSV.saida || '';
    if (colab.linha.querySelector('input[name="horasIntervalo"]')) {
        // Se houver intervalo de início e fim, calcula diferença, senão usa o campo do CSV
        let intervalo = '';
        if (dadosCSV.intervaloIni && dadosCSV.intervaloFim) {
            // Calcula diferença em minutos
            const [h1, m1] = dadosCSV.intervaloIni.split(':').map(Number);
            const [h2, m2] = dadosCSV.intervaloFim.split(':').map(Number);
            let min = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (min < 0) min += 24 * 60;
            intervalo = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
        } else {
            intervalo = colab.linha.querySelector('input[name="horasIntervalo"]').value;
        }
        colab.linha.querySelector('input[name="horasIntervalo"]').value = intervalo;
    }
    // Dispara eventos para simular digitação
    ['hInicio', 'hFim', 'horasIntervalo'].forEach(name => {
        const input = colab.linha.querySelector(`input[name="${name}"]`);
        if (input) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

let containerCriadoLinhaALinha = false;

function criarContainerLinhaALinha() {
    if (!identificaRelatorioRDO_HH()) return null;
    if (containerCriadoLinhaALinha) return null;
    const existente = document.querySelector('.conteiner_hora_linhaalinha');
    if (existente) return existente;
    // Remove container antigo se existir
        const container = document.createElement('div');
    container.className = 'conteiner_hora_linhaalinha';
    container.style = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        width: 380px;
        max-width: 95vw;
        max-height: 90vh;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid black;
        box-shadow: 4px 4px #000;
        font-family: Arial, sans-serif;
        transition: height 0.3s;
        overflow-y: auto;
    `;
    let csvSalvo = lerCSVLocal();
    let revisados = lerRevisados();
    let dadosCSV = csvSalvo ? parseCSVColaboradores(csvSalvo) : {};
    // Colapso
    let isCollapsed = localStorage.getItem('rdoLinhaALinhaWrapperState') === 'collapsed';
        container.innerHTML = `
        <div class="wrapper-container-linhaalinha" style="position: absolute; z-index: 99999; top: 3px; left: 15px; width: 25px; margin: 0px; padding: 0px; color: #1d5b50; cursor: pointer;">
            <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(${isCollapsed ? 180 : 0}deg);">
                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="#1d5b50"></path>
        </svg>
    </div>
    <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="margin: 15px 0px 5px; color: #1d5b50; font-size: 22px; font-weight: 550;">REVISÃO DE HORAS (ponto)</div>
    </div>
        <div id="csvInputAreaLinhaALinha"></div>
        <div id="csvStatusLinhaALinha" style="font-size: 12px; color: #888; margin-bottom: 10px;"></div>
        <div id="listaColaboradoresLinhaALinha" style="max-height: 38vh; overflow-y: auto; padding-right: 10px;"></div>
    `;
        document.body.appendChild(container);

    // Colapso/expansão
    const wrapperContainer = container.querySelector('.wrapper-container-linhaalinha');
        const svgArrow = wrapperContainer.querySelector('.down');
        function applyCollapsedState() {
        container.style.height = '30px';
        container.style.width = '30px';
        container.style.padding = '5px';
        container.style.overflow = 'hidden';
        container.style.borderRadius = '5px';
            svgArrow.style.transform = 'rotate(180deg)';
            wrapperContainer.style.position = 'absolute';
            wrapperContainer.style.left = '0';
            wrapperContainer.style.top = '0';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        }
        function applyExpandedState() {
        container.style.height = 'auto';
        container.style.width = '380px';
        container.style.padding = '20px';
        container.style.overflow = 'visible';
        container.style.borderRadius = '8px';
            svgArrow.style.transform = 'rotate(0deg)';
            wrapperContainer.style.position = 'absolute';
            wrapperContainer.style.left = '15px';
            wrapperContainer.style.top = '3px';
        }
            if (isCollapsed) {
                applyCollapsedState();
            } else {
                applyExpandedState();
            }
            wrapperContainer.addEventListener('click', () => {
                isCollapsed = !isCollapsed;
        localStorage.setItem('rdoLinhaALinhaWrapperState', isCollapsed ? 'collapsed' : 'expanded');
                if (isCollapsed) {
                    applyCollapsedState();
                } else {
                    applyExpandedState();
                }
            });

    const csvInputArea = container.querySelector('#csvInputAreaLinhaALinha');
    const statusCSV = container.querySelector('#csvStatusLinhaALinha');
    const listaColabs = container.querySelector('#listaColaboradoresLinhaALinha');

    function arredondarPonto(entrada, saida) {
        // Arredonda entrada para 06:30 se entre 06:00 e 06:30
        let entradaArred = entrada;
        let saidaArred = saida;
        if (/^06:(0[0-9]|1[0-9]|2[0-9]|30)$/.test(entrada)) {
            entradaArred = '06:30';
        }
        // Arredonda saída para 16:18 se entre 16:18 e 16:30
        if (/^16:(1[8-9]|2[0-9]|30)$/.test(saida)) {
            saidaArred = '16:18';
        }
        return { entradaArred, saidaArred };
    }

    function renderCSVInput() {
        csvInputArea.innerHTML = '';
        if (!csvSalvo) {
            // Input estilizado
            const label = document.createElement('label');
            label.textContent = 'Escolher arquivo de ponto';
            label.style = 'display:inline-block; margin-bottom:10px; padding:4px 12px; border-radius:8px; background:#1d5b50; color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:14px;';
            const inputCSV = document.createElement('input');
            inputCSV.type = 'file';
            inputCSV.accept = '.csv';
            inputCSV.style = 'display:none;';
            inputCSV.addEventListener('change', e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = evt => {
                    const csv = evt.target.result;
                    salvarCSVLocal(csv);
                    revisados = [];
                    salvarRevisados(revisados);
                    csvSalvo = csv;
                    dadosCSV = parseCSVColaboradores(csv);
                    statusCSV.textContent = 'Arquivo de ponto carregado!';
                    renderCSVInput();
                    atualizarLista();
                };
                reader.readAsText(file);
                // Corrige bug: reseta input para permitir novo upload igual
                e.target.value = '';
            });
            label.appendChild(inputCSV);
            label.addEventListener('click', () => inputCSV.click());
            csvInputArea.appendChild(label);
        } else {
            // Botão substituir estilizado
            const btnSubstituir = document.createElement('button');
            btnSubstituir.textContent = 'Substituir ponto';
            btnSubstituir.style = 'margin-bottom:10px; padding:4px 12px; border-radius:8px; background:#1d5b50; color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:14px;';
            btnSubstituir.addEventListener('click', () => {
                localStorage.removeItem(CSV_STORAGE_KEY);
                localStorage.removeItem(REVISADOS_KEY);
                csvSalvo = '';
                revisados = [];
                dadosCSV = {};
                statusCSV.textContent = 'Nenhum arquivo de ponto carregado.';
                renderCSVInput();
                atualizarLista();
            });
            csvInputArea.appendChild(btnSubstituir);
        }
    }

    function atualizarLista() {
        const colaboradores = getColaboradoresDOM();
        listaColabs.innerHTML = '';
        colaboradores.forEach(colab => {
            const normalizar = s => s.normalize('NFD').replace(/[^\w\s]/g, '').replace(/\s+/g, '').toLowerCase();
            const nomeColab = normalizar(colab.nome);
            let nomeCSV = Object.keys(dadosCSV).find(n => normalizar(n) === nomeColab);
            const dados = nomeCSV ? dadosCSV[nomeCSV] : null;
            const revisado = revisados.includes(colab.nome);
            let pontoArred = { entradaArred: '', saidaArred: '' };
            if (dados) {
                pontoArred = arredondarPonto(dados.entrada, dados.saida);
            }
            const div = document.createElement('div');
            div.style = `border: 1.5px solid #222; border-radius: 8px; margin-bottom: 7px; padding: 8px; background: ${revisado ? '#e0ffe0' : '#fff'}; box-shadow:2px 2px #000;`;
            // <span style=\"color:#888\">(${colab.funcao})</span>
            div.innerHTML = `
                <b>${colab.nome}</b> <br>
                <span style=\"font-size:12px;\">Horário padrão: <b>${colab.entrada}</b> | <b>${colab.saida}</b> | <b>${colab.intervalo}</b></span><br>
                <span style=\"font-size:12px;\">${dados ? `Horário do ponto: <b>${dados.entrada}</b> | <b>${dados.intervalo}</b> | <b>${dados.saida}</b>` : '<span style=\"color:#c00\">Não encontrado no relatório de ponto (faltou ou o nome do diariodeobra está diferente do csv)</span>'}</span><br>
                ${dados ? `<span style=\"font-size:12px; color:#1d5b50;\">Horário ajustado: <b>${pontoArred.entradaArred}</b> | <b>${dados.intervalo}</b> | <b>${pontoArred.saidaArred}</b></span><br>` : ''}
                <button class=\"btn-aplicar-horas\" style=\"margin-top:4px; padding:2px 8px; border-radius:8px; background:#1d5b50; color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:14px;\" ${revisado || !dados ? 'disabled' : ''}>Aplicar horas do ponto</button>
            `;
            const btn = div.querySelector('.btn-aplicar-horas');
            if (btn && !revisado && dados) {
                btn.addEventListener('click', () => {
                    // Aplica o ponto arredondado
                    aplicarHorasNoDOM(colab, {
                        entrada: pontoArred.entradaArred,
                        saida: pontoArred.saidaArred,
                        intervalo: dados.intervalo
                    });
                    revisados.push(colab.nome);
                    salvarRevisados(revisados);
                    atualizarLista();
                });
            }
            listaColabs.appendChild(div);
        });
    }

    renderCSVInput();
    atualizarLista();
    containerCriadoLinhaALinha = true;
    return container;
}

function removerContainerLinhaALinha() {
    const existente = document.querySelector('.conteiner_hora_linhaalinha');
    if (existente) existente.remove();
    containerCriadoLinhaALinha = false;
}

const observerLinhaALinha = new MutationObserver(() => {
    if (identificaRelatorioRDO_HH()) {
        criarContainerLinhaALinha();
    } else {
        removerContainerLinhaALinha();
    }
});
observerLinhaALinha.observe(document.body, { childList: true, subtree: true });

if (identificaRelatorioRDO_HH()) {
    criarContainerLinhaALinha();
}
