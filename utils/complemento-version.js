/**
 * Versão instalada (hardcode) e URL da loja — alinhar com manifest.json ao publicar.
 * O background grava em chrome.storage.local a versão informada pelo JSON de status (GitHub raw).
 */
(function complementoRdoVersionModule() {
  const COMPLEMENTO_RDO_VERSION = '2.1';
  const COMPLEMENTO_RDO_STORE_URL =
    'https://chromewebstore.google.com/detail/complemento-rdo/ifcagjkbngilbhannhibomnniipoannd';

  function norm(v) {
    return String(v || '').trim();
  }

  function serverSaysUpdate(remote) {
    const r = norm(remote);
    if (!r) return false;
    return r !== norm(COMPLEMENTO_RDO_VERSION);
  }

  function esc(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  function injectVersionCssOnce() {
    if (document.getElementById('complemento-rdo-version-css')) return;
    const s = document.createElement('style');
    s.id = 'complemento-rdo-version-css';
    s.textContent =
      '.complemento-rdo-version-slot .complemento-rdo-version-strip{font-size:10px;line-height:1.35;color:#444;border-top:1px solid rgba(0,0,0,0.1);margin-top:8px;padding-top:6px;text-align:right;}' +
      '.complemento-rdo-version-slot .crv-local{color:#555;}' +
      '.complemento-rdo-version-slot .crv-update{display:none;margin-top:4px;}' +
      '.complemento-rdo-version-slot .complemento-rdo-version-strip.crv-show-update .crv-update{display:block;}' +
      '.complemento-rdo-version-slot .crv-update a{color:#0d47a1;font-weight:600;}';
    (document.head || document.documentElement).appendChild(s);
  }

  function renderStripHtml(remote, unavailable) {
    const showUpdate = !unavailable && serverSaysUpdate(remote);
    return (
      '<div class="complemento-rdo-version-strip' +
      (showUpdate ? ' crv-show-update' : '') +
      '">' +
      '<span class="crv-local">Complemento RDO <b>v' +
      esc(COMPLEMENTO_RDO_VERSION) +
      '</b></span>' +
      '<div class="crv-update"><a href="' +
      COMPLEMENTO_RDO_STORE_URL +
      '" target="_blank" rel="noopener noreferrer">A versão ' +
      esc(norm(remote)) +
      ' está disponível. Atualize!</a></div></div>'
    );
  }

  function fillSlot(slot) {
    if (!slot || typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get(
      ['server_unavailable', 'server_remote_complemento_version'],
      (r) => {
        if (chrome.runtime.lastError) return;
        const unavailable = !!r.server_unavailable;
        const remote = r.server_remote_complemento_version || '';
        slot.innerHTML = renderStripHtml(remote, unavailable);
      }
    );
  }

  function complementoRdoMountVersionStrip(host) {
    if (!host || !host.appendChild) return;
    injectVersionCssOnce();
    let slot = host.querySelector(':scope > .complemento-rdo-version-slot');
    if (!slot) {
      slot = document.createElement('div');
      slot.className = 'complemento-rdo-version-slot';
      host.appendChild(slot);
    }
    fillSlot(slot);
  }

  function complementoRdoRefreshAllVersionSlots() {
    document.querySelectorAll('.complemento-rdo-version-slot').forEach(fillSlot);
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (!changes.server_unavailable && !changes.server_remote_complemento_version) return;
      complementoRdoRefreshAllVersionSlots();
      if (typeof window.complementoRdoRefreshPopupServerUi === 'function') {
        window.complementoRdoRefreshPopupServerUi();
      }
    });
  }

  function complementoRdoRefreshPopupServerUi() {
    const pill = document.getElementById('popup-server-pill');
    const sub = document.getElementById('popup-server-sub');
    const ban = document.getElementById('popup-update-banner');
    const link = document.getElementById('popup-update-link');
    const tag = document.querySelector('.version-tag');
    if (tag) tag.textContent = COMPLEMENTO_RDO_VERSION;
    if (!pill && !sub && !ban) return;
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get(
      ['server_unavailable', 'server_remote_complemento_version', 'server_remote_backend'],
      (r) => {
        if (chrome.runtime.lastError) return;
        const ok = !r.server_unavailable;
        const remote = norm(r.server_remote_complemento_version || '');
        const backend = norm(r.server_remote_backend || '');
        if (pill) {
          pill.textContent = ok ? 'Servidor de sincronização: OK' : 'Servidor de sincronização: indisponível';
          pill.classList.toggle('ok', ok);
          pill.classList.toggle('bad', !ok);
        }
        if (sub) {
          sub.textContent = backend
            ? 'Versão publicada (status): ' + remote + ' · ' + backend
            : remote
              ? 'Versão publicada (status): ' + remote
              : ok
                ? 'Extensão instalada: v' + COMPLEMENTO_RDO_VERSION
                : 'Sem resposta válida do endpoint de status — funções que dependem do servidor ficam desligadas.';
        }
        const show = ok && serverSaysUpdate(remote);
        if (ban && link) {
          ban.style.display = show ? 'block' : 'none';
          if (show) {
            link.href = COMPLEMENTO_RDO_STORE_URL;
            link.textContent = 'A versão ' + remote + ' está disponível. Atualize!';
          }
        }
      }
    );
  }

  window.COMPLEMENTO_RDO_VERSION = COMPLEMENTO_RDO_VERSION;
  window.COMPLEMENTO_RDO_STORE_URL = COMPLEMENTO_RDO_STORE_URL;
  window.complementoRdoMountVersionStrip = complementoRdoMountVersionStrip;
  window.complementoRdoRefreshAllVersionSlots = complementoRdoRefreshAllVersionSlots;
  window.complementoRdoRefreshPopupServerUi = complementoRdoRefreshPopupServerUi;

  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      complementoRdoRefreshPopupServerUi();
    });
  } else if (typeof document !== 'undefined') {
    complementoRdoRefreshPopupServerUi();
  }
})();
