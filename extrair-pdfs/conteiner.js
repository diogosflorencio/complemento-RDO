function agendarPopularSelectModelosCompilador(container) {
    let tentativas = 0;
    const maxTentativas = 80;
    const milissegundosEntreTentativas = 50;
    const identificadorIntervalo = setInterval(() => {
        tentativas++;
        if (typeof window.compiladorPopularSelectModelosRelatorio === 'function') {
            clearInterval(identificadorIntervalo);
            void window.compiladorPopularSelectModelosRelatorio(container).catch(() => {});
            return;
        }
        if (tentativas >= maxTentativas) {
            clearInterval(identificadorIntervalo);
        }
    }, milissegundosEntreTentativas);
}

async function criarCardFiltro() {
    const available = await isServerAvailable();
    if (!available) {
        return;
    }

    if (document.querySelector('.container_pdf_filtro')) return;
    if (!PDFExtractorAtivo) return null;
    const container = document.createElement('div');
    container.classList = "container_pdf_filtro";

    // Funções para salvar/restaurar valores dos campos
    const MODOS_COMPILADOR = ['pdf', 'dados', 'saldos'];
    const CHAVE_MODO_COMPILADOR = 'complementoRDO_modoCompilador';

    function salvarModoCompilador(modo) {
        if (!MODOS_COMPILADOR.includes(modo)) return;
        try {
            localStorage.setItem(CHAVE_MODO_COMPILADOR, modo);
        } catch (_) {}
        try {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ [CHAVE_MODO_COMPILADOR]: modo });
            }
        } catch (_) {}
        try {
            const filtrosStr = localStorage.getItem('complementoRDO_filtros');
            const filtros = filtrosStr ? JSON.parse(filtrosStr) : {};
            filtros.modo = modo;
            localStorage.setItem('complementoRDO_filtros', JSON.stringify(filtros));
        } catch (_) {}
    }

    function lerModoCompiladorLocal() {
        try {
            const direto = localStorage.getItem(CHAVE_MODO_COMPILADOR);
            if (MODOS_COMPILADOR.includes(direto)) return direto;
        } catch (_) {}
        try {
            const filtrosStr = localStorage.getItem('complementoRDO_filtros');
            if (filtrosStr) {
                const filtros = JSON.parse(filtrosStr);
                if (MODOS_COMPILADOR.includes(filtros.modo)) return filtros.modo;
            }
        } catch (_) {}
        return 'pdf';
    }

    function salvarValoresFiltros() {
        let existentes = {};
        try {
            existentes = JSON.parse(localStorage.getItem('complementoRDO_filtros') || '{}') || {};
        } catch (_) {
            existentes = {};
        }
        const valores = { ...existentes };
        const setSeExiste = (id, chave, isCheck = false) => {
            const el = document.getElementById(id);
            if (!el) return;
            valores[chave] = isCheck ? !!el.checked : (el.value || '');
        };
        setSeExiste('pdf-data-inicio', 'dataInicio');
        setSeExiste('pdf-data-fim', 'dataFim');
        setSeExiste('pdf-ordem', 'ordem');
        setSeExiste('pdf-tipo', 'tipo');
        setSeExiste('obras-excluidas', 'obrasExcluidas');
        setSeExiste('obras-somente-nome-contem', 'obrasSomenteNome');
        setSeExiste('obra-especifica', 'obraEspecifica');
        setSeExiste('aprovados-100', 'aprovados100', true);
        setSeExiste('sem-limite', 'semLimite', true);
        setSeExiste('somente-relatorios-hh', 'somenteRelatHH', true);
        setSeExiste('somente-obras-andamento', 'somenteObrasAndamento', true);
        localStorage.setItem('complementoRDO_filtros', JSON.stringify(valores));
        const tipoEl = document.getElementById('pdf-tipo');
        if (tipoEl) {
            const isSaldosModo = !!document.querySelector('.modo-switch.saldos');
            localStorage.setItem(isSaldosModo ? 'tipoExtrairSaldos' : 'tipoExtrairPDF', tipoEl.value);
        }
    }

    function restaurarValoresFiltros() {
        try {
            const valoresStr = localStorage.getItem('complementoRDO_filtros');
            if (!valoresStr) return;
            const valores = JSON.parse(valoresStr);
            
            const dataInicio = document.getElementById('pdf-data-inicio');
            if (dataInicio && valores.dataInicio) dataInicio.value = valores.dataInicio;
            
            const dataFim = document.getElementById('pdf-data-fim');
            if (dataFim && valores.dataFim) dataFim.value = valores.dataFim;
            
            const ordem = document.getElementById('pdf-ordem');
            if (ordem && valores.ordem) ordem.value = valores.ordem;
            
            const tipo = document.getElementById('pdf-tipo');
            if (tipo) {
                const isSaldosModo = !!document.querySelector('.modo-switch.saldos');
                const salvoModo = localStorage.getItem(isSaldosModo ? 'tipoExtrairSaldos' : 'tipoExtrairPDF');
                if (salvoModo) tipo.value = salvoModo;
                else if (valores.tipo) tipo.value = valores.tipo;
            }
            
            const obrasExcluidas = document.getElementById('obras-excluidas');
            if (obrasExcluidas && valores.obrasExcluidas) obrasExcluidas.value = valores.obrasExcluidas;
            
            const obrasSomenteNome = document.getElementById('obras-somente-nome-contem');
            if (obrasSomenteNome && valores.obrasSomenteNome) obrasSomenteNome.value = valores.obrasSomenteNome;
            
            const obraEspecifica = document.getElementById('obra-especifica');
            if (obraEspecifica && valores.obraEspecifica) obraEspecifica.value = valores.obraEspecifica;
            
            const aprovados100 = document.getElementById('aprovados-100');
            if (aprovados100) aprovados100.checked = valores.aprovados100 || false;
            
            const semLimite = document.getElementById('sem-limite');
            if (semLimite) semLimite.checked = valores.semLimite || false;
            
            const somenteRelatHH = document.getElementById('somente-relatorios-hh');
            if (somenteRelatHH) somenteRelatHH.checked = valores.somenteRelatHH || false;
            
            const somenteObrasAndamento = document.getElementById('somente-obras-andamento');
            if (somenteObrasAndamento) somenteObrasAndamento.checked = valores.somenteObrasAndamento || false;
        } catch (e) {
            console.warn('Erro ao restaurar filtros:', e);
        }
    }

    function adicionarListenersSalvamento() {
        const campos = [
            'pdf-data-inicio', 'pdf-data-fim', 'pdf-ordem', 'pdf-tipo',
            'obras-excluidas', 'obras-somente-nome-contem', 'obra-especifica',
            'aprovados-100', 'sem-limite', 'somente-relatorios-hh', 'somente-obras-andamento'
        ];
        campos.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.type === 'checkbox') {
                    el.addEventListener('change', salvarValoresFiltros);
                } else {
                    el.addEventListener('input', salvarValoresFiltros);
                    if (el.tagName === 'SELECT') el.addEventListener('change', salvarValoresFiltros);
                }
            }
        });
    }

    const TITULOS_MODO_COMPILADOR = {
        pdf: 'Compilador de PDFs',
        dados: 'Compilador de Dados',
        saldos: 'Compilador de Saldos'
    };

    function tituloCompiladorPorModo(modo) {
        return TITULOS_MODO_COMPILADOR[modo] || ('Compilador de ' + String(modo || '').replace(/^./, (c) => c.toUpperCase()));
    }

    function renderizarConteudo(modo) {
        if (!MODOS_COMPILADOR.includes(modo)) modo = 'pdf';
        salvarModoCompilador(modo);
        const isDados = modo === 'dados';
        const isSaldos = modo === 'saldos';
        const isPdf = modo === 'pdf';
        const tituloCompilador = tituloCompiladorPorModo(modo);
        container.innerHTML = `
            <div class="container compilador-medicacao-card complemento-card-fixo" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; box-sizing: border-box; background: rgb(255, 255, 255); padding: 14px 16px; border-radius: 8px; border: 2px solid black; box-shadow: rgb(0, 0, 0) 4px 4px; font-family: Arial, sans-serif; content-align: center; flex-direction: column; gap: 8px; font-size: 12px; line-height: 1.4;">
               
                <div id="overlay-desenvolvimento" style="display: none; flex-direction: column; align-items: center; bottom: 80px; justify-content: center; position: absolute; left: 0;  width: 100%; height: 295px; background: rgb(255, 255, 255); z-index: 10000;">
                    <span style="font-size: 13px; font-weight: bold; color: #b00; margin-bottom: 18px;">EM DESENVOLVIMENTO</span>
                    <input id="senha-desenvolvimento" type="password" placeholder="" style="
                        background: transparent !important;
                        border: none !important;
                        outline: none !important;
                        color: transparent !important;
                        caret-color: transparent !important;
                        width: 200px !important;
                        height: 40px !important;
                        font-size: 12px !important;
                        margin-bottom: 8px !important;
                        cursor: default !important;
                        -webkit-appearance: none !important;
                        -moz-appearance: none !important;
                        appearance: none !important;
                        box-shadow: none !important;
                        -webkit-box-shadow: none !important;
                        -moz-box-shadow: none !important;
                        border-radius: 0 !important;
                        -webkit-border-radius: 0 !important;
                        -moz-border-radius: 0 !important;
                        -webkit-focus-ring-color: transparent !important;
                        -webkit-tap-highlight-color: transparent !important;
                    " onfocus="this.style.setProperty('outline', 'none', 'important'); this.style.setProperty('box-shadow', 'none', 'important');" onblur="this.style.setProperty('outline', 'none', 'important'); this.style.setProperty('box-shadow', 'none', 'important');">
                </div>
                <div class="modo-switch-wrap">
                    <div id="modo-switch" class="modo-switch ${isPdf ? 'pdf' : isDados ? 'dados' : 'saldos'}" data-modos="${MODOS_COMPILADOR.length}">
                        <div class="modo-switch-slider" aria-hidden="true"></div>
                        <span id="modo-switch-pdf" class="modo-switch-label${isPdf ? ' selected' : ''}" data-modo="pdf">PDFs</span>
                        <span id="modo-switch-dados" class="modo-switch-label${isDados ? ' selected' : ''}" data-modo="dados">Dados</span>
                        <span id="modo-switch-saldos" class="modo-switch-label${isSaldos ? ' selected' : ''}" data-modo="saldos">Saldos</span>
                    </div>
                </div>
                <div class="wrapper-container" style="position: absolute; z-index: 99999; top: 4px; left: 12px; width: 20px; margin: 0px; padding: 0px; color: var(--theme-color); cursor: pointer;">
                    <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(180deg);">
                        <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path>
                    </svg>
                </div>
                <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="margin: 8px 0 4px; color: var(--theme-color) !important; font-size: 16px; font-weight: 600; line-height: 1.3;">${tituloCompilador}
                        <div id="wrap-explicacao" style="max-width: 100%; width: 100%; margin-top: 6px; background: #f7f7f7; border-radius: 5px; padding: 0; font-size: 11px; color: #444; font-weight: 400; overflow: hidden; transition: max-height 0.4s ease;">
                        
                         
                            <div id="wrap-explicacao-header" style="cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 5px 8px;">
                                <span style="font-size: 11px; font-weight: bold;">O que faz?</span>
                                <span id="wrap-explicacao-toggle" style="display: flex; align-items: center; transition: transform 0.4s;">
                                <svg id="wrap-explicacao-toggle-svg" viewBox="0 0 24 24" width="16" height="16" style="transform: rotate(180deg); transition: transform 0.3s;">
                                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path></svg>
                                </span>
                            </div>
                            <div id="wrap-explicacao-content" style="padding: 0 8px 6px 16px; max-height: 120px; overflow-y: auto;">
                                <ul style="margin: 4px 0 0 0; padding: 0; font-size: 11px; line-height: 1.35;">
                                    <li>Busca <b>todas as obras</b> conforme filtros definidos (status, siglas excluídas, nome, ID específico)</li>
                                    ${isPdf ? '<li>Para cada obra, extrai <b>todos os relatórios</b> do período escolhido, filtrando conforme os parâmetros definidos.</li>' : ''}
                                    ${isPdf ? '<li>Mescla os PDFs por <b>modelo de relatório</b> (lista vinda da API por obra); um arquivo por modelo e obra no período, ou só o modelo escolhido.</li>' : ''}
                                    ${isDados ? '<li>Para cada obra, extrai <b>todos os relatórios</b> do período escolhido e busca informações do campo <b>Atividades</b>.</li>' : ''}
                                    ${isDados ? '<li>Extrai de todos os relatórios as informações do campo <b>Atividades</b> e <b>Mão de Obra</b> (se habilitado) em formato <b>.XLSX</b>.</li>' : ''}
                                    ${isSaldos ? '<li>Para cada obra, busca a <b>lista de tarefas completa</b> via API do Diário de Obra.</li>' : ''}
                                    ${isSaldos ? '<li>Extrai <b>saldos, escopo total, realizado e porcentagem</b> de cada etapa e tarefa.</li>' : ''}
                                    ${isSaldos ? '<li>Busca o <b>histórico completo de atualizações</b> de cada tarefa (data, incremento, horas, fotos).</li>' : ''}
                                    ${isSaldos ? '<li>No período informado, extrai relatórios de orçamento (ou do modelo escolhido) e monta a aba <b>Orçamento</b>.</li>' : ''}
                                    ${isSaldos ? '<li>Gera planilha com <b>5 abas</b>: Saldos, Cronograma, Histórico, Progresso da Obra e Orçamento.</li>' : ''}
                                </ul>
                                <span style="font-size: 10px; color: #888;">Funciona automaticamente com a API de qualquer empresa/contrato, desde que tenha o token de integração gerado.</span>
                            </div>
                        </div>
                        ${isDados ? '<p style="margin-top: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: #f7f7f7; border-radius: 5px; font-size: 10px; color: #444; font-weight: 400;">Extrai dados dos relatórios selecionados.</p>' : ''}
                        ${isSaldos ? '<p style="margin-top: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: #f7f7f7; border-radius: 5px; font-size: 10px; color: #444; font-weight: 400;">Extrai saldos, escopo total, realizado e porcentagem de cada etapa e tarefa.</p>' : ''}
                    </div>
                </div>
                <div class="filtro-content" style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
                    <div class="input-group" style="display: flex; flex-direction: column; gap: 7px;">
                        <div style="display: flex; gap: 8px;">
                            <div style="flex: 1;">
                                <label for="pdf-data-inicio" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Data Inicial:</label>
                                <input type="date" id="pdf-data-inicio" class="form-control" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                            </div>
                            <div style="flex: 1;">
                                <label for="pdf-data-fim" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Data Final:</label>
                                <input type="date" id="pdf-data-fim" class="form-control" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                            </div>
                        </div>
                        ${isSaldos ? '<span style="display: block; margin-top: -2px; font-size: 10px; color: #888;">Deixe vazio para extrair tudo (o filtro serve para os relatórios, não lista de tarefas).</span>' : ''}
                        ${isSaldos ? `
                        <div>
                            <label for="pdf-tipo" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Modelo de relatório</label>
                            <select id="pdf-tipo" class="form-control" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                                <option value="todos-orcamentos">Todos orçamentos</option>
                            </select>
                            <span style="display: block; margin-top: 3px; font-size: 10px; color: #888;">Caso deixe em "Todos orçamentos", o sistema irá buscar por todos os modelos que tenha: orçamento, orcamento, orçamentos ou orcamentos no nome.</span>
                        </div>` : `
                        <div style="display: flex; gap: 8px;">
                            <div style="flex: 1;">
                                <label for="pdf-ordem" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Ordem:</label>
                                <select id="pdf-ordem" class="form-control" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                                    <option value="desc">Do fim ao início</option>
                                    <option value="asc">Do início ao fim</option>
                                </select>
                            </div>
                            <div style="flex: 1;">
                                <label for="pdf-tipo" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Modelo de relatório</label>
                                <select id="pdf-tipo" class="form-control" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                                    <option value="tudo">Todos os modelos</option>
                                </select>
                            </div>
                        </div>`}
                        <div>
                            <label for="obras-excluidas" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Obras excluídas:</label>
                            <input type="text" id="obras-excluidas" class="form-control" placeholder="Ex: M3, TAC, REC" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                        </div>
                        <div>
                            <label for="obras-somente-nome-contem" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Somente obra que tem (no nome):</label>
                            <input type="text" id="obras-somente-nome-contem" class="form-control" placeholder="Ex: HH, NORTE, sigla ou trecho; várias: vírgula (basta uma)" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                        </div>
                        <div>
                            <label for="obra-especifica" style="display: block; margin-bottom: 3px; color: #444; font-size: 12px;">Extrair obra específica:</label>
                            <input type="text" id="obra-especifica" class="form-control" placeholder="Ex: 664b1c7f7b8129706b075bba, 65f481f910388195c3094254" style="width: 100%; padding: 4px 6px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;">
                        </div>

                        ${!isSaldos ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                            <input type="checkbox" id="aprovados-100" style="margin: 0;">
                            <label for="aprovados-100" style="color: #444; margin: 0; font-size: 12px; cursor: pointer;">Extrair aprovados</label>
                            <input type="checkbox" id="sem-limite" style="margin: 0;">
                            <label for="sem-limite" style="color: #444; margin: 0; font-size: 12px; cursor: pointer;">Extração ilimitada</label>
                        </div>` : ''}
                        
                        ${isDados ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                            <input type="checkbox" id="somente-relatorios-hh" style="margin: 0;">
                            <label for="somente-relatorios-hh" style="color: #444; margin: 0; font-size: 12px; cursor: pointer;">Extrair M.O apenas de obras com "HH" no nome</label>
                        </div>` : ''}
                        
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                            <input type="checkbox" id="somente-obras-andamento" style="margin: 0;">
                            <label for="somente-obras-andamento" style="color: #444; margin: 0; font-size: 12px; cursor: pointer;">Extrair apenas obras com status "em andamento"</label>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                        


                        <button class="${isSaldos ? 'btn-extrair-saldos' : isDados ? 'btn-extrair-dados' : 'btn-extrair-pdf'}" style="width: 100%; padding: 7px; background: var(--theme-color); color: white; border: 2px solid black; border-radius: 7px; box-shadow: 2px 2px rgb(0, 0, 0); cursor: pointer; margin-top: 4px; font-size: 12px;">
                            ${isSaldos ? 'EXTRAIR SALDOS' : isDados ? 'EXTRAIR DADOS' : 'EXTRAIR PDFs'}
                        </button>
                    </div>
                    <div id="status-extracao-wrap" style="margin-top: 8px; display: flex; align-items: flex-start; gap: 8px;">
                        <div id="status-extracao" style="flex: 1; font-size: 12px; color: #666;"></div>
                        <button type="button" id="btn-cancelar-extracao" class="btn-cancelar-extracao" style="display: none;">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        container.querySelector('#modo-switch-pdf').onclick = () => renderizarConteudo('pdf');
        container.querySelector('#modo-switch-dados').onclick = () => renderizarConteudo('dados');
        container.querySelector('#modo-switch-saldos').onclick = () => renderizarConteudo('saldos');
        const modoSwitchEl = container.querySelector('#modo-switch');
        if (modoSwitchEl) {
            modoSwitchEl.style.setProperty('--modo-count', String(MODOS_COMPILADOR.length));
        }
        const selectTipo = container.querySelector('#pdf-tipo');
        if (selectTipo) {
            selectTipo.addEventListener('change', (evento) => {
                const chave = isSaldos ? 'tipoExtrairSaldos' : 'tipoExtrairPDF';
                localStorage.setItem(chave, evento.target.value);
                salvarValoresFiltros();
            });
            agendarPopularSelectModelosCompilador(container);
        }
        

        
        if (isSaldos) {
            const btnSaldos = container.querySelector('.btn-extrair-saldos');
            if (btnSaldos) {
                btnSaldos.addEventListener('click', function () {
                    if (typeof window.processarExtracaoSaldos === 'function') {
                        window.processarExtracaoSaldos();
                    } else {
                        alert('Função de extração de saldos não carregada!');
                    }
                });
            }
        } else if (isDados) {
            const btnDados = container.querySelector('.btn-extrair-dados');
            if (btnDados) {
                btnDados.addEventListener('click', function () {
                    if (typeof window.processarExtracaoDados === 'function') {
                        window.processarExtracaoDados();
                    } else {
                        alert('Função de extração de dados não carregada!');
                    }
                });
            }
        } else {
            container.querySelector('.btn-extrair-pdf').addEventListener('click', processarRelatorios);
        }
        const header = container.querySelector('#wrap-explicacao-header');
        const content = container.querySelector('#wrap-explicacao-content');
        const wrap = container.querySelector('#wrap-explicacao');
        const toggleSvg = container.querySelector('#wrap-explicacao-toggle-svg');
        if (header && content && wrap && toggleSvg) {
            let expanded = false;
            header.onclick = () => {
                expanded = !expanded;
                if (expanded) {
                    content.style.display = 'block';
                    wrap.style.maxHeight = '180px';
                    toggleSvg.style.transform = 'rotate(180deg)';      
                } else {
                    content.style.display = 'none';
                    wrap.style.maxHeight = '30px';
                    toggleSvg.style.transform = 'rotate(0deg)';
                }
            };
            content.style.display = 'none';
            wrap.style.maxHeight = '30px';
            toggleSvg.style.transform = 'rotate(0deg)';
        }
        let colapsado = localStorage.getItem('pdf_card_colapsado') === 'true';
        aplicarEstadoColapso(colapsado);
        
        // Restaura valores salvos e adiciona listeners
        setTimeout(() => {
            restaurarValoresFiltros();
            adicionarListenersSalvamento();
        }, 100);
        
        container.querySelector('.wrapper-container').addEventListener('click', function (e) {
            e.stopPropagation();
            colapsado = !colapsado;
            localStorage.setItem('pdf_card_colapsado', colapsado);
            aplicarEstadoColapso(colapsado);
        });
        const overlay = container.querySelector('#overlay-desenvolvimento');
        const inputSenha = container.querySelector('#senha-desenvolvimento');

        if (overlay && inputSenha) {
            function entrar() {
                if (inputSenha.value === 'hermione') {
                    overlay.style.display = 'none';
                }
            };
            inputSenha.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') entrar();
            });
        }

        const _crvBoxRender = container.querySelector('.container');
        if (_crvBoxRender && typeof complementoRdoMountVersionStrip === 'function') {
            complementoRdoMountVersionStrip(_crvBoxRender);
        }
    }

    const modoInicial = lerModoCompiladorLocal();
    renderizarConteudo(modoInicial);
    document.body.appendChild(container);
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get([CHAVE_MODO_COMPILADOR], (r) => {
                if (chrome.runtime.lastError) return;
                const modoExt = r && r[CHAVE_MODO_COMPILADOR];
                if (MODOS_COMPILADOR.includes(modoExt) && modoExt !== modoInicial) {
                    renderizarConteudo(modoExt);
                }
            });
        }
    } catch (_) {}
    const _crvBox = container.querySelector('.container');
    if (_crvBox && typeof complementoRdoMountVersionStrip === 'function') complementoRdoMountVersionStrip(_crvBox);

    function aplicarEstadoColapso(colapsado) {
        if (colapsado) {
            container.style.height = '45px';
            container.style.overflow = 'hidden';
            container.style.minWidth = '120px';
            container.style.width = 'fit-content';
            container.querySelector('#overlay-desenvolvimento').style.display = 'none';
            container.querySelector('.filtro-content').style.display = 'none';
            container.querySelector('.modo-switch-wrap').style.display = 'none';
            container.querySelector('#wrap-explicacao').style.display = 'none';
            container.querySelector('.wrapper-container').style.transform = 'rotate(0deg)';
        } else {
            container.style.height = '';
            container.style.overflow = '';
            container.style.minWidth = '340px';
            container.style.width = '340px';
            container.style.maxWidth = '340px';
            container.querySelector('#overlay-desenvolvimento').style.display = 'none'; // flex pra mostrar quando n colapsado
            container.querySelector('.cabecalho').style.display = '';
            container.querySelector('.filtro-content').style.display = '';
            container.querySelector('.modo-switch-wrap').style.display = '';
            container.querySelector('#wrap-explicacao').style.display = '';
            container.querySelector('.wrapper-container').style.transform = 'rotate(180deg)';
        }
    }

    if (!document.getElementById('compilador-modo-switch-css')) {
    const style = document.createElement('style');
    style.id = 'compilador-modo-switch-css';
    style.innerHTML = `
    .modo-switch-wrap {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      width: 100%;
      margin-bottom: 2px;
    }
    .modo-switch {
      --modo-count: 3;
      display: grid;
      grid-template-columns: repeat(var(--modo-count), minmax(0, 1fr));
      align-items: stretch;
      box-sizing: border-box;
      width: 186px;
      height: 28px;
      padding: 2px;
      gap: 0;
      position: relative;
      background: #f7f7f7;
      border-radius: 16px;
      border: 2px solid var(--theme-color);
      overflow: hidden;
    }
    .modo-switch-label {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0 2px;
      height: 100%;
      min-width: 0;
      box-sizing: border-box;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      color: var(--theme-color);
      cursor: pointer;
      user-select: none;
      transition: color 0.2s;
      text-align: center;
      white-space: nowrap;
    }
    .modo-switch-label.selected {
      color: #fff;
    }
    .modo-switch-slider {
      position: absolute;
      z-index: 0;
      top: 2px;
      left: 2px;
      width: calc((100% - 4px) / var(--modo-count));
      height: calc(100% - 4px);
      margin: 0;
      background: var(--theme-color);
      border-radius: 12px;
      transition: left 0.25s ease;
      pointer-events: none;
    }
    .modo-switch.pdf .modo-switch-slider {
      left: 2px;
    }
    .modo-switch.dados .modo-switch-slider {
      left: calc(2px + (100% - 4px) / var(--modo-count));
    }
    .modo-switch.saldos .modo-switch-slider {
      left: calc(2px + 2 * ((100% - 4px) / var(--modo-count)));
    }
    .btn-cancelar-extracao {
      flex-shrink: 0;
      margin: 0;
      padding: 2px 8px;
      font-size: 11px;
      line-height: 1.2;
      color: #666;
      background: #f3f3f3;
      border: 1px solid #ccc;
      border-radius: .25rem;
      cursor: pointer;
    }
    .btn-cancelar-extracao:hover {
      background: #eaeaea;
      color: #333;
    }
    `;
    document.head.appendChild(style);
    }

    return container;
}

/** Controle compartilhado de cancelamento das extrações (PDFs / Dados / Saldos). */
window.__complementoRdoExtracao = window.__complementoRdoExtracao || {
    cancelada: false,
    abort: null,
    countdownId: null
};

function complementoRdoEhCancelado() {
    return !!(window.__complementoRdoExtracao && window.__complementoRdoExtracao.cancelada);
}

function complementoRdoSignal() {
    return window.__complementoRdoExtracao && window.__complementoRdoExtracao.abort
        ? window.__complementoRdoExtracao.abort.signal
        : undefined;
}

function complementoRdoLancarSeCancelado() {
    if (!complementoRdoEhCancelado()) return;
    const erro = new Error('Extração cancelada pelo usuário.');
    erro.name = 'ComplementoRdoCancelado';
    throw erro;
}

function complementoRdoLimparCountdown() {
    const estado = window.__complementoRdoExtracao;
    if (estado && estado.countdownId) {
        clearInterval(estado.countdownId);
        estado.countdownId = null;
    }
}

function complementoRdoMostrarBotaoCancelar() {
    const btn = document.getElementById('btn-cancelar-extracao');
    if (!btn) return;
    btn.style.display = '';
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
        if (!confirm('Cancelar a extração? As requisições em andamento serão interrompidas.')) return;
        const estado = window.__complementoRdoExtracao;
        if (!estado) return;
        estado.cancelada = true;
        complementoRdoLimparCountdown();
        try {
            if (estado.abort) estado.abort.abort();
        } catch (_) {}
        const status = document.getElementById('status-extracao');
        if (status) status.innerHTML = 'Cancelando…';
    });
}

function complementoRdoOcultarBotaoCancelar() {
    const btn = document.getElementById('btn-cancelar-extracao');
    if (btn) btn.style.display = 'none';
}

function complementoRdoIniciarControleCancelamento() {
    const estado = window.__complementoRdoExtracao;
    complementoRdoLimparCountdown();
    estado.cancelada = false;
    estado.abort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    complementoRdoMostrarBotaoCancelar();
}

function complementoRdoFinalizarControleCancelamento() {
    complementoRdoLimparCountdown();
    complementoRdoOcultarBotaoCancelar();
    const estado = window.__complementoRdoExtracao;
    if (estado) {
        estado.abort = null;
    }
}

function complementoRdoFoiCancelamento(erro) {
    if (!erro) return false;
    if (erro.name === 'ComplementoRdoCancelado' || erro.name === 'AbortError') return true;
    return /cancelad/i.test(String(erro.message || ''));
}

window.complementoRdoEhCancelado = complementoRdoEhCancelado;
window.complementoRdoSignal = complementoRdoSignal;
window.complementoRdoLancarSeCancelado = complementoRdoLancarSeCancelado;
window.complementoRdoIniciarControleCancelamento = complementoRdoIniciarControleCancelamento;
window.complementoRdoFinalizarControleCancelamento = complementoRdoFinalizarControleCancelamento;
window.complementoRdoFoiCancelamento = complementoRdoFoiCancelamento;
window.complementoRdoLimparCountdown = complementoRdoLimparCountdown;

function encontrarCabecalhoTodosRelatorios() {
    const headers = document.querySelectorAll('.card-header h4');
    for (const h4 of headers) {
        const texto = (h4.textContent || '').trim().toLowerCase();
        if (texto.includes('todos os relatórios') || texto.includes('todos os relatorios')) {
            return h4.closest('.card-header') || h4;
        }
    }
    return null;
}

function garantirCssPrototipoIncorporacao() {
    if (document.getElementById('complemento-rdo-prototipo-incorporacao-css')) return;
    const style = document.createElement('style');
    style.id = 'complemento-rdo-prototipo-incorporacao-css';
    style.textContent = `
.complemento-rdo-prototipo-incorporacao {
  box-sizing: border-box;
  width: 100%;
  margin: 0 0 10px 0;
  border: 1px solid var(--theme-color, #0d6efd);
  border-radius: .25rem;
  background: #fff;
  font-family: Arial, sans-serif;
  overflow: hidden;
  transition: max-height 0.25s ease;
}
.complemento-rdo-prototipo-incorporacao.colapsado {
  max-height: 40px;
}
.complemento-rdo-prototipo-incorporacao.expandido {
  max-height: 280px;
}
.complemento-rdo-prototipo-incorporacao .crp-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  cursor: pointer;
  user-select: none;
  background: #f7f7f7;
  border-radius: .25rem .25rem 0 0;
}
.complemento-rdo-prototipo-incorporacao .crp-title {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--theme-color, #0d6efd);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.complemento-rdo-prototipo-incorporacao .crp-badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  color: #666;
  background: #eee;
  border-radius: .25rem;
  padding: 2px 7px;
}
.complemento-rdo-prototipo-incorporacao .crp-toggle {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--theme-color, #0d6efd);
  transition: transform 0.25s ease;
}
.complemento-rdo-prototipo-incorporacao.colapsado .crp-toggle {
  transform: rotate(0deg);
}
.complemento-rdo-prototipo-incorporacao.expandido .crp-toggle {
  transform: rotate(180deg);
}
.complemento-rdo-prototipo-incorporacao .crp-body {
  padding: 10px 12px 12px;
  font-size: 12px;
  line-height: 1.45;
  color: #444;
  border-top: 1px solid rgba(0,0,0,0.08);
}
.complemento-rdo-prototipo-incorporacao .crp-body p {
  margin: 0 0 8px 0;
}
`;
    (document.head || document.documentElement).appendChild(style);
}

/**
 * Protótipo visual: incorpora um bloco do Complemento RDO no fluxo da página
 * (acima de "Todos os relatórios"), em vez de só sobrepor com position:fixed.
 */
function montarPrototipoIncorporacaoComplementoRDO() {
    if (document.querySelector('.complemento-rdo-prototipo-incorporacao')) return true;
    const alvo = encontrarCabecalhoTodosRelatorios();
    if (!alvo || !alvo.parentNode) return false;

    garantirCssPrototipoIncorporacao();

    const proto = document.createElement('div');
    proto.className = 'complemento-rdo-prototipo-incorporacao colapsado';
    proto.setAttribute('data-complemento-rdo', 'prototipo-incorporacao');
    proto.innerHTML = `
      <div class="crp-bar" role="button" tabindex="0" aria-expanded="false" title="Expandir teste">
        <span class="crp-title">Protótipo de incorporação do Complemento RDO na página</span>
        <span class="crp-badge">teste</span>
        <svg class="crp-toggle" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="currentColor"></path>
        </svg>
      </div>
      <div class="crp-body" hidden>
        <p>Apenas fazendo um teste com algo que queria fazer há algum tempo: injetar o HTML direto na página em vez de um container desajeitado sobreposto com position:fixed.</p>
        <p>Esse é o primeiro teste. Caso achem muito bugado, favor passar algum feedback para que eu melhore. Creio que todas as funcionalidades do complemento incorporada nas páginas será beneficío para usabilidade de todos.</p>
      </div>
    `;

    const bar = proto.querySelector('.crp-bar');
    const body = proto.querySelector('.crp-body');

    function setExpandido(expandido) {
        proto.classList.toggle('expandido', expandido);
        proto.classList.toggle('colapsado', !expandido);
        body.hidden = !expandido;
        bar.setAttribute('aria-expanded', expandido ? 'true' : 'false');
    }

    bar.addEventListener('click', () => {
        setExpandido(proto.classList.contains('colapsado'));
    });
    bar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpandido(proto.classList.contains('colapsado'));
        }
    });

    alvo.parentNode.insertBefore(proto, alvo);
    return true;
}

function removerPrototipoIncorporacaoComplementoRDO() {
    document.querySelectorAll('.complemento-rdo-prototipo-incorporacao').forEach((el) => el.remove());
}

function agendarPrototipoIncorporacaoComplementoRDO() {
    if (montarPrototipoIncorporacaoComplementoRDO()) return;
    let tentativas = 0;
    const max = 40;
    const id = setInterval(() => {
        tentativas++;
        if (montarPrototipoIncorporacaoComplementoRDO() || tentativas >= max) {
            clearInterval(id);
        }
    }, 500);
}

window.montarPrototipoIncorporacaoComplementoRDO = montarPrototipoIncorporacaoComplementoRDO;
window.removerPrototipoIncorporacaoComplementoRDO = removerPrototipoIncorporacaoComplementoRDO;
window.agendarPrototipoIncorporacaoComplementoRDO = agendarPrototipoIncorporacaoComplementoRDO;