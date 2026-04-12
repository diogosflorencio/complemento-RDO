(function () {
    const STORAGE_KEY  = 'dashboardInicio';
    const CONTAINER_ID = 'complemento-rdo-dashboard-inicio';
    const LS_COLLAPSE  = 'complementoDashboardInicioCollapsed';
    const API_BASE     = 'https://apiexterna.diariodeobra.app/v1';

    let ativo = true;
    let pollingRotaIniciado = false;
    let _obraCache = null;

    function obterTokenApi() {
        try {
            const raw = localStorage.getItem('RDOEmpresa');
            const r = raw ? JSON.parse(raw) : {};
            return r.tokenApiExterna || '';
        } catch { return ''; }
    }

    function isRotaInicialApp() {
        const hash = location.hash || '';
        const pathRaw = location.pathname || '';
        if (/#\/app\/obras\/[a-f0-9]{20,}/i.test(hash)) return false;
        if (/\/app\/obras\/[a-f0-9]{20,}/i.test(pathRaw)) return false;
        let h = hash.replace(/^#/, '').split('?')[0].replace(/^\/+/, '').replace(/\/+$/, '');
        if (h === 'app/obras') return true;
        let p = pathRaw.replace(/\/+$/, '').replace(/^\/+/, '');
        if (p === 'app/obras') return true;
        return false;
    }

    function iniciarPollingRota() {
        if (pollingRotaIniciado) return;
        pollingRotaIniciado = true;
        let tentativas = 0;
        const id = setInterval(() => {
            tentativas++;
            if (!ativo) { clearInterval(id); return; }
            if (document.getElementById(CONTAINER_ID)) { clearInterval(id); return; }
            if (isRotaInicialApp()) { criarOuMostrar(); if (document.getElementById(CONTAINER_ID)) clearInterval(id); }
            if (tentativas >= 60) clearInterval(id);
        }, 350);
    }

    //  UTILS 
    function relatorioDentroDoPeriodo(rel, inicioISO, fimISO) {
        if (!rel.data) return false;
        const p = String(rel.data).split('/');
        if (p.length !== 3) return false;
        const t = new Date(`${p[2]}-${p[1]}-${p[0]}`);
        if (Number.isNaN(t.getTime())) return false;
        const ini = new Date(inicioISO);
        const fim = new Date(fimISO); fim.setHours(23, 59, 59, 999);
        return t >= ini && t <= fim;
    }

    function naoAprovado(rel) {
        const d = rel.status && rel.status.descricao ? String(rel.status.descricao).toLowerCase() : '';
        return d !== 'aprovado';
    }

    function escapeHtml(s) {
        const d = document.createElement('div'); d.textContent = s; return d.innerHTML;
    }

    function datasPadraoMes() {
        const fim = new Date();
        const ini = new Date(fim.getFullYear(), fim.getMonth(), 1);
        const iso = d => d.toISOString().slice(0, 10);
        return { inicio: iso(ini), fim: iso(fim) };
    }

    function sleep(ms) { return new Promise(x => setTimeout(x, ms)); }

    function statusColor(desc) {
        const d = String(desc || '').toLowerCase();
        if (d.includes('andamento')) return '#22c55e';
        if (d.includes('conclu'))    return '#3b82f6';
        if (d.includes('parali'))    return '#f59e0b';
        return '#9ca3af';
    }

    function statusBg(desc) {
        const d = String(desc || '').toLowerCase();
        if (d.includes('andamento')) return 'rgba(34,197,94,0.12)';
        if (d.includes('conclu'))    return 'rgba(59,130,246,0.12)';
        if (d.includes('parali'))    return 'rgba(245,158,11,0.12)';
        return 'rgba(255,255,255,0.05)';
    }

    function inicialNome(nome) {
        const partes = String(nome || '?').trim().split(/\s+/);
        if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
        return partes[0][0].toUpperCase();
    }

    //  API HELPERS 
    async function apiGet(path) {
        const token = obterTokenApi();
        if (!token) throw new Error('Token ausente, faça login no Diário de Obra.');
        const res = await fetch(`${API_BASE}${path}`, {
            headers: { token, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    async function getObras(forceRefresh) {
        if (_obraCache && !forceRefresh) return _obraCache;
        const obras = await apiGet('/obras');
        _obraCache = obras;
        return obras;
    }

    async function getRelatoriosObra(obraId, d1, d2) {
        const token = obterTokenApi();
        const url = new URL(`${API_BASE}/obras/${obraId}/relatorios`);
        url.searchParams.set('dataInicio', d1);
        url.searchParams.set('dataFim', d2);
        url.searchParams.set('limite', '2000');
        url.searchParams.set('ordem', 'asc');
        const res = await fetch(url.toString(), { headers: { token, 'Content-Type': 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const all = await res.json();
        return Array.isArray(all) ? all.filter(r => relatorioDentroDoPeriodo(r, d1, d2)) : [];
    }

    async function getDetalheRelatorio(obraId, relId) {
        const token = obterTokenApi();
        const res = await fetch(`${API_BASE}/obras/${obraId}/relatorios/${relId}`, {
            headers: { token, 'Content-Type': 'application/json' }
        });
        if (!res.ok) return null;
        return res.json();
    }

    async function getListaTarefas(obraId) {
        return apiGet(`/obras/${obraId}/lista-de-tarefas`);
    }

    // Coleta detalhes de todos os relatórios de uma obra no período
    async function coletarDetalhes(obraId, d1, d2, onProg) {
        const rels = await getRelatoriosObra(obraId, d1, d2);
        const detalhes = [];
        for (let i = 0; i < rels.length; i++) {
            const det = await getDetalheRelatorio(obraId, rels[i]._id);
            if (det) detalhes.push(det);
            if (typeof onProg === 'function') onProg({ atual: i + 1, total: rels.length });
            await sleep(120);
        }
        return detalhes;
    }

    async function agregarNaoAprovados(d1, d2, onProg) {
        const token = obterTokenApi();
        if (!token) throw new Error('Token ausente, faça login no Diário de Obra.');
        const res = await fetch(`${API_BASE}/obras`, {
            headers: { token, 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`Obras: HTTP ${res.status}`);
        const obras = await res.json();
        if (!Array.isArray(obras)) throw new Error('Resposta inválida.');
        const ativas = obras.filter(o => o.status && String(o.status.descricao).toLowerCase() === 'em andamento');
        const porTipo = {};
        let total = 0, erros = 0, consultadas = 0;
        for (const obra of ativas) {
            const url = new URL(`${API_BASE}/obras/${obra._id}/relatorios`);
            url.searchParams.set('dataInicio', d1);
            url.searchParams.set('dataFim', d2);
            url.searchParams.set('limite', '2000');
            url.searchParams.set('ordem', 'desc');
            try {
                const r = await fetch(url.toString(), { headers: { token, 'Content-Type': 'application/json' } });
                if (!r.ok) { erros++; } else {
                    const rels = await r.json();
                    if (Array.isArray(rels)) {
                        for (const rel of rels) {
                            if (!relatorioDentroDoPeriodo(rel, d1, d2) || !naoAprovado(rel)) continue;
                            const tipo = (rel.modeloDeRelatorioGlobal && rel.modeloDeRelatorioGlobal.descricao) || '(sem tipo)';
                            porTipo[tipo] = (porTipo[tipo] || 0) + 1;
                            total++;
                        }
                    }
                }
            } catch { erros++; }
            consultadas++;
            if (typeof onProg === 'function') onProg({ consultadas, totalObras: ativas.length, erros });
            await sleep(120);
        }
        return { porTipo, total, obrasContadas: ativas.length, erros, consultadas };
    }

    const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

#${CONTAINER_ID} *,#${CONTAINER_ID} *::before,#${CONTAINER_ID} *::after{box-sizing:border-box;margin:0;padding:0;}

#${CONTAINER_ID} .rdo-fab{
    position:fixed;bottom:16px;left:16px;z-index:2147483000;
    width:36px;height:36px;border-radius:8px;
    background:#111111;
    border:1px solid rgba(255,255,255,0.12);
    box-shadow:0px 0px 0px 1px rgba(255,255,255,0.06),0px 4px 12px rgba(0,0,0,0.6);
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    transition:opacity .15s;user-select:none;
}
#${CONTAINER_ID} .rdo-fab:hover{opacity:.8;}
#${CONTAINER_ID} .rdo-fab svg{width:15px;height:15px;}

#${CONTAINER_ID} .rdo-overlay{
    position:fixed;inset:0;z-index:2147482900;
    background:#0a0a0a;font-family:'Inter',sans-serif;font-size:13px;color:#ffffff;
    display:flex;flex-direction:column;
}
#${CONTAINER_ID} .rdo-layout{display:flex;height:100%;overflow:hidden;}

#${CONTAINER_ID} .rdo-sb{
    width:220px;min-width:220px;background:#111111;
    border-right:1px solid rgba(255,255,255,0.07);
    display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;
}
#${CONTAINER_ID} .rdo-sb-head{padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,0.07);}
#${CONTAINER_ID} .rdo-sb-wordmark{font-size:13px;font-weight:600;color:#ffffff;letter-spacing:.01em;}
#${CONTAINER_ID} .rdo-sb-wordmark span{color:#d0d0d0;font-weight:400;}
#${CONTAINER_ID} .rdo-sb-ver{font-size:11px;color:#a8a8a8;margin-top:3px;}
#${CONTAINER_ID} .rdo-sb-sec{
    font-size:10px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;
    color:#a8a8a8;padding:16px 16px 6px;
}
#${CONTAINER_ID} .rdo-ni{
    display:flex;align-items:center;gap:9px;padding:7px 16px;cursor:pointer;
    color:#d0d0d0;font-size:12.5px;font-weight:400;transition:color .12s,background .12s;
    border-left:2px solid transparent;user-select:none;
}
#${CONTAINER_ID} .rdo-ni:hover{color:#ffffff;background:#1a1a1a;}
#${CONTAINER_ID} .rdo-ni.on{color:#ffffff;background:#1a1a1a;border-left-color:#ffffff;}
#${CONTAINER_ID} .rdo-ni svg{width:13px;height:13px;flex-shrink:0;}
#${CONTAINER_ID} .rdo-sb-foot{
    margin-top:auto;padding:14px 16px;border-top:1px solid rgba(255,255,255,0.07);
    display:flex;flex-direction:column;gap:8px;font-size:11px;color:#d0d0d0;
}
#${CONTAINER_ID} .rdo-sb-foot-srv{display:flex;align-items:flex-start;gap:8px;}
#${CONTAINER_ID} .rdo-sb-srv-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:4px;background:#717171;}
#${CONTAINER_ID} .rdo-sb-srv-dot.ok{background:#22c55e;}
#${CONTAINER_ID} .rdo-sb-srv-dot.bad{background:#ef4444;}
#${CONTAINER_ID} .rdo-sb-srv-line1{font-weight:600;color:#ffffff;line-height:1.35;}
#${CONTAINER_ID} .rdo-sb-foot-sub{font-size:10px;color:#c6c6c6;margin-top:2px;line-height:1.35;}
#${CONTAINER_ID} .rdo-sb-foot-app{font-size:10px;color:#b8b8b8;}
#${CONTAINER_ID} .rdo-status-dot{width:5px;height:5px;border-radius:50%;background:#22c55e;flex-shrink:0;}

#${CONTAINER_ID} .rdo-main{flex:1;overflow-y:auto;background:#0a0a0a;}
#${CONTAINER_ID} .rdo-topbar{
    display:flex;align-items:center;justify-content:space-between;
    padding:0 24px;height:48px;background:#111111;
    border-bottom:1px solid rgba(255,255,255,0.07);position:sticky;top:0;z-index:10;
}
#${CONTAINER_ID} .rdo-tb-title{font-size:13px;font-weight:600;color:#ffffff;}
#${CONTAINER_ID} .rdo-tb-crumb{font-size:11px;color:#a8a8a8;}
#${CONTAINER_ID} .rdo-tb-close{
    width:28px;height:28px;border-radius:6px;background:transparent;
    border:1px solid rgba(255,255,255,0.1);cursor:pointer;
    display:flex;align-items:center;justify-content:center;color:#d0d0d0;transition:color .12s,background .12s;
}
#${CONTAINER_ID} .rdo-tb-close:hover{color:#ffffff;background:#1a1a1a;}
#${CONTAINER_ID} .rdo-tb-close svg{width:12px;height:12px;}

#${CONTAINER_ID} .rdo-pg{padding:28px 24px;display:none;}
#${CONTAINER_ID} .rdo-pg.on{display:block;}

#${CONTAINER_ID} .rdo-ph{font-size:20px;font-weight:600;color:#ffffff;margin-bottom:4px;letter-spacing:-.01em;}
#${CONTAINER_ID} .rdo-ps{font-size:12px;color:#d0d0d0;margin-bottom:24px;}

/* GRIDS */
#${CONTAINER_ID} .rdo-sgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;}
#${CONTAINER_ID} .rdo-sgrid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
#${CONTAINER_ID} .rdo-sgrid5{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:16px;}
#${CONTAINER_ID} .rdo-g2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
#${CONTAINER_ID} .rdo-g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}

/* STAT CARD */
#${CONTAINER_ID} .rdo-sc{
    background:#111111;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:14px 16px;
    box-shadow:0px 1px 5px -4px rgba(0,0,0,0.9),0px 0px 0px 1px rgba(255,255,255,0.04),0px 4px 8px rgba(0,0,0,0.4);
}
#${CONTAINER_ID} .rdo-sc-lbl{font-size:10px;font-weight:500;color:#a8a8a8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;}
#${CONTAINER_ID} .rdo-sc-val{font-size:22px;font-weight:600;color:#ffffff;line-height:1;letter-spacing:-.02em;}
#${CONTAINER_ID} .rdo-sc-val.r{color:#ff4444;}
#${CONTAINER_ID} .rdo-sc-val.g{color:#22c55e;}
#${CONTAINER_ID} .rdo-sc-val.b{color:#3b82f6;}
#${CONTAINER_ID} .rdo-sc-val.y{color:#f59e0b;}
#${CONTAINER_ID} .rdo-sc-meta{font-size:10px;color:#a8a8a8;margin-top:4px;}

/* CARD */
#${CONTAINER_ID} .rdo-card{
    background:#111111;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:16px;
    box-shadow:0px 1px 5px -4px rgba(0,0,0,0.9),0px 0px 0px 1px rgba(255,255,255,0.04),0px 4px 8px rgba(0,0,0,0.4);
    margin-bottom:8px;
}
#${CONTAINER_ID} .rdo-card:last-child{margin-bottom:0;}
#${CONTAINER_ID} .rdo-card-tit{font-size:13px;font-weight:600;color:#ffffff;margin-bottom:2px;}
#${CONTAINER_ID} .rdo-card-sub{font-size:11px;color:#a8a8a8;margin-bottom:14px;}

/* FORM ROW */
#${CONTAINER_ID} .rdo-frow{display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:10px;}
#${CONTAINER_ID} .rdo-fg{display:flex;flex-direction:column;gap:4px;}
#${CONTAINER_ID} .rdo-fg label{font-size:10px;font-weight:500;color:#a8a8a8;letter-spacing:.04em;text-transform:uppercase;}
#${CONTAINER_ID} .rdo-fg input[type=date],
#${CONTAINER_ID} .rdo-fg select{
    padding:6px 9px;border:1px solid rgba(255,255,255,0.12);border-radius:6px;
    background:#1a1a1a;color:#ffffff;font-size:11px;font-family:'Inter',sans-serif;
    outline:none;color-scheme:dark;cursor:pointer;
}
#${CONTAINER_ID} .rdo-fg select{min-width:180px;}
#${CONTAINER_ID} .rdo-fg input:focus,
#${CONTAINER_ID} .rdo-fg select:focus{border-color:rgba(255,255,255,0.3);}

/* BUTTONS */
#${CONTAINER_ID} .rdo-btn{
    padding:6px 14px;border-radius:6px;font-size:12px;font-weight:500;
    font-family:'Inter',sans-serif;cursor:pointer;border:none;
    background:#ffffff;color:#000000;transition:opacity .12s;letter-spacing:.01em;white-space:nowrap;
}
#${CONTAINER_ID} .rdo-btn:hover{opacity:.85;}
#${CONTAINER_ID} .rdo-btn:disabled{opacity:.35;cursor:default;}
#${CONTAINER_ID} .rdo-btn.sec{background:#1a1a1a;color:#ffffff;border:1px solid rgba(255,255,255,0.1);}
#${CONTAINER_ID} .rdo-btn.sec:hover:not(:disabled){background:#222;}

/* PROGRESS */
#${CONTAINER_ID} .rdo-smsg{font-size:10px;color:#d0d0d0;min-height:13px;margin-bottom:6px;}
#${CONTAINER_ID} .rdo-smsg.err{color:#ff6666;}
#${CONTAINER_ID} .rdo-pbar-wrap{margin-bottom:8px;display:none;}
#${CONTAINER_ID} .rdo-pbar-txt{font-size:10px;color:#a8a8a8;margin-bottom:3px;}
#${CONTAINER_ID} .rdo-pbar{height:1.5px;background:#222;border-radius:2px;overflow:hidden;}
#${CONTAINER_ID} .rdo-pfill{height:100%;border-radius:2px;background:#f0f0f0;width:0%;transition:width .3s;}

/* SCROLLS */
#${CONTAINER_ID} .rdo-scroll{max-height:240px;overflow-y:auto;}
#${CONTAINER_ID} .rdo-scroll-tall{max-height:380px;overflow-y:auto;}

/* LIST ITEMS */
#${CONTAINER_ID} .rdo-row-item{
    display:flex;align-items:center;justify-content:space-between;
    padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);
}
#${CONTAINER_ID} .rdo-row-item:last-child{border-bottom:none;}
#${CONTAINER_ID} .rdo-ri-name{font-size:12px;color:#ffffff;}
#${CONTAINER_ID} .rdo-ri-sub{font-size:10px;color:#d0d0d0;margin-top:1px;}
#${CONTAINER_ID} .rdo-ri-val{font-size:12px;font-weight:600;color:#ffffff;}

