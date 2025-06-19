function criarCardFiltro() {
    if (document.querySelector('.container_pdf_filtro')) return;
    if (!PDFExtractorAtivo) return null;
    console.log('Criando card filtro');
    const container = document.createElement('div');
    container.classList = "container_pdf_filtro";

    // Função para renderizar o conteúdo do container conforme o modo
    function renderizarConteudo(modo) {
        const isDados = modo === 'dados';
        container.innerHTML = `
            <div class="container" style="position: fixed; bottom: 20px; right: 20px; z-index: 99999; min-width: 300px; width: fit-content; box-sizing: border-box; background: rgb(255, 255, 255); padding: 20px; border-radius: 8px; border: 2px solid black; box-shadow: rgb(0, 0, 0) 4px 4px; font-family: Arial, sans-serif; content-align: center; flex-direction: column; gap: 10px; font-size: 14px;">
                <div class="modo-switch-wrap">
                    <div id="modo-switch" class="modo-switch ${isDados ? 'dados' : 'pdf'}" style="width: 120px; height: 30px; position: relative;">
                        <div class="modo-switch-slider"></div>
                        <span id="modo-switch-pdf" class="modo-switch-label${!isDados ? ' selected' : ''}" style="z-index:1;">PDFs</span>
                        <span id="modo-switch-dados" class="modo-switch-label${isDados ? ' selected' : ''}" style="z-index:1;">Dados</span>
                    </div>
                </div>
                <div class="wrapper-container" style="position: absolute; z-index: 99999; top: 3px; left: 15px; width: 25px; margin: 0px; padding: 0px; color: var(--theme-color); cursor: pointer;">
                    <svg class="down" viewBox="0 0 24 24" style="transition: transform 0.3s; transform: rotate(180deg);">
                        <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path>
                    </svg>
                </div>
                <div class="cabecalho" style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="margin: 15px 0px 5px; color: var(--theme-color) !important; font-size: 25px; font-weight: 600">Compilador de Medição
                        <div id="wrap-explicacao" style="max-width: 300px; width: 100%; margin-top: 8px; background: #f7f7f7; border-radius: 6px; padding: 0; font-size: 0.95rem; color: #444; font-weight: 400; overflow: hidden; transition: max-height 0.4s ease;">
                            <div id="wrap-explicacao-header" style="cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 12px;">
                                <span style="font-size: 1.1rem; font-weight: bold;">O que faz?</span>
                                <span id="wrap-explicacao-toggle" style="display: flex; align-items: center; transition: transform 0.4s;">
                                <svg id="wrap-explicacao-toggle-svg" viewBox="0 0 24 24" width="22" height="22";  style="transform: rotate(180deg); transition: transform 0.3s;">
                                <path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z" fill="var(--theme-color)"></path></svg>
                                </span>
                            </div>
                            <div id="wrap-explicacao-content" style="padding: 0 12px 8px 24px; max-height: 180px; overflow-y: auto;">
                                <ul style="margin: 8px 0 0 0; padding: 0; font-size: 0.90rem;">
                                    <li>Busca <b>todas as obras</b> da empresa e filtra apenas as que estão com <b>status em andamento</b> e foram modificadas no período selecionado.</li>
                                    <li>Para cada obra, extrai <b>todos os relatórios</b> do período escolhido, filtrando conforme os parâmetros definidos.</li>
                                    <li>Mescla todos os PDFs dos relatórios de cada obra em um único arquivo, renomeando conforme o tipo: <b>RDO</b> ou <b>RSP</b>.</li>
                                    <li>Extrai de todos os relatórios as informações do campo <b>atividade</b> e salva em formato <b>XLSX</b>.</li>
                                    <li>Faz a extração exata (linha a linha) de todas as <b>horas</b> dos relatórios que têm "HH" no nome.</li>
                                </ul>
                                <span style="font-size: 0.85rem; color: #888;">Funciona automaticamente com a API de qualquer empresa, desde que tenha o token de integração gerado.</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="filtro-content" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                    <div class="input-group" style="display: flex; flex-direction: column; gap: 8px;">
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
                        <div>
                            <label for="pdf-ordem" style="display: block; margin-bottom: 4px; color: #444;">Ordem:</label>
                            <select id="pdf-ordem" class="form-control" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="desc">Do fim ao início</option>
                                <option value="asc">Do início ao fim</option>
                            </select>
                        </div>
                        <div>
                            <label for="obras-excluidas" style="display: block; margin-bottom: 4px; color: #444;">Obras excluídas:</label>
                            <input type="text" id="obras-excluidas" class="form-control" placeholder="Ex: M3, TAC, REC" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label for="obra-especifica" style="display: block; margin-bottom: 4px; color: #444;">Extrair obra específica:</label>
                            <input type="text" id="obra-especifica" class="form-control" placeholder="Ex: 664b1c7f7b8129706b075bba, 65f481f910388195c3094254" style="width: 100%; padding: 5px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                            <input type="checkbox" id="aprovados-100" style="margin: 0;">
                            <label for="aprovados-100" style="color: #444; margin: 0; font-size: 0.97em; cursor: pointer;">Extrair apenas relatórios 100% aprovados</label>
                        </div>
                        <button class="${isDados ? 'btn-extrair-dados' : 'btn-extrair-pdf'}" style="width: 100%; padding: 8px; background: var(--theme-color); color: white; border: 2px solid black; border-radius: 8px; box-shadow: 2px 2px rgb(0, 0, 0); cursor: pointer; margin-top: 5px;">
                            ${isDados ? 'EXPORTAR DADOS (XLSX)' : 'EXTRAIR PDF(s)'}
                        </button>
                    </div>
                    <div id="status-extracao" style="margin-top: 10px; font-size: 14px; color: #666;"></div>
                </div>
            </div>
        `;
        // Adicionar listeners do modo
        container.querySelector('#modo-switch-pdf').onclick = () => renderizarConteudo('pdf');
        container.querySelector('#modo-switch-dados').onclick = () => renderizarConteudo('dados');
        if (isDados) {
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
        // Reatribuir o colapso do wrap explicação
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
            // Inicialmente colapsado
            content.style.display = 'none';
            wrap.style.maxHeight = '50px';
            toggleSvg.style.transform = 'rotate(0deg)';
        }
        // Reaplicar listener do wrap geral e estado de colapso
        let colapsado = localStorage.getItem('pdf_card_colapsado') === 'true';
        aplicarEstadoColapso(colapsado);
        container.querySelector('.wrapper-container').addEventListener('click', function (e) {
            e.stopPropagation();
            colapsado = !colapsado;
            localStorage.setItem('pdf_card_colapsado', colapsado);
            aplicarEstadoColapso(colapsado);
        });
    }

    renderizarConteudo('pdf');
    document.body.appendChild(container);

    // Função para aplicar o estado de colapso
    function aplicarEstadoColapso(colapsado) {
        if (colapsado) {
            container.style.height = '45px';
            container.style.overflow = 'hidden';
            container.style.minWidth = '120px';
            container.style.width = 'fit-content';
            //container.querySelector('.cabecalho').style.display = 'none';
            container.querySelector('.filtro-content').style.display = 'none';
            container.querySelector('.modo-switch-wrap').style.display = 'none';
            container.querySelector('#wrap-explicacao').style.display = 'none';
        } else {
            container.style.height = '';
            container.style.overflow = '';
            container.style.minWidth = '300px';
            container.querySelector('.cabecalho').style.display = '';
            container.querySelector('.filtro-content').style.display = '';
            container.querySelector('.modo-switch-wrap').style.display = '';
            container.querySelector('#wrap-explicacao').style.display = '';
        }
    }

    // Adicionar CSS para o switch
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
      width: 50%;
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
      left: 48%;
    }
    `;
    document.head.appendChild(style);

    return container;
}