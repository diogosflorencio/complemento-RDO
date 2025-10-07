

// Variáveis de cores para o tema dark ${cores.preto1}
const cores = {
    // Tons de Preto
    preto1: 'rgb(94, 94, 94)', // linha entre imagem da obra e titulo  botão de voltar 
    preto2: 'rgb(26, 26, 26)', // backgound do titulo da obra, barra do header
    preto3: 'rgba(34, 34, 34, 0.94)', //linhas do header e de limites
    preto4: 'rgb(189, 189, 189)', // data de aprovação, status carregando..., 
    preto5: 'rgba(255, 0, 0, 0.94)',

    // Tons de Cinza Escuro
    cinza1: 'rgb(190, 190, 190)', // titulo obras quando hover + data dos rdos na lista + texto log de edição, visualização, rdo anterior
    cinza2: 'rgb(255, 0, 0)',
    cinza3: 'rgb(190, 190, 190)', // titulos de informações da obra
    cinza4: 'rgb(255, 30, 0)',
    cinza5: 'rgb(0, 247, 255)',

    // Tons de Azul Escuro
    azul1: 'rgb(128, 128, 128)', // detalhes rdo
    azul2: 'rgb(20, 20, 20)', // recarregamento, back do botão de voltar
    azul3: 'rgba(0, 184, 230, 0.95)',
    azul4: 'rgb(234, 11, 241)',
    azul5: 'rgb(0, 183, 255)',

    // Tons de Verde Escuro
    verde1: 'rgb(43, 43, 43)', // borda filtros e borda rdo
    verde2: 'rgb(190, 190, 190)', //txt painel lateral obra
    verde3: 'rgb(190, 190, 190)', // texto aprovaçoes rdo e 
    verde4: 'rgba(202, 202, 202, 0.75)', // textos titulos painel oobra e obras
    verde5: 'rgba(22, 22, 22, 0.66)', // headers dos campos dos rdos

    // Tons de Roxo Escuro
    roxo1: 'rgba(8, 8, 8, 0.2)',
    roxo2: 'rgba(8, 8, 8, 0.2)',
    roxo3: 'rgba(8, 8, 8, 0.2)',
    roxo4: 'rgba(8, 8, 8, 0.2)',
    roxo5: 'rgba(8, 8, 8, 0.2)',

    // Tons de Vermelho Escuro
    vermelho1: 'rgba(8, 8, 8, 0.2)', // paineis (informação da obra, infgormação do rdo)
    vermelho2: '#400000',
    vermelho3: '#4D0000',
    vermelho4: '#590000',
    vermelho5: '#660000',

    // Tons de Marrom Escuro
    marrom1: '#1A0F00',
    marrom2: '#261A00',
    marrom3: '#332600',
    marrom4: '#403300',
    marrom5: '#4D4000',

    // Tons de Ciano Escuro
    ciano1: '#001A1A',
    ciano2: '#002626',
    ciano3: '#003333',
    ciano4: '#004040',
    ciano5: '#004D4D'
};

