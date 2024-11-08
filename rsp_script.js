function ajustaAlturaTextarea() {
    const textareas = document.querySelectorAll('textarea[name="descrica"].form-control');
    
    if (textareas.length > 0) {
      textareas.forEach(textarea => {
        textarea.style.minHeight = '450px';
      });
      console.log(`Modified height for ${textareas.length} textareas`);
    } else {
      console.log('Textareas not found. Retrying in 1 second...');
      setTimeout(ajustaAlturaTextarea, 1000);
  }
}

function identificaRelatorioRSP() {
  const titulo = document.querySelector('td.rdo-title h5 b');
  if (titulo && titulo.textContent.includes('Relatório Semanal de Produção (RSP)')) {
    ajustaAlturaTextarea();
    return true;
  }else{
    //console.log("n é rsp")
    return false;
  }
}

setTimeout(identificaRelatorioRSP, 1000);
  
  