// card_rdo_hh_linha_a_linha.js - VERSÃO FINAL

// Identifica se está em um RDO de HH
async function identificaRelatorioRDO_HH() {
    const titulo = document.querySelector('td.rdo-title h5 b');
    const nomeObra = document.querySelector('tr td[colspan="3"]')?.textContent || '';
    const datalhesRelatorio = document.querySelector(".card-header h4");

    if (titulo && titulo.textContent.includes('Relatório Diário de Obra (RDO)') && datalhesRelatorio) {
        // Verifica se o servidor está disponível para funcionalidades
        const available = await isServerAvailable();
        if (!available) {
            console.log('Servidor indisponível - funcionalidades de RDO HH não executadas');
            return false;
        }
        return true;
    }
    return false;
}

// Utilitário para persistir e recuperar dados do localStorage com encoding correto
const CSV_STORAGE_KEY = 'csv_hh_linha_a_linha';
const REVISADOS_KEY = 'csv_hh_linha_a_linha_revisados';
const UTILIZADOS_KEY = 'csv_hh_linha_a_linha_utilizados';

// Função para salvar dados com encoding UTF-8 preservado
function salvarCSVLocal(csv) {
    try {
        // Converte para base64 para preservar caracteres especiais
        const encodedCSV = btoa(unescape(encodeURIComponent(csv)));
        localStorage.setItem(CSV_STORAGE_KEY, encodedCSV);
    } catch (error) {
        console.error('Erro ao salvar CSV:', error);
        // Fallback: salva diretamente
        localStorage.setItem(CSV_STORAGE_KEY, csv);
    }
}

function lerCSVLocal() {
    try {
        const encodedCSV = localStorage.getItem(CSV_STORAGE_KEY);
        if (!encodedCSV) return '';
        
        // Tenta decodificar do base64
        try {
            return decodeURIComponent(escape(atob(encodedCSV)));
        } catch {
            // Se falhar, assume que foi salvo diretamente
            return encodedCSV;
        }
    } catch (error) {
        console.error('Erro ao ler CSV:', error);
        return '';
    }
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

function salvarUtilizados(utilizados) {
    localStorage.setItem(UTILIZADOS_KEY, JSON.stringify(utilizados));
}

function lerUtilizados() {
    try {
        return JSON.parse(localStorage.getItem(UTILIZADOS_KEY)) || [];
    } catch {
        return [];
    }
}

// Função melhorada para normalizar nomes para comparação
function normalizarNome(nome) {
    if (!nome) return '';
    
    return nome
        .normalize('NFD') // Decompõe caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
        .replace(/[^\w\s]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, ' ') // Normaliza espaços
        .trim()
        .toUpperCase();
}

// Função para criar variações do nome para busca
function criarVariacoesNome(nome) {
    const nomeBase = normalizarNome(nome);
    const variacoes = new Set([nomeBase]);
    
    // Adiciona variações comuns
    const palavras = nomeBase.split(' ');
    
    // Nome sem partículas (DE, DA, DO, DOS, DAS)
    const semParticulas = palavras.filter(p => !['DE', 'DA', 'DO', 'DOS', 'DAS'].includes(p));
    if (semParticulas.length !== palavras.length) {
        variacoes.add(semParticulas.join(' '));
    }
    
    // Apenas primeiro e último nome
    if (palavras.length > 2) {
        variacoes.add(`${palavras[0]} ${palavras[palavras.length - 1]}`);
    }
    
    // Primeiros dois nomes
    if (palavras.length > 1) {
        variacoes.add(`${palavras[0]} ${palavras[1]}`);
    }
    
    return Array.from(variacoes);
}

// Parseia o relatório de colaboradores no formato
function parseCSVColaboradores(csv) {
    const linhas = csv.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const colaboradores = {};
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Busca por linhas que contêm ID e nome do colaborador
        const matchColaborador = linha.match(/^\s*(\d+),(.+)$/);
        
        if (matchColaborador) {
            const id = matchColaborador[1].trim();
            const nomeOriginal = matchColaborador[2].trim();
            
            // Procura pela linha de marcações nas próximas linhas
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
                        
                        let intervalo = calcularIntervalo(entrada, intervaloIni, intervaloFim, saida);
                        
                        // Salva com o nome original preservado
                        colaboradores[nomeOriginal] = {
                            id,
                            entrada,
                            intervaloIni,
                            intervaloFim,
                            saida,
                            intervalo,
                            nomeNormalizado: normalizarNome(nomeOriginal),
                            variacoesNome: criarVariacoesNome(nomeOriginal)
                        };
                    } else if (horarios.length >= 2) {
                        const entrada = horarios[0] || '';
                        const ultimoHorario = horarios[horarios.length - 1] || '';
                        
                        colaboradores[nomeOriginal] = {
                            id,
                            entrada,
                            intervaloIni: horarios[1] || '',
                            intervaloFim: horarios[2] || '',
                            saida: ultimoHorario,
                            intervalo: horarios.length < 4 ? 'Incompleto' : '',
                            nomeNormalizado: normalizarNome(nomeOriginal),
                            variacoesNome: criarVariacoesNome(nomeOriginal)
                        };
                    }
                    break;
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
        
        if (minSaida < minEntrada) minSaida += 24 * 60;
        if (minIntFim < minIntIni) minIntFim += 24 * 60;
        
        if ((minSaida - minEntrada) < 270) {
            return '';
        }
        
        const minIntervalo = minIntFim - minIntIni;
        const horas = Math.floor(minIntervalo / 60);
        const minutos = minIntervalo % 60;
        
        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
    } catch (error) {
        return 'Erro';
    }
}

