// Função principal para aplicar cores nos cabeçalhos e elementos da interface
function aplicarCoresNosCabecalhos(isEnabled) {
  // Aplica cores em todos os cabeçalhos h1-h6
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    heading.style.color = isEnabled ? "#d8d8d8" : '';
  });

  // Aplica cor de fundo nos elementos com classe 'obra' dentro de box-item
  const obras = document.querySelectorAll('.grupo .box .box-item .obra');
  obras.forEach((obra) => {
    obra.style.backgroundColor = isEnabled ? "#1e1e1e" : '';
  });

  // Aplica cor de fundo nos itens de lista
  const obrasEmLista = document.querySelectorAll('.lista ul li');
  obrasEmLista.forEach((obra) => {
    obra.style.backgroundColor = isEnabled ? "#1e1e1e" : '';
  });

  // Altera o fundo do menu principal
  const headerMenu = document.querySelector("#header-menu");
  if (headerMenu) {
    headerMenu.style = isEnabled ? 'background-color: #1f1f1f; border-bottom: gray 1px solid;' : "";
  }

  // Estiliza o campo de filtro
  const input = document.querySelector("div .filtro .form-control")
  if (input) {
    input.style = isEnabled ? "background-color: black; border: 1px solid gray !important; " : "";
  }

  // Estiliza botões dropdown
  const dropdown = document.querySelectorAll(".btn-default")
  if (dropdown) {
    dropdown.forEach((i) => {
      i.style = isEnabled ? "background-color: black; border: 1px solid gray !important; color: white !important; " : "";
    })
  }

  // Aplica borda e fundo nos cards de relatórios
  const bordaRelatorios = document.querySelectorAll(".card")
  if (bordaRelatorios) {
    bordaRelatorios.forEach((i) => {
      i.style = isEnabled ? "border: 1px solid gray !important; background-color: #1f1f1f !important;" : "";
    })
  }

  // Estiliza textos dos dropdowns
  const dropdownTexto = document.querySelectorAll(".btn-default p")
  if (dropdownTexto) {
    dropdownTexto.forEach((i) => {
      i.style = isEnabled ? "color: white !important; " : "";
    })
  }

  // Estiliza cabeçalhos dos cards
  const cardHead = document.querySelectorAll(".container .card-header")
  if (cardHead) {
    cardHead.forEach((i) => {
      i.style = isEnabled ? "background-color: #1f1f1f" : "";
    })
  }

  // Estiliza modal de filtro
  const modalFiltro = document.querySelectorAll(".modal-dialog div.modal-content")[4]
  if (modalFiltro) {
    modalFiltro.style.backgroundColor = isEnabled ? "#1f1f1f" : "";
    modalFiltro.style.color = isEnabled ? "#white" : " ";
  }

  // Estiliza textos do modal de filtro
  const modalFiltroTextos = document.querySelectorAll(".modal-dialog div.modal-content .control-label")
  if (modalFiltroTextos) {
    modalFiltroTextos.forEach(i => {
      i.style = isEnabled ? " color: white" : "";
    })
  }

  // Estiliza inputs do modal de filtro
  const modalFiltroInput = document.querySelectorAll(".modal .modal-content .modal-body .btn-default")
  if (modalFiltroInput) {
    modalFiltroInput.forEach((i) => {
      i.style = isEnabled ? "background-color: #1f1f1f !important; boder: gray solid 1px" : ""
    })
  }

  // Estiliza footer do modal
  const modalFiltroFooter = document.querySelectorAll(".modal-footer")
  if (modalFiltroFooter) {
    modalFiltroFooter.forEach((i) => {
      i.style = isEnabled ? "background-color: #1f1f1f !important" : ""
    })
  }

  // Estiliza itens do menu dropdown
  const dropdownMenu = document.querySelectorAll(".dropdown-menu.dropdown-menu-right .option .dropdown-item");
  if (dropdownMenu.length) {
    dropdownMenu.forEach((item) => {
      item.style.cssText = isEnabled ? "color: white; background-color: #1f1f1f !important" : "";
    });
  }

  // Estiliza itens do menu dropdown quando aberto
  const dropdownMenu2 = document.querySelectorAll(".dropdown-menu.dropdown-menu-right.show  .option .dropdown-item");
  if (dropdownMenu2.length) {
    dropdownMenu2.forEach((item) => {
      item.style.cssText = isEnabled ? "color: white; background-color: #1f1f1f !important" : "";
    });
  }


 
   // Style tables with class bordasimples
   const tabelasBordaSimples = document.querySelectorAll('.bordasimples');
   tabelasBordaSimples.forEach(tabela => {
     tabela.style.cssText = isEnabled ? 'background-color: #1e1e1e; border-color: #444;' : '';
   });
 
   // Style table headers and cells
   const tableElements = document.querySelectorAll('.bordasimples th, .bordasimples td');
   tableElements.forEach(element => {
     element.style.cssText = isEnabled ? 'background-color: #1e1e1e; color: #d8d8d8; border-color: #444;' : '';
   });
 
  //  // Style badges
  //  const badges = document.querySelectorAll('.badge:not(.badge-danger):not(.badge-success):not(.badge-dark)');
  //  badges.forEach(badge => {
  //    badge.style.cssText = isEnabled ? 'background-color: #2d2d2d; color: #fff;' : '';
  //  });
 
   // Style modal content
   const modalContents = document.querySelectorAll('.modal-content');
   modalContents.forEach(content => {
     content.style.backgroundColor = isEnabled ? '#1f1f1f' : '';
   });
 
   const tabela = document.querySelectorAll('.table tr td ');
   tabela.forEach(tabela => {
    tabela.style = isEnabled ? 'color: white' : '';
   })

   

   // Style form controls for time input
   const formControlsHorario = document.querySelectorAll('.form-control');
   formControlsHorario.forEach(control => {
     if(isEnabled) {
       control.style = 'background-color: #2d2d2d; color: #fff; border-color: #444;'
     } else {
       control.style = "" // reseta todo o estilo
     }
   });

   // Style form controls for presence
   const formControlsPresenca = document.querySelectorAll('.presenca .form-control.input-sm');
   formControlsPresenca.forEach(control => {
     if(isEnabled) {
       control.style = 'background-color: #2d2d2d; color: #fff; border-color: #444; min-width: 90px !important;'
     } else {
       control.style = 'min-width: 90px !important;' //poe de volta no que é necessessario que é a coluna de presença
     }
   });

   // Style white space elements
   const whiteSpaceElements = document.querySelectorAll('.white-space');
   whiteSpaceElements.forEach(element => {
     element.style.color = isEnabled ? '#d8d8d8' : '';
   });
 
   // Style approval sections
   const approvalHeaders = document.querySelectorAll('.assinatura h4');
   approvalHeaders.forEach(header => {
     header.style.color = isEnabled ? '#d8d8d8' : '';
   });
 
   // Style pagination elements
   const paginationLinks = document.querySelectorAll('.paginacao a');
   paginationLinks.forEach(link => {
     link.style.cssText = isEnabled ? 'color: #d8d8d8; background-color: #2d2d2d;' : '';
   });
 
   // Style material icons
   const materialIcons = document.querySelectorAll('.material-icons');
   materialIcons.forEach(icon => {
     icon.style.color = isEnabled ? '#d8d8d8' : '';
   });
 
   // Style data/time information
   const dataHora = document.querySelectorAll('.data-hora');
   dataHora.forEach(element => {
     element.style.color = isEnabled ? '#a0a0a0' : '';
   });
   const tableHeaders = document.querySelectorAll('.bordasimples th');
  tableHeaders.forEach(header => {
    header.style.cssText = isEnabled ? 'background-color: #2d2d2d; color: #eeeeee; border-color: #444; font-weight: 600;' : '';
  });

  // Style table cells with lighter background
  const tableCells = document.querySelectorAll('.bordasimples td');
  tableCells.forEach(cell => {
    cell.style.cssText = isEnabled ? 'background-color: #1e1e1e; color: #d8d8d8; border-color: #444;' : '';
  });

  // Style signature sections with dark background
  const assinaturas = document.querySelectorAll('.assinatura');
  assinaturas.forEach(assinatura => {
    assinatura.style.cssText = isEnabled ? 'background-color: #1e1e1e; padding: 10px; border-radius: 4px;border-color: #444;' : '';
  });
  const editor = document.querySelector(".row .col p b");
  if(editor){
    editor.style.color = isEnabled ? "white" : "black" ;
  }
 // Container and all its elements styling
 const horaContainer = document.querySelector('.conteiner_hora .container');
 if (horaContainer) {
   horaContainer.style.cssText = `
     position: fixed;
     bottom: 20px;
     left: 20px;
     z-index: 99999;
     width: 300px;
     background: ${isEnabled ? '#1f1f1f' : 'rgb(255,255,255,1)'};
     padding: 20px;
     border-radius: 8px;
     border: solid 2px ${isEnabled ? '#444' : 'black'};
     box-shadow: 4px 4px ${isEnabled ? 'rgba(0, 0, 0, 0.5)' : 'rgb(0, 0, 0)'};
     font-family: Arial, sans-serif;
     transition: height 0.3s ease;
   `;
 
   const wrapperContainer = horaContainer.querySelector('.wrapper-container');
   if (wrapperContainer) {
     wrapperContainer.style.cssText = `
       position: absolute;
       z-index: 99999;
       top: 3px;
       left: 15px;
       width: 25px;
       margin: 0px;
       padding: 0px;
       color: #1d5b50;
       cursor: pointer;
     `;
   }
 
   const arrowIcon = horaContainer.querySelector('.down path');
   if (arrowIcon) {
     arrowIcon.setAttribute('fill', '#1d5b50');
   }
 
   const header = horaContainer.querySelector('h3');
   if (header) {
     header.style.cssText = `
       margin: 15px 0 5px 0;
       color: ${isEnabled ? '#fff' : '#1d5b50'};
     `;
   }
 
   const copyButton = horaContainer.querySelector('#botaoCopiar');
   if (copyButton) {
     copyButton.style.cssText = `
       padding: 5px 10px;
       background: #1d5b50;
       color: white;
       cursor: pointer;
       font-size: 12px;
       border-radius: 8px;
       border: solid 2px ${isEnabled ? '#444' : 'black'};
       box-shadow: 2px 2px ${isEnabled ? 'rgba(0, 0, 0, 0.5)' : 'rgb(0, 0, 0)'};
       margin: 5px 0 15px 0;
       outline: none;
     `;
   }
 
   const loadingMessage = horaContainer.querySelector('#mensagemCarregando');
   if (loadingMessage) {
     loadingMessage.style.color = isEnabled ? '#d8d8d8' : '#7f8c8d';
   }
   // Add this inside the horaContainer if block
  const cartoesFuncao = horaContainer.querySelectorAll('.cartao-funcao');
  if (cartoesFuncao) {
    cartoesFuncao.forEach(cartao => {
      cartao.style.backgroundColor = isEnabled ? '#2d2d2d' : '#f7f9fc';
      cartao.style.color = isEnabled ? '#d8d8d8' : 'inherit';
    });
  }

 
   const containerDados = horaContainer.querySelector('#containerDados');
   if (containerDados) {
     containerDados.style.cssText = `
       margin-top: 10px;
       max-height: 300px;
       overflow-y: auto;
       padding-right: 10px;
       color: ${isEnabled ? '#d8d8d8' : 'inherit'};
     `;
   }
 }
  let sidebar = document.querySelector(".sidebar-left");
  let sidebar2 = document.querySelector(".sidebar.flex.sticky");
 if (sidebar && sidebar2) {
    sidebar.style = isEnabled ? 'background-color: #1e1e1e; color: rgb(216, 216, 216); border-color: #444;' : '';
    sidebar2.style = isEnabled ? 'background-color: #1e1e1e; color: rgb(216, 216, 216); border-color: #444;' : '';
 }
  // Estiliza o body
   const body = document.querySelector("body")
  if (body) {
    body.style.color = isEnabled ? "#fff" : '';
    body.style.backgroundColor = isEnabled ? "#000" : '';
  }
}