/* TAGS */
#${CONTAINER_ID} .rdo-tag{font-size:9px;font-weight:500;padding:2px 7px;border-radius:9999px;letter-spacing:.02em;}
#${CONTAINER_ID} .rdo-tag.hi{background:rgba(255,68,68,0.12);color:#ff8080;border:1px solid rgba(255,68,68,0.2);}
#${CONTAINER_ID} .rdo-tag.lo{background:rgba(245,158,11,0.1);color:#fbbf24;border:1px solid rgba(245,158,11,0.2);}
#${CONTAINER_ID} .rdo-tag.ok{background:rgba(34,197,94,0.1);color:#4ade80;border:1px solid rgba(34,197,94,0.2);}
#${CONTAINER_ID} .rdo-tag.info{background:rgba(59,130,246,0.1);color:#60a5fa;border:1px solid rgba(59,130,246,0.2);}
#${CONTAINER_ID} .rdo-tag.neu{background:rgba(255,255,255,0.05);color:#c0c0c0;border:1px solid rgba(255,255,255,0.1);}

/* EMPTY */
#${CONTAINER_ID} .rdo-empty{
    padding:28px 16px;text-align:center;font-size:11px;color:#a8a8a8;
    border:1px dashed rgba(255,255,255,0.07);border-radius:7px;
}

/* BAR CHART */
#${CONTAINER_ID} .rdo-bar-item{margin-bottom:10px;}
#${CONTAINER_ID} .rdo-bar-head{display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;color:#d0d0d0;}
#${CONTAINER_ID} .rdo-bar-head span:last-child{font-weight:500;color:#ffffff;}
#${CONTAINER_ID} .rdo-bar-track{height:2px;background:#222;border-radius:2px;overflow:hidden;}
#${CONTAINER_ID} .rdo-bar-fill{height:100%;border-radius:2px;background:#f0f0f0;transition:width .6s cubic-bezier(.4,0,.2,1);}
#${CONTAINER_ID} .rdo-bar-fill.g{background:#22c55e;}
#${CONTAINER_ID} .rdo-bar-fill.b{background:#3b82f6;}
#${CONTAINER_ID} .rdo-bar-fill.r{background:#ff4444;}
#${CONTAINER_ID} .rdo-bar-fill.y{background:#f59e0b;}

/* OBRA CARDS */
#${CONTAINER_ID} .rdo-obra-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
#${CONTAINER_ID} .rdo-obra-card{
    background:#111111;border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:14px 16px;
    box-shadow:0px 1px 5px -4px rgba(0,0,0,0.9),0px 0px 0px 1px rgba(255,255,255,0.04),0px 4px 8px rgba(0,0,0,0.4);
}
#${CONTAINER_ID} .rdo-obra-name{font-size:12px;font-weight:600;color:#ffffff;margin-bottom:7px;line-height:1.4;}
#${CONTAINER_ID} .rdo-obra-stat{
    display:inline-flex;align-items:center;font-size:9px;font-weight:500;
    padding:2px 8px;border-radius:9999px;margin-bottom:9px;
}
#${CONTAINER_ID} .rdo-obra-meta{font-size:10px;color:#d0d0d0;display:flex;gap:10px;flex-wrap:wrap;}

/* TASK PROGRESS */
#${CONTAINER_ID} .rdo-etapa{margin-bottom:16px;}
#${CONTAINER_ID} .rdo-etapa-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;}
#${CONTAINER_ID} .rdo-etapa-name{font-size:12px;font-weight:600;color:#ffffff;flex:1;}
#${CONTAINER_ID} .rdo-etapa-pct{font-size:11px;font-weight:600;color:#ffffff;margin-left:10px;}
#${CONTAINER_ID} .rdo-etapa-bar{height:3px;background:#1e1e1e;border-radius:2px;overflow:hidden;margin-bottom:8px;}
#${CONTAINER_ID} .rdo-etapa-fill{height:100%;border-radius:2px;transition:width .8s cubic-bezier(.4,0,.2,1);}
#${CONTAINER_ID} .rdo-task{
    display:flex;align-items:center;padding:4px 0 4px 10px;
    border-bottom:1px solid rgba(255,255,255,0.04);gap:6px;
}
#${CONTAINER_ID} .rdo-task:last-child{border-bottom:none;}
#${CONTAINER_ID} .rdo-task-item{font-size:9.5px;color:#a8a8a8;min-width:28px;}
#${CONTAINER_ID} .rdo-task-name{font-size:11px;color:#c4c4c4;flex:1;}
#${CONTAINER_ID} .rdo-task-pct{font-size:10px;font-weight:600;color:#b0b0b0;min-width:32px;text-align:right;}
#${CONTAINER_ID} .rdo-task-pct.done{color:#22c55e;}
#${CONTAINER_ID} .rdo-task-pct.part{color:#f59e0b;}

/* WORKER */
#${CONTAINER_ID} .rdo-worker{display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
#${CONTAINER_ID} .rdo-worker:last-child{border-bottom:none;}
#${CONTAINER_ID} .rdo-worker-av{
    width:30px;height:30px;border-radius:50%;background:#1a1a1a;
    border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;
    justify-content:center;font-size:10px;font-weight:600;color:#d0d0d0;flex-shrink:0;
}
#${CONTAINER_ID} .rdo-worker-info{flex:1;min-width:0;}
#${CONTAINER_ID} .rdo-worker-name{font-size:12px;color:#ffffff;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#${CONTAINER_ID} .rdo-worker-role{font-size:10px;color:#d0d0d0;}
#${CONTAINER_ID} .rdo-worker-stats{text-align:right;flex-shrink:0;}
#${CONTAINER_ID} .rdo-worker-pres{font-size:12px;font-weight:600;color:#22c55e;}
#${CONTAINER_ID} .rdo-worker-hrs{font-size:10px;color:#d0d0d0;}

/* CLIMATE */
#${CONTAINER_ID} .rdo-clima-sumario{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px;}
#${CONTAINER_ID} .rdo-clima-item{
    background:#1a1a1a;border:1px solid rgba(255,255,255,0.05);
    border-radius:6px;padding:12px;text-align:center;
}
#${CONTAINER_ID} .rdo-clima-period{font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;color:#a8a8a8;margin-bottom:8px;}
#${CONTAINER_ID} .rdo-clima-big{font-size:18px;font-weight:600;color:#ffffff;line-height:1;margin-bottom:3px;}
#${CONTAINER_ID} .rdo-clima-sub{font-size:10px;color:#d0d0d0;}

/* MATERIAL TABLE */
#${CONTAINER_ID} .rdo-mat-head{
    display:flex;justify-content:space-between;padding:5px 0;
    border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:4px;
}
#${CONTAINER_ID} .rdo-mat-head span{font-size:10px;font-weight:500;color:#a8a8a8;text-transform:uppercase;letter-spacing:.05em;}
#${CONTAINER_ID} .rdo-mat-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);}
#${CONTAINER_ID} .rdo-mat-row:last-child{border-bottom:none;}
#${CONTAINER_ID} .rdo-mat-desc{font-size:12px;color:#ffffff;}
#${CONTAINER_ID} .rdo-mat-qty{font-size:12px;font-weight:600;color:#ffffff;}

/* RANKING NUM */
#${CONTAINER_ID} .rdo-rank-num{
    width:18px;height:18px;border-radius:4px;background:#1a1a1a;
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:600;color:#b0b0b0;flex-shrink:0;
}

/* FUNCIONALIDADES (existente) */
#${CONTAINER_ID} .rdo-func-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
#${CONTAINER_ID} .rdo-fi{
    padding:13px 14px;background:#111111;border:1px solid rgba(255,255,255,0.07);border-radius:8px;
    box-shadow:0px 1px 5px -4px rgba(0,0,0,0.9),0px 0px 0px 1px rgba(255,255,255,0.04),0px 4px 8px rgba(0,0,0,0.4);
}
#${CONTAINER_ID} .rdo-fi-name{font-size:12px;font-weight:600;color:#ffffff;margin-bottom:4px;}
#${CONTAINER_ID} .rdo-fi-desc{font-size:11px;color:#d0d0d0;line-height:1.5;}