// Função melhorada para encontrar colaborador no CSV
function encontrarColaboradorCSV(nomeDOM, dadosCSV) {
    const nomeDOMNormalizado = normalizarNome(nomeDOM);
    const variacoesDOMNome = criarVariacoesNome(nomeDOM);
    
    // Busca exata primeiro
    for (const [nomeCSV, dados] of Object.entries(dadosCSV)) {
        if (dados.nomeNormalizado === nomeDOMNormalizado) {
            return { nomeCSV, dados };
        }
    }
    
    // Busca por variações do nome do DOM
    for (const variacaoDOM of variacoesDOMNome) {
        for (const [nomeCSV, dados] of Object.entries(dadosCSV)) {
            if (dados.variacoesNome.includes(variacaoDOM)) {
                return { nomeCSV, dados };
            }
        }
    }
    
    // Busca por similaridade (contém)
    for (const [nomeCSV, dados] of Object.entries(dadosCSV)) {
        for (const variacaoCSV of dados.variacoesNome) {
            for (const variacaoDOM of variacoesDOMNome) {
                if (variacaoCSV.includes(variacaoDOM) || variacaoDOM.includes(variacaoCSV)) {
                    return { nomeCSV, dados };
                }
            }
        }
    }
    
    return null;
}

// Busca os colaboradores do DOM
function getColaboradoresDOM() {
    const rdoMaoDeObra = document.querySelector('#rdo-maodeobra');
    if (!rdoMaoDeObra) return [];
    const linhas = rdoMaoDeObra.querySelectorAll('table.table tbody tr');
    const colaboradores = [];
    
    linhas.forEach(linha => {
        const nomeTd = linha.querySelector('td');
        let nome = nomeTd?.textContent?.trim() || '';
        
        // Remove "Mão de Obra Direta" do final do nome
        nome = nome.replace(/\s+Mão de Obra Direta\s*$/i, '');
        nome = nome.replace(/\s+Mão de Obra Indireta\s*$/i, '');
        
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
    
    if (colab.linha.querySelector('input[name="hInicio"]'))
        colab.linha.querySelector('input[name="hInicio"]').value = dadosCSV.entrada || '';
    if (colab.linha.querySelector('input[name="hFim"]'))
        colab.linha.querySelector('input[name="hFim"]').value = dadosCSV.saida || '';
    if (colab.linha.querySelector('input[name="horasIntervalo"]')) {
        let intervalo = '';
        // Referências de entrada/saída que serão aplicadas
        const entradaRef = (dadosCSV.entrada || '').trim() || colab.linha.querySelector('input[name="hInicio"]')?.value || '';
        const saidaRef = (dadosCSV.saida || '').trim() || colab.linha.querySelector('input[name="hFim"]').value || '';
        
        const temEntradaESaida = /^\d{2}:\d{2}$/.test(entradaRef) && /^\d{2}:\d{2}$/.test(saidaRef);
        if (temEntradaESaida) {
            const [hE, mE] = entradaRef.split(':').map(Number);
            const [hS, mS] = saidaRef.split(':').map(Number);
            let minE = hE * 60 + mE;
            let minS = hS * 60 + mS;
            if (minS < minE) minS += 24 * 60;
            const duracaoMin = minS - minE;
            
            // Se a duração total for menor que 270 min (4,5h), não deve haver intervalo
            if (duracaoMin < 270) {
                intervalo = '';
            } else if (dadosCSV.intervaloIni && dadosCSV.intervaloFim) {
                const [h1, m1] = dadosCSV.intervaloIni.split(':').map(Number);
                const [h2, m2] = dadosCSV.intervaloFim.split(':').map(Number);
                let min = (h2 * 60 + m2) - (h1 * 60 + m1);
                if (min < 0) min += 24 * 60;
                intervalo = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
            } else {
                intervalo = colab.linha.querySelector('input[name="horasIntervalo"]').value;
            }
        } else {
            intervalo = colab.linha.querySelector('input[name="horasIntervalo"]').value;
        }
        colab.linha.querySelector('input[name="horasIntervalo"]').value = intervalo;
    }
    
    // Dispara eventos para simular digitação
    ['hInicio', 'hFim', 'horasIntervalo'].forEach(name => {
        const input = colab.linha.querySelector(`input[name="${name}"]`);
        if (input) {
            input.value = input.value; // Garante que o valor está atualizado
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            input.focus();
            input.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    });
}

// Função para identificar colaboradores não utilizados
function getColaboradoresNaoUtilizados(dadosCSV, utilizados) {
    const naoUtilizados = [];
    
    for (const [nomeCSV, dados] of Object.entries(dadosCSV)) {
        if (!utilizados.includes(nomeCSV)) {
            naoUtilizados.push({
                nome: nomeCSV,
                entrada: dados.entrada,
                saida: dados.saida,
                intervalo: dados.intervalo
            });
        }
    }
    
    return naoUtilizados;
}

let containerCriadoLinhaALinha = false;

async function criarContainerLinhaALinha() {
    if (!(await identificaRelatorioRDO_HH())) return null;
    if (containerCriadoLinhaALinha) return null;
    const existente = document.querySelector('.conteiner_hora_linhaalinha');
    if (existente) return existente;
    
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
    let utilizados = lerUtilizados();
    let dadosCSV = csvSalvo ? parseCSVColaboradores(csvSalvo) : {};
    
    let isCollapsed = localStorage.getItem('rdoLinhaALinhaWrapperState') === 'collapsed';
    
    container.innerHTML = `
        <div class="wrapper-container-linhaalinha" style="position: absolute; z-index: 99999; top: 3px; left: 15px; width: 25px; margin: 0px; padding: 0px; color: var(--theme-color); cursor: pointer;">
            <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(${isCollapsed ? 180 : 0}deg);">
                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path>
        </svg>
    </div>
    <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="margin: 15px 0px 5px; color: var(--theme-color); font-size: 22px; font-weight: 550;">REVISÃO DE HORAS (ponto)</div>
    </div>
        <div id="csvInputAreaLinhaALinha" ></div>
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
        let entradaArred = entrada;
        let saidaArred = saida;
        if (/^06:(0[0-9]|1[0-9]|2[0-9]|30)$/.test(entrada)) {
            entradaArred = '06:30';
        }
        if (/^16:(1[8-9]|2[0-9]|30)$/.test(saida)) {
            saidaArred = '16:18';
        }
        return { entradaArred, saidaArred };
    }

    function renderCSVInput() {
        csvInputArea.innerHTML = '';
        if (!csvSalvo) {
            const label = document.createElement('label');
            label.textContent = 'Escolher arquivo de ponto';
            label.style = 'display:inline-block; margin-bottom:10px; padding:4px 12px; border-radius:8px; background:var(--theme-color); color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:14px;';
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
                    utilizados = [];
                    salvarRevisados(revisados);
                    salvarUtilizados(utilizados);
                    csvSalvo = csv;
                    dadosCSV = parseCSVColaboradores(csv);
                    statusCSV.textContent = 'Arquivo de ponto carregado!';
                    renderCSVInput();
                    atualizarLista();
                };
                reader.readAsText(file, 'UTF-8');
                e.target.value = '';
            });
            label.appendChild(inputCSV);
            csvInputArea.appendChild(label);
        } else {
            const containerBotoes = document.createElement('div');
            containerBotoes.style = 'display: flex; gap: 8px; margin-bottom: 10px; align-items:normal; height: 45px;';
            
            const btnSubstituir = document.createElement('button');
            btnSubstituir.textContent = 'Substituir ponto';
            btnSubstituir.style = 'padding: 4px 12px; border-radius: 8px; background: var(--theme-color); color: rgb(255, 255, 255); border: 2px solid black; box-shadow: rgb(0, 0, 0) 2px 2px; cursor: pointer; font-size: 14px; line-height: 1.2;';
            btnSubstituir.addEventListener('click', () => {
                localStorage.removeItem(CSV_STORAGE_KEY);
                localStorage.removeItem(REVISADOS_KEY);
                localStorage.removeItem(UTILIZADOS_KEY);
                csvSalvo = '';
                revisados = [];
                utilizados = [];
                dadosCSV = {};
                statusCSV.textContent = 'Nenhum arquivo de ponto carregado.';
                renderCSVInput();
                atualizarLista();
            });
            
            const btnCopiarRestantes = document.createElement('button');
            const naoUtilizados = getColaboradoresNaoUtilizados(dadosCSV, utilizados);
            const totalCSV = Object.keys(dadosCSV).length;
            btnCopiarRestantes.innerHTML = `Nomes restantes: <small style="font-size:10px;">${naoUtilizados.length}/${totalCSV}</small>`;
            // | Rev: ${revisados.length}
            // btnCopiarRestantes.style = 'padding:4px 8px; border-radius:8px; background:var(--theme-color); color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:12px; line-height:1.2;';
            btnCopiarRestantes.style = 'padding:4px 12px; border-radius:8px; background:var(--theme-color); color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:14px; line-height:1.2;';
            btnCopiarRestantes.addEventListener('click', () => {
                const naoUtilizados = getColaboradoresNaoUtilizados(dadosCSV, utilizados);
                if (naoUtilizados.length === 0) {
                    alert('Todo mundo do relatorio de ponto foi adicionado ao rdo');
                    return;
                }
                
                let texto = `COLABORADORES QUE NÃO APARECERAM NOS RDOs (${naoUtilizados.length}):\n\n`;
                naoUtilizados.forEach((colab, index) => {
                    texto += `${index + 1}. ${colab.nome}\n`;
                   
                });
                
                navigator.clipboard.writeText(texto).then(() => {
                    alert('Lista de nomes copiadas (nomes que n foram adicionados ao rdo)');
                }).catch(() => {
                    // Fallback para navegadores que não suportam clipboard API
                    const textarea = document.createElement('textarea');
                    textarea.value = texto;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    alert('Lista de nomes copiadas (nomes que n foram adicionados ao rdo)');
                });
            });
            
            const btnAdicionarTodos = document.createElement('button');
            const colaboradores = getColaboradoresDOM();
            const colaboradoresParaAdicionar = colaboradores.filter(colab => {
                const resultado = encontrarColaboradorCSV(colab.nome, dadosCSV);
                const dados = resultado?.dados;
                const revisado = revisados.includes(colab.nome);
                return dados && !revisado;
            });
            
            btnAdicionarTodos.innerHTML = `Adicionar todos (${colaboradoresParaAdicionar.length})`;
            btnAdicionarTodos.style = 'padding:4px 12px; border-radius:8px; background:var(--theme-color); color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:14px; line-height:1.2;';
            btnAdicionarTodos.addEventListener('click', async () => {
                if (colaboradoresParaAdicionar.length === 0) {
                    alert('Não tem ninguem pra adicionar');
                    return;
                }
                
                btnAdicionarTodos.disabled = true;
                btnAdicionarTodos.textContent = 'Adicionando...';
                
                for (let i = 0; i < colaboradoresParaAdicionar.length; i++) {
                    const colab = colaboradoresParaAdicionar[i];
                    const resultado = encontrarColaboradorCSV(colab.nome, dadosCSV);
                    const dados = resultado?.dados;
                    
                    if (dados) {
                        const pontoArred = arredondarPonto(dados.entrada, dados.saida);
                        aplicarHorasNoDOM(colab, {
                            entrada: pontoArred.entradaArred,
                            saida: pontoArred.saidaArred,
                            intervalo: dados.intervalo
                        });
                        revisados.push(colab.nome);
                        salvarRevisados(revisados);
                        
                        // Atualiza o progresso no botão
                        btnAdicionarTodos.textContent = `Adicionando... (${i + 1}/${colaboradoresParaAdicionar.length})`;
                        
                        // Aguarda 1 segundo antes da próxima adição
                        if (i < colaboradoresParaAdicionar.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 400));
                        }
                    }
                }
                
                // Atualiza a lista e o botão
                atualizarLista();
                renderCSVInput();
                btnAdicionarTodos.disabled = false;
                btnAdicionarTodos.textContent = 'Concluído!';
                
                setTimeout(() => {
                    const colaboradoresAtualizados = getColaboradoresDOM();
                    const colaboradoresParaAdicionarAtualizados = colaboradoresAtualizados.filter(colab => {
                        const resultado = encontrarColaboradorCSV(colab.nome, dadosCSV);
                        const dados = resultado?.dados;
                        const revisado = revisados.includes(colab.nome);
                        return dados && !revisado;
                    });
                    btnAdicionarTodos.innerHTML = `Adicionar todos (${colaboradoresParaAdicionarAtualizados.length})`;
                }, 2000);
            });
            
            containerBotoes.appendChild(btnSubstituir);
            containerBotoes.appendChild(btnCopiarRestantes);
            containerBotoes.appendChild(btnAdicionarTodos);
            csvInputArea.appendChild(containerBotoes);
        }
    }

    function atualizarLista() {
        const colaboradores = getColaboradoresDOM();
        listaColabs.innerHTML = '';
        
        colaboradores.forEach(colab => {
            const resultado = encontrarColaboradorCSV(colab.nome, dadosCSV);
            const dados = resultado?.dados;
            const nomeCSV = resultado?.nomeCSV;
            const revisado = revisados.includes(colab.nome);
            
            // Adiciona à lista de utilizados se encontrou no CSV
            if (nomeCSV && !utilizados.includes(nomeCSV)) {
                utilizados.push(nomeCSV);
                salvarUtilizados(utilizados);
            }
            
            let pontoArred = { entradaArred: '', saidaArred: '' };
            if (dados) {
                pontoArred = arredondarPonto(dados.entrada, dados.saida);
            }
            
            const div = document.createElement('div');
            div.style = `border: 1.5px solid #222; border-radius: 8px; margin-bottom: 7px; padding: 8px; background: ${revisado ? '#e0ffe0' : '#fff'}; box-shadow:2px 2px #000;`;
            div.innerHTML = `
                <b>${colab.nome}</b> <br>
                <span style="font-size:12px;">Horário padrão: <b>${colab.entrada}</b> | <b>${colab.saida}</b> | <b>${colab.intervalo}</b></span><br>
                <span style="font-size:12px;">${dados ? `Horário do ponto: <b>${dados.entrada}</b> | <b>${dados.intervalo}</b> | <b>${dados.saida}</b>` : '<span style="color:#c00">Não encontrado no relatório de ponto</span>'}</span><br>
                ${dados ? `<span style="font-size:12px; color:var(--theme-color);">Horário ajustado: <b>${pontoArred.entradaArred}</b> | <b>${dados.intervalo}</b> | <b>${pontoArred.saidaArred}</b></span><br>` : ''}
                ${nomeCSV ? `<span style="font-size:10px; color:#666;">Encontrado como: ${nomeCSV}</span><br>` : ''}
                <button class="btn-aplicar-horas" style="margin-top:4px; padding:2px 8px; border-radius:8px; background:var(--theme-color); color:#fff; border:2px solid black; box-shadow:2px 2px #000; cursor:pointer; font-size:14px;" ${revisado || !dados ? 'disabled' : ''}>Aplicar horas do ponto</button>
            `;
            
            const btn = div.querySelector('.btn-aplicar-horas');
            if (btn && !revisado && dados) {
                btn.addEventListener('click', () => {
                    aplicarHorasNoDOM(colab, {
                        entrada: pontoArred.entradaArred,
                        saida: pontoArred.saidaArred,
                        intervalo: dados.intervalo
                    });
                    revisados.push(colab.nome);
                    salvarRevisados(revisados);
                    atualizarLista();
                    renderCSVInput(); // Atualiza o botão com os novos status
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

const observerLinhaALinha = new MutationObserver(async () => {
    if (await identificaRelatorioRDO_HH()) {
        await criarContainerLinhaALinha();
    } else {
        removerContainerLinhaALinha();
    }
});
observerLinhaALinha.observe(document.body, { childList: true, subtree: true });

// Initial check
(async () => {
    if (await identificaRelatorioRDO_HH()) {
        await criarContainerLinhaALinha();
    }
})();