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
    function salvarValoresFiltros() {
        const valores = {
            dataInicio: document.getElementById('pdf-data-inicio')?.value || '',
            dataFim: document.getElementById('pdf-data-fim')?.value || '',
            ordem: document.getElementById('pdf-ordem')?.value || 'desc',
            tipo: document.getElementById('pdf-tipo')?.value || 'tudo',
            obrasExcluidas: document.getElementById('obras-excluidas')?.value || '',
            obrasSomenteNome: document.getElementById('obras-somente-nome-contem')?.value || '',
            obraEspecifica: document.getElementById('obra-especifica')?.value || '',
            aprovados100: document.getElementById('aprovados-100')?.checked || false,
            semLimite: document.getElementById('sem-limite')?.checked || false,
            somenteRelatHH: document.getElementById('somente-relatorios-hh')?.checked || false,
            somenteObrasAndamento: document.getElementById('somente-obras-andamento')?.checked || false
        };
        localStorage.setItem('complementoRDO_filtros', JSON.stringify(valores));
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
            if (tipo && valores.tipo) tipo.value = valores.tipo;
            
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
                }
            }
        });
    }

    function renderizarConteudo(modo) {
        const isDados = modo === 'dados';
        const isSaldos = modo === 'saldos';
        const isPdf = modo === 'pdf';
        container.innerHTML = `
            <div class="container compilador-medicacao-card complemento-card-fixo" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; box-sizing: border-box; background: rgb(255, 255, 255); padding: 20px; border-radius: 8px; border: 2px solid black; box-shadow: rgb(0, 0, 0) 4px 4px; font-family: Arial, sans-serif; content-align: center; flex-direction: column; gap: 10px; font-size: 14px;">
               
                <div id="overlay-desenvolvimento" style="display: none; flex-direction: column; align-items: center; bottom: 80px; justify-content: center; position: absolute; left: 0;  width: 100%; height: 295px; background: rgb(255, 255, 255); z-index: 10000;">
                    <span style="font-size: 1.3rem; font-weight: bold; color: #b00; margin-bottom: 18px;">EM DESENVOLVIMENTO</span>
                    <input id="senha-desenvolvimento" type="password" placeholder="" style="
                        background: transparent !important;
                        border: none !important;
                        outline: none !important;
                        color: transparent !important;
                        caret-color: transparent !important;
                        width: 200px !important;
                        height: 40px !important;
                        font-size: 1rem !important;
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
                    <div id="modo-switch" class="modo-switch ${isPdf ? 'pdf' : isDados ? 'dados' : 'saldos'}" style="width: 180px; height: 30px; position: relative;">
                        <div class="modo-switch-slider"></div>
                        <span id="modo-switch-pdf" class="modo-switch-label${isPdf ? ' selected' : ''}" style="z-index:1;">PDFs</span>
                        <span id="modo-switch-dados" class="modo-switch-label${isDados ? ' selected' : ''}" style="z-index:1;">Dados</span>
                        <span id="modo-switch-saldos" class="modo-switch-label${isSaldos ? ' selected' : ''}" style="z-index:1; width: 60px;">Saldos</span>
                    </div>
                </div>
                <div class="wrapper-container" style="position: absolute; z-index: 99999; top: 3px; left: 15px; width: 25px; margin: 0px; padding: 0px; color: var(--theme-color); cursor: pointer;">
                    <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(180deg);">
                        <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path>
                    </svg>
                </div>
                <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="margin: 15px 0px 5px; color: var(--theme-color) !important; font-size: 25px; font-weight: 600">Compilador de Medição
                        <div id="wrap-explicacao" style="max-width: 100%; width: 100%; margin-top: 8px; background: #f7f7f7; border-radius: 6px; padding: 0; font-size: 0.95rem; color: #444; font-weight: 400; overflow: hidden; transition: max-height 0.4s ease;">
                        
                         
                            <div id="wrap-explicacao-header" style="cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 12px;">
                                <span style="font-size: 1.1rem; font-weight: bold;">O que faz?</span>
                                <span id="wrap-explicacao-toggle" style="display: flex; align-items: center; transition: transform 0.4s;">
                                <svg id="wrap-explicacao-toggle-svg" viewBox="0 0 24 24" width="22" height="22";  style="transform: rotate(180deg); transition: transform 0.3s;">
                                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path></svg>
                                </span>
                            </div>
                            <div id="wrap-explicacao-content" style="padding: 0 12px 8px 24px; max-height: 180px; overflow-y: auto;">
                                <ul style="margin: 8px 0 0 0; padding: 0; font-size: 0.90rem;">
                                    <li>Busca <b>todas as obras</b> conforme filtros definidos (status, siglas excluídas, nome, ID específico)</li>
                                    ${isPdf ? '<li>Para cada obra, extrai <b>todos os relatórios</b> do período escolhido, filtrando conforme os parâmetros definidos.</li>' : ''}
                                    ${isPdf ? '<li>Mescla os PDFs por <b>modelo de relatório</b> (lista vinda da API por obra); um arquivo por modelo e obra no período, ou só o modelo escolhido.</li>' : ''}
                                    ${isDados ? '<li>Para cada obra, extrai <b>todos os relatórios</b> do período escolhido e busca informações do campo <b>Atividades</b>.</li>' : ''}
                                    ${isDados ? '<li>Extrai de todos os relatórios as informações do campo <b>Atividades</b> e <b>Mão de Obra</b> (se habilitado) em formato <b>.XLSX</b>.</li>' : ''}
                                    ${isSaldos ? '<li>Para cada obra, busca a <b>lista de tarefas completa</b> via API do Diário de Obra.</li>' : ''}
                                    ${isSaldos ? '<li>Extrai <b>saldos, escopo total, realizado e porcentagem</b> de cada etapa e tarefa.</li>' : ''}
                                    ${isSaldos ? '<li>Busca o <b>histórico completo de atualizações</b> de cada tarefa (data, incremento, horas, fotos).</li>' : ''}
                                    ${isSaldos ? '<li>Gera planilha com <b>5 abas</b>: Saldos (para BI), Cronograma, Histórico, Progresso da Obra e Observações.</li>' : ''}
                                </ul>
                                <span style="font-size: 0.85rem; color: #888;">Funciona automaticamente com a API de qualquer empresa/contrato, desde que tenha o token de integração gerado.</span>
                            </div>
                        </div>
                        ${isDados ? '<p style="margin-top: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f7f7f7; border-radius: 6px; font-size: 0.70rem; color: #444; font-weight: 400;">Como há diversos usuarios com diferentes casos de uso, essa funcionalidade (extração de dados), extrairá todos os campos existentes no modelo de relatório e período escolhido.</p>' : ''}
                        ${isSaldos ? '<p style="margin-top: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f7f7f7; border-radius: 6px; font-size: 0.70rem; color: #444; font-weight: 400;">A extração de saldos busca todos os dados de lista de tarefas de todas as obras filtradas. Organiza por obra, etapa e tarefa, extraindo escopo total, realizado, saldo e histórico completo de atualizações. Os dados são exportados em 5 abas para uso em BI: Saldos, Cronograma, Histórico, Progresso da Obra e Observações.</p>' : ''}
                    </div>
                </div>
                <div class="filtro-content" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <div class="input-group" style="display: flex; flex-direction: column; gap: 8px;">
                        ${!isSaldos ? `
                        <div style="display: flex; gap: 10px;">
                            <div style="flex: 1;">
                                <label for="pdf-data-inicio" style="display: block; margin-bottom: 4px; color: #444;">Data Inicial:</label>
                                <input type="date" id="pdf-data-inicio" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div style="flex: 1;">
                                <label for="pdf-data-fim" style="display: block; margin-bottom: 4px; color: #444;">Data Final:</label>
                                <input type="date" id="pdf-data-fim" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <div style="flex: 1;">
                                <label for="pdf-ordem" style="display: block; margin-bottom: 4px; color: #444;">Ordem:</label>
                                <select id="pdf-ordem" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="desc">Do fim ao início</option>
                                    <option value="asc">Do início ao fim</option>
                                </select>
                            </div>
                            <div style="flex: 1;">
                                <label for="pdf-tipo" style="display: block; margin-bottom: 4px; color: #444;">Modelo de relatório</label>
                                <select id="pdf-tipo" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="tudo">Todos os modelos</option>
                                </select>
                            </div>
                        </div>` : ''}
                        <div>
                            <label for="obras-excluidas" style="display: block; margin-bottom: 4px; color: #444;">Obras excluídas:</label>
                            <input type="text" id="obras-excluidas" class="form-control" placeholder="Ex: M3, TAC, REC" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label for="obras-somente-nome-contem" style="display: block; margin-bottom: 4px; color: #444;">Somente obra que tem (no nome):</label>
                            <input type="text" id="obras-somente-nome-contem" class="form-control" placeholder="Ex: HH, NORTE, sigla ou trecho; várias: vírgula (basta uma)" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label for="obra-especifica" style="display: block; margin-bottom: 4px; color: #444;">Extrair obra específica:</label>
                            <input type="text" id="obra-especifica" class="form-control" placeholder="Ex: 664b1c7f7b8129706b075bba, 65f481f910388195c3094254" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>

                        ${!isSaldos ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                            <input type="checkbox" id="aprovados-100" style="margin: 0;">
                            <label for="aprovados-100" style="color: #444; margin: 0; font-size: 0.97em; cursor: pointer;">Extrair aprovados</label>
                            <input type="checkbox" id="sem-limite" style="margin: 0;">
                            <label for="sem-limite" style="color: #444; margin: 0; font-size: 0.97em; cursor: pointer;">Extração ilimitada</label>
                        </div>` : ''}
                        
                        ${isDados ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                            <input type="checkbox" id="somente-relatorios-hh" style="margin: 0;">
                            <label for="somente-relatorios-hh" style="color: #444; margin: 0; font-size: 0.97em; cursor: pointer;">Extrair M.O apenas de obras com "HH" no nome</label>
                        </div>` : ''}
                        
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                            <input type="checkbox" id="somente-obras-andamento" style="margin: 0;">
                            <label for="somente-obras-andamento" style="color: #444; margin: 0; font-size: 0.97em; cursor: pointer;">Extrair apenas obras com status "em andamento"</label>
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                        


                        <button class="${isSaldos ? 'btn-extrair-saldos' : isDados ? 'btn-extrair-dados' : 'btn-extrair-pdf'}" style="width: 100%; padding: 8px; background: var(--theme-color); color: white; border: 2px solid black; border-radius: 8px; box-shadow: 2px 2px rgb(0, 0, 0); cursor: pointer; margin-top: 5px;">
                            ${isSaldos ? 'EXTRAIR SALDOS' : isDados ? 'EXTRAIR DADOS' : 'EXTRAIR PDFs'}
                        </button>
                    </div>
                    <div id="status-extracao" style="margin-top: 10px; font-size: 14px; color: #666;"></div>
                </div>
            </div>
        `;
        container.querySelector('#modo-switch-pdf').onclick = () => renderizarConteudo('pdf');
        container.querySelector('#modo-switch-dados').onclick = () => renderizarConteudo('dados');
        container.querySelector('#modo-switch-saldos').onclick = () => renderizarConteudo('saldos');
        const selectTipo = container.querySelector('#pdf-tipo');
        if (selectTipo && !isSaldos) {
            selectTipo.addEventListener('change', (evento) => {
                localStorage.setItem('tipoExtrairPDF', evento.target.value);
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
                    wrap.style.maxHeight = '500px';
                    toggleSvg.style.transform = 'rotate(180deg)';      
                } else {
                    content.style.display = 'none';
                    wrap.style.maxHeight = '50px';
                    toggleSvg.style.transform = 'rotate(0deg)';
                }
            };
            content.style.display = 'none';
            wrap.style.maxHeight = '50px';
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
    }

    renderizarConteudo('pdf');
    document.body.appendChild(container);
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

    const style = document.createElement('style');
    style.innerHTML = `
    .modo-switch-wrap {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      width: 100%;
    }
    .modo-switch {
      display: flex;
      align-items: center;
      background: #f7f7f7;
      border-radius: 20px;
      border: 2px solid var(--theme-color);
      padding: 2px 6px;
      gap: 0;
      position: relative;
       

      }
      .modo-switch-label {
        font-size: 0.9rem;
        font-weight: bold;
        color: var(--theme-color);
      padding: 10px;
      cursor: pointer;
      transition: color 0.2s;
      user-select: none;
     font-size: 12px;

    }
    .modo-switch-label.selected {
      color: #fff;
    }
    .modo-switch-slider {
      position: absolute;
      top: 2px;
      left: 2px;
        margin-right: 2px;
      width: 33.333%;
      height: 22px;
      background: var(--theme-color);
      border-radius: 16px;
      transition: left 0.25s;
      z-index: 0;
    }
    .modo-switch.pdf .modo-switch-slider {
      left: 2px;
    }
    .modo-switch.dados .modo-switch-slider {
      left: 33.333%;
    }
    .modo-switch.saldos .modo-switch-slider {
      left: 65.666%;
    }

    `;
    document.head.appendChild(style);

    return container;
}