/* TUTORIAL (existente) */
#${CONTAINER_ID} .rdo-tut-list{display:flex;flex-direction:column;gap:6px;}
#${CONTAINER_ID} .rdo-ts{
    display:flex;gap:14px;padding:14px 16px;background:#111111;
    border:1px solid rgba(255,255,255,0.07);border-radius:8px;
    box-shadow:0px 1px 5px -4px rgba(0,0,0,0.9),0px 0px 0px 1px rgba(255,255,255,0.04),0px 4px 8px rgba(0,0,0,0.4);
}
#${CONTAINER_ID} .rdo-ts-n{font-size:11px;font-weight:600;color:#a8a8a8;width:18px;flex-shrink:0;padding-top:1px;}
#${CONTAINER_ID} .rdo-ts-title{font-size:12px;font-weight:600;color:#ffffff;margin-bottom:4px;}
#${CONTAINER_ID} .rdo-ts-desc{font-size:11px;color:#d0d0d0;line-height:1.5;}
#${CONTAINER_ID} .rdo-ts-code{
    display:inline-block;font-family:'Roboto Mono',monospace;font-size:10px;
    background:#1a1a1a;border:1px solid rgba(255,255,255,0.07);
    padding:2px 7px;border-radius:4px;margin-top:5px;color:#d0d0d0;
}

/* AVISO DEV + SERVIDOR (dashboard) */
#${CONTAINER_ID} .rdo-dev-nota{
    font-size:11px;line-height:1.55;color:#e2e2e2;
    background:#151515;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;margin-bottom:14px;
}
#${CONTAINER_ID} .rdo-srv-box{
    font-size:11px;line-height:1.5;color:#e2e2e2;
    background:#151515;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;margin-bottom:16px;
}
#${CONTAINER_ID} .rdo-srv-row{display:flex;align-items:flex-start;gap:10px;}
#${CONTAINER_ID} .rdo-dash-srv-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:3px;background:#717171;}
#${CONTAINER_ID} .rdo-dash-srv-dot.ok{background:#22c55e;}
#${CONTAINER_ID} .rdo-dash-srv-dot.bad{background:#ef4444;}
#${CONTAINER_ID} .rdo-srv-lines{flex:1;min-width:0;}
#${CONTAINER_ID} .rdo-srv-strong{font-weight:600;color:#ffffff;margin-bottom:4px;}
#${CONTAINER_ID} .rdo-srv-detail{font-size:10px;color:#c8c8c8;}
#${CONTAINER_ID} .rdo-update-banner{display:none;margin-top:10px;}
#${CONTAINER_ID} .rdo-update-banner.on{display:block;}
#${CONTAINER_ID} .rdo-update-banner a{color:#93c5fd;font-weight:600;text-decoration:underline;cursor:pointer;}

/* VERSÕES (existente) */
#${CONTAINER_ID} .rdo-ver-list{display:flex;flex-direction:column;}
#${CONTAINER_ID} .rdo-vi{display:flex;gap:14px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
#${CONTAINER_ID} .rdo-vi:last-child{border-bottom:none;}
#${CONTAINER_ID} .rdo-vdot{width:6px;height:6px;border-radius:50%;background:#222;border:1px solid rgba(255,255,255,0.12);flex-shrink:0;margin-top:4px;}
#${CONTAINER_ID} .rdo-vdot.cur{background:#ffffff;border-color:#ffffff;}
#${CONTAINER_ID} .rdo-vtit{font-size:12px;font-weight:600;color:#ffffff;display:flex;align-items:center;gap:7px;margin-bottom:2px;}
#${CONTAINER_ID} .rdo-vpill{font-size:9px;font-weight:500;padding:1px 7px;border-radius:9999px;background:rgba(255,255,255,0.06);color:#d0d0d0;border:1px solid rgba(255,255,255,0.1);}
#${CONTAINER_ID} .rdo-vdesc{font-size:11px;color:#a8a8a8;line-height:1.5;}
`;

    function montarHtml() {
        const { inicio, fim } = datasPadraoMes();
        const vLocal = (typeof window !== 'undefined' && window.COMPLEMENTO_RDO_VERSION) ? window.COMPLEMENTO_RDO_VERSION : '2.1';
        const loja = (typeof window !== 'undefined' && window.COMPLEMENTO_RDO_STORE_URL)
            ? window.COMPLEMENTO_RDO_STORE_URL
            : 'https://chromewebstore.google.com/detail/complemento-rdo/ifcagjkbngilbhannhibomnniipoannd';
        return `<style>${CSS}</style>

<div class="rdo-fab" id="rdo-fab" title="Abrir painel">
  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
</div>