function temaDark(isDarkTheme) {
    if (isDarkTheme) {
        const styleContent = `

.logomarca[data-v-0f6c0e10] {
    text-align: center;
    padding: 15px 0;
    position: relative;
    padding: 15px!important; 
    background-color: ${cores.preto1};
    border-radius: 4px;
    margin-bottom: 15px
}

.logomarca .logo[data-v-0f6c0e10] {
    height: 90px;
    max-width: 100%;
    min-width: 50px;
    margin: 0 auto;
    background-size: contain;
    background-position: 50%;
    background-repeat: no-repeat
}

.logomarca .logo-imagem[data-v-0f6c0e10] {
    height: 90px;
    max-width: 100%;
    min-width: 50px;
    margin: 0 auto
}

.logomarca .logo-imagem[data-v-0f6c0e10],.logomarca.borda .logo[data-v-0f6c0e10] {
    background-color: ${cores.preto2};
    border: 1px solid ${cores.preto3}!important
}

.logomarca.borda .logo-imagem[data-v-0f6c0e10] {
    background: ${cores.preto2}
}

.logomarca p[data-v-0f6c0e10] {
    margin: 0;
    padding: 0;
    font-size: 12px;
    margin-top: 15px;
    color: ${cores.preto4}
}

.logomarca .acao[data-v-0f6c0e10] {
    margin: 15px 0 0 0;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center
}

.logomarca .acao .btn[data-v-0f6c0e10] {
    margin: 0 5px;
    padding: 3px 10px 3px 30px!important
}

.logomarca .acao .btn i[data-v-0f6c0e10] {
    left: 5px!important
}

.box[data-v-7b895a57] {
    width: 100%;
    position: relative;
    display: block;
    margin-bottom: 45px!important
}

.box select[data-v-7b895a57] {
    width: 100%;
    position: absolute;
    bottom: -25px;
    border: none;
    opacity: 0;
    z-index: -999
}

.limit[data-v-7b895a57] {
    cursor: pointer!important
}

.dropdown .btn[data-v-7b895a57] {
    text-align: left;
    width: 100%;
    position: relative
}

.dropdown .btn .placeholderText[data-v-7b895a57] {
    color: ${cores.preto5}
}

.dropdown .btn[data-v-7b895a57]:focus {
    border-color: ${cores.cinza1}!important
}

.dropdown.disabled .btn[data-v-7b895a57] {
    background: ${cores.cinza2}!important;
    opacity: 1!important
}

.dropdown .btn p[data-v-7b895a57] {
    width: calc(100% - 40px)!important;
    position: absolute;
    top: 0;
    bottom: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    overflow: hidden
}

.dropdown .dropdown-menu[data-v-7b895a57] {
    width: calc(100% + 2px)!important;
    max-height: 400px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0!important;
    left: -1px!important;
    z-index: 999!important
}

.dropdown .dropdown-menu-right[data-v-7b895a57] {
    left: 0!important
}

.dropdown .dropdown-menu .busca[data-v-7b895a57] {
    padding: 5px 15px;
    margin: 10px 0
}

.dropdown .dropdown-menu .dropdown-item[data-v-7b895a57] {
    padding: 0!important;
    max-width: 100%;
    line-height: 1em
}

.dropdown .dropdown-menu .dropdown-item label[data-v-7b895a57] {
    margin: 0!important;
    padding: 8px 15px 6px 15px;
    max-width: 100%;
    font-weight: 400!important
}

.dropdown .dropdown-menu .dropdown-item.active[data-v-7b895a57],.dropdown .dropdown-menu .dropdown-item[data-v-7b895a57]:hover {
    color: ${cores.cinza3}
}

.dropdown .dropdown-menu .dropdown-item.active label[data-v-7b895a57],.dropdown .dropdown-menu .dropdown-item:hover label[data-v-7b895a57] {
    color: ${cores.cinza1}
}

.dropdown .dropdown-menu .dropdown-item.optgroup[data-v-7b895a57] {
    cursor: default!important;
    background: ${cores.cinza4}
}

.dropdown .dropdown-menu .dropdown-item.optgroup label[data-v-7b895a57] {
    cursor: default!important;
    color: ${cores.azul1}!important;
    padding-top: 8px!important;
    font-weight: 700!important
}

.dropdown .dropdown-menu .dropdown-item.optgroup[data-v-7b895a57]:hover {
    background: ${cores.cinza4}!important;
    color: ${cores.cinza5}!important
}

.dropdown .dropdown-menu .dropdown-item.option[data-v-7b895a57] {
    padding-left: 15px!important
}

.total[data-v-7b895a57] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    height: 100%;
    padding-right: 15px
}

.total i[data-v-7b895a57] {
    font-size: 14px;
    margin: 0 5px 0 0;
    padding: 0;
    color: #aaa
}

.card-placeholder[data-v-44a910ac] {
    height: 250px;
    z-index: 99;
    margin-bottom: 0!important
}

.card-placeholder span[data-v-44a910ac] {
    font-size: 12px;
    display: block;
    margin-bottom: 15px;
    color: ${cores.preto4}
}

.card-placeholder .placeholder-titulo[data-v-44a910ac] {
    width: 35%;
    height: 12px;
    display: block;
    margin-bottom: 10px
}

.card-placeholder .placeholder-descricao[data-v-44a910ac] {
    width: 40%;
    height: 12px;
    display: block;
    margin-bottom: 10px
}

.card-placeholder .placeholder-subdescricao[data-v-44a910ac] {
    width: 30%;
    height: 12px;
    display: block
}

.clear-body .card-body[data-v-44a910ac] {
    padding: 0!important
}

.clear[data-v-44a910ac] {
    border: none!important
}

.loader-top.ajax-loader .ajax-loader-logo[data-v-4abf5a4c] {
    top: 50px!important
}

.ajax-loader[data-v-4abf5a4c] {
    border-radius: 3px
}

.ajax-loader-content[data-v-4abf5a4c],.ajax-loader[data-v-4abf5a4c] {
    -webkit-transition: .75s ease-out;
    transition: .75s ease-out;
    z-index: 99;
    background: hsla(0,0%,100%,.85)
}

.ajax-loader-content[data-v-4abf5a4c] {
    width: calc(100% - 260px)!important;
    left: 260px!important
}

.ajax-loader-full[data-v-4abf5a4c] {
    position: fixed!important;
    top: 55px!important
}

.ajax-loader-full .ajax-loader-logo[data-v-4abf5a4c] {
    top: calc(50% - 55px)!important
}

.ajax-loader .ajax-loader-logo[data-v-4abf5a4c] {
    position: absolute;
    left: 50%;
    top: 50%;
    -webkit-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
    width: 50px;
    height: 50px
}

.ajax-loader .ajax-loader-logo-fixo[data-v-4abf5a4c] {
    position: fixed;
    left: calc(50% + 125px);
    top: 50%;
    -webkit-transform: translate(-50%,-50%);
    transform: translate(-50%,-50%);
    width: 50px;
    height: 50px
}

.ajax-loader .ajax-loader-circle[data-v-4abf5a4c] {
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
    -webkit-animation: ajaxLoaderSpin-data-v-4abf5a4c 1.4s linear infinite;
    animation: ajaxLoaderSpin-data-v-4abf5a4c 1.4s linear infinite
}

.ajax-loader .ajax-loader-title[data-v-4abf5a4c] {
    font-family: Arial;
    text-align: center;
    padding: 70px 0 0 0;
    position: relative;
    width: 200px;
    left: -76px;
    color: #111;
    letter-spacing: 1.2px;
    font-size: 12px
}

.ajax-loader .ajax-loader-circle .ajax-loader-circle-spinner[data-v-4abf5a4c] {
    -webkit-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
    -webkit-animation: ajaxLoaderDashSpin-data-v-4abf5a4c 1.4s ease-in-out infinite;
    animation: ajaxLoaderDashSpin-data-v-4abf5a4c 1.4s ease-in-out infinite
}

.ajax-loader .ajax-loader-circle circle[data-v-4abf5a4c] {
    -webkit-animation: ajaxLoaderColors-data-v-4abf5a4c 5.6s ease-in-out infinite,ajaxLoaderDash-data-v-4abf5a4c 1.4s ease-in-out infinite;
    animation: ajaxLoaderColors-data-v-4abf5a4c 5.6s ease-in-out infinite,ajaxLoaderDash-data-v-4abf5a4c 1.4s ease-in-out infinite;
    stroke-dasharray: 1570;
    stroke-dashoffset: 392.5;
    stroke: ${cores.cinza1};
    stroke-width: 19;
    fill: none
}

.ajax-loader .ajax-loader-letters path[data-v-4abf5a4c] {
    fill: ${cores.cinza1}
}

@-webkit-keyframes ajaxLoaderSpin-data-v-4abf5a4c {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg)
    }

    to {
        -webkit-transform: rotate(270deg);
        transform: rotate(270deg)
    }
}

@keyframes ajaxLoaderSpin-data-v-4abf5a4c {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg)
    }

    to {
        -webkit-transform: rotate(270deg);
        transform: rotate(270deg)
    }
}

@-webkit-keyframes ajaxLoaderColors-data-v-4abf5a4c {
    0% {
        stroke: #35ad0e
    }

    25% {
        stroke: #d8ad44
    }

    50% {
        stroke: #d00324
    }

    75% {
        stroke: #dc00b8
    }

    to {
        stroke: #017efc
    }
}

@keyframes ajaxLoaderColors-data-v-4abf5a4c {
    0% {
        stroke: #35ad0e
    }

    25% {
        stroke: #d8ad44
    }

    50% {
        stroke: #d00324
    }

    75% {
        stroke: #dc00b8
    }

    to {
        stroke: #017efc
    }
}

@-webkit-keyframes ajaxLoaderDash-data-v-4abf5a4c {
    0% {
        stroke-dashoffset: 1413
    }

    50% {
        stroke-dashoffset: 392.5
    }

    to {
        stroke-dashoffset: 1413
    }
}

@keyframes ajaxLoaderDash-data-v-4abf5a4c {
    0% {
        stroke-dashoffset: 1413
    }

    50% {
        stroke-dashoffset: 392.5
    }

    to {
        stroke-dashoffset: 1413
    }
}

@-webkit-keyframes ajaxLoaderDashSpin-data-v-4abf5a4c {
    50% {
        -webkit-transform: rotate(135deg);
        transform: rotate(135deg)
    }

    to {
        -webkit-transform: rotate(450deg);
        transform: rotate(450deg)
    }
}

@keyframes ajaxLoaderDashSpin-data-v-4abf5a4c {
    50% {
        -webkit-transform: rotate(135deg);
        transform: rotate(135deg)
    }

    to {
        -webkit-transform: rotate(450deg);
        transform: rotate(450deg)
    }
}

.ajax-loader .ajax-loader-circle .ajax-loader-circle-spinner[data-v-4abf5a4c],.ajax-loader .ajax-loader-circle circle[data-v-4abf5a4c],.ajax-loader .ajax-loader-circle[data-v-4abf5a4c],.ajax-loader .ajax-loader-letters[data-v-4abf5a4c],.ajax-loader[data-v-4abf5a4c] {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    width: 100%;
    height: 100%
}

.box[data-v-72ae3687] {
    text-align: center;
    padding: 80px 40px
}

.box .imagem[data-v-72ae3687] {
    height: 50px
}

.box img[data-v-72ae3687] {
    width: 50px
}

.box h4[data-v-72ae3687] {
    color: ${cores.verde4};
    margin: 20px 0 5px 0;
    font-size: 16px
}

.box p[data-v-72ae3687] {
    color: ${cores.preto4};
    font-size: 14px
}

.box.sm[data-v-72ae3687] {
    padding: 42px 20px
}

.box .imagem[data-v-72ae3687] {
    height: 40px
}

.box.sm img[data-v-72ae3687] {
    width: 40px
}

.box.sm h4[data-v-72ae3687] {
    font-size: 14px
}

.box.sm p[data-v-72ae3687] {
    font-size: 12px
}

.lightgallery[data-v-070a8094]:after {
    content: "";
    display: block;
    clear: both
}

.lightgallery.right[data-v-070a8094] {
    display: -webkit-box!important;
    display: -ms-flexbox!important;
    display: flex!important;
    -webkit-box-pack: end!important;
    -ms-flex-pack: end!important;
    justify-content: flex-end!important
}

.lightgallery a[data-v-070a8094] {
    margin: 0 1px 1px 0;
    width: 154px;
    height: 110px;
    float: left;
    position: relative;
    background-color: ${cores.azul2};
    border-radius: 3px;
    background-image: url(/libs/img/loading.458d8042.svg);
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: 44px
}

.lightgallery a .imagem[data-v-070a8094] {
    background-color: hsla(0,0%,93%,.6);
    width: 100%;
    height: 100%;
    border: none!important;
    border-radius: 3px;
    z-index: 999!important
}

.lightgallery a .quantidade[data-v-070a8094] {
    display: none
}

.lightgallery a p[data-v-070a8094] {
    font-size: 11px;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 23px;
    background: rgba(0,0,0,.7);
    padding: 3px 6px;
    margin: 0;
    width: 100%;
    color: ${cores.preto2};
    cursor: pointer;
    border-radius: 3px
}

.lightgallery a img[data-v-070a8094] {
    width: 0;
    height: 0
}

.lightgallery a[data-v-070a8094] {
    width: 0!important
}

.lightgallery a i[data-v-070a8094] {
    position: absolute;
    bottom: 0;
    right: 5px;
    color: ${cores.azul2}
}

.galeria[data-v-7a4fc4a8]:after {
    content: "";
    display: block;
    clear: both
}

.gallery .box[data-v-7a4fc4a8] {
    margin: .5px;
    width: calc(14.28571% - 1px)!important;
    height: 95px;
    float: left;
    position: relative;
    background-color: ${cores.azul2};
    border-radius: 3px;
    background-image: url(/libs/img/loading.458d8042.svg);
    background-position: 50%;
    background-repeat: no-repeat;
    background-size: 44px
}

.gallery .box .imagem[data-v-7a4fc4a8] {
    background-color: hsla(0,0%,93%,.6);
    width: 100%;
    height: 100%;
    border: none!important;
    border-radius: 3px;
    z-index: 99!important;
    position: relative
}

.gallery .box .imagem span[data-v-7a4fc4a8] {
    background: rgba(0,0,0,.6);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 3px;
    text-align: center;
    font-size: 18px;
    color: ${cores.preto2};
    font-weight: 700
}

.gallery .box p[data-v-7a4fc4a8] {
    font-size: 11px;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 23px;
    background: rgba(0,0,0,.7);
    padding: 3px 6px;
    margin: 0;
    width: 100%;
    color: ${cores.preto2};
    cursor: pointer;
    border-radius: 3px
}

.gallery .box img[data-v-7a4fc4a8] {
    width: 0;
    height: 0
}

.gallery .box i[data-v-7a4fc4a8] {
    position: absolute;
    bottom: 0;
    right: 5px;
    color: ${cores.azul2};
    z-index: 99
}

.paginacao[data-v-55090d29] {
    padding: 15px;
    border-top: 1px solid ${cores.preto3}
}

.paginacao .paginas[data-v-55090d29] {
    text-align: center;
    font-size: 12px;
    padding: 7px;
    margin: 0;
    color: ${cores.preto4}
}

.btn-link[data-v-55090d29] {
    position: relative;
    text-decoration: none
}

.btn-link i[data-v-55090d29] {
    font-size: 20px;
    background: ${cores.azul2};
    padding: 4px;
    border-radius: 3px;
    position: absolute;
    top: 1px
}

.btn-link[data-v-55090d29]:hover {
    text-decoration: none
}

.btn-prev[data-v-55090d29] {
    float: left;
    padding-left: 35px
}

.btn-prev i[data-v-55090d29] {
    left: 0
}

.btn-next[data-v-55090d29] {
    float: right;
    padding-right: 35px
}

.btn-next i[data-v-55090d29] {
    right: 0
}

.widgets[data-v-2db864ce] {
    padding: 15px 10px 5px 10px
}

.widgets .row[data-v-2db864ce] {
    margin-left: 0;
    margin-right: 0
}

.widgets .row .col[data-v-2db864ce] {
    padding-left: 5px;
    padding-right: 5px
}

.widgets .box[data-v-2db864ce] {
    border: 1px solid ${cores.preto3};
    padding: 10px 12px 5px 12px;
    border-radius: 4px;
    background-color: ${cores.cinza4}
}

.widgets .box h5[data-v-2db864ce] {
    margin: 0;
    padding: 0;
    font-size: 16px;
    color: ${cores.azul3};
    font-weight: 700
}

.widgets .box span[data-v-2db864ce] {
    margin: 0;
    padding: 0;
    font-size: 13px;
    color: ${cores.azul1}
}

.row[data-v-7dacd840] {
    margin-right: -5px;
    margin-left: -5px
}

.row .col[data-v-7dacd840] {
    padding-right: 5px;
    padding-left: 5px
}

.form-group .form-control[data-v-7dacd840] {
    margin-top: 5px
}

.form-group p[data-v-7dacd840] {
    margin: 10px 0 0 0
}

.videos.grid[data-v-7dacd840] {
    padding: 0 10px 0 10px
}

.videos.grid .row[data-v-7dacd840] {
    margin-right: -10px;
    margin-left: -10px
}

.videos.grid .row .col[data-v-7dacd840] {
    padding-right: 1px;
    padding-left: 1px;
    -ms-flex: 0 0 20%!important;
    -webkit-box-flex: 0!important;
    flex: 0 0 20%!important;
    max-width: 20%!important
}

.videos.grid .row .col .video[data-v-7dacd840] {
    height: auto!important;
    aspect-ratio: 16/9
}

.video[data-v-7dacd840] {
    position: relative;
    line-height: 0;
    background-color: ${cores.azul2};
    height: auto;
    aspect-ratio: 16/9;
    margin: 5px 0;
    border-radius: 3px
}

.videos.grid .video[data-v-7dacd840] {
    margin: 1px 0
}

.video video[data-v-7dacd840] {
    width: 100%!important;
    height: 100%!important;
    border-radius: 3px
}

.video .mask[data-v-7dacd840] {
    background: rgba(0,0,0,.15);
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px
}

.video .mask:hover>i[data-v-7dacd840] {
    color: ${cores.azul4}
}

.video .mask:hover .quantitativo .quantitativo-tempo .box[data-v-7dacd840] {
    background-color: ${cores.azul4}
}

.video .duracao[data-v-7dacd840] {
    position: absolute;
    bottom: 10px;
    left: 10px;
    font-size: 12px;
    color: ${cores.azul5};
    background: ${cores.preto2};
    padding: 2px 6px;
    display: inline-block;
    line-height: 1.2em;
    border-radius: 3px
}

.video .acao[data-v-7dacd840] {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 0
}

.video .acao a[data-v-7dacd840] {
    padding: 4px 3px 4px 4px
}

.form-group[data-v-7dacd840] {
    margin-bottom: 15px!important
}

.form-group p[data-v-7dacd840] {
    margin-top: 5px
}

.video.upload[data-v-7dacd840] {
    border: 1px solid ${cores.preto3};
    background-color: ${cores.verde1}
}

.video.upload span[data-v-7dacd840] {
    z-index: 999;
    position: absolute;
    bottom: 20px;
    left: 6px;
    font-size: 11px;
    color: ${cores.preto4}
}

.progress[data-v-7dacd840] {
    z-index: 999;
    position: absolute;
    bottom: 5px;
    left: 5px;
    width: calc(100% - 10px);
    height: 5px;
    margin-bottom: 0;
    overflow: hidden;
    background-color: #efefef;
    border-radius: 5px;
    -webkit-box-shadow: none;
    box-shadow: none
}

.progress .progress-bar[data-v-7dacd840] {
    background-color: #ff9500;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-radius: 5px
}

.progress .progress-bar.success[data-v-7dacd840] {
    background-color: #4cd965
}

.progress .progress-bar.error[data-v-7dacd840] {
    background-color: #ff3b2f
}

.quantitativo[data-v-7dacd840] {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 1px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between
}

.quantitativo .quantitativo-tempo .box[data-v-7dacd840],.quantitativo .quantitativo-tempo[data-v-7dacd840] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.quantitativo .quantitativo-tempo .box[data-v-7dacd840] {
    background-color: hsla(0,0%,100%,.8);
    margin: 6px;
    padding: 2px 4px 2px 2px;
    border-radius: 2px
}

.quantitativo .quantitativo-tempo span[data-v-7dacd840] {
    font-size: 11px
}

.quantitativo .quantitativo-tempo i[data-v-7dacd840] {
    font-size: 14px
}

.quantitativo .legenda[data-v-7dacd840] {
    color: ${cores.preto2};
    margin: 6px 4px 0 0
}

.quantidade[data-v-7dacd840] {
    background: rgba(0,0,0,.6);
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
    z-index: 9;
    font-size: 18px;
    color: ${cores.preto2};
    font-weight: 700
}

.videos a[data-v-112e8b22]:hover {
    color: ${cores.cinza1}!important
}

.videos p[data-v-112e8b22] {
    margin: 0;
    padding: 0;
    line-height: 1em
}

.videos .obra[data-v-112e8b22] {
    margin: 4px 0 0 0;
    padding: 0;
    color: ${cores.verde2};
    text-transform: uppercase;
    font-size: 11px;
    display: inline-block;
    max-width: 100%
}

.videos .descricao[data-v-112e8b22] {
    margin: 0;
    padding: 0;
    color: ${cores.azul1};
    font-size: 11px;
    line-height: 1em
}

.video[data-v-112e8b22] {
    position: relative;
    line-height: 0;
    background-color: ${cores.azul2};
    height: 135px;
    margin-bottom: 0;
    border-radius: 4px
}

.video video[data-v-112e8b22] {
    width: 100%!important;
    height: 100%!important;
    border-radius: 4px
}

.video .mask[data-v-112e8b22] {
    background: rgba(0,0,0,.1);
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    cursor: pointer
}

.video .mask i[data-v-112e8b22] {
    font-size: 56px;
    color: ${cores.preto2}
}

.video .mask:hover>i[data-v-112e8b22] {
    color: ${cores.azul4}
}

.video .duracao[data-v-112e8b22] {
    left: 10px
}

.video .data[data-v-112e8b22],.video .duracao[data-v-112e8b22] {
    position: absolute;
    bottom: 10px;
    font-size: 12px;
    color: ${cores.azul5};
    background: ${cores.preto2};
    padding: 2px 6px;
    display: inline-block;
    line-height: 1.2em;
    border-radius: 3px
}

.video .data[data-v-112e8b22] {
    right: 10px
}

.video .plataforma[data-v-112e8b22] {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 12px;
    color: ${cores.azul5};
    background: ${cores.preto2};
    padding: 2px 6px;
    display: inline-block;
    line-height: 1.2em;
    border-radius: 3px
}

.card-body[data-v-112e8b22] {
    padding-bottom: 0
}

.card-body .col[data-v-112e8b22] {
    padding-top: 5px
}

.modal[data-v-2f81b322] {
    z-index: 99999!important
}

.modal .modal-dialog[data-v-2f81b322] {
    max-width: 800px
}

.modal .modal-header[data-v-2f81b322] {
    width: 100%;
    padding-right: 0!important
}

.modal .modal-header .btn-link[data-v-2f81b322] {
    padding: 0;
    border: none
}

.modal .modal-header .row[data-v-2f81b322] {
    width: 100%
}

.modal .modal-header span[data-v-2f81b322] {
    font-size: 14px
}

.modal .close[data-v-2f81b322] {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    z-index: 999;
    opacity: 1;
    padding: 10px 15px;
    color: ${cores.preto2};
    border-radius: 3px
}

.modal .close[data-v-2f81b322]:hover {
    opacity: 1!important;
    color: ${cores.preto2}!important
}

.modal .modal-body[data-v-2f81b322] {
    line-height: 0
}

.descritivo[data-v-2f81b322] {
    display: block
}

.descritivo p[data-v-2f81b322] {
    margin: 0!important;
    padding: 0!important;
    line-height: 1.3em;
    padding: 0;
    display: block;
    font-size: 12px;
    color: ${cores.preto4}
}

.descritivo p[data-v-2f81b322]:first-child {
    margin: 15px 0 5px 0!important
}

.modal .modal-body video[data-v-2f81b322] {
    width: 100%!important;
    height: auto!important;
    max-height: 480px;
    border: 1px solid ${cores.preto3};
    border-radius: 3px;
    background: ${cores.azul5}
}

.modal .modal-body video[data-v-2f81b322]:focus {
    outline: none
}

.modal .modal-footer[data-v-2f81b322] {
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between
}

.modal .modal-footer .btn-outline-secondary[data-v-2f81b322] {
    margin-right: 15px
}

.carregarMais[data-v-0a2936f1] {
    text-align: center;
    display: none;
}

.carregarMais .btn[data-v-0a2936f1] {
    text-decoration: none;
    height: 50px;
    padding: 0 20px
}

.carregarMais .btn[data-v-0a2936f1]:hover {
    background-color: ${cores.azul2}
}

.carregarMais .btn img[data-v-0a2936f1] {
    width: 44px;
    opacity: .7
}

.btn .badge[data-v-0a2936f1] {
    margin-left: 5px;
    border-radius: 8px;
    min-width: 18px
}

.dropdown .btn[data-v-57a16dcc] {
    background: rgba(0,0,0,.1);
    padding: 3px 6px 4px 6px;
    font-size: 12px;
    color: ${cores.preto2}
}

.dropdown .btn[data-v-57a16dcc]:hover {
    background: rgba(0,0,0,.3)
}

.dropdown img[data-v-57a16dcc] {
    max-width: 22px!important;
    border-radius: 3px;
    margin-right: 5px;
    border: 1px solid hsla(0,0%,100%,.1)
}

.dropdown span[data-v-57a16dcc] {
    position: relative;
    top: 1px
}

.dropdown-toggle[data-v-57a16dcc]:after {
    margin-left: 5px;
    position: relative;
    top: 1px
}

.wrapper[data-v-3406ffea] {
    position: relative;
    width: 450px;
    height: 165px;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none
}

.signature-pad[data-v-3406ffea] {
    position: absolute;
    left: 0;
    top: 0;
    width: 450px;
    height: 165px;
    background-color: ${cores.preto2};
    border: 1px solid ${cores.verde1}
}

.modal-footer[data-v-24f2b02e] {
    border-top: none;
    padding-top: 0
}

.modal .modal-dialog[data-v-24f2b02e] {
    max-width: 482px!important
}

.assinaturas .assinatura[data-v-a1090058] {
    text-align: center;
    margin: 0 10px 0 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    height: 100%;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between
}

.assinaturas .assinatura .imagem[data-v-a1090058] {
    border-bottom: 1px solid ${cores.verde1};
    height: 56px;
    width: 100%;
    padding-bottom: 1px
}

.assinaturas .assinatura .imagem img[data-v-a1090058] {
    height: 55px;
    max-width: 100%
}

.assinaturas .assinatura p[data-v-a1090058] {
    font-size: 11px;
    margin-top: 6px;
    color: ${cores.preto4}
}

.btn-svg[data-v-a1090058] {
    padding: 2px 10px 2px 10px!important
}

.btn-svg img[data-v-a1090058] {
    width: 24px!important;
    height: 24px!important;
    margin-right: 5px;
    -webkit-filter: invert(97%) sepia(4%) saturate(1%) hue-rotate(131deg) brightness(106%) contrast(98%);
    filter: invert(97%) sepia(4%) saturate(1%) hue-rotate(131deg) brightness(106%) contrast(98%)
}

.assinatura[data-v-8420aa0a] {
    background-color: ${cores.preto2};
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    height: 100%;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    padding: 10px;
    text-align: center;
    border-radius: 0;
    border: 1px solid ${cores.preto3}
}

.assinaturas.editar .assinatura[data-v-8420aa0a] {
    border-radius: 3px
}

.assinatura h4[data-v-8420aa0a] {
    font-size: 12px;
    margin: 10px 0 2px 0;
    font-weight: 700
}

.assinatura .status[data-v-8420aa0a] {
    margin-bottom: 4px;
    min-height: 24px
}

.assinatura .line[data-v-8420aa0a] {
    font-size: 12px;
    margin: 0;
    padding: 0;
    color: ${cores.verde3}
}

.assinatura .data-hora[data-v-8420aa0a] {
    font-size: 11px;
    margin: 0;
    padding: 0;
    color: ${cores.preto4};
    margin-left: 5px
}

.assinatura .imagem[data-v-8420aa0a] {
    border-bottom: 1px solid ${cores.verde1};
    height: 56px;
    width: 90%;
    padding-bottom: 1px;
    margin: 0 auto
}

.assinatura .imagem img[data-v-8420aa0a] {
    height: 55px;
    max-width: 100%
}

.buttons[data-v-8420aa0a] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    margin-top: 8px
}

.buttons .dropdown[data-v-8420aa0a] {
    min-width: auto!important
}

.buttons .btn[data-v-8420aa0a] {
    padding: 0 12px 0 30px;
    margin: 0 5px;
    height: 32px;
    font-size: 12px
}

.buttons .btn i[data-v-8420aa0a] {
    font-size: 16px;
    left: 8px
}

.buttons .dropdown-confirmar .btn-success[data-v-8420aa0a] {
    min-width: 90px
}

.buttons .dropdown-confirmar .dropdown-menu[data-v-8420aa0a] {
    width: 230px;
    padding: 10px 15px
}

.buttons .dropdown-confirmar .dropdown-menu h6[data-v-8420aa0a] {
    font-size: 12px;
    font-weight: 700
}

.buttons .dropdown-confirmar .dropdown-menu p[data-v-8420aa0a] {
    font-size: 12px;
    margin: 0;
    padding: 0
}

.buttons .dropdown-confirmar .dropdown-menu .links[data-v-8420aa0a] {
    margin-top: 10px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between
}

.buttons .dropdown-confirmar .dropdown-menu .links a[data-v-8420aa0a] {
    font-size: 12px;
    background-color: ${cores.azul2};
    padding: 4px 8px;
    border-radius: 3px
}

.buttons .dropdown-confirmar .dropdown-menu .links a[data-v-8420aa0a]:hover {
    text-decoration: none
}

.buttons .dropdown-confirmar .dropdown-menu .links a.aprovar[data-v-8420aa0a] {
    color: ${cores.preto2};
    background-color: #28a745
}

.buttons .dropdown-confirmar .dropdown-menu .links a.aprovar[data-v-8420aa0a]:hover {
    background-color: #218838
}

.alerta-aprovado[data-v-8420aa0a] {
    font-size: 12px;
    display: block;
    color: ${cores.preto4}
}

.modal-open .modal.modal-foto[data-v-1aa74113] {
    background: rgba(0,0,0,.5)!important
}

.modal.modal-foto p[data-v-1aa74113] {
    font-size: 12px
}

.modal.modal-foto .imagem[data-v-1aa74113] {
    min-height: 80px
}

.modal-dialog[data-v-1aa74113] {
    min-width: 680px
}

.modal-header .row[data-v-1aa74113] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    margin-left: 0!important
}

.modal-header .row .col[data-v-1aa74113] {
    padding-left: 0!important;
    padding-right: 0!important
}

.modal-body[data-v-1aa74113] {
    padding: 15px 0!important
}

.modal-footer .mensagem[data-v-1aa74113] {
    position: absolute;
    left: 15px;
    font-size: 12px;
    color: ${cores.azul1}
}

ul[data-v-1aa74113] {
    margin: 0;
    padding: 0;
    list-style: none
}

ul li[data-v-1aa74113] {
    margin: 5px 0 5px 40px!important;
    padding: 6px 8px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    background-color: ${cores.azul2};
    border-radius: 4px;
    cursor: move;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    position: relative
}

ul li[data-v-1aa74113]:active {
    background-color: #dbe7f3
}

ul li .icon[data-v-1aa74113] {
    width: 20px;
    margin-right: 8px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    font-size: 12px
}

ul li .icon i[data-v-1aa74113] {
    color: ${cores.azul1}
}

ul li .icon span[data-v-1aa74113] {
    position: absolute;
    left: -40px;
    text-align: right;
    min-width: 30px;
    color: ${cores.roxo3};
    margin: 0 5px
}

ul li .body[data-v-1aa74113] {
    width: calc(100% - 28px);
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start
}

ul li .body h6[data-v-1aa74113] {
    font-size: 12px;
    font-weight: 700;
    margin: 0;
    padding: 0
}

ul li .body p[data-v-1aa74113] {
    font-size: 12px;
    margin: 0;
    padding: 0;
    max-height: 54px;
    overflow: hidden
}

ul li .body span.subtext[data-v-1aa74113] {
    font-size: 11px;
    margin: 0;
    padding: 0;
    color: ${cores.azul1}
}

ul.grid[data-v-1aa74113] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap
}

ul.grid li[data-v-1aa74113] {
    width: calc(33.33% - 45px);
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    margin: 5px
}

ul.grid.grid-foto li .icon[data-v-1aa74113] {
    width: 30px
}

ul li .body-imagem[data-v-1aa74113] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

ul li .body-imagem .imagem[data-v-1aa74113] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    width: 100px;
    min-width: 100px;
    height: 80px
}

ul li .body-imagem .imagem img[data-v-1aa74113] {
    border-radius: 4px;
    width: 100%;
    -o-object-fit: cover;
    object-fit: cover;
    border: 1px solid ${cores.preto3};
    cursor: pointer
}

ul li .body-imagem .descricao[data-v-1aa74113] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    padding-left: 5px
}

ul li .body-imagem .descricao p[data-v-1aa74113] {
    max-height: 72px!important;
    overflow: hidden
}

.login {
    position: relative;
    min-height: 100vh
}

.login:after {
    content: "";
    display: block;
    clear: both
}

.login .vertical-align {
    display: table-cell;
    vertical-align: middle;
    position: relative
}

.login .left {
    float: left;
    width: 450px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    background: ${cores.preto3};
    background-size: cover;
    background-position: 0
}

.login .left .center {
    min-height: 100%;
    height: 100vh;
    display: block;
    position: relative;
    width: 100%
}

.login .left .center header {
    position: fixed;
    top: 0;
    left: 0;
    padding: 30px;
    z-index: 999
}

.login .left .center header img {
    width: 50px;
    margin-right: 10px
}

.login .left .center header span {
    color: ${cores.preto2};
    font-size: 22px;
    font-weight: 700!important;
    letter-spacing: 1px;
    position: relative;
    top: 3px
}

.login .left .center .box {
    max-width: 100%;
    margin: 0 auto;
    padding: 30px;
    text-align: center
}

.login .left .center .box h3 {
    font-size: 24px
}

.login .left .center .box h3,.login .left .center .box h5 {
    color: ${cores.preto2};
    font-weight: 400;
    margin: 0 0 40px 0;
    line-height: 1.5em
}

.login .left .center .box h5 {
    font-size: 16px
}

.login .left .body {
    position: absolute;
    bottom: 25px;
    width: 100%;
    display: block;
    text-align: center
}

.login .left .body ul {
    margin: 0;
    padding: 0
}

.login .left .body ul li {
    background-color: ${cores.azul5};
    display: inline-block;
    border: 2px solid ${cores.verde1};
    margin: 0 5px;
    padding: 1px 4px;
    border-radius: 8px
}

.login .left .body ul li:hover {
    border: 2px solid ${cores.preto2}
}

.login .left .body ul li img {
    max-width: 120px
}

.login .right {
    float: right;
    width: calc(100% - 450px);
    padding: 30px;
    min-height: 100vh;
    height: 100vh;
    background: #f0eff5;
    display: table;
    position: relative
}

.login .right header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 30px 30px 0 30px;
    text-align: right;
    z-index: 9
}

.login .right header img {
    width: 50px;
    float: left;
    display: none;
    margin-right: 11px
}

.login .right header span {
    float: left;
    display: none;
    color: #3949ab;
    font-size: 22px;
    font-weight: 700!important;
    letter-spacing: 1px;
    position: relative;
    top: 7px
}

.login .right header .btn {
    color: ${cores.cinza1};
    font-size: 12px
}

.login .right .box {
    max-width: 400px;
    margin: 80px auto
}

.login .right .box h3 {
    font-size: 24px;
    color: ${cores.verde4};
    font-weight: 400;
    margin: 0 0 10px 0
}

.login .right .box h5 {
    font-size: 16px;
    color: ${cores.preto4};
    font-weight: 400;
    margin: 0 0 40px 0
}

.login .right .box .translate {
    display: block;
    width: 100%;
    margin-bottom: 20px
}

.login .right .box .translate .dropdown {
    float: none!important
}

.login .right .box .translate .btn {
    background: ${cores.preto2}!important;
    color: ${cores.verde4};
    border: 1px solid ${cores.verde1}
}

.login .right .box .msg .alert {
    padding: 12px 15px!important;
    border-radius: 3px;
    font-size: 13px
}

.login .right .box .msg .alert .close {
    top: -2px!important;
    right: 0!important
}

.login .right .box form a {
    font-size: 12px;
    font-weight: 400;
    color: ${cores.cinza1}
}

.login .right .box form label {
    font-size: 12px;
    color: ${cores.cinza3};
    margin: 0
}

.login .right .box form input {
    padding: 10px 12px;
    font-size: 12px!important;
    height: auto!important;
    line-height: 20px
}

.login .right .box form button {
    padding: 9px 35px;
    font-size: 13px;
    letter-spacing: 1px
}

.login .right .box form .footer {
    margin-top: 30px
}

.login .right .box .copy {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center
}

.login .right .box .copy a,.login .right .box .copy span {
    font-size: 12px
}

@media only screen and (min-width: 1px) and (max-width:999px) {
    .login .right {
        float:right;
        width: 100%;
        z-index: 999
    }

    .login .right header img,.login .right header span {
        display: inline-block
    }
}

.login[data-v-101f1295] {
    min-width: 992px
}

.modal-body .col[data-v-101f1295] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.modal-body ul li[data-v-101f1295] {
    padding: 10px 15px
}

.modal-body ul li h5[data-v-101f1295] {
    font-size: 14px;
    margin: 0;
    padding: 0;
    font-weight: 500;
    text-transform: uppercase;
    color: ${cores.verde4}
}

.modal-body .btn[data-v-101f1295] {
    display: block;
    padding: 6px 15px
}

.modal-body .btn i[data-v-101f1295] {
    font-size: 14px;
    position: relative;
    left: -5px;
    top: 2px
}

.modal-body .empresa[data-v-29f3b12a]:last-child {
    margin-bottom: 0!important
}

.empresa[data-v-29f3b12a] {
    border: 1px solid ${cores.preto3};
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 15px
}

.empresa[data-v-29f3b12a]:hover {
    background: ${cores.verde5}
}

.empresa p[data-v-29f3b12a] {
    margin: 0;
    padding: 0
}

.empresa .id[data-v-29f3b12a] {
    font-size: 12px;
    color: ${cores.preto4}
}

.empresa .nome[data-v-29f3b12a] {
    font-size: 14px;
    color: ${cores.verde4};
    text-transform: uppercase
}

.empresa .right[data-v-29f3b12a] {
    text-align: right;
    padding: 3px 0
}

.empresa .right p[data-v-29f3b12a] {
    margin: 0;
    padding: 8px 0;
    font-size: 12px;
    color: #f35a04
}

.empresa .right p.inativo[data-v-29f3b12a] {
    color: ${cores.preto4};
    font-style: italic
}

.checkbox-radio .radio[data-v-01ee93c9] {
    padding-left: 0!important;
    margin-right: 20px
}

.form-check-label-bold[data-v-ae940dba] {
    font-weight: 700!important;
    color: ${cores.cinza3}!important
}

select[data-v-ae940dba]:invalid {
    color: gray
}

.text-muted[data-v-ae940dba] {
    font-size: 11px;
    position: relative;
    top: -5px
}

.copiar[data-v-ae940dba] {
    margin: 5px 0 0 23px
}

.btn-copiar[data-v-ae940dba] {
    padding: 1px 3px;
    background-color: #f3f3f3;
    margin-left: 15px;
    line-height: 0
}

.btn-copiar[data-v-ae940dba]:hover {
    background-color: ${cores.preto3}
}

.btn-copiar .material-icons[data-v-ae940dba] {
    margin: 0;
    padding: 0
}

.confirmacao p[data-v-ae940dba] {
    font-size: 14px
}

.modal-body[data-v-6c91c03b] {
    max-height: 75vh;
    overflow: auto
}

h6[data-v-6c91c03b] {
    font-weight: 700;
    margin-bottom: 0
}

p[data-v-6c91c03b] {
    margin: 0 0 8px 0;
    font-size: 14px;
    line-height: 1.2em
}

ul[data-v-6c91c03b] {
    margin: 0 0 6px 0
}

ul li[data-v-6c91c03b] {
    margin: 0 0 4px 0;
    font-size: 14px;
    line-height: 1.2em
}

.dropdown-header[data-v-2660dab1] {
    font-size: 12px;
    padding: 2px 15px;
    margin-bottom: 6px
}

.header[data-v-2660dab1] {
    background: #3f51b5;
    min-width: 750px;
    height: 55px;
    padding: 0 15px;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between
}

.header .left[data-v-2660dab1],.header[data-v-2660dab1] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.header .left .empresa[data-v-2660dab1] {
    max-width: 300px;
    margin-right: 15px;
    cursor: pointer
}

.header .left .empresa h3[data-v-2660dab1] {
    margin: 0;
    padding: 0;
    font-size: 18px;
    text-transform: uppercase;
    color: ${cores.preto2};
    font-weight: 700;
    display: none
}

.header .left .empresa h4[data-v-2660dab1] {
    margin: 0;
    padding: 0;
    font-size: 14px;
    text-transform: uppercase;
    color: ${cores.preto2};
    font-weight: 700
}

.header .left ul[data-v-2660dab1] {
    margin: 0;
    padding: 0;
    list-style: none;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row
}

.header .left ul li a[data-v-2660dab1] {
    font-size: 14px;
    color: #f9f9f9;
    padding: 20px 15px;
    cursor: pointer;
    position: relative;
    line-height: 1.3em
}

.header .left ul .router-link-active[data-v-2660dab1],.header .left ul li a[data-v-2660dab1]:hover {
    background-color: rgba(0,0,0,.2);
    color: ${cores.preto2};
    cursor: pointer;
    text-decoration: none
}

.header .left ul li a .dropdown-menu a[data-v-2660dab1] {
    color: #212529
}

.header .left ul li a .dropdown-menu .router-link-active[data-v-2660dab1],.header .left ul li a .dropdown-menu a[data-v-2660dab1]:hover {
    color: ${cores.cinza1};
    background-color: ${cores.cinza4}
}

.header .left .alerta-notificacao[data-v-2660dab1] {
    background-color: red;
    display: inline-block;
    font-size: 11px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    line-height: 18px;
    text-align: center;
    color: ${cores.preto2};
    border-radius: 9px;
    position: absolute;
    z-index: 999;
    top: 12px;
    right: 8px
}

.header .left ul li a .dropdown-menu a .alerta-notificacao[data-v-2660dab1] {
    top: 2px
}

.menu-analise[data-v-2660dab1] {
    width: 400px;
    padding: 15px;
    cursor: default
}

.menu-analise h6[data-v-2660dab1] {
    font-size: 12px;
    margin-bottom: 12px;
    color: ${cores.verde4};
    font-weight: 700
}

.menu-analise a[data-v-2660dab1] {
    padding: 8px 0!important;
    border-top: 1px solid ${cores.azul2};
    line-height: 1.1em!important
}

.menu-analise a.router-link-active[data-v-2660dab1],.menu-analise a[data-v-2660dab1]:hover {
    background: none!important
}

.dropdown-item-text[data-v-2660dab1] {
    margin: 0 15px;
    padding: 0;
    font-size: 11px;
    color: ${cores.roxo3}
}

.header .dropdown-item[data-v-2660dab1] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.header .dropdown-item span[data-v-2660dab1] {
    display: inline-block;
    min-width: 18px;
    text-align: center;
    margin-left: 15px;
    background-color: ${cores.preto3};
    color: ${cores.roxo4};
    font-size: 11px;
    padding: 1px 4px;
    border-radius: 3px;
    font-weight: 400
}

.header .dropdown-item.router-link-active>span[data-v-2660dab1],.header .dropdown-item:hover>span[data-v-2660dab1] {
    background-color: #2f8efb;
    color: ${cores.preto2}
}

.header .right[data-v-2660dab1] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.header .right .adicionar[data-v-2660dab1] {
    display: block;
    margin-right: 12px;
    margin-left: 4px
}

.header .right .adicionar .dropdown .btn[data-v-2660dab1] {
    padding: 8px 15px;
    font-size: 12px;
    color: ${cores.preto2};
    font-weight: 700;
    text-transform: uppercase;
    border-radius: 3px!important;
    background-color: #ffab02;
    border: none;
    border-bottom: 1.5px solid rgba(0,0,0,.5);
    letter-spacing: .9px;
    cursor: pointer
}

.header .right .adicionar .dropdown .btn[data-v-2660dab1]:focus,.header .right .adicionar .dropdown .btn[data-v-2660dab1]:hover {
    background-color: #f19320
}

.header .right .adicionar .dropdown .btn .material-icons[data-v-2660dab1] {
    float: left;
    line-height: .5;
    font-size: 20px;
    position: relative;
    left: -5px;
    top: 4px
}

.header .right .adicionar .dropdown .dropdown-menu[data-v-2660dab1] {
    padding: 0
}

.header .right .adicionar .dropdown .dropdown-menu .item[data-v-2660dab1] {
    padding: 6px 0;
    border-bottom: 1px solid ${cores.azul2}
}

.header .right .adicionar .dropdown .dropdown-menu .item[data-v-2660dab1]:last-child {
    border: none
}

.header .right .adicionar .dropdown .dropdown-menu .dropdown-item[data-v-2660dab1] {
    padding: 6px 15px;
    font-size: 12px!important;
    cursor: pointer
}

.header .right .adicionar .dropdown .dropdown-menu .btn-icon[data-v-2660dab1] {
    padding-left: 40px!important
}

.header .right .adicionar .dropdown .dropdown-menu .btn-icon i[data-v-2660dab1] {
    left: 12px;
    top: 48%;
    font-size: 18px
}

.header .right .usuario[data-v-2660dab1] {
    display: block;
    height: 55px
}

.header .right .usuario .dropdown-toggle[data-v-2660dab1] {
    height: 100%;
    border-radius: 0;
    background: rgba(0,0,0,.1)
}

.header .right .usuario .dropdown-toggle[data-v-2660dab1]:active,.header .right .usuario .dropdown-toggle[data-v-2660dab1]:focus,.header .right .usuario .dropdown-toggle[data-v-2660dab1]:hover {
    text-decoration: none;
    background-color: rgba(0,0,0,.3);
    color: ${cores.preto2}
}

.header .right .usuario .dropdown-toggle[data-v-2660dab1]:after {
    color: ${cores.preto2}
}

.header .right .usuario .dropdown-toggle .nome[data-v-2660dab1] {
    max-width: 130px;
    margin-right: 5px;
    text-align: left
}

.header .right .usuario .dropdown-toggle .nome h5[data-v-2660dab1] {
    margin: 0 0 2px 8px;
    padding: 0;
    font-weight: 400;
    font-size: 14px;
    color: ${cores.preto2}
}

.header .right .usuario .dropdown-toggle .nome h6[data-v-2660dab1] {
    font-size: 11px;
    margin: 0 0 0 8px;
    color: ${cores.verde1}
}

.header .right .usuario .dropdown-usuario[data-v-2660dab1] {
    width: 250px;
    max-height: 500px!important;
    padding: 0
}

.header .right .usuario .periodo[data-v-2660dab1] {
    text-align: center
}

.header .right .usuario .periodo a[data-v-2660dab1] {
    padding: 10px 15px;
    display: block;
    background: #f3f3f3;
    font-style: italic;
    border-radius: 4px;
    font-size: 14px
}

.header .right .usuario .periodo a[data-v-2660dab1]:hover {
    text-decoration: none;
    background: ${cores.azul2};
    color: #2196f3
}

.header .right .usuario .perfil[data-v-2660dab1] {
    padding: 15px 15px 5px 15px;
    text-align: center;
    position: relative
}

.header .right .usuario .perfil .sigla[data-v-2660dab1] {
    width: 70px;
    height: 70px;
    position: relative;
    background-color: #7986cb;
    text-align: center;
    line-height: 70px;
    font-size: 14px;
    margin: 0 auto;
    color: ${cores.preto2}
}

.header .right .usuario .perfil .sigla .bg[data-v-2660dab1] {
    position: absolute;
    left: -1px;
    top: -1px;
    width: 72px;
    height: 72px;
    z-index: 9
}

.header .right .usuario .perfil h4[data-v-2660dab1] {
    margin: 10px 0;
    font-weight: 400;
    color: ${cores.verde2};
    font-size: 16px
}

.header .right .usuario .perfil h5[data-v-2660dab1],.header .right .usuario .perfil h6[data-v-2660dab1] {
    margin: 10px 0;
    font-weight: 400;
    color: ${cores.roxo3};
    font-size: 12px;
    line-height: 16px
}

.header .right .usuario ul[data-v-2660dab1] {
    margin: 0;
    padding: 0;
    text-align: center
}

.header .right .usuario ul li[data-v-2660dab1] {
    display: block;
    background: none;
    border-top: 1px solid ${cores.azul2};
    padding: 0 15px 0 12px
}

.header .right .usuario ul li a[data-v-2660dab1] {
    padding: 10px 0;
    color: ${cores.cinza3};
    font-size: 14px;
    cursor: pointer
}

.header .right .usuario ul li a[data-v-2660dab1]:hover {
    color: ${cores.cinza1};
    text-decoration: none
}

.header .right .usuario ul li a i[data-v-2660dab1] {
    margin: 0 10px 0 0;
    padding: 0;
    font-size: 18px;
    line-height: .1em;
    opacity: .9;
    display: none
}

.alerta-fim-teste[data-v-2660dab1] {
    background-color: red;
    display: inline-block;
    position: absolute;
    z-index: 999;
    left: 33px;
    top: 5px;
    font-size: 11px;
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    color: ${cores.preto2};
    border-radius: 50%
}

.versao[data-v-2660dab1] {
    font-size: 9px!important
}

@media only screen and (max-width: 1360px) {
    .header .left .empresa[data-v-2660dab1] {
        max-width:230px
    }

    .header .left ul li a[data-v-2660dab1] {
        font-size: 14px;
        color: #f9f9f9
    }

    .header .left ul li.trocar-empresa[data-v-2660dab1] {
        display: inline-block
    }
}

@media only screen and (max-width: 1280px) {
    .header .left .empresa[data-v-2660dab1] {
        max-width:190px
    }

    .header .left ul li a[data-v-2660dab1] {
        font-size: 14px;
        color: #f9f9f9
    }

    .header .left ul li.trocar-empresa[data-v-2660dab1] {
        display: none
    }
}

@media only screen and (max-width: 1200px) {
    .header .left ul li a[data-v-2660dab1] {
        font-size:14px;
        color: #f9f9f9;
        padding: 19px 11px 20px 11px;
        cursor: pointer;
        position: relative
    }

    .header .right .usuario .dropdown-toggle .nome[data-v-2660dab1] {
        max-width: 100px;
        margin-right: 5px;
        text-align: left
    }
}

@media only screen and (max-width: 1110px) {
    .header .left .empresa h3[data-v-2660dab1] {
        display:block
    }

    .header .left .empresa h4[data-v-2660dab1] {
        display: none
    }
}

.header[data-v-8de8991a] {
    padding: 0 0 10px 0
}

.header .row[data-v-8de8991a] {
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 55px
}

.header h3[data-v-8de8991a] {
    margin: 0;
    padding: 0;
    font-size: 18px
}

.header .total[data-v-8de8991a] {
    font-size: 12px;
    position: absolute;
    color: ${cores.preto4}
}

.col-back[data-v-8de8991a] {
    max-width: 40px!important;
    position: relative
}

.col-back a[data-v-8de8991a] {
    position: relative;
    top: 2px
}

.application.fixed .button[data-v-8de8991a] {
    display: none
}

.container-big .container[data-v-56107eaf] {
    max-width: 1300px
}

.header[data-v-56107eaf] {
    padding: 0;
    margin: 0;
    position: relative;
    z-index: 0!important;
    background: ${cores.preto2};
    border-bottom: 1px solid ${cores.preto3};
    min-width: 992px
}

.header.padding-sidebar[data-v-56107eaf] {
    padding-left: 220px
}

.header h3[data-v-56107eaf] {
    margin: 0;
    padding: 0;
    font-size: 18px
}

.header .row[data-v-56107eaf] {
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 55px
}

.header .container.full[data-v-56107eaf] {
    max-width: 100%!important
}

.header .left[data-v-56107eaf] {
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.header .left .prev[data-v-56107eaf] {
    margin: 0 10px 0 0;
    padding: 5px;
    line-height: 0;
    border-radius: 4px;
    background: ${cores.preto1}
}

.header .left .prev[data-v-56107eaf]:hover {
    background: ${cores.preto3}
}

.header .left .prev i[data-v-56107eaf] {
    color: ${cores.cinza1}
}

.header .button[data-v-56107eaf] {
    visibility: hidden
}

.header .button .btn[data-v-56107eaf] {
    opacity: 0
}

.header.fixed[data-v-56107eaf] {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    height: 55px;
    -webkit-box-shadow: 0 2px 2px 0 rgba(0,0,0,.1);
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.1)
}

.header.fixed .button[data-v-56107eaf] {
    visibility: visible
}

.header.fixed .button .btn[data-v-56107eaf] {
    opacity: 1
}

@media(max-width: 1280px) {
    .container-big .container[data-v-56107eaf] {
        max-width:1100px
    }
}

.imprimir[data-v-2fcdc294] {
    display: none
}
    
/* Main Container */
.box[data-v-d7f17f70] {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    overflow: hidden;
    perspective: 1000px;


}

.box .box-item[data-v-d7f17f70] {
    width: 20%;
    position: absolute;
    transform-style: preserve-3d;

}

${Array.from({length: 50}, (_, i) => `
.box .box-item:nth-child(${i + 1}) {
    top: ${Math.random() * 80}vh;
    left: ${Math.random() * 80}vw;
    animation: 
        bounce${(i % 5) + 1} ${20 + (i % 15)}s infinite linear ${-1 * (i * 0.2)}s;
}`).join('\n')}
/* Hide elements beyond 50 */
.box .box-item:nth-child(n+51) {
    display: none;
}
@keyframes bounce1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(80vw, 80vh) rotate(90deg); }
    50% { transform: translate(-80vw, 80vh) rotate(180deg); }
    75% { transform: translate(-80vw, -80vh) rotate(270deg); }
}

@keyframes bounce2 {
    0% { transform: translate(-80vw, -80vh) rotate(0deg); }
    33% { transform: translate(80vw, 80vh) rotate(120deg); }
    66% { transform: translate(80vw, -80vh) rotate(240deg); }
    100% { transform: translate(-80vw, -80vh) rotate(360deg); }
}

@keyframes bounce3 {
    0% { transform: translate(80vw, 80vh) rotate(0deg); }
    50% { transform: translate(-80vw, -80vh) rotate(180deg); }
    100% { transform: translate(80vw, 80vh) rotate(360deg); }
}

@keyframes bounce4 {
    0% { transform: translate(0, -80vh) rotate(0deg); }
    25% { transform: translate(80vw, 0) rotate(90deg); }
    50% { transform: translate(0, 80vh) rotate(180deg); }
    75% { transform: translate(-80vw, 0) rotate(270deg); }
    100% { transform: translate(0, -80vh) rotate(360deg); }
}

@keyframes bounce5 {
    0% { transform: translate(-80vw, 0) rotate(0deg); }
    33% { transform: translate(0, 80vh) rotate(120deg); }
    66% { transform: translate(80vw, 0) rotate(240deg); }
    100% { transform: translate(-80vw, 0) rotate(360deg); }
}




// .box[data-v-d7f17f70] {
//     display: -webkit-box;
//     display: -ms-flexbox;
//     display: flex;
//     -webkit-box-flex: 1;
//     -ms-flex: 1;
//     flex: 1;
//     -webkit-box-orient: horizontal;
//     -webkit-box-direction: normal;
//     -ms-flex-direction: row;
//     flex-direction: row;
//     -ms-flex-wrap: wrap;
//     flex-wrap: wrap;
//     margin: 10px -10px
// }

// .box .box-item[data-v-d7f17f70] {
//     display: -webkit-box;
//     display: -ms-flexbox;
//     display: flex;
//     width: 20%;
//     padding: 0 10px;
//     margin: 0 0 20px 0
// }

// .box .box-item .obra[data-v-d7f17f70] {
//     width: 100%;
//     height: 235px;
//     margin: 0;
//     cursor: pointer;
//     background: ${cores.preto2};
//     border-radius: 3px;
//     -webkit-box-shadow: 0 1px 2px 0 rgba(0,0,0,.1);
//     box-shadow: 0 1px 2px 0 rgba(0,0,0,.1);
//     position: relative
// }

// // .box .box-item .obra .imagem[data-v-d7f17f70] {
// //     display: block;
// //     width: 100%;
// //     height: 140px;
// //     border-radius: 3px 3px 0 0;
// //     padding: 10px 15px;
// //     background-color: ${cores.verde5};
// //     border-bottom: 1px solid ${cores.preto1}
// //     filter: brightness(10%);
// // } anteriormente este era o css do box de cada obra

// .box .box-item .obra .imagem[data-v-d7f17f70] {
//     display: block;
//     width: 100%;
//     height: 140px;
//     border-radius: 3px 3px 0 0;
//     padding: 10px 15px;
//     background-color: rgba(0, 0, 0, 0.2);
//     border-bottom: 1px solid rgba(0, 0, 0, 0.8);
//     filter: brightness(80%) contrast(90%);
//     transition: filter 0.3s ease;
// }

// .box .box-item .obra .imagem[data-v-d7f17f70]:hover {
//     filter: brightness(100%);
// }


// .box .box-item .obra:hover>.dropdown[data-v-d7f17f70] {
//     display: block
// }

// .box .box-item .obra .dropdown[data-v-d7f17f70] {
//     position: absolute;
//     top: 15px;
//     right: 15px;
//     z-index: 1;
//     display: none;
//     min-width: 10px
// }

// .box .box-item .obra .dropdown .btn[data-v-d7f17f70] {
//     padding: 0;
//     border: 1px solid ${cores.verde1};
//     font-size: 12px;
//     background-color: ${cores.preto2};
//     color: ${cores.cinza1};
//     line-height: 0
// }

// .box .box-item .obra .dropdown .btn i[data-v-d7f17f70] {
//     padding: 2px 3px;
//     margin: 0;
//     font-size: 24px
// }

// .box .box-item .obra .dropdown .dropdown-menu[data-v-d7f17f70] {
//     min-width: 130px
// }

// .box .box-item .obra .dropdown .dropdown-menu .dropdown-item[data-v-d7f17f70] {
//     padding: 4px 15px!important;
//     font-size: 12px!important
// }

// .box .box-item .obra .body[data-v-d7f17f70] {
//     padding: 10px 15px 10px 15px
// }

// .box .box-item .obra .body .quantidade[data-v-d7f17f70] {
//     position: relative;
//     top: -5px;
//     left: -2px;
//     display: -webkit-box;
//     display: -ms-flexbox;
//     display: flex;
//     -webkit-box-align: center;
//     -ms-flex-align: center;
//     align-items: center
// }

// .box .box-item .obra .body .quantidade ul[data-v-d7f17f70] {
//     margin: 0;
//     padding: 0;
//     list-style: none
// }

// .box .box-item .obra .body .quantidade ul li[data-v-d7f17f70] {
//     display: inline-block;
//     font-size: 10px;
//     margin: 0 5px 0 0;
//     padding: 0;
//     color: #888;
//     min-width: 40px
// }

// .box .box-item .obra .body .quantidade ul li i[data-v-d7f17f70] {
//     font-size: 14px;
//     position: relative;
//     top: 3px
// }

// .box .box-item .obra .body h5[data-v-d7f17f70] {
//     margin: 0;
//     padding: 0;
//     font-size: 14px;
//     max-height: 50px;
//     overflow: hidden;
//     color: ${cores.verde4}
// }

// .box .box-item:hover .obra .body h5[data-v-d7f17f70] {
//     color: ${cores.cinza1}
// }

.nenhum-registro[data-v-d7f17f70] {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    padding: 15px;
    text-align: center
}

.nenhum-registro img[data-v-d7f17f70] {
    height: 35px!important;
    margin-bottom: 15px
}

.nenhum-registro h5[data-v-d7f17f70] {
    font-size: 14px;
    color: ${cores.verde4};
    margin-bottom: 15px
}

.nenhum-registro p[data-v-d7f17f70] {
    font-size: 13px;
    color: ${cores.preto4};
    margin: 0;
    padding: 0
}

@media (max-width: 1280px) {
    .box .box-item[data-v-d7f17f70] {
        width:25%
    }
}

.lista[data-v-6fb94075] {
    width: 100%;
    margin: 10px 0
}

.lista ul[data-v-6fb94075] {
    margin: 0;
    padding: 0;
    list-style: none
}

.lista ul li[data-v-6fb94075] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    height: 100%;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    background: ${cores.preto2};
    border-bottom: 1px solid ${cores.preto3}
}

.lista ul li[data-v-6fb94075]:hover {
    background-color: ${cores.preto1}
}

.lista ul li[data-v-6fb94075]:first-child {
    border-radius: 4px 4px 0 0
}

.lista ul li[data-v-6fb94075]:last-child {
    border-bottom: none;
    border-radius: 0 0 4px 4px
}

.lista ul li .imagem a[data-v-6fb94075] {
    padding: 10px 15px!important;
    display: block;
    min-width: 75px;
    width: 75px;
    height: 65px
}

.lista ul li .imagem img[data-v-6fb94075] {
    width: 100%;
    height: 100%;
    -o-object-fit: cover;
    object-fit: cover;
    border-radius: 4px;
    background-color: ${cores.preto3};
    border: 1px solid ${cores.preto1}
}

.lista ul li .body[data-v-6fb94075] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    height: 100%;
    width: calc(100% - 275px);
    position: relative
}

.lista ul li .body a[data-v-6fb94075] {
    padding: 11px 0
}

.lista ul li .body h5[data-v-6fb94075] {
    margin: 0;
    padding: 0;
    font-size: 14px;
    color: ${cores.azul5}
}

.lista ul li:hover .body h5[data-v-6fb94075] {
    color: ${cores.cinza1}
}

.lista ul li .body .total .total-item[data-v-6fb94075] {
    display: inline-block;
    font-size: 10px;
    margin: 0 5px 0 0;
    padding: 0;
    color: #888;
    min-width: 40px
}

.lista ul li .body .total .total-item i[data-v-6fb94075] {
    font-size: 14px;
    position: relative;
    top: 3px
}

.lista ul li .acao[data-v-6fb94075] {
    min-width: 200px;
    width: 200px;
    height: 100%;
    padding-right: 15px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.lista ul li .acao .status[data-v-6fb94075] {
    font-size: 11px;
    margin-right: 8px
}

.nenhum-registro[data-v-6fb94075] {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    padding: 15px;
    text-align: center;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1
}

.nenhum-registro img[data-v-6fb94075] {
    height: 35px!important;
    margin-bottom: 15px
}

.nenhum-registro h5[data-v-6fb94075] {
    font-size: 14px;
    color: ${cores.verde4};
    margin-bottom: 15px
}

.nenhum-registro p[data-v-6fb94075] {
    font-size: 13px;
    color: ${cores.preto4};
    margin: 0;
    padding: 0
}

.alerta-pagamento.card[data-v-45030eac] {
    border: 1px solid #ed8b8b!important
}

.alerta-pagamento .card-body[data-v-45030eac] {
    padding: 10px 15px
}

.alerta-pagamento .card-body .mensagem[data-v-45030eac] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.alerta-pagamento .card-body .mensagem p[data-v-45030eac] {
    font-size: 14px;
    margin: 0;
    padding: 0;
    color: #c90000
}

.alerta-pagamento .modal-body a[data-v-45030eac] {
    color: ${cores.verde2}
}

.alerta-pagamento .modal-body a[data-v-45030eac]:hover {
    color: ${cores.cinza1}
}

.container[data-v-db708f4e] {
    margin-bottom: 40px;
    max-width: 1300px
}

.container.lista[data-v-db708f4e] {
    max-width: 1100px!important
}

.filtro i[data-v-db708f4e] {
    position: absolute;
    left: -20px;
    top: 6px;
    cursor: pointer
}

.grupo[data-v-db708f4e] {
    margin: 30px 0 0 0
}

.grupo h4[data-v-db708f4e] {
    margin: 0;
    padding: 0;
    font-size: 15px
}

@media (max-width: 1280px) {
    .container[data-v-db708f4e] {
        max-width:1100px
    }
}

.sticky[data-v-232ddd47] {
    top: 55px!important
}

.sidebar .sidebar-header[data-v-28043d9a],.sidebar .sidebar-header[data-v-6712d538] {
    padding: 32px 15px 4px 15px;
    font-size: 12px;
    color: ${cores.azul1}
}

.obra[data-v-c06fb8a2] {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    position: relative
}

.obra .sidebar-left[data-v-c06fb8a2] {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: ${cores.preto2};
    width: 220px;
    height: 100%;
    min-height: calc(100vh - 55px);
    padding-top: 55px;
    border-right: 1px solid ${cores.preto3}
}

.carregando[data-v-c06fb8a2] {
    position: absolute;
    left: 15px;
    bottom: 15px;
    z-index: 99;
    font-size: 12px;
    color: ${cores.preto4}
}

.badge[data-v-53967004] {
    position: relative;
    top: -5px
}

.bordasimples tr th b[data-v-53967004] {
    font-weight: 700
}

.bordasimples .rdo-logo img[data-v-53967004] {
    max-width: 100%!important;
    max-height: 80px
}

.bordasimples .rdo-logo-empresa[data-v-53967004] {
    text-align: left
}

.bordasimples .rdo-logo-empresa-center[data-v-53967004] {
    text-align: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 100%
}

.bordasimples .rdo-logo-cliente[data-v-53967004] {
    text-align: right
}

.bordasimples .rdo-title[data-v-53967004] {
    text-align: center
}

.bordasimples .rdo-title h5[data-v-53967004] {
    margin: 2px;
    padding: 0;
    font-size: 14px
}

.bordasimples.cabecalho tr td[data-v-53967004] {
    height: 33px!important
}

.bordasimples.cabecalho .form-group[data-v-53967004] {
    margin: 0!important;
    padding: 0!important
}

.bordasimples.cabecalho .form-group .form-control[data-v-53967004] {
    height: 28px!important;
    padding: 2px 5px!important
}

.bordasimples.cabecalho .form-group .input-sm[data-v-53967004] {
    width: 65%;
    text-align: center!important;
    float: left;
    padding: 0 5px!important
}

.bordasimples.cabecalho .form-group input[data-v-53967004] {
    text-align: center!important
}

.bordasimples.cabecalho .form-group span[data-v-53967004] {
    display: inline-block;
    margin: 7px 0 0 5px
}

.bordasimples .form-group[data-v-53967004] {
    margin: 0!important;
    padding: 0!important
}

.bordasimples .form-group .form-control[data-v-53967004] {
    height: 28px!important;
    padding: 5px 5px!important
}

.footer ul[data-v-0ffedba8] {
    margin: 0 0 18px 0;
    padding: 0;
    list-style: none
}

.footer ul li[data-v-0ffedba8] {
    margin: 0 0 5px 0;
    padding: 0;
    font-size: 11px
}

.footer .visualizacao[data-v-0ffedba8] {
    text-align: right
}

.footer .visualizacao a[data-v-0ffedba8] {
    font-size: 12px;
    margin-left: 20px
}

.footer .btn[data-v-0ffedba8] {
    margin-right: 10px
}

.edicoes[data-v-0ffedba8] {
    font-size: 12px;
    border-bottom: 1px dashed ${cores.preto3};
    padding: 20px 0 20px 15px
}

.edicoes[data-v-0ffedba8]:hover {
    background: #f6f6f6
}

.edicoes[data-v-0ffedba8]:last-child {
    border-bottom: none
}

.edicoes h5[data-v-0ffedba8] {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 2px 0;
    padding: 0;
    color: #dc3545
}

.edicoes .edicoes-versao[data-v-0ffedba8] {
    margin-top: 10px
}

.edicoes .edicoes-versao h6[data-v-0ffedba8] {
    font-size: 10px;
    font-weight: 700;
    margin: 0;
    display: inline-block
}

.edicoes .edicoes-versao ul[data-v-0ffedba8] {
    margin: 0;
    padding: 0;
    position: relative;
    left: -2px
}

.edicoes .edicoes-versao ul li[data-v-0ffedba8] {
    display: inline-block;
    background: ${cores.preto1};
    margin: 2px;
    padding: 2px 0;
    border-radius: 4px;
    width: 110px;
    text-align: center
}

.btn-primary[data-v-0ffedba8] {
    color: ${cores.preto2}!important
}

.row[data-v-40365936] {
    margin-right: -8px;
    margin-left: -8px
}

.row .col[data-v-40365936] {
    padding-right: 8px;
    padding-left: 8px
}

.bordasimples[data-v-40365936] {
    margin-top: 15px
}

.bordasimples tr th[data-v-40365936] {
    height: 27px!important
}

.bordasimples tr td[data-v-40365936] {
    height: 27px!important;
    position: relative
}

.bordasimples tr td b[data-v-40365936] {
    height: 27px!important
}

.bordasimples tr[data-v-40365936]:hover {
    background: ${cores.verde5}
}

.bordasimples .rdo-logo img[data-v-40365936] {
    max-width: 200px!important;
    max-height: 80px
}

.bordasimples .rdo-logo-empresa[data-v-40365936] {
    text-align: left
}

.bordasimples .rdo-logo-empresa-center[data-v-40365936] {
    text-align: center
}

.bordasimples .rdo-logo-cliente[data-v-40365936] {
    text-align: right
}

.bordasimples .rdo-title[data-v-40365936] {
    text-align: center
}

.bordasimples .rdo-title h5[data-v-40365936] {
    margin: 2px;
    padding: 0;
    font-size: 14px
}

.clima-icone[data-v-40365936] {
    text-transform: capitalize;
    padding-left: 30px
}

.icone[data-v-40365936] {
    position: absolute;
    top: 4px;
    left: 5px
}

.icone img[data-v-40365936] {
    width: 17px;
    opacity: .8
}

.impraticavel[data-v-40365936] {
    color: red;
    font-style: italic
}

.row[data-v-a5ac3856] {
    margin-right: -8px;
    margin-left: -8px
}

.row .col[data-v-a5ac3856] {
    padding-right: 8px;
    padding-left: 8px
}

.bordasimples[data-v-a5ac3856] {
    margin-top: 15px
}

.bordasimples tr th[data-v-a5ac3856] {
    height: 27px!important
}

.bordasimples tr td[data-v-a5ac3856] {
    height: 27px!important;
    position: relative
}

.bordasimples tr td b[data-v-a5ac3856] {
    height: 27px!important
}

.bordasimples tr[data-v-a5ac3856]:hover {
    background: ${cores.verde5}
}

.bordasimples .rdo-logo img[data-v-a5ac3856] {
    max-width: 200px!important;
    max-height: 80px
}

.bordasimples .rdo-logo-empresa[data-v-a5ac3856] {
    text-align: left
}

.bordasimples .rdo-logo-empresa-center[data-v-a5ac3856] {
    text-align: center
}

.bordasimples .rdo-logo-cliente[data-v-a5ac3856] {
    text-align: right
}

.bordasimples .rdo-title[data-v-a5ac3856] {
    text-align: center
}

.bordasimples .rdo-title h5[data-v-a5ac3856] {
    margin: 2px;
    padding: 0;
    font-size: 14px
}

.clima-icone[data-v-a5ac3856] {
    text-transform: capitalize;
    padding-left: 30px
}

.icone[data-v-a5ac3856] {
    position: absolute;
    top: 4px;
    left: 5px
}

.icone img[data-v-a5ac3856] {
    width: 17px;
    opacity: .8
}

.impraticavel[data-v-a5ac3856] {
    color: red;
    font-style: italic
}

.bordasimples[data-v-1d74fa89] {
    margin-top: 15px
}

.bordasimples tr td b[data-v-1d74fa89],.bordasimples tr td[data-v-1d74fa89],.bordasimples tr th[data-v-1d74fa89] {
    height: 27px!important
}

.bordasimples[data-v-fe3ed79a] {
    margin-top: 15px
}

.bordasimples tbody tr th[data-v-fe3ed79a] {
    text-align: center;
    background: ${cores.verde5};
    font-weight: 400;
    color: ${cores.azul1}
}

.bordasimples tbody tr td[data-v-fe3ed79a] {
    text-align: center
}

.bordasimples .total[data-v-fe3ed79a] {
    font-weight: 700
}

.bordasimples tr[data-v-fe3ed79a]:hover {
    background: ${cores.verde5}
}

.centralizar[data-v-fe3ed79a] {
    text-align: center
}

.bordasimples[data-v-11aed268] {
    margin-top: 15px
}

.bordasimples tbody tr th[data-v-11aed268] {
    text-align: center;
    background: ${cores.verde5};
    font-weight: 400;
    color: ${cores.azul1}
}

.bordasimples tbody tr td[data-v-11aed268] {
    text-align: center
}

.bordasimples tr[data-v-11aed268]:hover {
    background: ${cores.verde5}
}

.centralizar[data-v-11aed268] {
    text-align: center
}

.bordasimples[data-v-9ee18e1e] {
    margin-top: 15px
}

.bordasimples tr td[data-v-9ee18e1e] {
    text-align: center
}

.bordasimples .total[data-v-9ee18e1e] {
    font-weight: 700
}

.bordasimples .horario[data-v-9ee18e1e] {
    font-size: 11px;
    color: ${cores.roxo3}
}

.bordasimples tr[data-v-9ee18e1e]:hover {
    background: ${cores.verde5}
}

.sub-item[data-v-29064df8] {
    font-size: 11px;
    color: ${cores.azul1}
}

.list-group .list-group-item[data-v-29064df8] {
    padding: 6px 12px
}

.list-group .list-group-item[data-v-29064df8]:hover {
    background-color: ${cores.azul2}
}

.tag[data-v-29064df8] {
    background: ${cores.preto3};
    font-size: 11px;
    margin: 5px 5px 0 0;
    padding: 0 6px;
    display: inline-block;
    border-radius: 4px
}

.bordasimples[data-v-1114fb02] {
    margin-top: 15px
}

.bordasimples tr[data-v-1114fb02]:hover {
    background: ${cores.verde5}
}

.bordasimples .porcentagem[data-v-1114fb02] {
    text-align: right
}

.bordasimples .sub-titulo[data-v-1114fb02] {
    margin: 5px 0 0 25px;
    padding: 0;
    font-size: 11px;
    font-style: italic;
    color: ${cores.preto4}
}

.bordasimples .sub-titulo-etapa[data-v-1114fb02] {
    margin: 0 0 4px 0!important;
    padding: 0!important;
    font-size: 11px;
    color: ${cores.roxo2};
    display: block
}

.bordasimples p[data-v-1114fb02] {
    margin: 0
}

.bordasimples .item-etapa b[data-v-1114fb02] {
    color: ${cores.azul1}
}

.bordasimples .sub-item[data-v-1114fb02] {
    font-size: 11px;
    color: ${cores.preto4};
    margin: 2px 0
}

.mao-de-obra[data-v-1114fb02] {
    list-style: none;
    margin-top: 4px
}

.mao-de-obra li[data-v-1114fb02] {
    display: inline-block;
    background-color: ${cores.azul2};
    color: ${cores.cinza3};
    font-size: 11px;
    margin: 2px;
    padding: 0 6px;
    border-radius: 2px
}

table ul[data-v-1114fb02] {
    margin: 0 0 0 1px;
    padding: 0;
    display: block;
    list-style: none
}

table ul[data-v-1114fb02]:after {
    content: "";
    display: block;
    clear: both
}

table ul li[data-v-1114fb02] {
    display: block;
    width: 27px;
    height: 27px;
    border-radius: 2px;
    margin: 1px 1px 0 0;
    float: left;
    background-color: ${cores.azul2}
}

.horario[data-v-1114fb02] {
    font-size: 11px;
    margin-top: 4px;
    color: ${cores.roxo3};
    display: block
}

.quantitativo[data-v-1114fb02] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    z-index: 999;
    position: relative
}

.quantitativo .quantitativo-item[data-v-1114fb02] {
    margin: 2px 2px 2px 0;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    padding: 1px 4px;
    border-radius: 3px
}

.quantitativo .quantitativo-item[data-v-1114fb02]:hover {
    cursor: pointer;
    background: #007bff
}

.quantitativo .quantitativo-item:hover>i[data-v-1114fb02],.quantitativo .quantitativo-item:hover>span[data-v-1114fb02] {
    color: ${cores.preto2}
}

.quantitativo .quantitativo-item i[data-v-1114fb02] {
    font-size: 14px;
    margin-right: 3px;
    color: #bbb
}

.quantitativo .quantitativo-item span[data-v-1114fb02] {
    font-size: 11px!important;
    color: ${cores.preto4}
}

.bordasimples[data-v-f43d8caa] {
    margin-top: 15px
}

.bordasimples tr[data-v-f43d8caa]:hover {
    background: ${cores.verde5}
}

.bordasimples .rdo-tags[data-v-f43d8caa] {
    display: block
}

.bordasimples .rdo-tags span[data-v-f43d8caa] {
    display: inline-block;
    background: ${cores.preto3};
    color: ${cores.cinza3};
    margin: 5px 5px 0 0;
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 2px
}

.bordasimples .sub-item[data-v-f43d8caa] {
    font-size: 11px;
    color: ${cores.preto4};
    margin: 2px 0
}

.row[data-v-032b641e] {
    margin-right: -8px;
    margin-left: -8px
}

.row .col[data-v-032b641e] {
    padding-right: 8px;
    padding-left: 8px
}

.bordasimples[data-v-032b641e] {
    margin-top: 15px
}

.bordasimples tr[data-v-032b641e]:hover {
    background: ${cores.verde5}
}

.bordasimples .sub-item[data-v-032b641e] {
    font-size: 11px;
    color: ${cores.preto4};
    margin: 2px 0
}

.modal-body[data-v-e5ddfcbe] {
    padding: 0!important
}

.modal-body .grupo-selecao[data-v-e5ddfcbe] {
    max-height: 60vh;
    overflow-x: hidden;
    padding: 0 0 0 0
}

.modal-body .grupo-selecao .form-group[data-v-e5ddfcbe] {
    margin: 10px 15px!important;
    min-height: 50px
}

.modal-body .grupo-selecao .item[data-v-e5ddfcbe] {
    background-color: ${cores.preto2}
}

.modal-body .grupo-selecao .item.hide[data-v-e5ddfcbe] {
    display: none
}

.modal-body .grupo-selecao .item-nenhum-registro[data-v-e5ddfcbe] {
    position: absolute;
    font-size: 12px;
    color: ${cores.preto4};
    padding: 2px 0 15px 15px
}

.bordasimples[data-v-f1b15a12] {
    margin-top: 15px
}

.bordasimples tr[data-v-f1b15a12]:hover {
    background: ${cores.verde5}
}

.bordasimples tr td p[data-v-f1b15a12] {
    margin: 0;
    padding: 0
}

.bordasimples tr td p b[data-v-f1b15a12] {
    color: ${cores.verde4}
}

.bordasimples tr td p.data-hora[data-v-f1b15a12] {
    text-align: right;
    font-size: 11px;
    color: ${cores.roxo3}
}

.bordasimples tr td p.data-hora-acao[data-v-f1b15a12] {
    margin-right: 80px
}

.btn-primary[data-v-f1b15a12] {
    position: relative;
    top: -10px;
    font-size: 12px
}

.acao[data-v-f1b15a12] {
    position: absolute;
    right: 10px;
    top: 0
}

.bordasimples[data-v-7cb3a8a0] {
    margin-top: 15px
}

.bordasimples tr td[data-v-7cb3a8a0] {
    padding: 0
}

.bordasimples .imagem-upload[data-v-7cb3a8a0] {
    padding: 8px
}

.bordasimples .imagem-upload .loader[data-v-7cb3a8a0] {
    float: left;
    width: calc(14.28% - 1px)!important;
    height: 95px!important;
    display: block;
    margin: 1px;
    position: relative;
    background: #929292;
    border-radius: 3px
}

.btn-primary[data-v-7cb3a8a0] {
    position: relative;
    top: -10px;
    font-size: 12px;
    margin-bottom: 0
}

.bordasimples[data-v-3229c72c] {
    margin-top: 15px;
    margin-bottom: 0
}

.bordasimples tr td[data-v-3229c72c] {
    padding: 0
}

.box-videos[data-v-3229c72c] {
    padding: 8px 12px;
    border-left: 1px solid ${cores.verde1};
    border-right: 1px solid ${cores.verde1};
    border-bottom: 1px solid ${cores.verde1}
}

.bordasimples[data-v-7c7a0728] {
    margin-top: 15px
}

.bordasimples tr[data-v-7c7a0728]:hover {
    background: ${cores.verde5}
}

.progress[data-v-7c7a0728] {
    width: 100%;
    height: 5px;
    margin: 6px 0 0 0;
    overflow: hidden;
    background-color: #efefef;
    border-radius: 0;
    -webkit-box-shadow: none;
    box-shadow: none
}

.progress .progress-bar[data-v-7c7a0728] {
    background-color: #ff9500;
    -webkit-box-shadow: none;
    box-shadow: none
}

.progress .progress-bar.success[data-v-7c7a0728] {
    background-color: #4cd965
}

.progress .progress-bar.error[data-v-7c7a0728] {
    background-color: #ff3b2f
}

.btn-primary[data-v-7c7a0728] {
    position: relative;
    top: -10px;
    font-size: 12px;
    margin-bottom: 0
}

.assinatura[data-v-f14ed146] {
    border-top: 1px solid ${cores.verde1};
    text-align: center;
    margin: 40px 20px 0 20px
}

.assinatura p[data-v-f14ed146] {
    font-size: 11px;
    margin-top: 6px;
    color: ${cores.preto4}
}

.alert.alert-dark[data-v-1708882a] {
    padding: 12px 15px;
    color: #393939;
    background-color: #f7f7f7;
    border-color: ${cores.preto3}
}

.assinatura[data-v-1708882a] {
    margin-top: 30px
}

.assinatura h4[data-v-1708882a] {
    font-size: 12px;
    margin: 10px 0 2px 0;
    font-weight: 700
}

.assinatura .status[data-v-1708882a] {
    margin-bottom: 4px
}

.assinatura .line[data-v-1708882a] {
    font-size: 12px;
    margin: 0;
    padding: 0;
    color: ${cores.verde3}
}

.assinatura .data-hora[data-v-1708882a] {
    font-size: 11px;
    margin: 0;
    padding: 0;
    color: ${cores.preto4};
    margin-left: 5px
}

.assinatura .aprovador[data-v-1708882a] {
    margin-bottom: 8px
}

.assinatura .btn[data-v-1708882a] {
    margin: 8px 0 0 0
}

.assinatura .btn-danger[data-v-1708882a] {
    margin-right: 5px
}

.header-descricao[data-v-1708882a] {
    font-size: 12px;
    color: ${cores.preto4};
    padding: 0;
    margin-top: 20px;
    display: block
}

.float-right .btn[data-v-0db91a99] {
    margin-left: 8px
}

.btn-primary[data-v-0db91a99] {
    color: ${cores.preto2}!important
}

.container[data-v-0db91a99] {
    padding: 15px 15px 40px 15px
}

.container-placeholder[data-v-0db91a99] {
    padding: 15px 15px
}

.container .row[data-v-0db91a99] {
    margin-right: -8px;
    margin-left: -8px
}

.container .row .col[data-v-0db91a99] {
    padding-right: 8px;
    padding-left: 8px
}

.paginacao[data-v-0db91a99] {
    margin-top: 10px;
    padding: 20px 0 0 0;
    position: relative;
    top: 5px
}

.paginacao .left[data-v-0db91a99] {
    text-align: left
}

.paginacao .left a[data-v-0db91a99] {
    display: inline-block
}

.paginacao .left a[data-v-0db91a99]:after {
    contain: "";
    display: block;
    clear: both
}

.paginacao .left a i[data-v-0db91a99] {
    float: left;
    font-size: 20px;
    margin-right: 8px;
    background: ${cores.azul2};
    padding: 4px;
    border-radius: 3px
}

.paginacao .left a .data[data-v-0db91a99] {
    float: left
}

.paginacao .left a .data span[data-v-0db91a99] {
    display: block;
    font-size: 11px;
    line-height: 1.3em
}

.paginacao .right[data-v-0db91a99] {
    text-align: right
}

.paginacao .right a[data-v-0db91a99] {
    display: inline-block
}

.paginacao .right a[data-v-0db91a99]:after {
    contain: "";
    display: block;
    clear: both
}

.paginacao .right a i[data-v-0db91a99] {
    float: right;
    font-size: 20px;
    margin-left: 8px;
    background: ${cores.azul2};
    padding: 4px;
    border-radius: 3px
}

.paginacao .right a .data[data-v-0db91a99] {
    float: right
}

.paginacao .right a .data span[data-v-0db91a99] {
    display: block;
    font-size: 11px;
    line-height: 1.3em
}

.badge[data-v-9f2cdef4] {
    position: relative;
    top: -5px
}

.bordasimples tr th b[data-v-9f2cdef4] {
    font-weight: 700
}

.bordasimples .rdo-logo img[data-v-9f2cdef4] {
    max-width: 100%!important;
    max-height: 80px
}

.bordasimples .rdo-logo-empresa[data-v-9f2cdef4] {
    text-align: left
}

.bordasimples .rdo-logo-empresa-center[data-v-9f2cdef4] {
    text-align: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 100%
}

.bordasimples .rdo-logo-cliente[data-v-9f2cdef4] {
    text-align: right
}

.bordasimples .rdo-title[data-v-9f2cdef4] {
    text-align: center
}

.bordasimples .rdo-title h5[data-v-9f2cdef4] {
    margin: 2px;
    padding: 0;
    font-size: 14px
}

.bordasimples .input-modelo[data-v-9f2cdef4] {
    font-weight: 700;
    font-size: 14px
}

.bordasimples.cabecalho tr td[data-v-9f2cdef4] {
    height: 35px!important
}

.bordasimples.cabecalho .form-group[data-v-9f2cdef4] {
    margin: 0!important;
    padding: 0!important
}

.bordasimples.cabecalho .form-group .form-control[data-v-9f2cdef4] {
    height: 28px!important;
    padding: 2px 5px!important
}

.bordasimples.cabecalho .form-group .input-sm[data-v-9f2cdef4] {
    width: 65%;
    text-align: center!important;
    float: left;
    padding: 0 5px!important
}

.bordasimples.cabecalho .form-group input[data-v-9f2cdef4] {
    text-align: center!important
}

.bordasimples.cabecalho .form-group span[data-v-9f2cdef4] {
    display: inline-block;
    margin: 7px 0 0 5px
}

.bordasimples .form-group[data-v-9f2cdef4] {
    margin: 0!important;
    padding: 0!important
}

.bordasimples .form-group .form-control[data-v-9f2cdef4] {
    height: 28px!important;
    padding: 5px 5px!important
}

.data-editor[data-v-9f2cdef4] {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row
}

.data-editor input[data-v-9f2cdef4] {
    display: -webkit-box!important;
    display: -ms-flexbox!important;
    display: flex!important;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    height: 28px!important;
    margin: 0 2px 0 0;
    padding: 0;
    text-align: center
}

.data-editor input[data-v-9f2cdef4]:last-child {
    margin: 0 0 0 2px
}

.menu-right ul[data-v-4df3ce99] {
    margin: 0;
    padding: 8px 0;
    list-style: none
}

.menu-right ul li[data-v-4df3ce99] {
    display: block
}

.menu-right ul li a[data-v-4df3ce99] {
    display: block;
    padding: 5px 10px;
    font-size: 11px;
    position: relative;
    color: ${cores.azul1}
}

.menu-right ul li a[data-v-4df3ce99]:hover {
    text-decoration: none;
    color: ${cores.cinza1};
    background-color: ${cores.azul2}
}

.menu-right ul li a span[data-v-4df3ce99] {
    position: absolute;
    right: 10px;
    background: ${cores.preto3};
    padding: 0 4px;
    border-radius: 3px
}

@media (max-width: 1450px) {
    .menu-right ul li a[data-v-4df3ce99] {
        padding:4px 8px;
        font-size: 11px
    }
}

.footer ul[data-v-7bccf65d] {
    margin: 0 0 18px 0;
    padding: 0;
    list-style: none
}

.footer ul li[data-v-7bccf65d] {
    margin: 0 0 5px 0;
    padding: 0;
    font-size: 11px
}

.footer .visualizacao[data-v-7bccf65d] {
    text-align: right
}

.footer .visualizacao a[data-v-7bccf65d] {
    font-size: 12px;
    margin-left: 20px
}

.footer .btn[data-v-7bccf65d] {
    margin-right: 10px
}

.salvando[data-v-7bccf65d] {
    font-size: 12px;
    margin-right: 15px;
    color: ${cores.preto4};
    font-style: italic
}

.edicoes[data-v-7bccf65d] {
    font-size: 12px;
    border-bottom: 1px dashed ${cores.preto3};
    padding: 20px 0 20px 15px
}

.edicoes[data-v-7bccf65d]:hover {
    background: #f6f6f6
}

.edicoes[data-v-7bccf65d]:last-child {
    border-bottom: none
}

.edicoes h5[data-v-7bccf65d] {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 2px 0;
    padding: 0;
    color: #dc3545
}

.edicoes .edicoes-versao[data-v-7bccf65d] {
    margin-top: 10px
}

.edicoes .edicoes-versao h6[data-v-7bccf65d] {
    font-size: 10px;
    font-weight: 700;
    margin: 0;
    display: inline-block
}

.edicoes .edicoes-versao ul[data-v-7bccf65d] {
    margin: 0;
    padding: 0;
    position: relative;
    left: -2px
}

.edicoes .edicoes-versao ul li[data-v-7bccf65d] {
    display: inline-block;
    background: ${cores.preto1};
    margin: 2px;
    padding: 2px 0;
    border-radius: 4px;
    width: 110px;
    text-align: center
}

.row[data-v-376b5a0d] {
    margin-right: -8px;
    margin-left: -8px
}

.row .col[data-v-376b5a0d] {
    padding-right: 8px;
    padding-left: 8px
}

.bordasimples[data-v-376b5a0d] {
    margin-top: 0
}

.bordasimples tr td[data-v-376b5a0d] {
    padding: 7px
}

.checkbox label[data-v-376b5a0d],.checkbox-radio label[data-v-376b5a0d] {
    font-size: 11px!important;
    margin: 0!important
}

.radio[data-v-376b5a0d] {
    padding-left: 7px
}

.row[data-v-7997c890] {
    margin-right: -8px;
    margin-left: -8px
}

.row .col[data-v-7997c890] {
    padding-right: 8px;
    padding-left: 8px
}

p[data-v-7997c890] {
    margin: 0;
    padding: 0;
    font-size: 10px;
    color: ${cores.preto4};
    font-style: italic;
    position: relative;
    top: -8px
}

.centralizar[data-v-7997c890] {
    text-align: center;
    padding-top: 25px;
    color: ${cores.preto4}
}

.card .card-body[data-v-7997c890] {
    padding: 6px 16px 0 16px
}

.form-group label[data-v-7997c890] {
    font-size: 11px!important
}

.form-control[data-v-7997c890] {
    height: 30px!important
}

.totalHoras[data-v-7997c890] {
    font-size: 12px;
    color: ${cores.azul1};
    font-weight: 500;
    margin-top: 6px
}

.tipo-maodeobra[data-v-3f5864c4] {
    font-size: 12px;
    margin-right: 15px;
    color: ${cores.preto4};
    text-transform: uppercase
}

.lista ul[data-v-3f5864c4] {
    margin: 0;
    padding: 0;
    list-style: none
}

.lista ul[data-v-3f5864c4]:after {
    content: "";
    display: block;
    clear: both
}

.lista ul li[data-v-3f5864c4] {
    width: 33.32%;
    float: left;
    padding: 0 35px 0 15px;
    position: relative;
    border-bottom: 1px solid ${cores.roxo1}
}

.lista ul li[data-v-3f5864c4]:after {
    content: "";
    display: block;
    clear: both
}

.lista ul li[data-v-3f5864c4]:hover {
    background-color: ${cores.verde5}
}

.lista ul li[data-v-3f5864c4] {
    border-right: 1px solid ${cores.roxo1}
}

.lista ul li[data-v-3f5864c4]:nth-child(3n) {
    border-right: none
}

.lista ul li .descricao[data-v-3f5864c4] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    float: left;
    width: calc(100% - 110px);
    height: 40px;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center
}

.lista ul li .descricao p[data-v-3f5864c4] {
    font-size: 12px;
    padding: 0;
    margin: 0;
    color: ${cores.verde2}
}

.lista ul li .descricao span[data-v-3f5864c4] {
    font-size: 10px;
    color: ${cores.preto4};
    font-style: italic
}

.lista ul li .form[data-v-3f5864c4] {
    float: right
}

.lista ul li a[data-v-3f5864c4] {
    position: absolute;
    top: 8px;
    right: 15px;
    font-size: 10px;
    padding: 3px 2px 0 2px;
    color: ${cores.cinza1}!important;
    background: ${cores.azul2};
    border-radius: 3px;
    height: 24px!important
}

.lista ul li a i[data-v-3f5864c4] {
    font-size: 20px;
    line-height: 18px;
    margin: 0;
    padding: 0
}

.form[data-v-3f5864c4] {
    padding: 8px 0;
    width: 100px!important
}

.form .input-group[data-v-3f5864c4] {
    margin: 0!important
}

.form .input-group .form-control[data-v-3f5864c4] {
    height: auto!important;
    width: 44px!important;
    max-width: 44px!important;
    padding: 2px 0!important;
    border-radius: 0!important;
    text-align: center
}

.form .input-group .input-group-text[data-v-3f5864c4] {
    padding: 0 14px 0 8px;
    cursor: pointer;
    background: ${cores.verde5};
    color: ${cores.roxo3};
    width: 15px;
    text-align: center;
    font-size: 11px
}

.form .input-group .input-group-text[data-v-3f5864c4]:hover {
    color: ${cores.preto2};
    border-color: ${cores.cinza1};
    background: ${cores.cinza1}
}

.nenhum-registro[data-v-3f5864c4] {
    font-size: 11px;
    color: ${cores.preto4}
}

.modal-body[data-v-3f5864c4] {
    padding: 0!important
}

.modal-body .busca[data-v-3f5864c4] {
    padding: 0 15px
}

.modal-body .grupo-selecao[data-v-3f5864c4] {
    max-height: 60vh;
    overflow-x: hidden;
    padding: 0 0 0 0
}

.modal-body .grupo-selecao .form-group[data-v-3f5864c4] {
    margin: 10px 15px!important
}

.modal-body .grupo-selecao .item[data-v-3f5864c4] {
    background-color: ${cores.preto2}
}

.modal-body .grupo-selecao .item.hide[data-v-3f5864c4] {
    display: none
}

.modal-body .grupo-selecao .item-nenhum-registro[data-v-3f5864c4] {
    font-size: 12px;
    color: ${cores.preto4};
    padding: 10px 15px;
    font-style: italic;
    border-radius: 3px;
    background-color: ${cores.verde5}
}

.float-left[data-v-3f5864c4] {
    position: absolute;
    left: 15px
}

.form-select[data-v-3f5864c4] {
    width: auto!important;
    display: inline-block!important;
    margin-right: 15px
}

.horas-trabalhadas[data-v-69dca3e0] {
    font-size: 12px;
    margin-top: 8px;
    display: block
}

ul[data-v-d06509e8] {
    margin: 0;
    padding: 0;
    list-style: none
}

ul li[data-v-d06509e8] {
    margin-bottom: 15px
}

.float-left[data-v-d06509e8] {
    position: absolute;
    left: 15px
}

.centralizar[data-v-d06509e8] {
    text-align: center
}

.resetar[data-v-d06509e8] {
    padding-left: 0;
    padding-right: 0
}

.presenca[data-v-d06509e8] {
    width: 110px!important
}

.tipo-maodeobra[data-v-d06509e8] {
    font-size: 12px;
    margin-right: 15px;
    color: ${cores.preto4};
    text-transform: uppercase
}

.form-select[data-v-d06509e8] {
    width: auto!important;
    display: inline-block!important;
    margin-right: 15px
}

.table tr th[data-v-d06509e8] {
    padding-top: 15px
}

.table .form-group[data-v-d06509e8] {
    margin: 0!important
}

.table .form-group .form-control[data-v-d06509e8] {
    height: 28px!important;
    padding: 4px 8px!important;
    margin: 0 2px;
    text-align: center;
    width: 60px;
    display: inline-block
}

.table tr td .grupo[data-v-d06509e8] {
    margin: 0;
    padding: 0;
    font-size: 11px;
    color: ${cores.roxo3}
}

.table tr td.acao[data-v-d06509e8] {
    padding: 8px 15px 6px 15px
}

.modal-dialog-big[data-v-d06509e8] {
    max-width: 700px!important
}

.modal-body-horas[data-v-d06509e8] {
    max-height: 75vh;
    overflow-x: hidden
}

.modal-body[data-v-d06509e8] {
    padding: 0!important
}

.modal-body .busca[data-v-d06509e8] {
    padding: 0 15px
}

.modal-body .grupo-selecao[data-v-d06509e8] {
    max-height: 55vh;
    overflow-x: hidden;
    padding: 0 0 0 0
}

.modal-body .grupo-selecao .form-group[data-v-d06509e8] {
    margin: 10px 15px!important
}

.modal-body .grupo-selecao .item[data-v-d06509e8] {
    background-color: ${cores.preto2}
}

.modal-body .grupo-selecao .item.hide[data-v-d06509e8] {
    display: none
}

.modal-body .grupo-selecao .item-nenhum-registro[data-v-d06509e8] {
    font-size: 12px;
    color: ${cores.preto4};
    padding: 10px 15px;
    font-style: italic;
    border-radius: 3px;
    background-color: ${cores.verde5}
}

.modal-body .grupo-selecao .funcao[data-v-d06509e8] {
    color: ${cores.roxo3}
}

.tipo-maodeobra[data-v-3ac1f292] {
    font-size: 12px;
    margin-right: 15px;
    color: ${cores.preto4}
}

.lista ul[data-v-3ac1f292] {
    margin: 0;
    padding: 0;
    list-style: none
}

.lista ul[data-v-3ac1f292]:after {
    content: "";
    display: block;
    clear: both
}

.lista ul li[data-v-3ac1f292] {
    width: 33.32%;
    float: left;
    padding: 0 15px;
    position: relative;
    border-bottom: 1px solid ${cores.roxo1}
}

.lista ul li[data-v-3ac1f292]:after {
    content: "";
    display: block;
    clear: both
}

.lista ul li[data-v-3ac1f292]:hover {
    background-color: ${cores.verde5}
}

.lista ul li[data-v-3ac1f292] {
    border-right: 1px solid ${cores.roxo1}
}

.lista ul li[data-v-3ac1f292]:nth-child(3n) {
    border-right: none
}

.lista ul li .center[data-v-3ac1f292] {
    -webkit-box-orient: horizontal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    min-height: 40px
}

.lista ul li .center[data-v-3ac1f292],.lista ul li .descricao[data-v-3ac1f292] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-direction: normal
}

.lista ul li .descricao[data-v-3ac1f292] {
    -webkit-box-orient: vertical;
    -ms-flex-direction: column;
    flex-direction: column;
    width: calc(100% - 130px);
    margin-right: 10px;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center
}

.lista ul li .descricao p[data-v-3ac1f292] {
    font-size: 12px;
    padding: 0;
    margin: 0;
    color: ${cores.verde2}
}

.lista ul li .descricao span[data-v-3ac1f292] {
    font-size: 10px;
    color: ${cores.preto4};
    font-style: italic
}

.lista ul li .form[data-v-3ac1f292] {
    max-width: 60px;
    width: 60px
}

.lista ul li .form .form-control[data-v-3ac1f292] {
    width: 100%;
    max-height: 24px;
    text-align: center
}

.lista ul li .acao[data-v-3ac1f292] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    width: 60px;
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.nenhum-registro[data-v-3ac1f292] {
    font-size: 11px;
    color: ${cores.preto4}
}

.modal-body[data-v-3ac1f292] {
    padding: 0!important
}

.modal-body .busca[data-v-3ac1f292] {
    padding: 0 15px
}

.modal-body .grupo-selecao[data-v-3ac1f292] {
    max-height: 60vh;
    overflow-x: hidden;
    padding: 0 0 0 0
}

.modal-body .grupo-selecao .form-group[data-v-3ac1f292] {
    margin: 10px 15px!important
}

.modal-body .grupo-selecao .item[data-v-3ac1f292] {
    background-color: ${cores.preto2}
}

.modal-body .grupo-selecao .item.hide[data-v-3ac1f292] {
    display: none
}

.modal-body .grupo-selecao .item-nenhum-registro[data-v-3ac1f292] {
    font-size: 12px;
    color: ${cores.preto4};
    padding: 10px 15px;
    font-style: italic;
    border-radius: 3px;
    background-color: ${cores.verde5}
}

.float-left[data-v-3ac1f292] {
    position: absolute;
    left: 15px
}

.btn-primary[data-v-293047b6] {
    padding: 4px 10px 4px 25px!important
}

.btn-primary i[data-v-293047b6] {
    left: 4px
}

.box[data-v-293047b6] {
    padding: 10px 15px;
    background-color: ${cores.verde5};
    border-radius: 4px
}

.box .box-header[data-v-293047b6] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    min-height: 30px
}

.box .box-header h6[data-v-293047b6] {
    font-size: 12px;
    font-weight: 700;
    margin: 0
}

.sub-item[data-v-293047b6] {
    font-size: 10px;
    color: ${cores.roxo3}
}

.dropdown[data-v-293047b6] {
    min-width: 10px!important
}

.dropdown-menu[data-v-293047b6] {
    width: 280px
}

.list-group .list-group-item[data-v-293047b6]:first-child {
    margin-top: 10px
}

.list-group .list-group-item[data-v-293047b6] {
    padding: 6px 12px;
    position: relative
}

.list-group .list-group-item .col[data-v-293047b6] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.list-group .list-group-item .col.col-quantidade[data-v-293047b6] {
    max-width: 100px
}

.list-group .list-group-item[data-v-293047b6]:hover {
    border-color: ${cores.cinza1}!important
}

.list-group .list-group-item .col .input-group[data-v-293047b6] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.list-group .list-group-item .col .input-group input[data-v-293047b6] {
    text-align: center;
    margin-left: 2px;
    height: 24px!important
}

.list-group .list-group-item a[data-v-293047b6] {
    background-color: ${cores.azul2};
    padding: 2px 1px;
    border-radius: 3px;
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex
}

.list-group .list-group-item a[data-v-293047b6]:hover {
    text-decoration: none;
    background-color: ${cores.preto3}
}

.list-group .list-group-item a i[data-v-293047b6] {
    font-size: 20px;
    margin: 0;
    padding: 0;
    line-height: 18px
}

.nenhum-registro[data-v-293047b6] {
    font-size: 12px;
    padding: 0 15px;
    color: ${cores.roxo3}
}

.row[data-v-fc5d7ba0] {
    margin-right: -5px;
    margin-left: -5px
}

.row .col[data-v-fc5d7ba0] {
    padding-right: 5px;
    padding-left: 5px
}

.btn[data-v-fc5d7ba0] {
    padding: 5px 10px 5px 25px!important
}

.btn-icon i[data-v-fc5d7ba0] {
    left: 4px
}

.btn-primary[data-v-fc5d7ba0] {
    margin: 0;
    padding: 4px 10px 4px 25px!important;
    color: ${cores.preto2};
    font-weight: 400;
    font-size: 13px!important
}

.galeria[data-v-fc5d7ba0] {
    background-color: ${cores.verde5};
    padding: 10px 15px;
    border-radius: 4px
}

.galeria .box-header[data-v-fc5d7ba0] {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    min-height: 30px
}

.galeria .box-header h6[data-v-fc5d7ba0] {
    font-size: 12px;
    font-weight: 700;
    margin: 0
}

.galeria .box[data-v-fc5d7ba0] {
    position: relative;
    margin-top: 10px
}

.galeria .row .col-3[data-v-fc5d7ba0] {
    -ms-flex: 0 0 20%!important;
    -webkit-box-flex: 0!important;
    flex: 0 0 20%!important;
    max-width: 20%!important
}

.galeria .box .imagem[data-v-fc5d7ba0] {
    display: block;
    width: 100%;
    height: 70px;
    border-radius: 4px;
    background-color: ${cores.preto2};
    border: 1px solid ${cores.azul2}
}

.galeria .box .imagem a[data-v-fc5d7ba0] {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 0 2px 0 3px;
    color: ${cores.cinza1}!important;
    background: ${cores.azul2};
    border-radius: 2px
}

.galeria .box .imagem a[data-v-fc5d7ba0]:hover {
    text-decoration: none;
    background: ${cores.preto3}
}

.galeria .box .imagem a i[data-v-fc5d7ba0] {
    font-size: 20px;
    padding: 0;
    margin: 0;
    line-height: 0;
    position: relative;
    top: 5px
}

.galeria .box.loader .imagem[data-v-fc5d7ba0] {
    background-color: ${cores.preto2};
    border: 1px solid ${cores.azul2}
}

.progress[data-v-fc5d7ba0] {
    z-index: 999;
    position: absolute;
    bottom: 5px;
    left: 5px;
    width: calc(100% - 11px);
    height: 3px;
    margin-bottom: 0;
    overflow: hidden;
    background-color: #efefef;
    border-radius: 0;
    -webkit-box-shadow: none;
    box-shadow: none
}

.progress .progress-bar[data-v-fc5d7ba0] {
    background-color: #ff9500;
    -webkit-box-shadow: none;
    box-shadow: none
}

.progress .progress-bar.success[data-v-fc5d7ba0] {
    background-color: #4cd965
}

.progress .progress-bar.error[data-v-fc5d7ba0] {
    background-color: #ff3b2f
}

.danger[data-v-35d37dfa] {
    font-size: 12px;
    color: red
}

.body-scroll[data-v-35d37dfa] {
    max-height: calc(75vh - 55px);
    overflow-x: hidden
}

.border-danger[data-v-35d37dfa] {
    border-color: red!important
}

.border-danger[data-v-35d37dfa]:focus {
    -webkit-box-shadow: 0 0 0 .2rem rgba(244,67,54,.25);
    box-shadow: 0 0 0 .2rem rgba(244,67,54,.25)
}

.modal-body .form-group p[data-v-717e324c] {
    margin: 7px 0
}

textarea[data-v-717e324c] {
    min-height: 120px
}

.border-danger[data-v-717e324c] {
    border-color: red!important
}

.border-danger[data-v-717e324c]:focus {
    -webkit-box-shadow: 0 0 0 .2rem rgba(244,67,54,.25);
    box-shadow: 0 0 0 .2rem rgba(244,67,54,.25)
}

.divisor[data-v-717e324c] {
    width: 100%;
    height: 1px;
    background: ${cores.preto3};
    margin: 15px 0 25px 0
}

.modal-body .list-group .list-group-item[data-v-717e324c] {
    min-height: auto!important;
    padding: 8px 10px!important
}

.modal-body .list-group .list-group-item p[data-v-717e324c] {
    margin: 2px 5px 10px 5px
}

.modal-body .item-nenhum-registro[data-v-717e324c] {
    font-size: 12px;
    color: ${cores.preto4};
    padding: 0
}

.padding-right-zero[data-v-f6262170] {
    padding-right: 0!important
}

.table tr th[data-v-f6262170] {
    padding-top: 15px
}

.table tr[data-v-f6262170]:first-child {
    border-top: none!important
}

.table tr td p[data-v-f6262170] {
    margin-bottom: 0
}

.table ul[data-v-f6262170] {
    margin: 0;
    padding: 0;
    display: block
}

.table ul li[data-v-f6262170] {
    display: block;
    width: 27px;
    height: 27px;
    border-radius: 2px;
    margin: 1px 1px 0 0;
    float: left;
    background-color: ${cores.azul2}
}

.mao-de-obra[data-v-f6262170] {
    list-style: none;
    margin-top: 4px
}

.mao-de-obra li[data-v-f6262170] {
    display: inline-block;
    background-color: ${cores.preto3};
    color: ${cores.cinza3};
    font-size: 11px;
    margin: 2px;
    padding: 0 6px;
    border-radius: 2px
}

.sub-titulo-etapa[data-v-f6262170] {
    margin: 0 0 4px 0!important;
    padding: 0!important;
    font-size: 11px;
    color: ${cores.roxo2};
    display: block
}

.observacao[data-v-f6262170] {
    display: block;
    padding: 0;
    margin: 4px 0 4px 30px;
    font-size: 11px;
    font-style: italic;
    color: ${cores.roxo2}
}

.horario[data-v-f6262170] {
    font-size: 11px;
    margin-top: 4px;
    color: ${cores.roxo3};
    display: block
}

.float-left[data-v-fcee0a94] {
    position: absolute;
    left: 15px
}

.danger[data-v-fcee0a94] {
    font-size: 12px;
    color: red
}

.dropdown[data-v-fcee0a94] {
    margin-bottom: 10px
}

.dropdown .btn[data-v-fcee0a94] {
    text-align: left
}

.dropdown .form-control[data-v-fcee0a94] {
    height: auto!important;
    min-height: 34px!important;
    padding: 5px 25px 4px 12px!important;
    cursor: pointer
}

.dropdown .form-control .place[data-v-fcee0a94] {
    color: ${cores.preto5};
    padding: 2px 0;
    display: inline-block;
    font-size: 12px
}

.dropdown .badge[data-v-fcee0a94] {
    margin: 2px;
    padding: 4px 7px;
    background: ${cores.preto3};
    font-size: 11px;
    color: ${cores.azul1};
    border-radius: 4px;
    font-weight: 500
}

.dropdown .dropdown-menu[data-v-fcee0a94] {
    width: 100%;
    max-height: 300px;
    overflow-x: hidden;
    overflow-y: auto
}

.dropdown .dropdown-menu .busca[data-v-fcee0a94] {
    padding: 0 15px;
    margin: 10px 0
}

.dropdown .dropdown-menu .dropdown-item[data-v-fcee0a94] {
    padding: 0 10px 0 15px!important
}

.dropdown .dropdown-menu label[data-v-fcee0a94] {
    margin-bottom: 0;
    padding: 6px 2px;
    width: 100%
}

.dropdown .dropdown-menu .checkbox label[data-v-fcee0a94]:before {
    top: 7px
}

.form-group[data-v-fcee0a94] {
    position: relative
}

.form-group a[data-v-fcee0a94] {
    position: absolute;
    top: 29px;
    right: 5px;
    padding: 0 2px 0 3px;
    color: ${cores.cinza1}!important;
    background: ${cores.azul2};
    border-radius: 2px
}

.form-group a[data-v-fcee0a94]:hover {
    text-decoration: none;
    background: ${cores.preto3}
}

.form-group a i[data-v-fcee0a94] {
    font-size: 20px;
    padding: 0;
    margin: 0;
    line-height: 0;
    position: relative;
    top: 5px
}

.table tr th[data-v-4286477c] {
    padding-top: 15px
}

.table tr[data-v-4286477c]:first-child {
    border-top: none!important
}

.table tr td p[data-v-4286477c] {
    margin: 0;
    padding: 0
}

.table tr td span[data-v-4286477c] {
    display: inline-block;
    background: ${cores.preto3};
    margin: 5px 5px 2px 0;
    padding: 0 6px;
    font-size: 11px;
    color: ${cores.cinza3};
    border-radius: 2px
}

.table tr th[data-v-40b74f3d] {
    padding-top: 15px
}

.table tr[data-v-40b74f3d]:first-child {
    border-top: none!important
}

.table tr td p[data-v-40b74f3d] {
    margin: 0
}

.table .sub-item[data-v-40b74f3d] {
    font-size: 11px;
    color: ${cores.preto4};
    margin: 2px 0
}

.table tr th[data-v-5dc4bff8] {
    padding-top: 15px
}

.table tr[data-v-5dc4bff8]:first-child {
    border-top: none!important
}

.table tr td p[data-v-5dc4bff8] {
    margin: 0;
    padding: 0
}

.table tr td p b[data-v-5dc4bff8] {
    color: ${cores.verde4}
}

.table tr td p.data-hora[data-v-5dc4bff8] {
    text-align: right;
    font-size: 11px;
    color: ${cores.roxo3}
}

.table tr td span[data-v-5dc4bff8] {
    display: inline-block;
    background: ${cores.preto3};
    margin: 5px 5px 2px 0;
    padding: 1px 6px;
    font-size: 10px;
    color: ${cores.azul1};
    border-radius: 9px
}

.modal-content .imagem[data-v-6ead81a7] {
    background: ${cores.azul1};
    text-align: center;
    border-radius: 3px;
    margin-bottom: 15px;
    min-height: 250px
}

.modal-content .imagem img[data-v-6ead81a7] {
    max-height: 60vh;
    max-width: 100%;
    border-radius: 3px;
    position: relative;
    z-index: 999
}

.row[data-v-c0ee0298] {
    margin-right: -5px;
    margin-left: -5px
}

.row .col[data-v-c0ee0298] {
    padding-right: 5px;
    padding-left: 5px
}

.btn-primary[data-v-c0ee0298] {
    margin: 0
}

.salvando[data-v-c0ee0298] {
    font-size: 12px;
    display: inline-block;
    margin-right: 0;
    padding: 8px 0 7px 0;
    color: ${cores.preto4};
    font-style: italic
}

.galeria[data-v-c0ee0298] {
    padding: 10px 15px
}

.galeria .row .col[data-v-c0ee0298] {
    padding-right: 0;
    padding-left: 0
}

.galeria .box[data-v-c0ee0298] {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    padding: 5px 5px
}

.galeria .box[data-v-c0ee0298]:hover {
    background: ${cores.azul2};
    border-radius: 4px
}

.galeria .box-loader[data-v-c0ee0298]:hover {
    background: none
}

.galeria .box .imagem[data-v-c0ee0298] {
    width: 120px;
    height: 80px;
    display: block;
    position: relative;
    border-radius: 4px;
    border: 1px solid ${cores.azul2};
    background-size: cover;
    background-color: ${cores.azul2};
    background-position: 50%
}

.galeria .box .descricao[data-v-c0ee0298] {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    margin-left: 5px
}

.galeria .box .descricao .form-group[data-v-c0ee0298] {
    margin: 0!important
}

.galeria .box .descricao .form-control[data-v-c0ee0298] {
    height: 80px!important;
    min-height: 80px!important
}

.galeria .box .descricao .form-control.fake[data-v-c0ee0298] {
    overflow: hidden;
    padding: 3px 10px;
    cursor: pointer;
    width: 100%
}

.galeria .box .descricao .form-control.fake .place[data-v-c0ee0298] {
    color: #979797
}

.galeria .box .acao[data-v-c0ee0298] {
    width: 40px;
    height: 24px;
    padding: 0;
    position: absolute;
    top: 13px;
    left: 77px;
    z-index: 9
}

.galeria .box .acao a[data-v-c0ee0298] {
    padding: 3px 2px 3px 2px!important
}

.galeria .box .acao a i[data-v-c0ee0298] {
    font-size: 20px;
    padding: 0;
    margin: 0;
    line-height: 18px
}

.progress[data-v-c0ee0298] {
    z-index: 999;
    position: absolute;
    bottom: 5px;
    left: 5px;
    width: calc(100% - 10px);
    height: 4px;
    margin-bottom: 0;
    overflow: hidden;
    background-color: #efefef;
    border-radius: 0;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-radius: 5px
}

.progress .progress-bar[data-v-c0ee0298] {
    background-color: #ff9500;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-radius: 5px
}

.progress .progress-bar.success[data-v-c0ee0298] {
    background-color: #4cd965
}

.progress .progress-bar.error[data-v-c0ee0298] {
    background-color: #ff3b2f
}

.modal .close[data-v-c0ee0298] {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    z-index: 999;
    opacity: 1;
    padding: 10px 15px;
    color: ${cores.preto2};
    border-radius: 3px
}

.modal .close[data-v-c0ee0298]:hover {
    opacity: 1!important;
    color: ${cores.preto2}!important
}

.modal-dialog[data-v-c0ee0298] {
    max-width: 700px
}

.modal-content .imagem[data-v-c0ee0298] {
    min-height: 250px;
    width: 100%;
    position: relative;
    display: block;
    margin: 0!important;
    overflow: hidden
}

.modal-content .imagem img[data-v-c0ee0298] {
    position: relative;
    z-index: 999;
    border-radius: 0;
    display: block;
    margin: 0!important;
    width: 100%!important;
    border-radius: 3px
}

.modal-content p[data-v-c0ee0298] {
    font-size: 12px
}

.btn-primary[data-v-4dc9c93b] {
    margin: 0
}

.card-body[data-v-4dc9c93b] {
    padding-top: 8px!important;
    padding-bottom: 0!important
}

.salvando[data-v-4dc9c93b] {
    font-size: 12px;
    display: inline-block;
    margin-right: 0;
    padding: 8px 0 7px 0;
    color: ${cores.preto4};
    font-style: italic
}

.tipo-video[data-v-4dc9c93b] {
    font-size: 12px;
    margin-right: 15px;
    color: ${cores.preto4};
    text-transform: uppercase
}

.tipo-limite[data-v-4dc9c93b] {
    font-size: 12px;
    display: inline-block;
    padding-top: 8px;
    color: ${cores.preto4};
    text-transform: uppercase
}

.tipo-badge[data-v-4dc9c93b] {
    font-size: 11px;
    margin-right: 15px;
    color: ${cores.preto2};
    background-color: #dc3545;
    padding: 2px 6px;
    border-radius: 4px
}

.modal .modal-dialog[data-v-4dc9c93b] {
    max-width: 800px
}

.modal .video video[data-v-4dc9c93b] {
    width: 100%!important;
    height: auto!important;
    max-height: 480px!important;
    border: 1px solid ${cores.preto3};
    border-radius: 3px;
    background: ${cores.verde2}
}

.modal .video video[data-v-4dc9c93b]:focus {
    outline: none
}

.modal .right[data-v-4dc9c93b] {
    text-align: right
}

.btn-primary[data-v-7d9aa726] {
    margin: 0
}

.salvando[data-v-7d9aa726] {
    font-size: 12px;
    display: inline-block;
    margin-right: 0;
    padding: 8px 0 7px 0;
    color: ${cores.preto4};
    font-style: italic
}

.table tr th[data-v-7d9aa726] {
    padding-top: 15px
}

.table tr[data-v-7d9aa726]:first-child {
    border-top: none!important
}

.table tr td.acao[data-v-7d9aa726] {
    width: 110px
}

.progress[data-v-7d9aa726] {
    width: 100%;
    height: 5px;
    margin: 6px 0 0 0;
    overflow: hidden;
    background-color: #efefef;
    border-radius: 0;
    -webkit-box-shadow: none;
    box-shadow: none
}

.progress .progress-bar[data-v-7d9aa726] {
    background-color: #ff9500;
    -webkit-box-shadow: none;
    box-shadow: none
}

.progress .progress-bar.success[data-v-7d9aa726] {
    background-color: #4cd965
}

.progress .progress-bar.error[data-v-7d9aa726] {
    background-color: #ff3b2f
}

.card-body[data-v-2d842f37] {
    padding: 10px 15px 5px 15px
}

.card-body .badge[data-v-2d842f37] {
    margin-bottom: 15px
}

.radio[data-v-2d842f37] {
    padding-left: 5px
}

.assinaturas .assinatura[data-v-2d842f37] {
    text-align: center;
    margin: 40px 20px 0 20px
}

.assinaturas .assinatura .imagem[data-v-2d842f37] {
    border-bottom: 1px solid ${cores.verde1};
    height: 56px;
    width: 100%;
    padding-bottom: 1px
}

.assinaturas .assinatura .imagem img[data-v-2d842f37] {
    height: 55px;
    max-width: 100%
}

.assinaturas .assinatura p[data-v-2d842f37] {
    font-size: 11px;
    margin-top: 6px;
    color: ${cores.preto4}
}

.header-descricao[data-v-1591f201] {
    font-size: 12px;
    color: ${cores.preto4};
    padding: 7px 0
}

.radio[data-v-1591f201] {
    padding-left: 5px
}

.alert.alert-dark[data-v-1591f201] {
    padding: 12px 15px;
    color: #393939;
    background-color: #f7f7f7;
    border-color: ${cores.preto3}
}

.container[data-v-f128698a] {
    padding: 15px 15px 40px 15px;
    position: relative
}

.container-placeholder[data-v-f128698a] {
    padding: 15px 15px
}

.container .menu-right[data-v-f128698a] {
    position: absolute;
    left: calc(50% + 555px);
    top: 80px;
    z-index: 99;
    width: 155px
}

.container .menu-right.fixed[data-v-f128698a] {
    position: fixed;
    top: 70px
}

.header .button[data-v-f128698a] {
    position: absolute;
    right: 0
}

.header.fixed .button[data-v-f128698a] {
    display: block;
    position: relative
}

.btn.disabled[data-v-f128698a],.btn[data-v-f128698a]:disabled {
    opacity: .65!important
}

.salvando[data-v-f128698a] {
    font-size: 12px;
    margin-right: 15px;
    color: ${cores.preto4};
    font-style: italic
}

.alerta[data-v-f128698a] {
    position: absolute;
    right: 10px;
    top: -16px
}

.alerta .btn[data-v-f128698a] {
    padding-left: 40px;
    position: relative
}

.alerta img[data-v-f128698a] {
    width: 22px;
    position: absolute;
    top: 4px;
    left: 10px
}

.fixed .alerta[data-v-f128698a] {
    right: 110px!important;
    top: 0!important
}

.alert[data-v-f128698a] {
    margin: 0;
    background-color: #f44336;
    color: ${cores.preto2};
    border: none;
    display: inline;
    font-size: 15px;
    position: fixed;
    bottom: 15px;
    right: 15px;
    z-index: 99
}

.alert span[data-v-f128698a] {
    margin-right: 12px;
    font-size: 22px
}

.alert .btn[data-v-f128698a] {
    margin-left: 20px;
    border: none
}

.modal-body .nome[data-v-f128698a] {
    display: block
}

.modal-body p[data-v-f128698a] {
    font-size: 12px;
    margin: 10px 0 0 0;
    color: ${cores.preto4};
    line-height: 1.2em;
    font-style: italic
}

@media (max-width: 1450px) {
    .container .menu-right[data-v-f128698a] {
        left:calc(50% + 540px);
        width: 140px
    }
}

@media (max-width: 1400px) {
    .container .menu-right[data-v-f128698a] {
        display:none
    }
}

.v-toaster {
    position: fixed;
    top: 50px;
    right: 0;
    z-index: 10000;
    width: 300px;
    padding-left: 10px;
    padding-right: 10px
}

.v-toaster .v-toast {
    margin-bottom: 10px;
    -webkit-transition: all .3s ease;
    transition: all .3s ease;
    border: 1px solid #454d5d;
    border-radius: 8px;
    color: ${cores.preto2};
    display: block;
    padding: 1rem;
    background: rgba(69,77,93,.9);
    border-color: #454d5d
}

.v-toaster .v-toast.v-toast-enter,.v-toaster .v-toast.v-toast-leave-to {
    -webkit-transform: translate(100%);
    transform: translate(100%)
}

.v-toaster .v-toast.v-toast-success {
    background: rgba(50,182,67,.9);
    border-color: #32b643
}

.v-toaster .v-toast.v-toast-warning {
    background: rgba(255,183,0,.9);
    border-color: #ffb700
}

.v-toaster .v-toast.v-toast-info {
    background: rgba(91,192,222,.9);
    border-color: #5bc0de
}

.v-toaster .v-toast.v-toast-error {
    background: rgba(232,86,0,.9);
    border-color: #e85600
}

.v-toaster .v-toast.v-toast-primary {
    background: rgba(66,139,202,.9);
    border-color: #428bca
}

.v-toaster .v-toast .v-toast-btn-clear {
    background: transparent;
    border: 0;
    color: currentColor;
    opacity: .45;
    text-decoration: none;
    float: right;
    cursor: pointer
}

.v-toaster .v-toast .v-toast-btn-clear:hover {
    opacity: .85
}

.v-toaster .v-toast .v-toast-btn-clear:before {
    content: "2715"
}

@media (max-width: 300px) {
    .v-toaster {
        width:100%
    }
}

body.swal2-shown {
    overflow-y: hidden
}

.swal2-container,body.swal2-iosfix {
    position: fixed;
    left: 0;
    right: 0
}

.swal2-container {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    top: 0;
    bottom: 0;
    padding: 10px;
    background-color: transparent;
    z-index: 1060
}

.swal2-container.swal2-fade {
    -webkit-transition: background-color .1s;
    transition: background-color .1s
}

.swal2-container.swal2-shown {
    background-color: rgba(0,0,0,.4)
}

.swal2-modal {
    background-color: ${cores.preto2};
    font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
    border-radius: 5px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-align: center;
    margin: auto;
    overflow-x: hidden;
    overflow-y: auto;
    display: none;
    position: relative;
    max-width: 100%
}

.swal2-modal:focus {
    outline: 0
}

.swal2-modal.swal2-loading {
    overflow-y: hidden
}

.swal2-modal .swal2-title {
    color: #595959;
    font-size: 30px;
    text-align: center;
    font-weight: 600;
    text-transform: none;
    position: relative;
    margin: 0 0 .4em;
    padding: 0;
    display: block;
    word-wrap: break-word
}

.swal2-modal .swal2-buttonswrapper {
    margin-top: 15px
}

.swal2-modal .swal2-buttonswrapper:not(.swal2-loading) .swal2-styled[disabled] {
    opacity: .4;
    cursor: no-drop
}

.swal2-modal .swal2-buttonswrapper.swal2-loading .swal2-styled.swal2-confirm {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border: 4px solid transparent;
    border-color: transparent;
    width: 40px;
    height: 40px;
    padding: 0;
    margin: 7.5px;
    vertical-align: top;
    background-color: transparent!important;
    color: transparent;
    cursor: default;
    border-radius: 100%;
    -webkit-animation: rotate-loading 1.5s linear 0s infinite normal;
    animation: rotate-loading 1.5s linear 0s infinite normal;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none
}

.swal2-modal .swal2-buttonswrapper.swal2-loading .swal2-styled.swal2-cancel {
    margin-left: 30px;
    margin-right: 30px
}

.swal2-modal .swal2-buttonswrapper.swal2-loading :not(.swal2-styled).swal2-confirm:after {
    display: inline-block;
    content: "";
    margin-left: 5px 0 15px;
    vertical-align: -1px;
    height: 15px;
    width: 15px;
    border: 3px solid ${cores.roxo3};
    -webkit-box-shadow: 1px 1px 1px ${cores.preto2};
    box-shadow: 1px 1px 1px ${cores.preto2};
    border-right-color: transparent;
    border-radius: 50%;
    -webkit-animation: rotate-loading 1.5s linear 0s infinite normal;
    animation: rotate-loading 1.5s linear 0s infinite normal
}

.swal2-modal .swal2-styled {
    border: 0;
    border-radius: 3px;
    -webkit-box-shadow: none;
    box-shadow: none;
    color: ${cores.preto2};
    cursor: pointer;
    font-size: 17px;
    font-weight: 500;
    margin: 15px 5px 0;
    padding: 10px 32px
}

.swal2-modal .swal2-image {
    margin: 20px auto;
    max-width: 100%
}

.swal2-modal .swal2-close {
    background: 0 0;
    border: 0;
    margin: 0;
    padding: 0;
    width: 38px;
    height: 40px;
    font-size: 36px;
    line-height: 40px;
    font-family: serif;
    position: absolute;
    top: 5px;
    right: 8px;
    cursor: pointer;
    color: ${cores.verde1};
    -webkit-transition: color .1s ease;
    transition: color .1s ease
}

.swal2-modal .swal2-close:hover {
    color: #d55
}

.swal2-modal>.swal2-checkbox,.swal2-modal>.swal2-file,.swal2-modal>.swal2-input,.swal2-modal>.swal2-radio,.swal2-modal>.swal2-select,.swal2-modal>.swal2-textarea {
    display: none
}

.swal2-modal .swal2-content {
    font-size: 18px;
    text-align: center;
    font-weight: 300;
    position: relative;
    float: none;
    margin: 0;
    padding: 0;
    line-height: normal;
    color: #545454;
    word-wrap: break-word
}

.swal2-modal .swal2-checkbox,.swal2-modal .swal2-file,.swal2-modal .swal2-input,.swal2-modal .swal2-radio,.swal2-modal .swal2-select,.swal2-modal .swal2-textarea {
    margin: 20px auto
}

.swal2-modal .swal2-file,.swal2-modal .swal2-input,.swal2-modal .swal2-textarea {
    width: 100%;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    font-size: 18px;
    border-radius: 3px;
    border: 1px solid #d9d9d9;
    -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.06);
    box-shadow: inset 0 1px 1px rgba(0,0,0,.06);
    -webkit-transition: border-color box-shadow .3s;
    transition: border-color box-shadow .3s
}

.swal2-modal .swal2-file.swal2-inputerror,.swal2-modal .swal2-input.swal2-inputerror,.swal2-modal .swal2-textarea.swal2-inputerror {
    border-color: #f27474!important;
    -webkit-box-shadow: 0 0 2px #f27474!important;
    box-shadow: 0 0 2px #f27474!important
}

.swal2-modal .swal2-file:focus,.swal2-modal .swal2-input:focus,.swal2-modal .swal2-textarea:focus {
    outline: 0;
    border: 1px solid #b4dbed;
    -webkit-box-shadow: 0 0 3px #c4e6f5;
    box-shadow: 0 0 3px #c4e6f5
}

.swal2-modal .swal2-file:focus::-webkit-input-placeholder,.swal2-modal .swal2-input:focus::-webkit-input-placeholder,.swal2-modal .swal2-textarea:focus::-webkit-input-placeholder {
    -webkit-transition: opacity .3s ease .03s;
    transition: opacity .3s ease .03s;
    opacity: .8
}

.swal2-modal .swal2-file:focus::-moz-placeholder,.swal2-modal .swal2-input:focus::-moz-placeholder,.swal2-modal .swal2-textarea:focus::-moz-placeholder {
    -webkit-transition: opacity .3s ease .03s;
    -moz-transition: opacity .3s ease .03s;
    transition: opacity .3s ease .03s;
    opacity: .8
}

.swal2-modal .swal2-file:focus:-ms-input-placeholder,.swal2-modal .swal2-input:focus:-ms-input-placeholder,.swal2-modal .swal2-textarea:focus:-ms-input-placeholder {
    -webkit-transition: opacity .3s ease .03s;
    -ms-transition: opacity .3s ease .03s;
    transition: opacity .3s ease .03s;
    opacity: .8
}

.swal2-modal .swal2-file:focus::-ms-input-placeholder,.swal2-modal .swal2-input:focus::-ms-input-placeholder,.swal2-modal .swal2-textarea:focus::-ms-input-placeholder {
    -webkit-transition: opacity .3s ease .03s;
    -ms-transition: opacity .3s ease .03s;
    transition: opacity .3s ease .03s;
    opacity: .8
}

.swal2-modal .swal2-file:focus::placeholder,.swal2-modal .swal2-input:focus::placeholder,.swal2-modal .swal2-textarea:focus::placeholder {
    -webkit-transition: opacity .3s ease .03s;
    transition: opacity .3s ease .03s;
    opacity: .8
}

.swal2-modal .swal2-file::-webkit-input-placeholder,.swal2-modal .swal2-input::-webkit-input-placeholder,.swal2-modal .swal2-textarea::-webkit-input-placeholder {
    color: #e6e6e6
}

.swal2-modal .swal2-file::-moz-placeholder,.swal2-modal .swal2-input::-moz-placeholder,.swal2-modal .swal2-textarea::-moz-placeholder {
    color: #e6e6e6
}

.swal2-modal .swal2-file:-ms-input-placeholder,.swal2-modal .swal2-input:-ms-input-placeholder,.swal2-modal .swal2-textarea:-ms-input-placeholder {
    color: #e6e6e6
}

.swal2-modal .swal2-file::-ms-input-placeholder,.swal2-modal .swal2-input::-ms-input-placeholder,.swal2-modal .swal2-textarea::-ms-input-placeholder {
    color: #e6e6e6
}

.swal2-modal .swal2-file::placeholder,.swal2-modal .swal2-input::placeholder,.swal2-modal .swal2-textarea::placeholder {
    color: #e6e6e6
}

.swal2-modal .swal2-range input {
    float: left;
    width: 80%
}

.swal2-modal .swal2-range output {
    float: right;
    width: 20%;
    font-size: 20px;
    font-weight: 600;
    text-align: center
}

.swal2-modal .swal2-range input,.swal2-modal .swal2-range output {
    height: 43px;
    line-height: 43px;
    vertical-align: middle;
    margin: 20px auto;
    padding: 0
}

.swal2-modal .swal2-input {
    height: 43px;
    padding: 0 12px
}

.swal2-modal .swal2-input[type=number] {
    max-width: 150px
}

.swal2-modal .swal2-file {
    font-size: 20px
}

.swal2-modal .swal2-textarea {
    height: 108px;
    padding: 12px
}

.swal2-modal .swal2-select {
    color: #545454;
    font-size: inherit;
    padding: 5px 10px;
    min-width: 40%;
    max-width: 100%
}

.swal2-modal .swal2-radio {
    border: 0
}

.swal2-modal .swal2-radio label:not(:first-child) {
    margin-left: 20px
}

.swal2-modal .swal2-radio input,.swal2-modal .swal2-radio span {
    vertical-align: middle
}

.swal2-modal .swal2-radio input {
    margin: 0 3px 0 0
}

.swal2-modal .swal2-checkbox {
    color: #545454
}

.swal2-modal .swal2-checkbox input,.swal2-modal .swal2-checkbox span {
    vertical-align: middle
}

.swal2-modal .swal2-validationerror {
    background-color: #f0f0f0;
    margin: 0 -20px;
    overflow: hidden;
    padding: 10px;
    color: gray;
    font-size: 16px;
    font-weight: 300;
    display: none
}

.swal2-modal .swal2-validationerror:before {
    content: "!";
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #ea7d7d;
    color: ${cores.preto2};
    line-height: 24px;
    text-align: center;
    margin-right: 10px
}

@supports (-ms-accelerator:true) {
    .swal2-range input {
        width: 100%!important
    }

    .swal2-range output {
        display: none
    }
}

@media (-ms-high-contrast:active),(-ms-high-contrast:none) {
    .swal2-range input {
        width: 100%!important
    }

    .swal2-range output {
        display: none
    }
}

.swal2-icon {
    width: 80px;
    height: 80px;
    border: 4px solid transparent;
    border-radius: 50%;
    margin: 20px auto 30px;
    padding: 0;
    position: relative;
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    cursor: default;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none
}

.swal2-icon.swal2-error {
    border-color: #f27474
}

.swal2-icon.swal2-error .swal2-x-mark {
    position: relative;
    display: block
}

.swal2-icon.swal2-error [class^=swal2-x-mark-line] {
    position: absolute;
    height: 5px;
    width: 47px;
    background-color: #f27474;
    display: block;
    top: 37px;
    border-radius: 2px
}

.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=left] {
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    left: 17px
}

.swal2-icon.swal2-error [class^=swal2-x-mark-line][class$=right] {
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    right: 16px
}

.swal2-icon.swal2-warning {
    font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
    color: #f8bb86;
    border-color: #facea8
}

.swal2-icon.swal2-info,.swal2-icon.swal2-warning {
    font-size: 60px;
    line-height: 80px;
    text-align: center
}

.swal2-icon.swal2-info {
    font-family: Open Sans,sans-serif;
    color: #3fc3ee;
    border-color: #9de0f6
}

.swal2-icon.swal2-question {
    font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
    color: #87adbd;
    border-color: #c9dae1;
    font-size: 60px;
    line-height: 80px;
    text-align: center
}

.swal2-icon.swal2-success {
    border-color: #a5dc86
}

.swal2-icon.swal2-success [class^=swal2-success-circular-line] {
    border-radius: 50%;
    position: absolute;
    width: 60px;
    height: 120px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg)
}

.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=left] {
    border-radius: 120px 0 0 120px;
    top: -7px;
    left: -33px;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    -webkit-transform-origin: 60px 60px;
    transform-origin: 60px 60px
}

.swal2-icon.swal2-success [class^=swal2-success-circular-line][class$=right] {
    border-radius: 0 120px 120px 0;
    top: -11px;
    left: 30px;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    -webkit-transform-origin: 0 60px;
    transform-origin: 0 60px
}

.swal2-icon.swal2-success .swal2-success-ring {
    width: 80px;
    height: 80px;
    border: 4px solid hsla(98,55%,69%,.2);
    border-radius: 50%;
    -webkit-box-sizing: content-box;
    box-sizing: content-box;
    position: absolute;
    left: -4px;
    top: -4px;
    z-index: 2
}

.swal2-icon.swal2-success .swal2-success-fix {
    width: 7px;
    height: 90px;
    position: absolute;
    left: 28px;
    top: 8px;
    z-index: 1;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg)
}

.swal2-icon.swal2-success [class^=swal2-success-line] {
    height: 5px;
    background-color: #a5dc86;
    display: block;
    border-radius: 2px;
    position: absolute;
    z-index: 2
}

.swal2-icon.swal2-success [class^=swal2-success-line][class$=tip] {
    width: 25px;
    left: 14px;
    top: 46px;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg)
}

.swal2-icon.swal2-success [class^=swal2-success-line][class$=long] {
    width: 47px;
    right: 8px;
    top: 38px;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg)
}

.swal2-progresssteps {
    font-weight: 600;
    margin: 0 0 20px;
    padding: 0
}

.swal2-progresssteps li {
    display: inline-block;
    position: relative
}

.swal2-progresssteps .swal2-progresscircle {
    background: #3085d6;
    border-radius: 2em;
    color: ${cores.preto2};
    height: 2em;
    line-height: 2em;
    text-align: center;
    width: 2em;
    z-index: 20
}

.swal2-progresssteps .swal2-progresscircle:first-child {
    margin-left: 0
}

.swal2-progresssteps .swal2-progresscircle:last-child {
    margin-right: 0
}

.swal2-progresssteps .swal2-progresscircle.swal2-activeprogressstep {
    background: #3085d6
}

.swal2-progresssteps .swal2-progresscircle.swal2-activeprogressstep~.swal2-progresscircle,.swal2-progresssteps .swal2-progresscircle.swal2-activeprogressstep~.swal2-progressline {
    background: #add8e6
}

.swal2-progresssteps .swal2-progressline {
    background: #3085d6;
    height: .4em;
    margin: 0 -1px;
    z-index: 10
}

[class^=swal2] {
    -webkit-tap-highlight-color: transparent
}

@-webkit-keyframes showSweetAlert {
    0% {
        -webkit-transform: scale(.7);
        transform: scale(.7)
    }

    45% {
        -webkit-transform: scale(1.05);
        transform: scale(1.05)
    }

    80% {
        -webkit-transform: scale(.95);
        transform: scale(.95)
    }

    to {
        -webkit-transform: scale(1);
        transform: scale(1)
    }
}

@keyframes showSweetAlert {
    0% {
        -webkit-transform: scale(.7);
        transform: scale(.7)
    }

    45% {
        -webkit-transform: scale(1.05);
        transform: scale(1.05)
    }

    80% {
        -webkit-transform: scale(.95);
        transform: scale(.95)
    }

    to {
        -webkit-transform: scale(1);
        transform: scale(1)
    }
}

@-webkit-keyframes hideSweetAlert {
    0% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 1
    }

    to {
        -webkit-transform: scale(.5);
        transform: scale(.5);
        opacity: 0
    }
}

@keyframes hideSweetAlert {
    0% {
        -webkit-transform: scale(1);
        transform: scale(1);
        opacity: 1
    }

    to {
        -webkit-transform: scale(.5);
        transform: scale(.5);
        opacity: 0
    }
}

.swal2-show {
    -webkit-animation: showSweetAlert .3s;
    animation: showSweetAlert .3s
}

.swal2-show.swal2-noanimation {
    -webkit-animation: none;
    animation: none
}

.swal2-hide {
    -webkit-animation: hideSweetAlert .15s forwards;
    animation: hideSweetAlert .15s forwards
}

.swal2-hide.swal2-noanimation {
    -webkit-animation: none;
    animation: none
}

@-webkit-keyframes animate-success-tip {
    0% {
        width: 0;
        left: 1px;
        top: 19px
    }

    54% {
        width: 0;
        left: 1px;
        top: 19px
    }

    70% {
        width: 50px;
        left: -8px;
        top: 37px
    }

    84% {
        width: 17px;
        left: 21px;
        top: 48px
    }

    to {
        width: 25px;
        left: 14px;
        top: 45px
    }
}

@keyframes animate-success-tip {
    0% {
        width: 0;
        left: 1px;
        top: 19px
    }

    54% {
        width: 0;
        left: 1px;
        top: 19px
    }

    70% {
        width: 50px;
        left: -8px;
        top: 37px
    }

    84% {
        width: 17px;
        left: 21px;
        top: 48px
    }

    to {
        width: 25px;
        left: 14px;
        top: 45px
    }
}

@-webkit-keyframes animate-success-long {
    0% {
        width: 0;
        right: 46px;
        top: 54px
    }

    65% {
        width: 0;
        right: 46px;
        top: 54px
    }

    84% {
        width: 55px;
        right: 0;
        top: 35px
    }

    to {
        width: 47px;
        right: 8px;
        top: 38px
    }
}

@keyframes animate-success-long {
    0% {
        width: 0;
        right: 46px;
        top: 54px
    }

    65% {
        width: 0;
        right: 46px;
        top: 54px
    }

    84% {
        width: 55px;
        right: 0;
        top: 35px
    }

    to {
        width: 47px;
        right: 8px;
        top: 38px
    }
}

@-webkit-keyframes rotatePlaceholder {
    0% {
        -webkit-transform: rotate(-45deg);
        transform: rotate(-45deg)
    }

    5% {
        -webkit-transform: rotate(-45deg);
        transform: rotate(-45deg)
    }

    12% {
        -webkit-transform: rotate(-405deg);
        transform: rotate(-405deg)
    }

    to {
        -webkit-transform: rotate(-405deg);
        transform: rotate(-405deg)
    }
}

@keyframes rotatePlaceholder {
    0% {
        -webkit-transform: rotate(-45deg);
        transform: rotate(-45deg)
    }

    5% {
        -webkit-transform: rotate(-45deg);
        transform: rotate(-45deg)
    }

    12% {
        -webkit-transform: rotate(-405deg);
        transform: rotate(-405deg)
    }

    to {
        -webkit-transform: rotate(-405deg);
        transform: rotate(-405deg)
    }
}

.swal2-animate-success-line-tip {
    -webkit-animation: animate-success-tip .75s;
    animation: animate-success-tip .75s
}

.swal2-animate-success-line-long {
    -webkit-animation: animate-success-long .75s;
    animation: animate-success-long .75s
}

.swal2-success.swal2-animate-success-icon .swal2-success-circular-line-right {
    -webkit-animation: rotatePlaceholder 4.25s ease-in;
    animation: rotatePlaceholder 4.25s ease-in
}

@-webkit-keyframes animate-error-icon {
    0% {
        -webkit-transform: rotateX(100deg);
        transform: rotateX(100deg);
        opacity: 0
    }

    to {
        -webkit-transform: rotateX(0);
        transform: rotateX(0);
        opacity: 1
    }
}

@keyframes animate-error-icon {
    0% {
        -webkit-transform: rotateX(100deg);
        transform: rotateX(100deg);
        opacity: 0
    }

    to {
        -webkit-transform: rotateX(0);
        transform: rotateX(0);
        opacity: 1
    }
}

.swal2-animate-error-icon {
    -webkit-animation: animate-error-icon .5s;
    animation: animate-error-icon .5s
}

@-webkit-keyframes animate-x-mark {
    0% {
        -webkit-transform: scale(.4);
        transform: scale(.4);
        margin-top: 26px;
        opacity: 0
    }

    50% {
        -webkit-transform: scale(.4);
        transform: scale(.4);
        margin-top: 26px;
        opacity: 0
    }

    80% {
        -webkit-transform: scale(1.15);
        transform: scale(1.15);
        margin-top: -6px
    }

    to {
        -webkit-transform: scale(1);
        transform: scale(1);
        margin-top: 0;
        opacity: 1
    }
}

@keyframes animate-x-mark {
    0% {
        -webkit-transform: scale(.4);
        transform: scale(.4);
        margin-top: 26px;
        opacity: 0
    }

    50% {
        -webkit-transform: scale(.4);
        transform: scale(.4);
        margin-top: 26px;
        opacity: 0
    }

    80% {
        -webkit-transform: scale(1.15);
        transform: scale(1.15);
        margin-top: -6px
    }

    to {
        -webkit-transform: scale(1);
        transform: scale(1);
        margin-top: 0;
        opacity: 1
    }
}

.swal2-animate-x-mark {
    -webkit-animation: animate-x-mark .5s;
    animation: animate-x-mark .5s
}

@-webkit-keyframes rotate-loading {
    0% {
        -webkit-transform: rotate(0);
        transform: rotate(0)
    }

    to {
        -webkit-transform: rotate(1turn);
        transform: rotate(1turn)
    }
}

@keyframes rotate-loading {
    0% {
        -webkit-transform: rotate(0);
        transform: rotate(0)
    }

    to {
        -webkit-transform: rotate(1turn);
        transform: rotate(1turn)
    }
}

/*!
 * Datepicker for Bootstrap v1.9.0 (https://github.com/uxsolutions/bootstrap-datepicker)
 *
 * Licensed under the Apache License v2.0 (http://www.apache.org/licenses/LICENSE-2.0)
 */
.datepicker {
    padding: 4px;
    border-radius: 4px;
    direction: ltr
}

.datepicker-inline {
    width: 220px
}

.datepicker-rtl {
    direction: rtl
}

.datepicker-rtl.dropdown-menu {
    left: auto
}

.datepicker-rtl table tr td span {
    float: right
}

.datepicker-dropdown {
    top: 0;
    left: 0
}

.datepicker-dropdown:before {
    content: "";
    display: inline-block;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid ${cores.roxo3};
    border-top: 0;
    border-bottom-color: rgba(0,0,0,.2);
    position: absolute
}

.datepicker-dropdown:after {
    content: "";
    display: inline-block;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid ${cores.preto2};
    border-top: 0;
    position: absolute
}

.datepicker-dropdown.datepicker-orient-left:before {
    left: 6px
}

.datepicker-dropdown.datepicker-orient-left:after {
    left: 7px
}

.datepicker-dropdown.datepicker-orient-right:before {
    right: 6px
}

.datepicker-dropdown.datepicker-orient-right:after {
    right: 7px
}

.datepicker-dropdown.datepicker-orient-bottom:before {
    top: -7px
}

.datepicker-dropdown.datepicker-orient-bottom:after {
    top: -6px
}

.datepicker-dropdown.datepicker-orient-top:before {
    bottom: -7px;
    border-bottom: 0;
    border-top: 7px solid ${cores.roxo3}
}

.datepicker-dropdown.datepicker-orient-top:after {
    bottom: -6px;
    border-bottom: 0;
    border-top: 6px solid ${cores.preto2}
}

.datepicker table {
    margin: 0;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none
}

.datepicker td,.datepicker th {
    text-align: center;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: none
}

.table-striped .datepicker table tr td,.table-striped .datepicker table tr th {
    background-color: transparent
}

.datepicker table tr td.day.focused,.datepicker table tr td.day:hover {
    background: ${cores.azul2};
    cursor: pointer
}

.datepicker table tr td.new,.datepicker table tr td.old {
    color: ${cores.roxo3}
}

.datepicker table tr td.disabled,.datepicker table tr td.disabled:hover {
    background: 0 0;
    color: ${cores.roxo3};
    cursor: default
}

.datepicker table tr td.highlighted {
    background: #d9edf7;
    border-radius: 0
}

.datepicker table tr td.today,.datepicker table tr td.today.disabled,.datepicker table tr td.today.disabled:hover,.datepicker table tr td.today:hover {
    background-color: #fde19a;
    background-image: -webkit-gradient(linear,left top,left bottom,from(#fdd49a),to(#fdf59a));
    background-image: linear-gradient(180deg,#fdd49a,#fdf59a);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#fdd49a",endColorstr="#fdf59a",GradientType=0);
    border-color: #fdf59a #fdf59a #fbed50;
    border-color: rgba(0,0,0,.1) rgba(0,0,0,.1) rgba(0,0,0,.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: ${cores.azul5}
}

.datepicker table tr td.today.active,.datepicker table tr td.today.disabled,.datepicker table tr td.today.disabled.active,.datepicker table tr td.today.disabled.disabled,.datepicker table tr td.today.disabled:active,.datepicker table tr td.today.disabled:hover,.datepicker table tr td.today.disabled:hover.active,.datepicker table tr td.today.disabled:hover.disabled,.datepicker table tr td.today.disabled:hover:active,.datepicker table tr td.today.disabled:hover:hover,.datepicker table tr td.today.disabled:hover[disabled],.datepicker table tr td.today.disabled[disabled],.datepicker table tr td.today:active,.datepicker table tr td.today:hover,.datepicker table tr td.today:hover.active,.datepicker table tr td.today:hover.disabled,.datepicker table tr td.today:hover:active,.datepicker table tr td.today:hover:hover,.datepicker table tr td.today:hover[disabled],.datepicker table tr td.today[disabled] {
    background-color: #fdf59a
}

.datepicker table tr td.today.active,.datepicker table tr td.today.disabled.active,.datepicker table tr td.today.disabled:active,.datepicker table tr td.today.disabled:hover.active,.datepicker table tr td.today.disabled:hover:active,.datepicker table tr td.today:active,.datepicker table tr td.today:hover.active,.datepicker table tr td.today:hover:active {
    background-color: #fbf069
}

.datepicker table tr td.today:hover:hover {
    color: ${cores.azul5}
}

.datepicker table tr td.today.active:hover {
    color: ${cores.preto2}
}

.datepicker table tr td.range,.datepicker table tr td.range.disabled,.datepicker table tr td.range.disabled:hover,.datepicker table tr td.range:hover {
    background: ${cores.azul2};
    border-radius: 0
}

.datepicker table tr td.range.today,.datepicker table tr td.range.today.disabled,.datepicker table tr td.range.today.disabled:hover,.datepicker table tr td.range.today:hover {
    background-color: #f3d17a;
    background-image: -webkit-gradient(linear,left top,left bottom,from(#f3c17a),to(#f3e97a));
    background-image: linear-gradient(180deg,#f3c17a,#f3e97a);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f3c17a",endColorstr="#f3e97a",GradientType=0);
    border-color: #f3e97a #f3e97a #edde34;
    border-color: rgba(0,0,0,.1) rgba(0,0,0,.1) rgba(0,0,0,.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    border-radius: 0
}

.datepicker table tr td.range.today.active,.datepicker table tr td.range.today.disabled,.datepicker table tr td.range.today.disabled.active,.datepicker table tr td.range.today.disabled.disabled,.datepicker table tr td.range.today.disabled:active,.datepicker table tr td.range.today.disabled:hover,.datepicker table tr td.range.today.disabled:hover.active,.datepicker table tr td.range.today.disabled:hover.disabled,.datepicker table tr td.range.today.disabled:hover:active,.datepicker table tr td.range.today.disabled:hover:hover,.datepicker table tr td.range.today.disabled:hover[disabled],.datepicker table tr td.range.today.disabled[disabled],.datepicker table tr td.range.today:active,.datepicker table tr td.range.today:hover,.datepicker table tr td.range.today:hover.active,.datepicker table tr td.range.today:hover.disabled,.datepicker table tr td.range.today:hover:active,.datepicker table tr td.range.today:hover:hover,.datepicker table tr td.range.today:hover[disabled],.datepicker table tr td.range.today[disabled] {
    background-color: #f3e97a
}

.datepicker table tr td.range.today.active,.datepicker table tr td.range.today.disabled.active,.datepicker table tr td.range.today.disabled:active,.datepicker table tr td.range.today.disabled:hover.active,.datepicker table tr td.range.today.disabled:hover:active,.datepicker table tr td.range.today:active,.datepicker table tr td.range.today:hover.active,.datepicker table tr td.range.today:hover:active {
    background-color: #efe24b
}

.datepicker table tr td.selected,.datepicker table tr td.selected.disabled,.datepicker table tr td.selected.disabled:hover,.datepicker table tr td.selected:hover {
    background-color: #9e9e9e;
    background-image: -webkit-gradient(linear,left top,left bottom,from(#b3b3b3),to(grey));
    background-image: linear-gradient(180deg,#b3b3b3,grey);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#b3b3b3",endColorstr="#808080",GradientType=0);
    border-color: grey grey #595959;
    border-color: rgba(0,0,0,.1) rgba(0,0,0,.1) rgba(0,0,0,.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: ${cores.preto2};
    text-shadow: 0 -1px 0 rgba(0,0,0,.25)
}

.datepicker table tr td.selected.active,.datepicker table tr td.selected.disabled,.datepicker table tr td.selected.disabled.active,.datepicker table tr td.selected.disabled.disabled,.datepicker table tr td.selected.disabled:active,.datepicker table tr td.selected.disabled:hover,.datepicker table tr td.selected.disabled:hover.active,.datepicker table tr td.selected.disabled:hover.disabled,.datepicker table tr td.selected.disabled:hover:active,.datepicker table tr td.selected.disabled:hover:hover,.datepicker table tr td.selected.disabled:hover[disabled],.datepicker table tr td.selected.disabled[disabled],.datepicker table tr td.selected:active,.datepicker table tr td.selected:hover,.datepicker table tr td.selected:hover.active,.datepicker table tr td.selected:hover.disabled,.datepicker table tr td.selected:hover:active,.datepicker table tr td.selected:hover:hover,.datepicker table tr td.selected:hover[disabled],.datepicker table tr td.selected[disabled] {
    background-color: grey
}

.datepicker table tr td.selected.active,.datepicker table tr td.selected.disabled.active,.datepicker table tr td.selected.disabled:active,.datepicker table tr td.selected.disabled:hover.active,.datepicker table tr td.selected.disabled:hover:active,.datepicker table tr td.selected:active,.datepicker table tr td.selected:hover.active,.datepicker table tr td.selected:hover:active {
    background-color: ${cores.azul1}
}

.datepicker table tr td.active,.datepicker table tr td.active.disabled,.datepicker table tr td.active.disabled:hover,.datepicker table tr td.active:hover {
    background-color: #006dcc;
    background-image: -webkit-gradient(linear,left top,left bottom,from(#08c),to(#04c));
    background-image: linear-gradient(180deg,#08c,#04c);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#08c",endColorstr="#0044cc",GradientType=0);
    border-color: #04c #04c #002a80;
    border-color: rgba(0,0,0,.1) rgba(0,0,0,.1) rgba(0,0,0,.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: ${cores.preto2};
    text-shadow: 0 -1px 0 rgba(0,0,0,.25)
}

.datepicker table tr td.active.active,.datepicker table tr td.active.disabled,.datepicker table tr td.active.disabled.active,.datepicker table tr td.active.disabled.disabled,.datepicker table tr td.active.disabled:active,.datepicker table tr td.active.disabled:hover,.datepicker table tr td.active.disabled:hover.active,.datepicker table tr td.active.disabled:hover.disabled,.datepicker table tr td.active.disabled:hover:active,.datepicker table tr td.active.disabled:hover:hover,.datepicker table tr td.active.disabled:hover[disabled],.datepicker table tr td.active.disabled[disabled],.datepicker table tr td.active:active,.datepicker table tr td.active:hover,.datepicker table tr td.active:hover.active,.datepicker table tr td.active:hover.disabled,.datepicker table tr td.active:hover:active,.datepicker table tr td.active:hover:hover,.datepicker table tr td.active:hover[disabled],.datepicker table tr td.active[disabled] {
    background-color: #04c
}

.datepicker table tr td.active.active,.datepicker table tr td.active.disabled.active,.datepicker table tr td.active.disabled:active,.datepicker table tr td.active.disabled:hover.active,.datepicker table tr td.active.disabled:hover:active,.datepicker table tr td.active:active,.datepicker table tr td.active:hover.active,.datepicker table tr td.active:hover:active {
    background-color: #039
}

.datepicker table tr td span {
    display: block;
    width: 23%;
    height: 54px;
    line-height: 54px;
    float: left;
    margin: 1%;
    cursor: pointer;
    border-radius: 4px
}

.datepicker table tr td span.focused,.datepicker table tr td span:hover {
    background: ${cores.azul2}
}

.datepicker table tr td span.disabled,.datepicker table tr td span.disabled:hover {
    background: 0 0;
    color: ${cores.roxo3};
    cursor: default
}

.datepicker table tr td span.active,.datepicker table tr td span.active.disabled,.datepicker table tr td span.active.disabled:hover,.datepicker table tr td span.active:hover {
    background-color: #006dcc;
    background-image: -webkit-gradient(linear,left top,left bottom,from(#08c),to(#04c));
    background-image: linear-gradient(180deg,#08c,#04c);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#08c",endColorstr="#0044cc",GradientType=0);
    border-color: #04c #04c #002a80;
    border-color: rgba(0,0,0,.1) rgba(0,0,0,.1) rgba(0,0,0,.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: ${cores.preto2};
    text-shadow: 0 -1px 0 rgba(0,0,0,.25)
}

.datepicker table tr td span.active.active,.datepicker table tr td span.active.disabled,.datepicker table tr td span.active.disabled.active,.datepicker table tr td span.active.disabled.disabled,.datepicker table tr td span.active.disabled:active,.datepicker table tr td span.active.disabled:hover,.datepicker table tr td span.active.disabled:hover.active,.datepicker table tr td span.active.disabled:hover.disabled,.datepicker table tr td span.active.disabled:hover:active,.datepicker table tr td span.active.disabled:hover:hover,.datepicker table tr td span.active.disabled:hover[disabled],.datepicker table tr td span.active.disabled[disabled],.datepicker table tr td span.active:active,.datepicker table tr td span.active:hover,.datepicker table tr td span.active:hover.active,.datepicker table tr td span.active:hover.disabled,.datepicker table tr td span.active:hover:active,.datepicker table tr td span.active:hover:hover,.datepicker table tr td span.active:hover[disabled],.datepicker table tr td span.active[disabled] {
    background-color: #04c
}

.datepicker table tr td span.active.active,.datepicker table tr td span.active.disabled.active,.datepicker table tr td span.active.disabled:active,.datepicker table tr td span.active.disabled:hover.active,.datepicker table tr td span.active.disabled:hover:active,.datepicker table tr td span.active:active,.datepicker table tr td span.active:hover.active,.datepicker table tr td span.active:hover:active {
    background-color: #039
}

.datepicker table tr td span.new,.datepicker table tr td span.old {
    color: ${cores.roxo3}
}

.datepicker .datepicker-switch {
    width: 145px
}

.datepicker .datepicker-switch,.datepicker .next,.datepicker .prev,.datepicker tfoot tr th {
    cursor: pointer
}

.datepicker .datepicker-switch:hover,.datepicker .next:hover,.datepicker .prev:hover,.datepicker tfoot tr th:hover {
    background: ${cores.azul2}
}

.datepicker .next.disabled,.datepicker .prev.disabled {
    visibility: hidden
}

.datepicker .cw {
    font-size: 10px;
    width: 12px;
    padding: 0 2px 0 5px;
    vertical-align: middle
}

.input-append.date .add-on,.input-prepend.date .add-on {
    cursor: pointer
}

.input-append.date .add-on i,.input-prepend.date .add-on i {
    margin-top: 3px
}

.input-daterange input {
    text-align: center
}

.input-daterange input:first-child {
    border-radius: 3px 0 0 3px
}

.input-daterange input:last-child {
    border-radius: 0 3px 3px 0
}

.input-daterange .add-on {
    display: inline-block;
    width: auto;
    min-width: 16px;
    height: 18px;
    padding: 4px 5px;
    font-weight: 400;
    line-height: 18px;
    text-align: center;
    text-shadow: 0 1px 0 ${cores.preto2};
    vertical-align: middle;
    background-color: ${cores.azul2};
    border: 1px solid ${cores.verde1};
    margin-left: -5px;
    margin-right: -5px
}

.checkbox,.radio {
    margin-bottom: 0
}

.checkbox {
    padding-left: 21px
}

.checkbox label {
    display: inline-block;
    position: relative;
    padding-left: 2px;
    font-size: 12px;
    cursor: pointer;
    color: ${cores.preto4}!important;
    font-weight: 400!important
}

.checkbox label:before {
    content: "";
    width: 15px;
    height: 15px;
    top: 1px;
    border: 1px solid ${cores.verde1};
    border-radius: 3px;
    background-color: ${cores.preto2};
    -webkit-transition: border .15s ease-in-out,color .15s ease-in-out;
    transition: border .15s ease-in-out,color .15s ease-in-out
}

.checkbox label:after,.checkbox label:before {
    display: inline-block;
    position: absolute;
    left: 0;
    margin-left: -20px
}

.checkbox label:after {
    width: 16px;
    height: 16px;
    top: 0;
    padding-left: 3px;
    padding-top: 1px;
    font-size: 11px;
    color: ${cores.verde3}
}

.checkbox input[type=checkbox] {
    opacity: 0;
    display: none
}

.checkbox input[type=checkbox]:focus+label:before {
    outline: none
}

.checkbox input[type=checkbox]:disabled+label {
    opacity: .65
}

.checkbox input[type=checkbox]:disabled+label:before {
    background-color: ${cores.azul2};
    cursor: not-allowed
}

.checkbox.checkbox-circle label:before {
    border-radius: 50%
}

.checkbox.checkbox-inline {
    margin-top: 0
}

.checkbox-primary input[type=checkbox]:checked+label:before {
    background-color: ${cores.cinza1};
    border-color: ${cores.cinza1};
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAtCAYAAADRLVmZAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABV0RVh0Q3JlYXRpb24gVGltZQAxLzI5LzE4rxCMZwAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAIMSURBVGiB7di/axNhGAfwVAcHFxGEirZDO7SCP8BfKFakglJxUBHERXB0c/ZvcXR30s1JF13qoghVqIJVbDFYWq0K5eNwbzXEXPLem+R6hXwh432fTy53z3EZQm0rZttmA1IzgJedAbzsDOClBy0/m+C4h2Vca+f666sCHHexIstnXKo8PKCb8xMXKwvHnRbojaxiqnJw3G6D3sgCTlYGjptYj4CTXfP/+Upfh7haq9Ue1OJX8aO8otLOOGbwK/JMw/1cXywcu2VraiQRPY21AuiHebZoOCbwNhTWcb4g+jS+F0A/xvau4BjDh6biVUxFoo/JnoixeYId7dAd4diPdzkD6jjRAX0ISwXQT7EzHJsGxz487zDoC47koCdlezg2L7Cr4fhk+FzkwI840IQex3wB9EvsaepIhr8uMHge42HgqPgvDa+wt8UvlgwfxrMCgDc4i9kCx8xhNOdS6+rmHA6gfuQ9xtrc2OnwUDAif7OkZgETeeiewENJq12emkUcbIfuGTwUTeJTl+g6jnZC9xQeyg7LdndKlnEqBt1zeCg8jq8F0Ss4F4vuCzyUnsG3SPQPXCiC7hs8FE/792aelzVcLoruKzyUz4Qz2iq/ZW87SekrPAy4EpCNWceNVHQp8Ab8YkAvdYsuDR4GXZc9pG51i46BD6Ugq5At+2/tAF52BvCyM4CXnS0L/wMEkH3RBRHbXQAAAABJRU5ErkJggg==)!important;
    background-position: 50%;
    background-size: cover
}

.checkbox-primary input[type=checkbox]:checked+label:after {
    color: ${cores.preto2}
}

.checkbox-danger input[type=checkbox]:checked+label:before {
    background-color: #d9534f;
    border-color: #d9534f
}

.checkbox-danger input[type=checkbox]:checked+label:after {
    color: ${cores.preto2}
}

.checkbox-info input[type=checkbox]:checked+label:before {
    background-color: #5bc0de;
    border-color: #5bc0de
}

.checkbox-info input[type=checkbox]:checked+label:after {
    color: ${cores.preto2}
}

.checkbox-warning input[type=checkbox]:checked+label:before {
    background-color: #f0ad4e;
    border-color: #f0ad4e
}

.checkbox-warning input[type=checkbox]:checked+label:after {
    color: ${cores.preto2}
}

.checkbox-success input[type=checkbox]:checked+label:before {
    background-color: #5cb85c;
    border-color: #5cb85c
}

.checkbox-success input[type=checkbox]:checked+label:after {
    color: ${cores.preto2}
}

.radio {
    padding-left: 20px
}

.radio label {
    display: inline-block;
    position: relative;
    padding-left: 2px;
    font-size: 12px;
    cursor: pointer;
    color: ${cores.verde2}!important;
    font-weight: 400!important
}

.radio label:before {
    content: "";
    width: 17px;
    height: 17px;
    left: 0;
    top: 0;
    border: 1px solid ${cores.verde1};
    background-color: ${cores.preto2};
    -webkit-transition: border .15s ease-in-out;
    transition: border .15s ease-in-out
}

.radio label:after,.radio label:before {
    display: inline-block;
    position: absolute;
    margin-left: -20px;
    border-radius: 50%
}

.radio label:after {
    content: " ";
    width: 11px;
    height: 11px;
    left: 3px;
    top: 3px;
    background-color: ${cores.verde3};
    -webkit-transform: scale(0);
    transform: scale(0);
    -webkit-transition: -webkit-transform .1s cubic-bezier(.8,-.33,.2,1.33);
    transition: -webkit-transform .1s cubic-bezier(.8,-.33,.2,1.33);
    transition: transform .1s cubic-bezier(.8,-.33,.2,1.33);
    transition: transform .1s cubic-bezier(.8,-.33,.2,1.33),-webkit-transform .1s cubic-bezier(.8,-.33,.2,1.33)
}

.radio input[type=radio] {
    opacity: 0
}

.radio input[type=radio]:focus+label:before {
    outline: none
}

.radio input[type=radio]:checked+label:after {
    -webkit-transform: scale(1);
    transform: scale(1)
}

.radio input[type=radio]:disabled+label {
    opacity: .65
}

.radio input[type=radio]:disabled+label:before {
    cursor: not-allowed
}

.radio-primary input[type=radio]:checked:disabled+label:before,.radio-primary input[type=radio]:disabled+label:after {
    border-color: ${cores.verde1};
    background-color: ${cores.preto2}!important
}

.radio.radio-inline {
    margin-top: 0
}

.radio-primary input[type=radio]+label:after {
    background-color: ${cores.cinza1}
}

.radio-primary input[type=radio]:checked+label:before {
    border-color: ${cores.cinza1}
}

.radio-primary input[type=radio]:checked+label:after {
    background-color: ${cores.cinza1}
}

.radio-danger input[type=radio]+label:after {
    background-color: #d9534f
}

.radio-danger input[type=radio]:checked+label:before {
    border-color: #d9534f
}

.radio-danger input[type=radio]:checked+label:after {
    background-color: #d9534f
}

.radio-info input[type=radio]+label:after {
    background-color: #5bc0de
}

.radio-info input[type=radio]:checked+label:before {
    border-color: #5bc0de
}

.radio-info input[type=radio]:checked+label:after {
    background-color: #5bc0de
}

.radio-warning input[type=radio]+label:after {
    background-color: #f0ad4e
}

.radio-warning input[type=radio]:checked+label:before {
    border-color: #f0ad4e
}

.radio-warning input[type=radio]:checked+label:after {
    background-color: #f0ad4e
}

.radio-success input[type=radio]+label:after {
    background-color: #5cb85c
}

.radio-success input[type=radio]:checked+label:before {
    border-color: #5cb85c
}

.radio-success input[type=radio]:checked+label:after {
    background-color: #5cb85c
}

body,html {
    min-width: 992px;
    font-weight: 400;
    font-family: Arial,sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: ${cores.verde4};
    background-color: ${cores.preto3};
    margin: 0;
    padding: 0
}

body.responsive,html.responsive {
    min-width: 100px
}

.container {
    max-width: 1100px
}

svg>g>g:last-child {
    pointer-events: none
}

a {
    color: ${cores.cinza1}
}

em {
    color: red;
    font-style: normal
}

.router-link,.router-link:hover {
    text-decoration: none
}

.row {
    margin-right: -10px;
    margin-left: -10px
}

.row .col {
    padding-right: 10px;
    padding-left: 10px
}

.limit {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis
}

.limit-line-2 {
    -webkit-line-clamp: 2
}

.limit-line-2,.limit-line-3 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical
}

.limit-line-3 {
    -webkit-line-clamp: 3
}

.limit-line-4 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical
}

.white-space {
    white-space: pre-wrap!important
}

.circle {
    border-radius: 50%
}

.clear:after {
    content: "";
    display: block;
    clear: both
}

.flex,.flex-center {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex
}

.flex-center {
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center
}

.sticky {
    position: -moz-sticky;
    position: -o-sticky;
    position: -ms-sticky;
    position: sticky;
    top: 0;
    width: 100%
}

.sticky:after,.sticky:before {
    content: "";
    display: table
}

.sticky-header {
    background-color: ${cores.preto2};
    position: sticky;
    top: 54px;
    z-index: 10
}

.bg {
    background-size: cover;
    background-position: 50%;
    background-repeat: no-repeat
}

.animation {
    -webkit-transition: all .3s;
    transition: all .3s
}

.highlight {
    background-color: #ff0!important;
    color: #090907!important;
    font-weight: 500
}

.showprint {
    display: none!important
}

.sub-titulo {
    color: ${cores.preto4};
    font-size: 11px;
    font-weight: 400
}

.vertical-middle {
    display: grid;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center
}

.material-icons-image {
    font-size: 15px!important
}

.badge {
    border-radius: 3px;
    font-size: 11px;
    color: ${cores.preto2}
}

.badge-warning {
    background-color: #f2a100
}

.badge-danger {
    background-color: #ff3b2f
}

.badge-success {
    background-color: #1db537
}

.badge-secondary {
    background-color: #acacad
}

.sigla {
    width: 35px;
    height: 35px;
    background-color: #7986cb;
    text-align: center;
    line-height: 36px;
    font-size: 12px;
    color: ${cores.preto2};
    position: relative
}

.sigla .bg {
    position: absolute;
    left: -1px;
    top: -1px;
    width: 37px;
    height: 37px;
    z-index: 9
}

.btn {
    font-size: 13px
}

.btn-icon {
    padding: 6px 15px 6px 34px;
    display: inline-block!important;
    position: relative
}

.btn-icon i {
    margin: 0;
    padding: 0;
    line-height: 0;
    position: absolute;
    top: 50%;
    left: 8px;
    font-size: 19px;
    max-width: 19px!important
}

.btn-ajuda {
    outline: none!important;
    position: fixed;
    right: 15px;
    bottom: 15px;
    z-index: 9;
    background-color: ${cores.preto2};
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    -webkit-box-shadow: 0 3px 13px -1px #b0b0b0;
    box-shadow: 0 3px 13px -1px #b0b0b0
}

.btn-ajuda i {
    margin: 0;
    padding: 0;
    line-height: 1.45em;
    font-size: 24px;
    color: #888
}

.btn-ajuda:hover {
    background-color: ${cores.preto2}
}

.btn-ajuda:hover>i {
    color: ${cores.cinza1}
}

.btn-ajuda:focus {
    outline: none!important;
    -webkit-box-shadow: none!important;
    box-shadow: none!important
}

.btn-icon-busca {
    width: 34px;
    height: 34px
}

.btn-icon-busca i {
    top: 6px!important;
    left: -1px!important
}

.btn-excel {
    padding: 6px 12px!important;
    max-height: 33px
}

.btn-excel img {
    width: 17px;
    margin-right: 5px;
    position: relative;
    top: -1px
}

.btn-ver-tudo {
    font-size: 12px;
    float: right;
    margin: 7px 0
}

.btn-ver-tudo:hover {
    text-decoration: none
}

.dropdown {
    display: block;
    min-width: 74px;
    float: right
}

.dropdown.dropdown-full {
    width: 100%
}

.dropdown .dropdown-select:after {
    position: absolute;
    right: 10px;
    top: 47%
}

.dropdown .btn-default {
    margin: 0;
    padding: 7px 12px;
    display: block;
    width: 100%;
    min-height: 34px;
    border: 1px solid ${cores.verde1};
    font-size: 12px;
    background-color: ${cores.preto2};
    color: ${cores.verde2}
}

.dropdown .btn-default.dropdown-select p {
    margin: 0;
    padding: 0 15px 0 0;
    color: #212529
}

.dropdown .dropdown-item {
    padding: 4px 15px!important;
    font-size: 12px!important
}

.dropdown .dropdown-item.router-link-active,.dropdown .dropdown-item:hover,.dropdown-item.active,.dropdown-item:active {
    background-color: ${cores.cinza4};
    color: ${cores.cinza1};
    outline: none;
    cursor: pointer
}

.dropdown .dropdown-item:focus {
    color: ${cores.cinza1};
    outline: none;
    background: ${cores.cinza4}
}

.dropdown .dropdown-header:hover {
    background: ${cores.preto2};
    color: ${cores.cinza5};
    cursor: default
}

.dropdown-data {
    float: right;
    margin-left: 15px
}

.dropdown-data .input-group .form-control {
    width: 90px;
    text-align: center;
    padding: 0!important
}

.dropdown-data .input-group .input-group-prepend .input-group-text {
    padding: 5px 10px;
    font-size: 12px;
    border: none;
    background: none
}

.dropdown-data .input-group .input-group-prepend .btn {
    border-radius: 3px;
    padding: 0 8px;
    margin: 0 2px 0 15px
}

.dropdown-data .input-group .input-group-prepend .btn i {
    font-size: 20px;
    position: relative;
    top: 3px
}

.dropdown .dropdown-menu {
    max-height: 300px!important;
    overflow-y: auto
}

.dropdown .dropdown-menu-filtro {
    max-height: 450px;
    overflow-y: auto
}

.filtro .dropdown {
    margin-left: 15px
}

.tooltip-inner {
    font-size: 12px
}

.datepicker {
    padding: 5px
}

.datepicker td,.datepicker th {
    padding: 5px 8px!important;
    font-size: 14px
}

.datepicker td.today {
    background: ${cores.azul2}!important
}

.datepicker table tr td.active,.datepicker table tr td.active.disabled,.datepicker table tr td.active.disabled:hover,.datepicker table tr td.active:hover {
    background-color: #004ab7!important;
    background-image: none!important;
    border: none!important
}

.v-toaster {
    top: auto!important;
    bottom: 0!important;
    right: 0!important;
    font-weight: 700!important
}

.v-toaster .v-toast {
    border-radius: 4px!important;
    font-size: 12px
}

.v-toaster .v-toast.v-toast-error {
    background: #f32d1f!important;
    border-color: #f32d1f!important
}

.v-toaster .v-toast.v-toast-warning {
    background: #ffb700!important
}


// .card {
//     margin-bottom: 20px;
//     word-wrap: normal;
//     background: rgba(20, 19, 19, 0.05) !important;
//     border: 1px solid rgba(255, 255, 255, 0.2);
//     border-radius: 15px;
//     backdrop-filter: blur(10px);
//     -webkit-backdrop-filter: blur(10px);
//     box-shadow: 0 8px 32px 0 rgba(78, 78, 78, 0.2);
//     transition: all 0.3s ease;
// }


.card {
    margin-bottom: 20px;
    word-wrap: normal;
    border: 1px solid rgba(0,0,0,.2);
    background-color: ${cores.vermelho1} !important;
}





.card .card-header {
    padding: 9px 15px 8px 15px;
    border-bottom: 1px solid ${cores.roxo5};
    background: ${cores.preto2}!important;
}

.card .card-header h4 {
    margin: 8px 0;
    padding: 0;
    font-weight: 700;
    display: inline-block;
    font-size: 14px!important;
    color: #f35a04
}

.card .card-header p {
    margin: -2px 0 15px 0;
    padding: 0;
    font-size: 12px;
    color: ${cores.verde2}
}

.card .card-header .center {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 100%;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center
}

.card .card-header .center h4 {
    margin: 0;
    padding: 0
}

.card .card-header .center span {
    font-size: 11px;
    color: ${cores.roxo3};
    font-style: italic;
    margin-top: 2px
}

.card .card-header.acao .btn {
    float: right
}

.card .card-header .dropdown .reordenar {
    padding: 3px;
    line-height: 0;
    border: 1px solid ${cores.azul2}
}

.card .card-header .dropdown .reordenar i {
    color: ${cores.cinza1}
}

.card .card-filtro {
    padding: 15px 15px;
    display: block;
    border-bottom: none!important
}

.card .card-filtro .total {
    text-align: right;
    margin-top: 8px;
    display: block;
    font-weight: 700;
    font-size: 12px
}

.card .card-body {
    padding: 15px
}

.card-footer {
    background: ${cores.preto2};
    border-top: none;
    padding: 12px 15px
}

.card-footer a {
    font-size: 12px
}

.form-group {
    margin: 0 0 15px 0!important;
    padding: 0!important
}

.form-group label {
    font-size: 12px!important;
    color: ${cores.cinza3};
    margin: 0!important;
    font-weight: 700
}

.form-group p {
    color: ${cores.verde2};
    font-size: 12px
}

.form-group-last {
    margin-bottom: 0!important
}

.form-control {
    height: 34px!important;
    font-size: 12px!important;
    border: 1px solid ${cores.verde1}!important;
    color: ${cores.verde4};
    padding: 0 10px;
    border-radius: 3px!important;
    -webkit-transition: all .3s;
    transition: all .3s
}

textarea.form-control {
    min-height: 130px;
    height: auto!important;
    padding: 5px 8px
}

input:active,input:focus,select:active,select:focus,textarea:active,textarea:focus {
    border: 1px solid ${cores.cinza1}!important
}

input::-webkit-input-placeholder,select::-webkit-input-placeholder,textarea::-webkit-input-placeholder {
    font-size: 12px!important;
    color: #929292!important
}

input::-moz-placeholder,select::-moz-placeholder,textarea::-moz-placeholder {
    font-size: 12px!important;
    color: #929292!important
}

input:-ms-input-placeholder,select:-ms-input-placeholder,textarea:-ms-input-placeholder {
    font-size: 12px!important;
    color: #929292!important
}

input:-moz-placeholder,select:-moz-placeholder,textarea:-moz-placeholder {
    font-size: 12px!important;
    color: #929292!important
}

.form-check .form-check-input {
    cursor: pointer
}

.form-check .form-check-label {
    cursor: pointer;
    color: ${cores.azul1}!important;
    font-weight: 400
}

.sidebar {
    -webkit-box-flex: 1;
    -ms-flex: 1;
    flex: 1;
    max-width: 220px;
    background: ${cores.preto2};
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column
}

.sidebar-left .sidebar-conf {
    overflow: auto;
    height: calc(100vh - 55px);
    padding-bottom: 40px
}

.sidebar-left.fixed .sidebar-conf {
    height: 100vh
}

.sidebar-conf::-webkit-scrollbar {
    width: 8px
}

.sidebar-conf::-webkit-scrollbar-track {
    background-color: ${cores.verde5}
}

.sidebar-conf::-webkit-scrollbar-thumb {
    background-color: #a9a9a9;
    border-radius: 5px
}

.sidebar .foto {
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    padding: 15px;
    border-radius: 3px
}

.sidebar .foto .logo {
    height: 120px;
    width: 100%;
    margin: 0 auto;
    background-color: ${cores.azul2};
    border: 1px solid ${cores.preto1};
    border-radius: 4px
}

.sidebar ul {
    margin: 0;
    padding: 0;
    list-style: none
}

.sidebar ul li {
    margin: 1px 0 0 0
}

.sidebar ul li a {
    font-size: 12px;
    padding: 6px 15px;
    display: block;
    color: ${cores.verde2};
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex
}

.sidebar ul li.total {
    padding-right: 25px!important
}

.sidebar ul li a i {
    margin: 0 5px 0 0;
    padding: 0;
    font-size: 18px;
    line-height: 0;
    position: relative;
    top: 9px
}

.sidebar ul li.separador {
    border-top: 1px solid ${cores.preto3};
    padding: 0!important;
    margin: 10px 0;
    height: 0;
    list-style: none
}

.sidebar ul li.separador.min {
    margin: 5px 15px 5px 40px
}

.sidebar .badge {
    position: absolute;
    right: 15px;
    color: ${cores.roxo4}
}

.sidebar .badge.badge-secondary {
    background-color: ${cores.preto3};
    font-weight: 400
}

.sidebar ul li a.router-link-active,.sidebar ul li a:hover,.sidebar ul li.active,.sidebar ul li.active>a,.sidebar ul li:hover {
    color: ${cores.cinza1}!important;
    text-decoration: none;
    background: ${cores.preto1}
}

.sidebar ul li a.router-link-active .badge,.sidebar ul li a:hover>.badge,.sidebar ul li.active>.badge,.sidebar ul li.active>a>.badge,.sidebar ul li:hover>.badge {
    background-color: #2f8efb;
    color: ${cores.preto2}
}

.sidebar ul li ul {
    padding-bottom: 6px
}

.sidebar ul li ul li a {
    padding: 4px 15px 4px 39px
}

.sidebar ul li ul li a:hover,.sidebar ul li ul li:hover {
    background-color: #e5e5e5!important
}

.modal {
    text-align: center;
    z-index: 9999!important
}

.modal-dialog {
    width: 90%;
    max-width: 600px
}

.modal-dialog.modal-lg {
    width: 90%;
    max-width: 980px
}

.modal:before {
    content: "";
    height: 100%;
    margin-right: -4px
}

.modal-dialog,.modal:before {
    display: inline-block;
    vertical-align: middle
}

.modal-dialog {
    text-align: left
}

.modal-big {
    max-width: 600px!important
}

.modal-open .modal {
    background: rgba(0,0,0,.2)!important
}

.modal .modal-content .modal-header {
    padding: 15px 15px;
    border-bottom: 1px solid ${cores.azul2}
}

.modal .modal-content .modal-header .modal-title {
    font-size: 16px;
    color: #f35a04
}

.modal .modal-content .modal-header .close {
    position: relative;
    top: -2px
}

.modal .modal-imagem {
    padding: 15px;
    background: #607d8b
}

.modal .modal-imagem .imagem {
    display: block;
    width: 100px;
    height: 80px;
    margin: 0 auto;
    border-radius: 3px
}

.modal .modal-content .modal-body {
    padding: 15px
}

.modal .modal-content .modal-body img {
    max-width: 100%
}

.modal .modal-content .modal-body .btn-default {
    background: ${cores.preto2}!important
}

.modal-content {
    border-radius: 3px!important
}

.modal-footer {
    border-radius: 0 0 4px 4px
}

.modal-footer,.modal-footer .btn-default {
    background: ${cores.preto2}
}

.table {
    margin-bottom: 0
}

.table thead th {
    border-bottom: none;
    border-top: none
}

.table tr th {
    font-size: 12px;
    padding: 5px 15px
}

.table tr td {
    padding: 4px 15px;
    color: ${cores.verde4}
}

.table tr a.td,.table tr td {
    font-size: 12px;
    vertical-align: middle
}

.table tr a.td {
    display: table-cell;
    border-top: 1px solid ${cores.roxo1};
    padding: 7px 15px;
    color: ${cores.cinza1}
}

.table tr a.td:hover {
    text-decoration: none
}

.table-data tr:first-child td,.table-nenhum td,.table-nenhum th {
    border-top: none
}

.table-data tr td {
    vertical-align: top;
    padding: 8px 15px
}

.table-data tr td.middle {
    vertical-align: middle
}

.table-data tr td.acao {
    min-width: 80px;
    padding: 5px 15px
}

.table .top-border {
    border-top: 1px solid ${cores.roxo1}!important
}

.table .no-border {
    border: none!important
}

.acao {
    text-align: right
}

.acao a {
    display: -webkit-inline-box;
    display: -ms-inline-flexbox;
    display: inline-flex;
    padding: 3px 2px 3px 3px;
    margin: 0 0 0 4px;
    color: ${cores.cinza1}!important;
    background: ${cores.azul2};
    border-radius: 3px
}

.acao a:hover {
    text-decoration: none;
    background: ${cores.preto3}
}

.acao a i {
    font-size: 20px;
    padding: 0;
    margin: 0;
    line-height: 18px
}

.acao a.editar {
    padding: 3px 3px 3px 4px;
    position: relative;
    top: -1px
}

.acao a.editar i {
    font-size: 18px
}

.acao a.excluir {
    padding: 3px 2px 3px 2px!important
}

.bordasimples {
    border-collapse: collapse;
    width: 100%
}

.bordasimples tr th {
    border: 1px solid ${cores.verde1};
    padding: 5px;
    background: ${cores.verde5}
}

.bordasimples tr td {
    border: 1px solid ${cores.verde1};
    padding: 5px;
    color: ${cores.verde4};
    font-size: 12px
}

.bordasimples {
    margin-bottom: 15px
}

.bordasimples:last-child {
    margin-bottom: 0
}

.bordasimples tr th {
    font-size: 12px
}

.bordasimples tr td b {
    color: ${cores.verde4}
}

.swal2-container.swal2-shown {
    z-index: 99999
}

.swal2-modal {
    z-index: 99999!important
}

.swal2-modal .swal2-title {
    font-size: 20px!important
}

.swal2-modal .swal2-buttonswrapper button {
    padding: 5px 20px!important;
    font-size: 15px!important;
    outline: none!important;
    -webkit-box-shadow: none!important;
    box-shadow: none!important
}

.swal2-modal .swal2-cancel {
    background: ${cores.preto2}!important;
    border: 1px solid #c4c4c4!important;
    color: #737373!important
}

.swal2-modal .swal2-cancel:hover {
    border: 1px solid #737373!important
}

.swal2-modal .swal2-loading .swal2-cancel {
    display: none!important
}

.alert {
    font-size: 12px;
    margin-bottom: 5px
}

.alert-dismissible .close {
    padding: 9px!important
}

.nav-tabs {
    background: ${cores.preto2};
    border-radius: 3px 3px 0 0
}

.nav-tabs .nav-item {
    border: none
}

.nav-tabs .nav-item a {
    font-size: 13px;
    padding: 12px 20px;
    color: ${cores.roxo4};
    border: none;
    cursor: pointer
}

.nav-tabs .nav-item a:hover {
    padding: 12px 20px
}

.nav-tabs .nav-item a.active,.nav-tabs .nav-item a:hover {
    border: none;
    color: ${cores.cinza1};
    border-bottom: 2px solid ${cores.cinza1}
}

.application.fixed .obra .sidebar-left {
    padding-top: 0
}

.obra .page-obra {
    margin-left: 220px;
    padding: 15px 0 40px 0
}

.page-sidebar {
    margin-left: 220px;
    padding: 15px 0 20px 0
}

@-webkit-keyframes placeHolderShimmer {
    0% {
        background-position: -468px 0
    }

    to {
        background-position: 468px 0
    }
}

@keyframes placeHolderShimmer {
    0% {
        background-position: -468px 0
    }

    to {
        background-position: 468px 0
    }
}

.placeholder {
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
    -webkit-animation-iteration-count: infinite;
    animation-iteration-count: infinite;
    -webkit-animation-name: placeHolderShimmer;
    animation-name: placeHolderShimmer;
    -webkit-animation-timing-function: linear;
    animation-timing-function: linear;
    background: #f6f7f8;
    background: -webkit-gradient(linear,left top,right top,color-stop(8%,${cores.azul2}),color-stop(18%,${cores.preto3}),color-stop(33%,${cores.azul2}));
    background: linear-gradient(90deg,${cores.azul2} 8%,${cores.preto3} 18%,${cores.azul2} 33%);
    background-size: 950px 100%;
    height: 100%;
    position: relative;
    border-radius: 4px
}

.lg-backdrop {
    z-index: 9999!important
}

.lg-outer {
    z-index: 99999!important
}

.relatorio-galeria {
    padding: 8px;
    position: relative;
    left: 1px
}

.relatorio-galeria .lightgallery a {
    width: calc(14.28% - 1px)!important;
    height: 95px!important
}

.registros .relatorio-galeria {
    padding: 0;
    position: relative;
    left: 0
}

.registros .relatorio-galeria .lightgallery a {
    width: calc(14.28% - 1px)!important;
    height: 95px!important
}

.relatorio-galeria-visualizar {
    padding: 0;
    position: relative;
    left: 0
}

.relatorio-galeria-visualizar .lightgallery a {
    width: 24px!important;
    height: 24px!important;
    background-image: none!important
}

.relatorio-galeria-visualizar .lightgallery a i {
    display: none
}

.relatorio-galeria-visualizar .lightgallery a.clear {
    width: 0!important;
    height: 0!important;
    margin: 0!important
}

.relatorio-galeria-visualizar .lightgallery a.mais-fotos {
    background: ${cores.azul5}
}

.relatorio-galeria-visualizar .lightgallery a.mais-fotos .imagem {
    opacity: .2
}

.relatorio-galeria-visualizar .lightgallery a.mais-fotos .quantidade {
    display: block;
    color: ${cores.preto2};
    opacity: 1;
    position: absolute;
    top: 0;
    padding: 4px 0;
    width: 100%;
    text-align: center;
    font-size: 11px;
    font-weight: 700
}

.dashboard-galeria {
    padding: 11px 8px 8px 8px;
    position: relative;
    left: 2px
}

.dashboard-galeria .lightgallery a {
    width: calc(25% - 2px)!important;
    height: 100px!important
}

.dashboard-galeria.full {
    padding-top: 12px;
    padding-bottom: 12px
}

.dashboard-galeria.full .lightgallery a {
    height: 90px!important
}

.lista-tarefas {
    padding: 8px 0;
    position: relative;
    left: 3px
}

.lista-tarefas .lightgallery a {
    width: 65px!important;
    height: 65px!important
}

.lista-galeria .lightgallery a {
    width: 93.5px!important;
    height: 70px!important
}

.list-group .list-group-item {
    padding: 12px 15px;
    font-size: 12px;
    color: ${cores.verde2}
}

.list-group .list-group-item label {
    margin-bottom: 0
}

.list-group .list-group-item .item .modelo-relatorio {
    margin: 0;
    float: right
}

.list-group .list-group-item .item .modelo-relatorio span {
    background: ${cores.preto1};
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px
}

.list-group .list-group-item .registros {
    display: block;
    margin: 0
}

.list-group .list-group-item .registros ul {
    margin: 0;
    padding: 0;
    list-style: none
}

.list-group .list-group-item .registros ul li {
    margin: 0;
    padding: 6px 5px;
    border-bottom: 1px dashed #e0e0e0
}

.list-group .list-group-item .registros ul li:hover {
    background: ${cores.verde5}
}

.list-group .list-group-item .registros ul li:last-child {
    border: none
}

.list-group .list-group-item .registros ul li h6 {
    margin: 5px 0;
    padding: 0;
    font-size: 12px;
    color: ${cores.verde4};
    font-weight: 700
}

.list-group .list-group-item .registros ul li p {
    color: ${cores.verde2};
    padding: 0;
    margin: 0
}

.list-group .list-group-item .registros ul li a,.list-group .list-group-item .registros ul li a:hover>p {
    color: ${cores.cinza1}
}

.list-group .list-group-item .registros ul li .sub-titulo {
    margin: 0 0 0 28px;
    padding: 0;
    font-size: 11px;
    font-style: italic;
    color: ${cores.preto4}
}

.list-group .list-group-item .registros ul li .porcentagem {
    text-align: right;
    display: block
}

.list-group .list-group-item .registros ul li span {
    font-size: 11px;
    color: ${cores.preto4}
}

.list-group .list-group-item .registros ul li span.tag {
    background: ${cores.preto3};
    color: ${cores.cinza3};
    font-size: 11px;
    margin: 5px 5px 0 0;
    padding: 1px 6px;
    display: inline-block;
    border-radius: 2px
}

.ql-toolbar.ql-snow {
    border-radius: 3px 3px 0 0
}

.ql-container.ql-snow {
    border-radius: 0 0 3px 3px
}

.ql-toolbar .ql-picker.ql-color-picker svg,.ql-toolbar button svg {
    width: 20px!important;
    height: 20px!important
}

.quillWrapper .ql-snow.ql-toolbar .ql-formats {
    margin-bottom: 5px!important
}

.ql-picker:not(.ql-background) {
    top: 1px!important
}

.ql-snow .ql-color-picker .ql-picker-label svg,.ql-snow .ql-icon-picker .ql-picker-label svg {
    top: -3px!important;
    left: -1px;
    position: relative
}

@media print {
    #printable,body,html {
        margin: 0;
        padding: 0;
        border: 0
    }

    #printable {
        font-size: 14px
    }

    #printable~* {
        display: none
    }
}
`;
        const style = document.createElement('style');
        style.type = 'text/css';
        style.textContent = styleContent;
        document.head.appendChild(style);
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
    temaDark(isEnabled);
    document.body.style.backgroundColor = isEnabled ? '#121212' : '';
}



// Configuração do MutationObserver para monitorar mudanças no DOM
const observerRSP = new MutationObserver(() => {
    try {
        chrome.storage.sync.get('darkTheme', function (data) {
            const isDarkTheme = data.darkTheme ?? false;
            temaDark(isDarkTheme);
        });
    } catch (error) {
        // If extension context is invalid, disconnect the observer
        observerRSP.disconnect();
    }
});

// Reconnect observer when extension is ready
document.addEventListener('DOMContentLoaded', () => {
    observerRSP.observe(document.body, {
        childList: true,
        subtree: true
    });
});

temaDark(false);
const corPadrao = '#1d5b50';

// Função para aplicar a cor padrão no cabeçalho - executa imediatamente
function aplicarCorPadraoCabecalho() {
    const headerRDOApp = document.querySelectorAll('header.header');
    headerRDOApp.forEach(cabecalho => {
        cabecalho.style.backgroundColor = corPadrao;
    });
}

// Ouvinte para mudanças na cor do tema
chrome.runtime.onMessage.addListener((mensagem) => {
    if (mensagem.themeColor) {
        atualizarCorTema(mensagem.themeColor);
    }
});

// Carrega o tema salvo quando a página é carregada
chrome.storage.sync.get('themeColor', (dados) => {
    if (dados.themeColor) {
        atualizarCorTema(dados.themeColor);
    } else {
        aplicarCorPadraoCabecalho(); // Aplica cor padrão se não houver cor salva
    }
});

// Atualiza a cor do tema em todos os elementos necessários
function atualizarCorTema(cor) {
    document.documentElement.style.setProperty('--theme-color', cor);

    const elementosTema = document.querySelectorAll('.module-header, .beta-banner, .shortcutPanel, header.header');
    elementosTema.forEach(elemento => {
        elemento.style.backgroundColor = cor;
    });
}

// Inicializa com a cor padrão
aplicarCorPadraoCabecalho();