// Inicialização do tema ao carregar a extensão
chrome.storage.sync.get('darkTheme', function (data) {
  const isDarkTheme = data.darkTheme ?? false;
  applyDarkMode(isDarkTheme);
});

// Listener para mudanças no tema
chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace === 'sync' && changes.darkTheme) {
    const newThemeValue = changes.darkTheme.newValue;
    applyDarkMode(newThemeValue);
  }
});

// Função principal para aplicar o tema escuro
function applyDarkMode(isEnabled) {
  aplicarCoresNosCabecalhos(isEnabled);
  document.body.style.backgroundColor = isEnabled ? '#121212' : '';
}

// Função para mudar cores do header
function mudarCores() {
  const headers = document.querySelectorAll('header.header');
  headers.forEach(header => {
    header.style.backgroundColor = "#1d5b50";
  });
}

// Configuração do MutationObserver para monitorar mudanças no DOM
const observerRSP = new MutationObserver(() => {
  chrome.storage.sync.get('darkTheme', function (data) {
    const isDarkTheme = data.darkTheme ?? false;
    aplicarCoresNosCabecalhos(isDarkTheme);
  });
});

// Inicialização
mudarCores();
observerRSP.observe(document.body, { childList: true, subtree: true });
aplicarCoresNosCabecalhos(false);

