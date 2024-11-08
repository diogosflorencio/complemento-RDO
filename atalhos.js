document.addEventListener("keydown", (evento) => {
    if (document.querySelector('button.btn.btn-success.btn-icon.animation')) {
        if ((evento.key).toLowerCase() == "s" && evento.altKey) {
            document.querySelector('button.btn.btn-success.btn-icon.animation').click()
        }
    }
    
    if(document.querySelector('[title="Obras"]')){
        if ((evento.key).toLowerCase() == "h" && evento.altKey) {
            document.querySelector('[title="Obras"]').click();
        }
    }
});

