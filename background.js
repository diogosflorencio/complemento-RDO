// Sistema de sincronização com servidor central
// Este sistema verifica a conectividade com o servidor para garantir que as funcionalidades
// que dependem de sincronização de dados funcionem corretamente. Se o servidor estiver
// indisponível, as funcionalidades são desabilitadas para evitar inconsistências.
const SERVER_STATUS_URL = 'https://unpleasant-ingaborg-diogosflorencio-baf2a414.koyeb.app/api/aware'; // Endpoint para verificar status do servidor

console.log('Background script carregado - sistema de sincronização ativo');

// Verifica status do servidor quando a extensão é instalada
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extensão instalada - verificando conectividade com servidor');
  checkServerStatus();
});

// Verifica status do servidor quando o Chrome é iniciado
chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome iniciado - verificando conectividade com servidor');
  checkServerStatus();
});

// Verifica status do servidor quando o usuário volta para o Chrome
chrome.tabs.onActivated.addListener(() => {
  console.log('Aba ativada - verificando conectividade com servidor');
  checkServerStatus();
});

// Verifica status do servidor quando o usuário clica na extensão
chrome.action.onClicked.addListener(() => {
  console.log('Extensão clicada - verificando conectividade com servidor');
  checkServerStatus();
});

async function checkServerStatus() {
  console.log('Verificando status do servidor central...');

  try {
    console.log('Conectando ao servidor:', SERVER_STATUS_URL);
    const response = await fetch(SERVER_STATUS_URL);
    const data = await response.json();

    console.log('Resposta do servidor:', data);

    // Verifica se o servidor está respondendo corretamente
    if (data.message !== 'aware') {
      // Servidor não está respondendo como esperado - desabilita funcionalidades
      disableServerFeatures();
      console.log('Servidor não está respondendo corretamente - funcionalidades desabilitadas');
    } else {
      // Servidor está funcionando - habilita funcionalidades
      enableServerFeatures();
      console.log('Servidor funcionando normalmente - funcionalidades habilitadas');
    }
  } catch (error) {
    // Erro de conectividade - desabilita funcionalidades
    disableServerFeatures();
    console.log('Erro de conectividade com servidor:', error.message);
  }
}

function disableServerFeatures() {
  // Marca que as funcionalidades dependentes do servidor estão indisponíveis
  chrome.storage.local.set({ 'server_unavailable': true });

  // Remove popup para evitar uso de funcionalidades que dependem do servidor
  chrome.action.setPopup({ popup: '' });

  console.log('Funcionalidades dependentes do servidor desabilitadas');
}

function enableServerFeatures() {
  // Marca que as funcionalidades dependentes do servidor estão disponíveis
  chrome.storage.local.set({ 'server_unavailable': false });

  // Restaura popup
  chrome.action.setPopup({ popup: 'popup/popup.html' });

  console.log('Funcionalidades dependentes do servidor habilitadas');
}

// Verificação inicial imediata
console.log('Executando verificação inicial de conectividade...');
checkServerStatus();
