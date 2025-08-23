// Função para verificar se o servidor está disponível para funcionalidades
async function isServerAvailable() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['server_unavailable'], (result) => {
      resolve(!result.server_unavailable);
    });
  });
}

// Função para executar código apenas se o servidor estiver disponível
async function executeIfServerAvailable(callback) {
  const available = await isServerAvailable();
  if (available) {
    callback();
  } else {
    console.log('Servidor indisponível - funcionalidade não executada');
  }
}
