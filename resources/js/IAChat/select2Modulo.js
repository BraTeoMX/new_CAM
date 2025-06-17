// public/js/select2Modulo.js (pero en resources/js/IAChat/select2Modulo.js)

/**
 * Inicializa Select2 en un elemento <select> dado, para la selección de módulos.
 * @param {HTMLElement} selectElement - El elemento <select> del DOM donde se inicializará Select2.
 * @param {object} chatManagerInstance - La instancia de ChatManager para interactuar con el chat principal.
 */
window.initializeModuloSelect2 = function(selectElement, chatManagerInstance) { // <-- ¡CAMBIO AQUÍ!
    if (window.$ && selectElement) {
        // Destruir cualquier instancia existente de Select2 para evitar duplicados
        if ($(selectElement).data('select2')) {
            $(selectElement).select2('destroy');
        }

        $(selectElement).select2({
            placeholder: 'Selecciona un módulo',
            allowClear: true,
            width: '100%',
            ajax: {
                url: '/obtener-modulo', // Asegúrate de que esta URL sea correcta (plural)
                type: 'GET',
                dataType: 'json',
                delay: 250,
                data: function(params) {
                    return { search: params.term || '' }; // Parámetro de búsqueda para el backend
                },
                processResults: function(data) {
                    // El backend ya debería devolver los datos en el formato {id: 'valor', text: 'texto'}
                    // por lo que simplemente los pasamos directamente a results.
                    return { results: data };
                },
                cache: true
            },
            minimumInputLength: 0
        });

        // Evento cuando se selecciona un módulo
        $(selectElement).on('select2:select', async function(e) {
            const moduloSeleccionado = e.params.data.text;

            // Deshabilitar el select para evitar más interacciones
            $(this).prop('disabled', true);

            // Mostrar burbuja del usuario con el módulo seleccionado
            const userActionHtml = await chatManagerInstance.renderUserActionAsBubble(`He seleccionado el módulo: **${moduloSeleccionado}**`);
            if (userActionHtml) {
                const chatMessages = chatManagerInstance.elements.chatMessages;
                const tempUserDiv = document.createElement('div');
                tempUserDiv.innerHTML = userActionHtml;
                chatMessages.appendChild(tempUserDiv.firstChild);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            // Remover el contenedor del Select2 después de la selección
            $(selectElement).closest('.select2-container-wrapper').remove();


            // Mostrar SweetAlert2 de carga
            Swal.fire({
                title: 'Buscando ticket...',
                text: `Estamos buscando el ticket asociado al módulo "${moduloSeleccionado}"`,
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            // Redirigir con el módulo como query param
            setTimeout(() => {
                window.location.href = `http://128.150.102.40:8020/FollowOT?modulo=${encodeURIComponent(moduloSeleccionado)}`;
            }, 1200);
        });
    }
}; // <-- ¡Y aquí también, porque ahora es una asignación a una propiedad de window!
