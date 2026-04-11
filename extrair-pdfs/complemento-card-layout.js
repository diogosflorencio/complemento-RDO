(function complementoInjectCardLayoutCss() {
    if (document.getElementById('complemento-rdo-cards-layout')) return;
    const el = document.createElement('style');
    el.id = 'complemento-rdo-cards-layout';
    el.textContent = `
.complemento-card-fixo,
.complemento-card-fixo-sm,
.complemento-card-fixo-lg {
  box-sizing: border-box;
}
.complemento-card-fixo {
  width: 340px;
  min-width: 340px;
  max-width: 340px;
  overflow-x: hidden;
}
/* Especificidade acima de .container do tema (ex.: max-width: 1100px) */
.container_pdf_filtro > .container.complemento-card-fixo {
  width: 340px;
  min-width: 340px;
  max-width: 340px;
  overflow-x: hidden;
}
.complemento-card-fixo-sm {
  width: 300px;
  min-width: 300px;
  max-width: 300px;
  overflow-x: hidden;
}
.complemento-card-fixo-lg {
  width: min(380px, 95vw);
  min-width: 0;
  max-width: min(380px, 95vw);
  overflow-x: hidden;
}
.complemento-card-fixo .filtro-content,
.complemento-card-fixo-sm .filtro-content,
.complemento-card-fixo-lg .filtro-content {
  min-width: 0;
  max-width: 100%;
}
.complemento-card-fixo .input-group,
.complemento-card-fixo-sm .input-group {
  min-width: 0;
  max-width: 100%;
}
.complemento-card-fixo .form-control,
.complemento-card-fixo select,
.complemento-card-fixo-sm .form-control,
.complemento-card-fixo-sm select,
.complemento-card-fixo-lg .form-control,
.complemento-card-fixo-lg select {
  max-width: 100%;
  box-sizing: border-box;
}
.complemento-card-fixo #status-extracao,
.complemento-card-fixo #unificador-status-extracao,
.complemento-card-fixo-sm #containerDados,
.complemento-card-fixo-sm #mensagemCarregando,
.complemento-card-fixo-sm .cartao-funcao,
.complemento-card-fixo-sm .cartao-total {
  word-break: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
}
.complemento-card-fixo details.unificador-aviso-collapse {
  max-width: 100% !important;
  min-width: 0;
}
.complemento-card-fixo .cabecalho,
.complemento-card-fixo .cabecalho > div,
.complemento-card-fixo-sm .cabecalho,
.complemento-card-fixo-sm .cabecalho > div,
.complemento-card-fixo-lg .cabecalho,
.complemento-card-fixo-lg .cabecalho > div {
  max-width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.complemento-card-fixo code,
.complemento-card-fixo-sm code {
  word-break: break-all;
}
.complemento-card-fixo-lg #listaColaboradoresLinhaALinha,
.complemento-card-fixo-lg #csvStatusLinhaALinha,
.complemento-card-fixo-lg #csvInputAreaLinhaALinha {
  word-break: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
  min-width: 0;
}
.complemento-card-fixo-sm .shortcut-list {
  max-width: 100%;
  overflow-x: hidden;
}
.complemento-card-fixo-sm .shortcut-item {
  min-width: 0;
  gap: 8px;
}
.complemento-card-fixo-sm .shortcut-item span:first-child {
  flex: 1;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: anywhere;
}
`;
    (document.head || document.documentElement).appendChild(el);
})();
