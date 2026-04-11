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

/** Geração de conteúdo (vários modelos / fallback). Carrega no 1.º script para rsp_script e relatorios. */
(function registerLlmFetchGenerateContent() {
  if (typeof window !== 'undefined' && typeof window.llmFetchGenerateContent === 'function') return;

  const MODEL_IDS = [
    'gemini-3.1-flash-lite-preview-06-17',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
  ];

  function buildGenerateContentUrl(modelId, apiKey) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;
  }

  function shouldTryNextModel(httpStatus, json) {
    if (httpStatus === 429 || httpStatus === 503) return true;
    if (httpStatus === 404) return true;
    const code = json && json.error && json.error.code;
    if (code === 429 || code === 503) return true;
    const blob = JSON.stringify(json || {});
    if (httpStatus === 400 && /model|not found|invalid|unsupported|Unknown/i.test(blob)) return true;
    return /RESOURCE_EXHAUSTED|quota exceeded|Quota exceeded|rate limit|RateLimitError|overloaded/i.test(blob);
  }

  function responseHasCandidateText(json) {
    try {
      const parts = json && json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts;
      if (!Array.isArray(parts)) return false;
      return parts.some((p) => p && typeof p.text === 'string' && p.text.trim().length > 0);
    } catch {
      return false;
    }
  }

  function primeiroTextoDosCandidates(json) {
    const parts = json && json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts;
    if (!Array.isArray(parts)) return null;
    for (const p of parts) {
      if (p && typeof p.text === 'string' && p.text.trim()) return p.text;
    }
    return null;
  }

  async function llmFetchGenerateContent(apiKey, init) {
    if (!apiKey) throw new Error('API key ausente');
    let lastError;
    for (let i = 0; i < MODEL_IDS.length; i++) {
      const modelId = MODEL_IDS[i];
      const url = buildGenerateContentUrl(modelId, apiKey);
      const res = await fetch(url, init);
      const responseBody = await res.text();
      let json;
      try {
        json = JSON.parse(responseBody);
      } catch {
        json = { error: { message: responseBody.slice(0, 500) } };
      }

      if (res.ok && responseHasCandidateText(json)) {
        const saida = primeiroTextoDosCandidates(json);
        if (i > 0) {
          console.log('[Complemento RDO] Resposta via modelo alternativo:', modelId);
        }
        return { json, modelId, text: saida };
      }

      lastError = new Error(json.error && json.error.message ? json.error.message : `HTTP ${res.status}: ${responseBody.slice(0, 280)}`);

      const hasNext = i < MODEL_IDS.length - 1;
      if (hasNext && shouldTryNextModel(res.status, json)) {
        console.warn('[Complemento RDO]', modelId, '— limite ou indisponível; tentando o próximo.');
        continue;
      }
      throw lastError;
    }
    throw lastError;
  }

  window.llmFetchGenerateContent = llmFetchGenerateContent;
  window.LLM_MODEL_IDS_ORDERED = MODEL_IDS;
})();
