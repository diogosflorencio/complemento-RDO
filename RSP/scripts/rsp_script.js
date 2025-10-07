let limitador = 0;
function ajustaAlturaTextarea() {
  const textareas = document.querySelectorAll('textarea[name="descrica"].form-control');

  if (textareas.length > 0) {
    textareas.forEach(textarea => {
      textarea.style.minHeight = '450px';

    });
    console.log(`Altura modificada em ${textareas.length} textareas`);
  } else {
    console.log('Textareas não encontrado. Nova tentiva em 1 segundo...');
    if(limitador >= 10){
      return;
    } 
    setTimeout(ajustaAlturaTextarea, 1000);
    limitador++; // limitador para não cair num loop com a função recursiva
  }
} 

function identificaRelatorioRSP() {
  const titulo = document.querySelector('td.rdo-title h5 b');
  if (titulo && titulo.textContent.includes('Relatório Semanal de Produção (RSP)')) {
    setTimeout(ajustaAlturaTextarea, 1000)
    return true;
  } else {
    console.log("n é rsp")
    return false;
  }
}


const observerRelatorioRSP = new MutationObserver(() => {
  identificaRelatorioRSP()
})

observerRelatorioRSP.observe(document.body, { childList: true, subtree: true})