<div class="rdo-overlay" id="rdo-overlay" style="display:none;">
  <div class="rdo-layout">

    <nav class="rdo-sb">
      <div class="rdo-sb-head">
        <div class="rdo-sb-wordmark">Complemento <span>RDO</span></div>
        <div class="rdo-sb-ver">versão ${vLocal}</div>
      </div>

      <div class="rdo-sb-sec">Painel</div>
      <div class="rdo-ni on" data-pg="dash">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="1" width="5.5" height="5.5" rx=".8"/><rect x="9.5" y="1" width="5.5" height="5.5" rx=".8"/><rect x="1" y="9.5" width="5.5" height="5.5" rx=".8"/><rect x="9.5" y="9.5" width="5.5" height="5.5" rx=".8"/></svg>
        Dashboard
      </div>
      <div class="rdo-ni" data-pg="pend">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><polyline points="8 4.5 8 8 10 10"/></svg>
        Pendências
      </div>

      <div class="rdo-sb-sec">Análise</div>
      <div class="rdo-ni" data-pg="obras">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="8" width="3" height="6" rx=".5"/><rect x="6.5" y="5" width="3" height="9" rx=".5"/><rect x="11" y="2" width="3" height="12" rx=".5"/></svg>
        Obras
      </div>
      <div class="rdo-ni" data-pg="prod">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="2 12 5 7 8.5 10 13 4"/><circle cx="13" cy="4" r="1" fill="currentColor"/></svg>
        Produção
      </div>
      <div class="rdo-ni" data-pg="mo">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="2.5"/><path d="M2.5 14c0-3 2-4.5 5.5-4.5s5.5 1.5 5.5 4.5"/></svg>
        Mão de Obra
      </div>
      <div class="rdo-ni" data-pg="ocorr">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2L14 13H2L8 2z"/><line x1="8" y1="7" x2="8" y2="10"/><circle cx="8" cy="12" r=".5" fill="currentColor"/></svg>
        Ocorrências
      </div>
      <div class="rdo-ni" data-pg="clima">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="6.5" r="2.5"/><path d="M3 12.5a5 5 0 0110 0"/><line x1="8" y1="1" x2="8" y2="2.5"/><line x1="12.5" y1="3" x2="11.4" y2="4.1"/><line x1="14" y1="7" x2="12.5" y2="7"/></svg>
        Clima
      </div>
      <div class="rdo-ni" data-pg="equip">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="5" width="14" height="8" rx="1"/><path d="M4 5V3.5A1.5 1.5 0 015.5 2h5A1.5 1.5 0 0112 3.5V5"/></svg>
        Equipamentos
      </div>
      <div class="rdo-ni" data-pg="mat">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 11V5l6-3 6 3v6l-6 3-6-3z"/><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="5" x2="14" y2="5"/></svg>
        Materiais
      </div>

      <div class="rdo-sb-sec">Extensão</div>
      <div class="rdo-ni" data-pg="func">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5" rx=".6"/><rect x="9" y="2" width="5" height="5" rx=".6"/><rect x="2" y="9" width="5" height="5" rx=".6"/><path d="M11.5 9v6M8.5 12h6"/></svg>
        Funcionalidades
      </div>
      <div class="rdo-ni" data-pg="tut">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M6.5 6a1.5 1.5 0 0 1 3 .5c0 1.5-2 1.5-2 3"/><circle cx="8" cy="12" r=".5" fill="currentColor"/></svg>
        Tutorial
      </div>
      <div class="rdo-ni" data-pg="ver">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><polyline points="6 8 8 10 11.5 6"/></svg>
        Versões
      </div>

      <div class="rdo-sb-foot">
        <div class="rdo-sb-foot-srv">
          <div class="rdo-sb-srv-dot" id="rdo-sb-srv-dot"></div>
          <div>
            <div class="rdo-sb-srv-line1" id="rdo-sb-srv-line1">Verificando servidor…</div>
            <div class="rdo-sb-foot-sub" id="rdo-sb-foot-sub"></div>
          </div>
        </div>
        <div class="rdo-sb-foot-app">Extensão v${vLocal} · diariodeobra.app</div>
      </div>
    </nav>

    <div class="rdo-main">
      <div class="rdo-topbar">
        <span class="rdo-tb-title" id="rdo-tb-t">Dashboard</span>
        <div style="display:flex;align-items:center;gap:10px;">
          <span class="rdo-tb-crumb" id="rdo-tb-c">visão geral</span>
          <div class="rdo-tb-close" id="rdo-close-btn" title="Minimizar">
            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
          </div>
        </div>
      </div>

      <!--  DASHBOARD  -->
      <div class="rdo-pg on" id="rdo-pg-dash">
        <div class="rdo-ph">Dashboard</div>
        <div class="rdo-ps">Resumo de obras ativas e relatórios do período</div>
        <div class="rdo-dev-nota" id="rdo-dev-nota">
          Ainda estou desenvolvendo: por enquanto há só o básico aqui. A ideia é cruzar o máximo de dados possível,
          gerar o máximo de informação útil e permitir extrair tudo direto desta página, sem depender de fluxos manuais repetitivos.
        </div>
        
        <div class="rdo-sgrid">
          <div class="rdo-sc"><div class="rdo-sc-lbl">Obras ativas</div><div class="rdo-sc-val" id="rdo-s1">--</div><div class="rdo-sc-meta">em andamento</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Não aprovados</div><div class="rdo-sc-val r" id="rdo-s2">--</div><div class="rdo-sc-meta">no período</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Consultadas</div><div class="rdo-sc-val g" id="rdo-s3">--%</div><div class="rdo-sc-meta">taxa de consulta</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Falhas</div><div class="rdo-sc-val" id="rdo-s4">--</div><div class="rdo-sc-meta">erros de req.</div></div>
        </div>
        <div class="rdo-g2">
          <div class="rdo-card">
            <div class="rdo-card-tit">Pendências do período</div>
            <div class="rdo-card-sub">Relatórios não aprovados agrupados por tipo</div>
            <div class="rdo-frow">
              <div class="rdo-fg"><label>Início</label><input type="date" id="rdo-d1" value="${inicio}"></div>
              <div class="rdo-fg"><label>Fim</label><input type="date" id="rdo-d2" value="${fim}"></div>
              <button class="rdo-btn" id="rdo-btn1">Buscar</button>
            </div>
            <div class="rdo-smsg" id="rdo-msg1"></div>
            <div class="rdo-pbar-wrap" id="rdo-pw1">
              <div class="rdo-pbar-txt" id="rdo-pt1"></div>
              <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-pf1"></div></div>
            </div>
            <div class="rdo-scroll" id="rdo-tab1"><div class="rdo-empty">Selecione o período e clique em Buscar</div></div>
          </div>
          <div class="rdo-card">
            <div class="rdo-card-tit">Distribuição por tipo</div>
            <div class="rdo-card-sub">Proporção dos relatórios pendentes</div>
            <div class="rdo-scroll" id="rdo-chart1"><div class="rdo-empty">Aguardando busca</div></div>
          </div>
        </div>
      </div>

      <!--  PENDÊNCIAS  -->
      <div class="rdo-pg" id="rdo-pg-pend">
        <div class="rdo-ph">Pendências</div>
        <div class="rdo-ps">Lista completa de relatórios não aprovados</div>
        <div class="rdo-card">
          <div class="rdo-frow">
            <div class="rdo-fg"><label>Início</label><input type="date" id="rdo-p1" value="${inicio}"></div>
            <div class="rdo-fg"><label>Fim</label><input type="date" id="rdo-p2" value="${fim}"></div>
            <button class="rdo-btn" id="rdo-pbtn">Buscar</button>
          </div>
          <div class="rdo-smsg" id="rdo-pmsg"></div>
          <div class="rdo-pbar-wrap" id="rdo-ppw">
            <div class="rdo-pbar-txt" id="rdo-ppt"></div>
            <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-ppf"></div></div>
          </div>
          <div id="rdo-ptab"><div class="rdo-empty">Configure o período acima</div></div>
        </div>
      </div>

      <!--  OBRAS  -->
      <div class="rdo-pg" id="rdo-pg-obras">
        <div class="rdo-ph">Obras</div>
        <div class="rdo-ps">Visão geral de todas as obras cadastradas</div>
        <div class="rdo-sgrid">
          <div class="rdo-sc"><div class="rdo-sc-lbl">Total</div><div class="rdo-sc-val" id="rdo-ob-total">--</div><div class="rdo-sc-meta">obras cadastradas</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Em andamento</div><div class="rdo-sc-val g" id="rdo-ob-and">--</div><div class="rdo-sc-meta">ativas</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Concluídas</div><div class="rdo-sc-val b" id="rdo-ob-conc">--</div><div class="rdo-sc-meta">finalizadas</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Paralisadas</div><div class="rdo-sc-val y" id="rdo-ob-par">--</div><div class="rdo-sc-meta">paradas</div></div>
        </div>
        <div class="rdo-frow" style="margin-bottom:14px;">
          <div class="rdo-fg">
            <label>Filtrar por status</label>
            <select id="rdo-ob-filtro">
              <option value="">Todos</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Concluída">Concluída</option>
              <option value="Paralisada">Paralisada</option>
              <option value="Não Iniciada">Não Iniciada</option>
            </select>
          </div>
          <button class="rdo-btn" id="rdo-ob-btn">Carregar obras</button>
          <button class="rdo-btn sec" id="rdo-ob-refresh" title="Atualizar cache">↺ Atualizar</button>
        </div>
        <div class="rdo-smsg" id="rdo-ob-msg"></div>
        <div id="rdo-ob-grid"><div class="rdo-empty">Clique em Carregar obras para ver a lista</div></div>
      </div>

      <!--  PRODUÇÃO  -->
      <div class="rdo-pg" id="rdo-pg-prod">
        <div class="rdo-ph">Produção</div>
        <div class="rdo-ps">Avanço físico e cronograma de tarefas por obra</div>
        <div class="rdo-card">
          <div class="rdo-frow">
            <div class="rdo-fg">
              <label>Obra</label>
              <select id="rdo-prod-obra"><option value="">Selecione uma obra...</option></select>
            </div>
            <button class="rdo-btn" id="rdo-prod-btn">Carregar tarefas</button>
          </div>
          <div class="rdo-smsg" id="rdo-prod-msg"></div>
          <div class="rdo-pbar-wrap" id="rdo-prod-pw">
            <div class="rdo-pbar-txt" id="rdo-prod-pt">Carregando...</div>
            <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-prod-pf"></div></div>
          </div>
        </div>
        <div class="rdo-sgrid3" id="rdo-prod-stats" style="display:none;">
          <div class="rdo-sc"><div class="rdo-sc-lbl">Total de tarefas</div><div class="rdo-sc-val" id="rdo-prod-tot">--</div><div class="rdo-sc-meta"></div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Concluídas</div><div class="rdo-sc-val g" id="rdo-prod-conc">--</div><div class="rdo-sc-meta"></div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Realizado</div><div class="rdo-sc-val b" id="rdo-prod-real">--%</div><div class="rdo-sc-meta">avanço geral</div></div>
        </div>
        <div id="rdo-prod-content"><div class="rdo-empty">Selecione uma obra para ver o cronograma</div></div>
      </div>

      <!--  MÃO DE OBRA  -->
      <div class="rdo-pg" id="rdo-pg-mo">
        <div class="rdo-ph">Mão de Obra</div>
        <div class="rdo-ps">Presença, horas trabalhadas e composição da equipe</div>
        <div class="rdo-card">
          <div class="rdo-frow">
            <div class="rdo-fg"><label>Obra</label><select id="rdo-mo-obra"><option value="">Selecione...</option></select></div>
            <div class="rdo-fg"><label>Início</label><input type="date" id="rdo-mo-d1" value="${inicio}"></div>
            <div class="rdo-fg"><label>Fim</label><input type="date" id="rdo-mo-d2" value="${fim}"></div>
            <button class="rdo-btn" id="rdo-mo-btn">Buscar</button>
          </div>
          <div class="rdo-smsg" id="rdo-mo-msg"></div>
          <div class="rdo-pbar-wrap" id="rdo-mo-pw">
            <div class="rdo-pbar-txt" id="rdo-mo-pt"></div>
            <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-mo-pf"></div></div>
          </div>
        </div>
        <div class="rdo-sgrid" id="rdo-mo-stats" style="display:none;">
          <div class="rdo-sc"><div class="rdo-sc-lbl">Colaboradores</div><div class="rdo-sc-val" id="rdo-mo-ncol">--</div><div class="rdo-sc-meta">únicos no período</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Presenças totais</div><div class="rdo-sc-val g" id="rdo-mo-npres">--</div><div class="rdo-sc-meta">registros com presença</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Horas totais</div><div class="rdo-sc-val b" id="rdo-mo-nhrs">--</div><div class="rdo-sc-meta">horas trabalhadas</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Relatórios</div><div class="rdo-sc-val" id="rdo-mo-nrel">--</div><div class="rdo-sc-meta">analisados</div></div>
        </div>
        <div class="rdo-g2" id="rdo-mo-content" style="display:none;">
          <div class="rdo-card">
            <div class="rdo-card-tit">Presença por colaborador</div>
            <div class="rdo-card-sub">Dias presente · ordenado por frequência</div>
            <div class="rdo-scroll-tall" id="rdo-mo-presenca"><div class="rdo-empty">–</div></div>
          </div>
          <div class="rdo-card">
            <div class="rdo-card-tit">Horas trabalhadas</div>
            <div class="rdo-card-sub">Total acumulado no período</div>
            <div class="rdo-scroll-tall" id="rdo-mo-horas"><div class="rdo-empty">–</div></div>
          </div>
        </div>
        <div class="rdo-card" id="rdo-mo-padrao-card" style="display:none;margin-top:8px;">
          <div class="rdo-card-tit">Mão de obra padrão</div>
          <div class="rdo-card-sub">Funções registradas nos relatórios do período</div>
          <div id="rdo-mo-padrao"></div>
        </div>
      </div>

      <!--  OCORRÊNCIAS  -->
      <div class="rdo-pg" id="rdo-pg-ocorr">
        <div class="rdo-ph">Ocorrências</div>
        <div class="rdo-ps">Frequência e tipos de ocorrências no período</div>
        <div class="rdo-card">
          <div class="rdo-frow">
            <div class="rdo-fg"><label>Obra</label><select id="rdo-ocorr-obra"><option value="">Selecione...</option></select></div>
            <div class="rdo-fg"><label>Início</label><input type="date" id="rdo-ocorr-d1" value="${inicio}"></div>
            <div class="rdo-fg"><label>Fim</label><input type="date" id="rdo-ocorr-d2" value="${fim}"></div>
            <button class="rdo-btn" id="rdo-ocorr-btn">Buscar</button>
          </div>
          <div class="rdo-smsg" id="rdo-ocorr-msg"></div>
          <div class="rdo-pbar-wrap" id="rdo-ocorr-pw">
            <div class="rdo-pbar-txt" id="rdo-ocorr-pt"></div>
            <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-ocorr-pf"></div></div>
          </div>
        </div>
        <div class="rdo-sgrid3" id="rdo-ocorr-stats" style="display:none;">
          <div class="rdo-sc"><div class="rdo-sc-lbl">Total ocorrências</div><div class="rdo-sc-val r" id="rdo-ocorr-tot">--</div><div class="rdo-sc-meta">registradas</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Tipos únicos</div><div class="rdo-sc-val" id="rdo-ocorr-tipos">--</div><div class="rdo-sc-meta">tags distintas</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Relatórios afetados</div><div class="rdo-sc-val y" id="rdo-ocorr-rels">--</div><div class="rdo-sc-meta">com ocorrência</div></div>
        </div>
        <div class="rdo-g2" id="rdo-ocorr-content" style="display:none;">
          <div class="rdo-card">
            <div class="rdo-card-tit">Por tag / tipo</div>
            <div class="rdo-card-sub">Frequência por categoria de ocorrência</div>
            <div id="rdo-ocorr-tags"></div>
          </div>
          <div class="rdo-card">
            <div class="rdo-card-tit">Lista de ocorrências</div>
            <div class="rdo-card-sub">Todas as descrições registradas no período</div>
            <div class="rdo-scroll-tall" id="rdo-ocorr-lista"></div>
          </div>
        </div>
      </div>

      <!--  CLIMA  -->
      <div class="rdo-pg" id="rdo-pg-clima">
        <div class="rdo-ph">Clima</div>
        <div class="rdo-ps">Condições climáticas e impacto na praticabilidade das obras</div>
        <div class="rdo-card">
          <div class="rdo-frow">
            <div class="rdo-fg"><label>Obra</label><select id="rdo-clima-obra"><option value="">Selecione...</option></select></div>
            <div class="rdo-fg"><label>Início</label><input type="date" id="rdo-clima-d1" value="${inicio}"></div>
            <div class="rdo-fg"><label>Fim</label><input type="date" id="rdo-clima-d2" value="${fim}"></div>
            <button class="rdo-btn" id="rdo-clima-btn">Buscar</button>
          </div>
          <div class="rdo-smsg" id="rdo-clima-msg"></div>
          <div class="rdo-pbar-wrap" id="rdo-clima-pw">
            <div class="rdo-pbar-txt" id="rdo-clima-pt"></div>
            <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-clima-pf"></div></div>
          </div>
        </div>
        <div id="rdo-clima-content" style="display:none;">
          <div class="rdo-clima-sumario" id="rdo-clima-sum"></div>
          <div class="rdo-g2">
            <div class="rdo-card">
              <div class="rdo-card-tit">Praticabilidade por turno</div>
              <div class="rdo-card-sub">Dias praticáveis vs impraticáveis em cada período</div>
              <div id="rdo-clima-barras"></div>
            </div>
            <div class="rdo-card">
              <div class="rdo-card-tit">Tipos de clima registrados</div>
              <div class="rdo-card-sub">Frequência por condição climática</div>
              <div id="rdo-clima-tipos"></div>
            </div>
          </div>
        </div>
      </div>

      <!--  EQUIPAMENTOS  -->
      <div class="rdo-pg" id="rdo-pg-equip">
        <div class="rdo-ph">Equipamentos</div>
        <div class="rdo-ps">Utilização de equipamentos por período e obra</div>
        <div class="rdo-card">
          <div class="rdo-frow">
            <div class="rdo-fg"><label>Obra</label><select id="rdo-equip-obra"><option value="">Selecione...</option></select></div>
            <div class="rdo-fg"><label>Início</label><input type="date" id="rdo-equip-d1" value="${inicio}"></div>
            <div class="rdo-fg"><label>Fim</label><input type="date" id="rdo-equip-d2" value="${fim}"></div>
            <button class="rdo-btn" id="rdo-equip-btn">Buscar</button>
          </div>
          <div class="rdo-smsg" id="rdo-equip-msg"></div>
          <div class="rdo-pbar-wrap" id="rdo-equip-pw">
            <div class="rdo-pbar-txt" id="rdo-equip-pt"></div>
            <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-equip-pf"></div></div>
          </div>
        </div>
        <div class="rdo-sgrid3" id="rdo-equip-stats" style="display:none;">
          <div class="rdo-sc"><div class="rdo-sc-lbl">Tipos únicos</div><div class="rdo-sc-val" id="rdo-equip-ntip">--</div><div class="rdo-sc-meta">equipamentos distintos</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Uso total</div><div class="rdo-sc-val b" id="rdo-equip-nuso">--</div><div class="rdo-sc-meta">registros nos RDOs</div></div>
          <div class="rdo-sc"><div class="rdo-sc-lbl">Mais utilizado</div><div class="rdo-sc-val g" id="rdo-equip-top" style="font-size:13px;margin-top:2px;">–</div><div class="rdo-sc-meta">em frequência</div></div>
        </div>
        <div class="rdo-g2" id="rdo-equip-content" style="display:none;">
          <div class="rdo-card">
            <div class="rdo-card-tit">Mais frequentes</div>
            <div class="rdo-card-sub">Aparições nos relatórios do período</div>
            <div id="rdo-equip-freq"></div>
          </div>
          <div class="rdo-card">
            <div class="rdo-card-tit">Maior quantidade total</div>
            <div class="rdo-card-sub">Soma das quantidades no período</div>
            <div id="rdo-equip-qty"></div>
          </div>
        </div>
      </div>

      <!--  MATERIAIS  -->
      <div class="rdo-pg" id="rdo-pg-mat">
        <div class="rdo-ph">Materiais</div>
        <div class="rdo-ps">Controle de materiais recebidos e utilizados no período</div>
        <div class="rdo-card">
          <div class="rdo-frow">
            <div class="rdo-fg"><label>Obra</label><select id="rdo-mat-obra"><option value="">Selecione...</option></select></div>
            <div class="rdo-fg"><label>Início</label><input type="date" id="rdo-mat-d1" value="${inicio}"></div>
            <div class="rdo-fg"><label>Fim</label><input type="date" id="rdo-mat-d2" value="${fim}"></div>
            <button class="rdo-btn" id="rdo-mat-btn">Buscar</button>
          </div>
          <div class="rdo-smsg" id="rdo-mat-msg"></div>
          <div class="rdo-pbar-wrap" id="rdo-mat-pw">
            <div class="rdo-pbar-txt" id="rdo-mat-pt"></div>
            <div class="rdo-pbar"><div class="rdo-pfill" id="rdo-mat-pf"></div></div>
          </div>
        </div>
        <div class="rdo-g2" id="rdo-mat-content" style="display:none;">
          <div class="rdo-card">
            <div class="rdo-card-tit">Materiais recebidos</div>
            <div class="rdo-card-sub">Acumulado consolidado no período</div>
            <div class="rdo-mat-head"><span>Material</span><span>Qtd.</span></div>
            <div class="rdo-scroll-tall" id="rdo-mat-rec"></div>
          </div>
          <div class="rdo-card">
            <div class="rdo-card-tit">Materiais utilizados</div>
            <div class="rdo-card-sub">Acumulado consolidado no período</div>
            <div class="rdo-mat-head"><span>Material</span><span>Qtd.</span></div>
            <div class="rdo-scroll-tall" id="rdo-mat-util"></div>
          </div>
        </div>
      </div>

      <!--  FUNCIONALIDADES  -->
      <div class="rdo-pg" id="rdo-pg-func">
        <div class="rdo-ph">Funcionalidades</div>
        <div class="rdo-ps">Recursos disponíveis nesta versão</div>
        <div class="rdo-func-grid">
          <div class="rdo-fi"><div class="rdo-fi-name">Cálculo de horas HH</div><div class="rdo-fi-desc">Soma automática por função separando HN, K1, K2, K3 e K4. Lança no campo de atividades com um clique.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Extração e compilação de PDFs</div><div class="rdo-fi-desc">Filtre obras e período. Baixe PDFs avulsos ou compile em arquivo único para medição.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Revisão de horas por ponto</div><div class="rdo-fi-desc">Importe CSV do ponto e compare com o RDO linha a linha. Aplica horários arredondados por colaborador.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">RSP por período</div><div class="rdo-fi-desc">Consolida relatórios do período em texto estruturado para RSP. Requer token válido no popup.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Formatação automática</div><div class="rdo-fi-desc">Formata comentários e ocorrências com a API . Pode ser desativada na revisão geral.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Extrator geral de dados</div><div class="rdo-fi-desc">Extrai atividades e horas de todas as obras em planilha XLSX consolidada com links diretos.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Atalhos de teclado</div><div class="rdo-fi-desc">Salvar, navegar e ações rápidas. Ative no popup. Lista completa no card de atalhos dentro do app.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Slider de imagens</div><div class="rdo-fi-desc">Slider de fotos nas obras em andamento com cache de 30 min e scroll estilo touch.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Dashboard · Obras</div><div class="rdo-fi-desc">Visão geral de todas as obras com filtro por status, contadores e cards com totais.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Dashboard · Produção</div><div class="rdo-fi-desc">Cronograma e % de avanço por etapa e tarefa. Selecione qualquer obra cadastrada.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Dashboard · Mão de Obra</div><div class="rdo-fi-desc">Presença e horas trabalhadas por colaborador. Filtre por obra e período.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Dashboard · Ocorrências</div><div class="rdo-fi-desc">Frequência por tag, lista de registros e contadores de impacto no período.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Dashboard · Clima</div><div class="rdo-fi-desc">Praticabilidade por turno (manhã/tarde/noite), tipos de clima e indicadores consolidados.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Dashboard · Equipamentos</div><div class="rdo-fi-desc">Ranking de equipamentos por frequência de uso e quantidade total no período.</div></div>
          <div class="rdo-fi"><div class="rdo-fi-name">Dashboard · Materiais</div><div class="rdo-fi-desc">Consolidado de materiais recebidos e utilizados acumulado por nome no período.</div></div>
        </div>
      </div>

      <!--  TUTORIAL  -->
      <div class="rdo-pg" id="rdo-pg-tut">
        <div class="rdo-ph">Tutorial</div>
        <div class="rdo-ps">Primeiros passos e uso das principais funções</div>
        <div class="rdo-tut-list">
          <div class="rdo-ts"><div class="rdo-ts-n">01</div><div><div class="rdo-ts-title">Configure o token da API</div><div class="rdo-ts-desc">Abra o popup da extensão e insira o token da API externa do Diário de Obra. Sem isso nenhuma função de busca funciona.</div><span class="rdo-ts-code">Popup > Token API Externa</span></div></div>
          <div class="rdo-ts"><div class="rdo-ts-n">02</div><div><div class="rdo-ts-title">Configure a chave  (opcional)</div><div class="rdo-ts-desc">Para usar a formatação automática de comentários e ocorrências, insira sua chave da API  no campo do popup.</div><span class="rdo-ts-code">Popup > API Key</span></div></div>
          <div class="rdo-ts"><div class="rdo-ts-n">03</div><div><div class="rdo-ts-title">Busque pendências por período</div><div class="rdo-ts-desc">No Dashboard ou em Pendências, selecione o intervalo de datas e clique em Buscar. O sistema consulta todas as obras ativas e agrupa os relatórios não aprovados por tipo.</div></div></div>
          <div class="rdo-ts"><div class="rdo-ts-n">04</div><div><div class="rdo-ts-title">Use os dashboards de análise</div><div class="rdo-ts-desc">Nas abas Obras, Produção, Mão de Obra, Ocorrências, Clima, Equipamentos e Materiais: selecione a obra e o período. O sistema busca os relatórios e detalha cada relatório individualmente (120ms entre chamadas para respeitar o limite de 150 req/min).</div></div></div>
          <div class="rdo-ts"><div class="rdo-ts-n">05</div><div><div class="rdo-ts-title">Card HH dentro do RDO</div><div class="rdo-ts-desc">Ao abrir um RDO de obra HH em modo de edição, o card de análise aparece automaticamente. Confira as horas por função e clique em Adicionar para lançar no campo de atividades.</div></div></div>
          <div class="rdo-ts"><div class="rdo-ts-n">06</div><div><div class="rdo-ts-title">Revisão geral automática</div><div class="rdo-ts-desc">O botão Revisão Geral executa em sequência: hora padrão, equipamentos, formatação, lançamento de horas HH e aprovação. O checkbox ao lado controla se aprova ou apenas salva.</div></div></div>
        </div>
      </div>

      <!--  VERSÕES  -->
      <div class="rdo-pg" id="rdo-pg-ver">
        <div class="rdo-ph">Versões</div>
        <div class="rdo-ps">Histórico completo de atualizações</div>
        <div class="rdo-card">
          <div class="rdo-ver-list">
       
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 2.1</div><div class="rdo-vdesc">Dashboard tela cheia, sidebar com abas, FAB com posição fixa, progresso por obra em tempo real. Dashboards de análise: Obras, Produção, Mão de Obra, Ocorrências, Clima, Equipamentos e Materiais. Filtros por obra e período em todos. Cache de obras.</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 2.0</div><div class="rdo-vdesc">Side panel, MutationObserver, guard de chrome API, timeout e retry no compilador</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.9</div><div class="rdo-vdesc">Comentário RSP aprimorado, links diretos no Excel, exportação ilimitada</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.8</div><div class="rdo-vdesc">Links clicáveis nos arquivos XLSX, correções na extração e exportação de dados</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.7</div><div class="rdo-vdesc">Correções críticas de runtime na revisão automática, maior estabilidade geral</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.6</div><div class="rdo-vdesc">Sistema de revisão automática de relatórios, melhorias de interface</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.5</div><div class="rdo-vdesc">Revisão automática aprimorada, maior precisão na extração e processamento</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.4</div><div class="rdo-vdesc">Revisão geral de relatórios, melhorias no servidor e confiabilidade dos dados</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.3</div><div class="rdo-vdesc">Correções gerais de bugs e melhorias de estabilidade</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.2</div><div class="rdo-vdesc">Lista de colaboradores não utilizados, correção encoding UTF-8, extrator geral</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.1</div><div class="rdo-vdesc">Extração de horas linha a linha, exportação granular para XLSX por colaborador</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 1.0</div><div class="rdo-vdesc">Versão estável, compilador de medição, filtros, XLSX, PDFs, atalhos e temas</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 0.9 beta</div><div class="rdo-vdesc">Fetch paralelo, painel unificado, filtros avançados, exportação consolidada</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 0.8 beta</div><div class="rdo-vdesc">Slider de imagens das obras, cache 30 min, pré-carregamento</div></div></div>
            <div class="rdo-vi"><div class="rdo-vdot"></div><div><div class="rdo-vtit">v 0.1 beta</div><div class="rdo-vdesc">Card de horas por função, card flutuante colapsável, tema escuro inicial</div></div></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>`;
    }

    //  RENDER HELPERS 

    function renderBarras(items, containerId, colorClass) {
        if (!items.length) return `<div class="rdo-empty">Nenhum dado encontrado</div>`;
        const max = items[0].v;
        return items.slice(0, 12).map(it => `
            <div class="rdo-bar-item">
                <div class="rdo-bar-head">
                    <span>${escapeHtml(it.k)}</span>
                    <span>${it.v}</span>
                </div>
                <div class="rdo-bar-track">
                    <div class="rdo-bar-fill ${colorClass || ''}" style="width:${Math.round(it.v / max * 100)}%"></div>
                </div>
            </div>`).join('');
    }

    function renderRowItems(items) {
        if (!items.length) return `<div class="rdo-empty">Nenhum dado encontrado</div>`;
        return items.map((it, idx) => `
            <div class="rdo-row-item">
                <div style="display:flex;align-items:center;gap:8px;">
                    <div class="rdo-rank-num">${idx + 1}</div>
                    <div>
                        <div class="rdo-ri-name">${escapeHtml(it.k)}</div>
                        ${it.sub ? `<div class="rdo-ri-sub">${escapeHtml(it.sub)}</div>` : ''}
                    </div>
                </div>
                <span class="rdo-ri-val">${it.v}</span>
            </div>`).join('');
    }

    function setProgresso(pw, pt, pf, atual, total, label) {
        pw.style.display = 'block';
        const pct = total > 0 ? Math.round(atual / total * 100) : 0;
        pf.style.width = pct + '%';
        pt.textContent = label || `${atual} / ${total}`;
    }

    function setMsg(el, txt, err) {
        el.textContent = txt;
        el.className = 'rdo-smsg' + (err ? ' err' : '');
    }

    function popularSelect(sel, obras) {
        const atual = sel.value;
        sel.innerHTML = '<option value="">Selecione uma obra...</option>';
        obras.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o._id;
            opt.textContent = o.nome;
            sel.appendChild(opt);
        });
        if (atual) sel.value = atual;
    }

    async function popularTodosSelects(wrap, forceRefresh) {
        try {
            const obras = await getObras(forceRefresh);
            if (!Array.isArray(obras)) return;
            const sorted = [...obras].sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
            ['rdo-prod-obra', 'rdo-mo-obra', 'rdo-ocorr-obra', 'rdo-clima-obra', 'rdo-equip-obra', 'rdo-mat-obra'].forEach(id => {
                const s = wrap.querySelector('#' + id);
                if (s) popularSelect(s, sorted);
            });
        } catch (e) { /* silencia, token pode não estar configurado */ }
    }

    function atualizarPainelServidorVersao(wrap) {
        if (!wrap || typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
        const loja =
            (typeof window !== 'undefined' && window.COMPLEMENTO_RDO_STORE_URL) ||
            'https://chromewebstore.google.com/detail/complemento-rdo/ifcagjkbngilbhannhibomnniipoannd';
        const vLocal =
            (typeof window !== 'undefined' && window.COMPLEMENTO_RDO_VERSION) || '2.1';

        const apply = () => {
            chrome.storage.local.get(
                ['server_unavailable', 'server_remote_complemento_version', 'server_remote_backend'],
                (r) => {
                    if (chrome.runtime.lastError) return;
                    const ok = !r.server_unavailable;
                    const remote = String(r.server_remote_complemento_version || '').trim();
                    const backend = String(r.server_remote_backend || '').trim();

                    const sbDot = wrap.querySelector('#rdo-sb-srv-dot');
                    const sbLine = wrap.querySelector('#rdo-sb-srv-line1');
                    const sbSub = wrap.querySelector('#rdo-sb-foot-sub');
                    if (sbDot) {
                        sbDot.classList.toggle('ok', ok);
                        sbDot.classList.toggle('bad', !ok);
                    }
                    if (sbLine) {
                        sbLine.textContent = ok
                            ? 'Sincronização: servidor OK'
                            : 'Sincronização: sem resposta válida';
                    }
                    if (sbSub) {
                        sbSub.textContent = ok
                            ? (backend
                                ? `Publicado v${remote || '—'} · ${backend}`
                                : (remote ? `Versão no status: ${remote}` : 'Resposta ok (sem version no JSON)'))
                            : 'isServerAvailable() fica falso; funções dependentes não executam.';
                    }

                    const dd = wrap.querySelector('#rdo-dash-srv-dot');
                    const dmeta = wrap.querySelector('#rdo-dash-srv-meta');
                    const dtitle = wrap.querySelector('#rdo-dash-srv-title');
                    const ban = wrap.querySelector('#rdo-update-banner');
                    const link = wrap.querySelector('#rdo-update-link');
                    if (dd) {
                        dd.classList.toggle('ok', ok);
                        dd.classList.toggle('bad', !ok);
                    }
                    if (dtitle) {
                        dtitle.textContent = ok
                            ? 'Servidor de sincronização: OK'
                            : 'Servidor de sincronização: indisponível ou inválido';
                    }
                    if (dmeta) {
                        dmeta.textContent = ok
                            ? `Esta extensão instalada: v${vLocal}` +
                              (remote ? ` · versão no status: ${remote}` : '') +
                              (backend ? ` · backend: ${backend}` : '')
                            : `Extensão v${vLocal}, aguardando endpoint de status (JSON raw no GitHub).`;
                    }
                    const showUp = ok && remote && remote !== String(vLocal).trim();
                    if (ban && link) {
                        if (showUp) {
                            ban.classList.add('on');
                            link.href = loja;
                            link.textContent = `A versão ${remote} está disponível. Atualize!`;
                        } else {
                            ban.classList.remove('on');
                            link.textContent = '';
                        }
                    }
                }
            );
        };
        apply();
        if (!wrap.dataset.complementoSrvUiBound) {
            wrap.dataset.complementoSrvUiBound = '1';
            chrome.storage.onChanged.addListener((ch, area) => {
                if (area !== 'local') return;
                if (!ch.server_unavailable && !ch.server_remote_complemento_version && !ch.server_remote_backend) return;
                if (!document.getElementById(CONTAINER_ID)) return;
                apply();
            });
        }
    }

    //  EVENTOS 
    function ligarEventos(wrap) {
        const overlay  = wrap.querySelector('#rdo-overlay');
        const fab      = wrap.querySelector('#rdo-fab');
        const closeBtn = wrap.querySelector('#rdo-close-btn');

        const colapsado = () => localStorage.getItem(LS_COLLAPSE) !== 'false';
        function setColapse(c) {
            localStorage.setItem(LS_COLLAPSE, c ? 'true' : 'false');
            overlay.style.display = c ? 'none' : 'flex';
            fab.style.display     = c ? 'flex'  : 'none';
        }
        setColapse(colapsado());
        closeBtn.addEventListener('click', () => setColapse(true));
        fab.addEventListener('click',      () => setColapse(false));

        const pgs  = { dash:'Dashboard', pend:'Pendências', obras:'Obras', prod:'Produção', mo:'Mão de Obra', ocorr:'Ocorrências', clima:'Clima', equip:'Equipamentos', mat:'Materiais', func:'Funcionalidades', tut:'Tutorial', ver:'Versões' };
        const subs = { dash:'visão geral', pend:'relatórios não aprovados', obras:'todas as obras', prod:'avanço físico e tarefas', mo:'presença e horas', ocorr:'registros por tipo', clima:'condições e praticabilidade', equip:'uso no período', mat:'recebido vs utilizado', func:'recursos disponíveis', tut:'como usar', ver:'histórico' };

        let selectsPopulados = false;
        wrap.querySelectorAll('.rdo-ni').forEach(n => {
            n.addEventListener('click', () => {
                const pg = n.dataset.pg;
                wrap.querySelectorAll('.rdo-ni').forEach(x => x.classList.remove('on'));
                wrap.querySelectorAll('.rdo-pg').forEach(x => x.classList.remove('on'));
                n.classList.add('on');
                wrap.querySelector('#rdo-pg-' + pg).classList.add('on');
                wrap.querySelector('#rdo-tb-t').textContent = pgs[pg] || pg;
                wrap.querySelector('#rdo-tb-c').textContent = subs[pg] || '';
                // Popula selects na primeira vez que uma aba de análise é aberta
                if (!selectsPopulados && ['prod','mo','ocorr','clima','equip','mat'].includes(pg)) {
                    selectsPopulados = true;
                    popularTodosSelects(wrap, false);
                }
            });
        });

        //  DASHBOARD / PENDÊNCIAS (lógica original) 
        async function executarBusca(cfg) {
            const { d1id, d2id, mid, pwid, ptid, pfid, tid, bid, chid, s1, s2, s3, s4 } = cfg;
            const d1  = wrap.querySelector('#' + d1id);
            const d2  = wrap.querySelector('#' + d2id);
            const msg = wrap.querySelector('#' + mid);
            const pw  = wrap.querySelector('#' + pwid);
            const pt  = wrap.querySelector('#' + ptid);
            const pf  = wrap.querySelector('#' + pfid);
            const tab = wrap.querySelector('#' + tid);
            const btn = wrap.querySelector('#' + bid);
            if (!d1.value || !d2.value) { msg.textContent = 'Selecione as datas.'; return; }
            btn.disabled = true;
            msg.textContent = 'Consultando obras...';
            pw.style.display = 'block';
            pf.style.width = '0%';
            tab.innerHTML = '';
            try {
                const res = await agregarNaoAprovados(d1.value, d2.value, ({ consultadas, totalObras }) => {
                    const pct = totalObras ? Math.round(consultadas / totalObras * 100) : 0;
                    pf.style.width = pct + '%';
                    pt.textContent = consultadas + ' / ' + totalObras + ' obras';
                });
                const { porTipo, total, obrasContadas, erros, consultadas } = res;
                const sorted = Object.keys(porTipo).sort((a, b) => porTipo[b] - porTipo[a]);
                tab.innerHTML = sorted.map(t =>
                    `<div class="rdo-row-item">
                        <span class="rdo-ri-name">${escapeHtml(t)}</span>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span class="rdo-tag ${porTipo[t] > 5 ? 'hi' : 'lo'}">${porTipo[t] > 5 ? 'alto' : 'médio'}</span>
                            <span class="rdo-ri-val">${porTipo[t]}</span>
                        </div>
                    </div>`
                ).join('') || '<div class="rdo-empty">Nenhum relatório pendente no período</div>';
                if (chid && sorted.length) {
                    const ch = wrap.querySelector('#' + chid);
                    const mx = porTipo[sorted[0]];
                    ch.innerHTML = sorted.slice(0, 7).map(t => {
                        const pct = Math.round(porTipo[t] / mx * 100);
                        return `<div class="rdo-bar-item">
                            <div class="rdo-bar-head"><span>${escapeHtml(t)}</span><span>${porTipo[t]}</span></div>
                            <div class="rdo-bar-track"><div class="rdo-bar-fill" style="width:${pct}%"></div></div>
                        </div>`;
                    }).join('');
                }
                const pct = obrasContadas ? Math.round(consultadas / obrasContadas * 100) : 0;
                if (s1) wrap.querySelector('#' + s1).textContent = obrasContadas;
                if (s2) wrap.querySelector('#' + s2).textContent = total;
                if (s3) wrap.querySelector('#' + s3).textContent = pct + '%';
                if (s4) wrap.querySelector('#' + s4).textContent = erros;
                msg.textContent = '';
                btn.textContent = 'Atualizar';
            } catch (err) {
                msg.textContent = String(err.message || err);
            } finally {
                btn.disabled = false;
                pw.style.display = 'none';
            }
        }

        wrap.querySelector('#rdo-btn1').addEventListener('click', () => executarBusca({
            d1id:'rdo-d1', d2id:'rdo-d2', mid:'rdo-msg1', pwid:'rdo-pw1',
            ptid:'rdo-pt1', pfid:'rdo-pf1', tid:'rdo-tab1', bid:'rdo-btn1',
            chid:'rdo-chart1', s1:'rdo-s1', s2:'rdo-s2', s3:'rdo-s3', s4:'rdo-s4'
        }));
        wrap.querySelector('#rdo-pbtn').addEventListener('click', () => executarBusca({
            d1id:'rdo-p1', d2id:'rdo-p2', mid:'rdo-pmsg', pwid:'rdo-ppw',
            ptid:'rdo-ppt', pfid:'rdo-ppf', tid:'rdo-ptab', bid:'rdo-pbtn'
        }));

        //  OBRAS 
        async function carregarObras(forceRefresh) {
            const btn    = wrap.querySelector('#rdo-ob-btn');
            const msg    = wrap.querySelector('#rdo-ob-msg');
            const filtro = wrap.querySelector('#rdo-ob-filtro');
            const grid   = wrap.querySelector('#rdo-ob-grid');
            btn.disabled = true;
            setMsg(msg, 'Carregando obras...');
            try {
                const obras = await getObras(forceRefresh);
                if (!Array.isArray(obras)) throw new Error('Resposta inválida');
                // Contadores
                const cnt = { total: obras.length, and: 0, conc: 0, par: 0, nini: 0 };
                obras.forEach(o => {
                    const d = String((o.status && o.status.descricao) || '').toLowerCase();
                    if (d.includes('andamento')) cnt.and++;
                    else if (d.includes('conclu')) cnt.conc++;
                    else if (d.includes('parali')) cnt.par++;
                    else cnt.nini++;
                });
                wrap.querySelector('#rdo-ob-total').textContent = cnt.total;
                wrap.querySelector('#rdo-ob-and').textContent   = cnt.and;
                wrap.querySelector('#rdo-ob-conc').textContent  = cnt.conc;
                wrap.querySelector('#rdo-ob-par').textContent   = cnt.par;

                function renderGrid() {
                    const f = filtro.value;
                    const lista = f ? obras.filter(o => o.status && o.status.descricao === f) : obras;
                    if (!lista.length) { grid.innerHTML = '<div class="rdo-empty">Nenhuma obra encontrada</div>'; return; }
                    grid.innerHTML = `<div class="rdo-obra-grid">${lista.map(o => {
                        const desc = (o.status && o.status.descricao) || '–';
                        const c = statusColor(desc), bg = statusBg(desc);
                        return `<div class="rdo-obra-card">
                            <div class="rdo-obra-name">${escapeHtml(o.nome)}</div>
                            <div class="rdo-obra-stat" style="color:${c};background:${bg};">● ${escapeHtml(desc)}</div>
                            <div class="rdo-obra-meta">
                                <span>📄 ${o.totalRelatorios || 0} rel.</span>
                                <span>📷 ${o.totalFotos || 0} fotos</span>
                                ${o.modified ? `<span>🕐 ${o.modified.slice(0,10)}</span>` : ''}
                            </div>
                        </div>`;
                    }).join('')}</div>`;
                }

                filtro.addEventListener('change', renderGrid);
                renderGrid();
                setMsg(msg, `${obras.length} obras carregadas`);
                // Atualiza selects das outras abas também
                await popularTodosSelects(wrap, false);
            } catch (e) {
                setMsg(msg, e.message, true);
            } finally {
                btn.disabled = false;
            }
        }

        wrap.querySelector('#rdo-ob-btn').addEventListener('click', () => carregarObras(false));
        wrap.querySelector('#rdo-ob-refresh').addEventListener('click', async () => {
            _obraCache = null;
            selectsPopulados = false;
            await carregarObras(true);
        });
        wrap.querySelector('#rdo-ob-filtro').addEventListener('change', () => {
            if (_obraCache) wrap.querySelector('#rdo-ob-btn').click();
        });

        //  PRODUÇÃO 
        wrap.querySelector('#rdo-prod-btn').addEventListener('click', async () => {
            const sel  = wrap.querySelector('#rdo-prod-obra');
            const msg  = wrap.querySelector('#rdo-prod-msg');
            const pw   = wrap.querySelector('#rdo-prod-pw');
            const pt   = wrap.querySelector('#rdo-prod-pt');
            const pf   = wrap.querySelector('#rdo-prod-pf');
            const btn  = wrap.querySelector('#rdo-prod-btn');
            const cont = wrap.querySelector('#rdo-prod-content');
            const stats= wrap.querySelector('#rdo-prod-stats');
            if (!sel.value) { setMsg(msg, 'Selecione uma obra.', true); return; }
            btn.disabled = true;
            pw.style.display = 'block';
            pt.textContent = 'Buscando tarefas...';
            pf.style.width = '50%';
            setMsg(msg, '');
            cont.innerHTML = '';
            stats.style.display = 'none';
            try {
                const data = await getListaTarefas(sel.value);
                pf.style.width = '100%';
                if (!data || !Array.isArray(data.cronograma)) throw new Error('Sem dados de cronograma');
                wrap.querySelector('#rdo-prod-tot').textContent  = data.totalTarefas || 0;
                wrap.querySelector('#rdo-prod-conc').textContent = data.totalTarefasConcluida || 0;
                wrap.querySelector('#rdo-prod-real').textContent = (parseFloat(data.realizado) || 0).toFixed(1) + '%';
                stats.style.display = '';

                const cores = ['#22c55e','#3b82f6','#f59e0b','#a78bfa','#fb923c','#34d399','#60a5fa'];
                cont.innerHTML = data.cronograma.map((etapa, ei) => {
                    const pct = parseFloat(etapa.porcentagem) || 0;
                    const cor = cores[ei % cores.length];
                    const tarefasHtml = Array.isArray(etapa.tarefas) ? etapa.tarefas.map(t => {
                        const tp = parseFloat(t.porcentagem) || 0;
                        const cls = tp >= 100 ? 'done' : tp > 0 ? 'part' : '';
                        return `<div class="rdo-task">
                            <span class="rdo-task-item">${escapeHtml(t.item || '')}</span>
                            <span class="rdo-task-name">${escapeHtml(t.descricao || '')}</span>
                            <span class="rdo-task-pct ${cls}">${tp}%</span>
                        </div>`;
                    }).join('') : '';
                    return `<div class="rdo-card rdo-etapa">
                        <div class="rdo-etapa-head">
                            <span class="rdo-etapa-name">${escapeHtml(etapa.item || '')} · ${escapeHtml(etapa.descricao || '')}</span>
                            <span class="rdo-etapa-pct">${pct.toFixed(1)}%</span>
                        </div>
                        <div class="rdo-etapa-bar"><div class="rdo-etapa-fill" style="width:${pct}%;background:${cor};"></div></div>
                        <div class="rdo-task-list">${tarefasHtml}</div>
                    </div>`;
                }).join('') || '<div class="rdo-empty">Sem etapas cadastradas</div>';
                setMsg(msg, `${data.cronograma.length} etapas · ${data.totalTarefas} tarefas`);
            } catch (e) {
                setMsg(msg, e.message, true);
                cont.innerHTML = '<div class="rdo-empty">Erro ao carregar tarefas</div>';
            } finally {
                btn.disabled = false;
                pw.style.display = 'none';
            }
        });

        //  MÃO DE OBRA 
        wrap.querySelector('#rdo-mo-btn').addEventListener('click', async () => {
            const sel  = wrap.querySelector('#rdo-mo-obra');
            const d1   = wrap.querySelector('#rdo-mo-d1').value;
            const d2   = wrap.querySelector('#rdo-mo-d2').value;
            const msg  = wrap.querySelector('#rdo-mo-msg');
            const pw   = wrap.querySelector('#rdo-mo-pw');
            const pt   = wrap.querySelector('#rdo-mo-pt');
            const pf   = wrap.querySelector('#rdo-mo-pf');
            const btn  = wrap.querySelector('#rdo-mo-btn');
            if (!sel.value || !d1 || !d2) { setMsg(msg, 'Selecione obra e período.', true); return; }
            btn.disabled = true; setMsg(msg, '');
            wrap.querySelector('#rdo-mo-content').style.display = 'none';
            wrap.querySelector('#rdo-mo-stats').style.display = 'none';
            wrap.querySelector('#rdo-mo-padrao-card').style.display = 'none';
            try {
                const detalhes = await coletarDetalhes(sel.value, d1, d2, ({ atual, total }) => {
                    setProgresso(pw, pt, pf, atual, total, `Relatório ${atual} / ${total}`);
                });
                pw.style.display = 'none';
                if (!detalhes.length) { setMsg(msg, 'Nenhum relatório no período.'); return; }

                // Agrega presença
                const presMap = {}; // nome > { func, dias, segundos }
                const padMap  = {}; // descricao > quantidade total
                detalhes.forEach(rel => {
                    const mo = rel.maoDeObra || {};
                    // Personalizada
                    (mo.personalizada || []).forEach(w => {
                        const k = (w.nome || '?') + '||' + (w.funcao || '');
                        if (!presMap[k]) presMap[k] = { nome: w.nome || '?', funcao: w.funcao || '', dias: 0, seg: 0 };
                        if (w.presenca) presMap[k].dias++;
                        // Converte horasTrabalhadas HH:MM em segundos
                        if (w.horasTrabalhadas) {
                            const [hh, mm] = String(w.horasTrabalhadas).split(':').map(Number);
                            presMap[k].seg += ((hh || 0) * 3600 + (mm || 0) * 60);
                        }
                    });
                    // Padrão
                    (mo.padrao || []).forEach(p => {
                        const k = p.descricao || '?';
                        padMap[k] = (padMap[k] || 0) + (p.quantidade || 0);
                    });
                });

                const workers = Object.values(presMap).sort((a, b) => b.dias - a.dias);
                const totalPres = workers.reduce((s, w) => s + w.dias, 0);
                const totalSeg  = workers.reduce((s, w) => s + w.seg, 0);
                const totalHrs  = Math.floor(totalSeg / 3600);

                wrap.querySelector('#rdo-mo-ncol').textContent  = workers.length;
                wrap.querySelector('#rdo-mo-npres').textContent = totalPres;
                wrap.querySelector('#rdo-mo-nhrs').textContent  = totalHrs + 'h';
                wrap.querySelector('#rdo-mo-nrel').textContent  = detalhes.length;
                wrap.querySelector('#rdo-mo-stats').style.display = '';

                // Presença
                wrap.querySelector('#rdo-mo-presenca').innerHTML = workers.length
                    ? workers.map(w => `
                        <div class="rdo-worker">
                            <div class="rdo-worker-av">${escapeHtml(inicialNome(w.nome))}</div>
                            <div class="rdo-worker-info">
                                <div class="rdo-worker-name">${escapeHtml(w.nome)}</div>
                                <div class="rdo-worker-role">${escapeHtml(w.funcao)}</div>
                            </div>
                            <div class="rdo-worker-stats">
                                <div class="rdo-worker-pres">${w.dias} dias</div>
                            </div>
                        </div>`).join('')
                    : '<div class="rdo-empty">Sem dados</div>';

                // Horas
                const byHours = [...workers].sort((a, b) => b.seg - a.seg).filter(w => w.seg > 0);
                wrap.querySelector('#rdo-mo-horas').innerHTML = byHours.length
                    ? byHours.map(w => {
                        const h = Math.floor(w.seg / 3600);
                        const m = Math.floor((w.seg % 3600) / 60);
                        return `<div class="rdo-worker">
                            <div class="rdo-worker-av">${escapeHtml(inicialNome(w.nome))}</div>
                            <div class="rdo-worker-info">
                                <div class="rdo-worker-name">${escapeHtml(w.nome)}</div>
                                <div class="rdo-worker-role">${escapeHtml(w.funcao)}</div>
                            </div>
                            <div class="rdo-worker-stats">
                                <div class="rdo-worker-pres">${h}h${m > 0 ? m + 'm' : ''}</div>
                            </div>
                        </div>`;
                    }).join('')
                    : '<div class="rdo-empty">Horários não registrados</div>';

                // Padrão
                const padEntries = Object.entries(padMap).sort((a, b) => b[1] - a[1]);
                if (padEntries.length) {
                    const mx = padEntries[0][1];
                    wrap.querySelector('#rdo-mo-padrao').innerHTML = padEntries.map(([k, v]) => `
                        <div class="rdo-bar-item">
                            <div class="rdo-bar-head"><span>${escapeHtml(k)}</span><span>${v}</span></div>
                            <div class="rdo-bar-track"><div class="rdo-bar-fill b" style="width:${Math.round(v / mx * 100)}%"></div></div>
                        </div>`).join('');
                    wrap.querySelector('#rdo-mo-padrao-card').style.display = '';
                }
                wrap.querySelector('#rdo-mo-content').style.display = '';
                setMsg(msg, `${detalhes.length} relatórios · ${workers.length} colaboradores`);
            } catch (e) {
                setMsg(msg, e.message, true);
            } finally {
                btn.disabled = false;
                pw.style.display = 'none';
            }
        });

        //  OCORRÊNCIAS 
        wrap.querySelector('#rdo-ocorr-btn').addEventListener('click', async () => {
            const sel = wrap.querySelector('#rdo-ocorr-obra');
            const d1  = wrap.querySelector('#rdo-ocorr-d1').value;
            const d2  = wrap.querySelector('#rdo-ocorr-d2').value;
            const msg = wrap.querySelector('#rdo-ocorr-msg');
            const pw  = wrap.querySelector('#rdo-ocorr-pw');
            const pt  = wrap.querySelector('#rdo-ocorr-pt');
            const pf  = wrap.querySelector('#rdo-ocorr-pf');
            const btn = wrap.querySelector('#rdo-ocorr-btn');
            if (!sel.value || !d1 || !d2) { setMsg(msg, 'Selecione obra e período.', true); return; }
            btn.disabled = true; setMsg(msg, '');
            wrap.querySelector('#rdo-ocorr-content').style.display = 'none';
            wrap.querySelector('#rdo-ocorr-stats').style.display = 'none';
            try {
                const detalhes = await coletarDetalhes(sel.value, d1, d2, ({ atual, total }) => {
                    setProgresso(pw, pt, pf, atual, total, `Relatório ${atual} / ${total}`);
                });
                pw.style.display = 'none';
                if (!detalhes.length) { setMsg(msg, 'Nenhum relatório no período.'); return; }

                const tagMap  = {}; // tag > count
                const lista   = []; // { data, desc, tags[] }
                let relsAfetados = 0;

                detalhes.forEach(rel => {
                    const ocorrs = rel.ocorrencias || [];
                    if (ocorrs.length) relsAfetados++;
                    ocorrs.forEach(oc => {
                        lista.push({ data: rel.data || '–', desc: oc.descricao || '', tags: (oc.tags || []).filter(t => t.checked).map(t => t.descricao) });
                        (oc.tags || []).filter(t => t.checked).forEach(t => {
                            tagMap[t.descricao] = (tagMap[t.descricao] || 0) + 1;
                        });
                        // se não tem tags, conta como "Sem categoria"
                        if (!(oc.tags || []).some(t => t.checked)) {
                            tagMap['Sem categoria'] = (tagMap['Sem categoria'] || 0) + 1;
                        }
                    });
                });

                const tagsSorted = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
                const tiposUnicos = Object.keys(tagMap).length;

                wrap.querySelector('#rdo-ocorr-tot').textContent   = lista.length;
                wrap.querySelector('#rdo-ocorr-tipos').textContent  = tiposUnicos;
                wrap.querySelector('#rdo-ocorr-rels').textContent   = relsAfetados;
                wrap.querySelector('#rdo-ocorr-stats').style.display = '';

                // Barras de tags
                const mx = tagsSorted.length ? tagsSorted[0][1] : 1;
                wrap.querySelector('#rdo-ocorr-tags').innerHTML = tagsSorted.length
                    ? tagsSorted.map(([k, v]) => `
                        <div class="rdo-bar-item">
                            <div class="rdo-bar-head"><span>${escapeHtml(k)}</span><span>${v}</span></div>
                            <div class="rdo-bar-track"><div class="rdo-bar-fill r" style="width:${Math.round(v / mx * 100)}%"></div></div>
                        </div>`).join('')
                    : '<div class="rdo-empty">Nenhuma tag registrada</div>';

                // Lista de ocorrências
                wrap.querySelector('#rdo-ocorr-lista').innerHTML = lista.length
                    ? lista.map(oc => `
                        <div class="rdo-row-item" style="flex-direction:column;align-items:flex-start;gap:4px;">
                            <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                                <span class="rdo-ri-name" style="font-size:11px;">${escapeHtml(oc.desc || '(sem descrição)')}</span>
                                <span class="rdo-ri-sub" style="flex-shrink:0;margin-left:8px;">${escapeHtml(oc.data)}</span>
                            </div>
                            ${oc.tags.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;">${oc.tags.map(t => `<span class="rdo-tag hi">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
                        </div>`).join('')
                    : '<div class="rdo-empty">Nenhuma ocorrência registrada</div>';

                wrap.querySelector('#rdo-ocorr-content').style.display = '';
                setMsg(msg, `${detalhes.length} relatórios · ${lista.length} ocorrências`);
            } catch (e) {
                setMsg(msg, e.message, true);
            } finally {
                btn.disabled = false;
                pw.style.display = 'none';
            }
        });

        //  CLIMA 
        wrap.querySelector('#rdo-clima-btn').addEventListener('click', async () => {
            const sel = wrap.querySelector('#rdo-clima-obra');
            const d1  = wrap.querySelector('#rdo-clima-d1').value;
            const d2  = wrap.querySelector('#rdo-clima-d2').value;
            const msg = wrap.querySelector('#rdo-clima-msg');
            const pw  = wrap.querySelector('#rdo-clima-pw');
            const pt  = wrap.querySelector('#rdo-clima-pt');
            const pf  = wrap.querySelector('#rdo-clima-pf');
            const btn = wrap.querySelector('#rdo-clima-btn');
            if (!sel.value || !d1 || !d2) { setMsg(msg, 'Selecione obra e período.', true); return; }
            btn.disabled = true; setMsg(msg, '');
            wrap.querySelector('#rdo-clima-content').style.display = 'none';
            try {
                const detalhes = await coletarDetalhes(sel.value, d1, d2, ({ atual, total }) => {
                    setProgresso(pw, pt, pf, atual, total, `Relatório ${atual} / ${total}`);
                });
                pw.style.display = 'none';
                if (!detalhes.length) { setMsg(msg, 'Nenhum relatório no período.'); return; }

                const turnos = { manha: { prat: 0, imprat: 0 }, tarde: { prat: 0, imprat: 0 }, noite: { prat: 0, imprat: 0 } };
                const tipoMap = {};
                let totalAtivos = 0;

                detalhes.forEach(rel => {
                    const c = rel.clima || {};
                    ['manha', 'tarde', 'noite'].forEach(t => {
                        const turno = c[t];
                        if (!turno || !turno.ativo) return;
                        totalAtivos++;
                        const cond = String(turno.condicao || '').toLowerCase();
                        if (cond.includes('imprat')) turnos[t].imprat++; else turnos[t].prat++;
                        const clima = turno.clima;
                        if (clima) tipoMap[clima] = (tipoMap[clima] || 0) + 1;
                    });
                });

                const nomesTurno = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
                // Sumarário cards
                const totalPrat   = Object.values(turnos).reduce((s, t) => s + t.prat, 0);
                const totalImprat = Object.values(turnos).reduce((s, t) => s + t.imprat, 0);
                wrap.querySelector('#rdo-clima-sum').innerHTML = `
                    <div class="rdo-clima-item">
                        <div class="rdo-clima-period">Relatórios</div>
                        <div class="rdo-clima-big">${detalhes.length}</div>
                        <div class="rdo-clima-sub">analisados</div>
                    </div>
                    <div class="rdo-clima-item">
                        <div class="rdo-clima-period">Praticáveis</div>
                        <div class="rdo-clima-big" style="color:#22c55e;">${totalPrat}</div>
                        <div class="rdo-clima-sub">registros</div>
                    </div>
                    <div class="rdo-clima-item">
                        <div class="rdo-clima-period">Impraticáveis</div>
                        <div class="rdo-clima-big" style="color:#ff4444;">${totalImprat}</div>
                        <div class="rdo-clima-sub">registros</div>
                    </div>`;

                // Barras por turno
                wrap.querySelector('#rdo-clima-barras').innerHTML = ['manha', 'tarde', 'noite'].map(t => {
                    const tot = turnos[t].prat + turnos[t].imprat;
                    if (!tot) return '';
                    const pctP = Math.round(turnos[t].prat / tot * 100);
                    const pctI = 100 - pctP;
                    return `<div style="margin-bottom:14px;">
                        <div style="font-size:11px;font-weight:500;color:#d0d0d0;margin-bottom:6px;">${nomesTurno[t]}</div>
                        <div style="display:flex;gap:6px;align-items:center;font-size:10px;">
                            <span style="color:#22c55e;min-width:28px;">${pctP}%</span>
                            <div style="flex:1;height:3px;background:#222;border-radius:2px;overflow:hidden;">
                                <div style="height:100%;width:${pctP}%;background:#22c55e;border-radius:2px;"></div>
                            </div>
                            <span style="color:#d0d0d0;">Praticável · ${turnos[t].prat}d</span>
                        </div>
                        <div style="display:flex;gap:6px;align-items:center;font-size:10px;margin-top:4px;">
                            <span style="color:#ff4444;min-width:28px;">${pctI}%</span>
                            <div style="flex:1;height:3px;background:#222;border-radius:2px;overflow:hidden;">
                                <div style="height:100%;width:${pctI}%;background:#ff4444;border-radius:2px;"></div>
                            </div>
                            <span style="color:#d0d0d0;">Impraticável · ${turnos[t].imprat}d</span>
                        </div>
                    </div>`;
                }).join('') || '<div class="rdo-empty">Nenhum dado de turno</div>';

                // Tipos de clima
                const tiposSorted = Object.entries(tipoMap).sort((a, b) => b[1] - a[1]);
                const mxT = tiposSorted.length ? tiposSorted[0][1] : 1;
                wrap.querySelector('#rdo-clima-tipos').innerHTML = tiposSorted.length
                    ? tiposSorted.map(([k, v]) => `
                        <div class="rdo-bar-item">
                            <div class="rdo-bar-head"><span>${escapeHtml(k)}</span><span>${v}</span></div>
                            <div class="rdo-bar-track"><div class="rdo-bar-fill b" style="width:${Math.round(v / mxT * 100)}%"></div></div>
                        </div>`).join('')
                    : '<div class="rdo-empty">Nenhum tipo registrado</div>';

                wrap.querySelector('#rdo-clima-content').style.display = '';
                setMsg(msg, `${detalhes.length} relatórios analisados`);
            } catch (e) {
                setMsg(msg, e.message, true);
            } finally {
                btn.disabled = false;
                pw.style.display = 'none';
            }
        });

        //  EQUIPAMENTOS 
        wrap.querySelector('#rdo-equip-btn').addEventListener('click', async () => {
            const sel = wrap.querySelector('#rdo-equip-obra');
            const d1  = wrap.querySelector('#rdo-equip-d1').value;
            const d2  = wrap.querySelector('#rdo-equip-d2').value;
            const msg = wrap.querySelector('#rdo-equip-msg');
            const pw  = wrap.querySelector('#rdo-equip-pw');
            const pt  = wrap.querySelector('#rdo-equip-pt');
            const pf  = wrap.querySelector('#rdo-equip-pf');
            const btn = wrap.querySelector('#rdo-equip-btn');
            if (!sel.value || !d1 || !d2) { setMsg(msg, 'Selecione obra e período.', true); return; }
            btn.disabled = true; setMsg(msg, '');
            wrap.querySelector('#rdo-equip-content').style.display = 'none';
            wrap.querySelector('#rdo-equip-stats').style.display = 'none';
            try {
                const detalhes = await coletarDetalhes(sel.value, d1, d2, ({ atual, total }) => {
                    setProgresso(pw, pt, pf, atual, total, `Relatório ${atual} / ${total}`);
                });
                pw.style.display = 'none';
                if (!detalhes.length) { setMsg(msg, 'Nenhum relatório no período.'); return; }

                const freqMap = {}; // descricao > aparições (nº de relatórios)
                const qtyMap  = {}; // descricao > quantidade total acumulada
                let usoTotal  = 0;

                detalhes.forEach(rel => {
                    const equips = rel.equipamentos || [];
                    equips.forEach(eq => {
                        const k = eq.descricao || '?';
                        freqMap[k] = (freqMap[k] || 0) + 1;
                        qtyMap[k]  = (qtyMap[k]  || 0) + (parseInt(eq.quantidade) || 1);
                        usoTotal++;
                    });
                });

                const freqSorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
                const qtySorted  = Object.entries(qtyMap).sort((a, b) => b[1] - a[1]);

                wrap.querySelector('#rdo-equip-ntip').textContent = freqSorted.length;
                wrap.querySelector('#rdo-equip-nuso').textContent = usoTotal;
                wrap.querySelector('#rdo-equip-top').textContent  = freqSorted.length ? freqSorted[0][0] : '–';
                wrap.querySelector('#rdo-equip-stats').style.display = '';

                const mxF = freqSorted.length ? freqSorted[0][1] : 1;
                wrap.querySelector('#rdo-equip-freq').innerHTML = freqSorted.length
                    ? freqSorted.map(([k, v]) => `
                        <div class="rdo-bar-item">
                            <div class="rdo-bar-head"><span>${escapeHtml(k)}</span><span>${v}×</span></div>
                            <div class="rdo-bar-track"><div class="rdo-bar-fill" style="width:${Math.round(v / mxF * 100)}%"></div></div>
                        </div>`).join('')
                    : '<div class="rdo-empty">Nenhum equipamento registrado</div>';

                const mxQ = qtySorted.length ? qtySorted[0][1] : 1;
                wrap.querySelector('#rdo-equip-qty').innerHTML = qtySorted.length
                    ? qtySorted.map(([k, v]) => `
                        <div class="rdo-bar-item">
                            <div class="rdo-bar-head"><span>${escapeHtml(k)}</span><span>${v} un.</span></div>
                            <div class="rdo-bar-track"><div class="rdo-bar-fill g" style="width:${Math.round(v / mxQ * 100)}%"></div></div>
                        </div>`).join('')
                    : '<div class="rdo-empty">Nenhum equipamento registrado</div>';

                wrap.querySelector('#rdo-equip-content').style.display = '';
                setMsg(msg, `${detalhes.length} relatórios · ${freqSorted.length} equipamentos únicos`);
            } catch (e) {
                setMsg(msg, e.message, true);
            } finally {
                btn.disabled = false;
                pw.style.display = 'none';
            }
        });

        //  MATERIAIS 
        wrap.querySelector('#rdo-mat-btn').addEventListener('click', async () => {
            const sel = wrap.querySelector('#rdo-mat-obra');
            const d1  = wrap.querySelector('#rdo-mat-d1').value;
            const d2  = wrap.querySelector('#rdo-mat-d2').value;
            const msg = wrap.querySelector('#rdo-mat-msg');
            const pw  = wrap.querySelector('#rdo-mat-pw');
            const pt  = wrap.querySelector('#rdo-mat-pt');
            const pf  = wrap.querySelector('#rdo-mat-pf');
            const btn = wrap.querySelector('#rdo-mat-btn');
            if (!sel.value || !d1 || !d2) { setMsg(msg, 'Selecione obra e período.', true); return; }
            btn.disabled = true; setMsg(msg, '');
            wrap.querySelector('#rdo-mat-content').style.display = 'none';
            try {
                const detalhes = await coletarDetalhes(sel.value, d1, d2, ({ atual, total }) => {
                    setProgresso(pw, pt, pf, atual, total, `Relatório ${atual} / ${total}`);
                });
                pw.style.display = 'none';
                if (!detalhes.length) { setMsg(msg, 'Nenhum relatório no período.'); return; }

                // Agrega por descrição (texto, pois quantidade pode ter unidades como "10m")
                function agregaLista(items) {
                    const m = {};
                    items.forEach(it => {
                        const k = String(it.descricao || '?').trim();
                        if (!m[k]) m[k] = [];
                        m[k].push(String(it.quantidade || '?'));
                    });
                    return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
                }

                const recList  = [];
                const utilList = [];
                detalhes.forEach(rel => {
                    const cm = rel.controleDeMaterial || {};
                    (cm.recebido || []).forEach(it => recList.push(it));
                    (cm.utilizado || []).forEach(it => utilList.push(it));
                });

                const recAgg  = agregaLista(recList);
                const utilAgg = agregaLista(utilList);

                function renderMat(entries) {
                    if (!entries.length) return '<div class="rdo-empty">Nenhum registro</div>';
                    return entries.map(([k, vals]) => `
                        <div class="rdo-mat-row">
                            <span class="rdo-mat-desc">${escapeHtml(k)}</span>
                            <span class="rdo-mat-qty">${vals.join(', ')}</span>
                        </div>`).join('');
                }

                wrap.querySelector('#rdo-mat-rec').innerHTML  = renderMat(recAgg);
                wrap.querySelector('#rdo-mat-util').innerHTML = renderMat(utilAgg);
                wrap.querySelector('#rdo-mat-content').style.display = '';
                setMsg(msg, `${detalhes.length} relatórios · ${recList.length} recebimentos · ${utilList.length} utilizações`);
            } catch (e) {
                setMsg(msg, e.message, true);
            } finally {
                btn.disabled = false;
                pw.style.display = 'none';
            }
        });

        atualizarPainelServidorVersao(wrap);
    }

    //  MOUNT / UNMOUNT 
    function criarOuMostrar() {
        if (!ativo || !isRotaInicialApp()) { remover(); return; }
        if (document.getElementById(CONTAINER_ID)) return;
        const wrap = document.createElement('div');
        wrap.id = CONTAINER_ID;
        wrap.innerHTML = montarHtml();
        document.body.appendChild(wrap);
        ligarEventos(wrap);
    }

    function remover() {
        document.getElementById(CONTAINER_ID)?.remove();
    }

    chrome.storage.sync.get(STORAGE_KEY, d => {
        ativo = d[STORAGE_KEY] !== false;
        criarOuMostrar();
        iniciarPollingRota();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        if (changes[STORAGE_KEY]) {
            ativo = changes[STORAGE_KEY].newValue !== false;
            if (!ativo) remover(); else criarOuMostrar();
        }
    });

    chrome.runtime.onMessage.addListener(msg => {
        if (Object.prototype.hasOwnProperty.call(msg, STORAGE_KEY)) {
            ativo = msg[STORAGE_KEY] !== false;
            if (!ativo) remover(); else criarOuMostrar();
        }
    });

    function aoMudarRota() {
        if (!ativo) return;
        if (isRotaInicialApp()) criarOuMostrar(); else remover();
    }
    window.addEventListener('hashchange', aoMudarRota);
    window.addEventListener('popstate', aoMudarRota);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { criarOuMostrar(); iniciarPollingRota(); });
    } else {
        criarOuMostrar();
        iniciarPollingRota();
    }
    window.addEventListener('load', () => { if (ativo && isRotaInicialApp()) criarOuMostrar(); });
})();