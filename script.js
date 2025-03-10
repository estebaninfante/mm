const categoriaConfig = {
    arquitecto: {
        campos: ['arquitecto-siso', 'disponibilidad-section'],
        required: ['experiencia', 'software', 'disponibilidad']
    },
    siso: {
        campos: ['arquitecto-siso', 'disponibilidad-section'],
        required: ['experiencia', 'disponibilidad']
    },
    tecnico: {
        campos: ['tecnico-instalador', 'disponibilidad-section'],
        required: ['disponibilidad']
    },
    instalador: {
        campos: ['tecnico-instalador', 'disponibilidad-section'],
        required: ['disponibilidad']
    },
    ayudante: {
        campos: ['disponibilidad-section'],
        required: ['disponibilidad']
    },
    aseador: {
        campos: ['disponibilidad-section'],
        required: ['disponibilidad']
    }
};

// Update especialidadesConfig to have correct specialties
const especialidadesConfig = {
    tecnico: {
        drywall: 'Drywall / Superboard',
        pintura: 'Pintura y Acabados',
        electricidad: 'Electricidad',
        plomeria: 'Plomería',
        carpinteria: 'Carpintería',
        enchapado: 'Enchapado',
        cocinas: 'Instalación de Cocinas',
        pisos: 'Instalación de Pisos'
    },
    instalador: {
        drywall: 'Drywall / Superboard',
        pintura: 'Pintura y Acabados',
        electricidad: 'Electricidad',
        plomeria: 'Plomería',
        carpinteria: 'Carpintería',
        enchapado: 'Enchapado',
        cocinas: 'Instalación de Cocinas',
        pisos: 'Instalación de Pisos'
    }
};

// Código de lugares integrado
let departamentosData = {};

async function cargarDepartamentosYCiudades() {
    try {
        const response = await fetch('https://www.datos.gov.co/resource/xdk5-pm3f.json');
        const data = await response.json();
        
        // Organizar datos por departamento
        data.forEach(item => {
            if (!departamentosData[item.departamento]) {
                departamentosData[item.departamento] = new Set();
            }
            if (item.municipio) {
                departamentosData[item.departamento].add(item.municipio);
            }
        });

        // Poblar select de departamentos
        const depSelect = document.getElementById('departamento');
        depSelect.innerHTML = '<option value="">Seleccione un departamento...</option>';
        
        Object.keys(departamentosData)
            .sort()
            .forEach(dep => {
                const option = document.createElement('option');
                option.value = dep;
                option.textContent = dep;
                depSelect.appendChild(option);
            });

    } catch (error) {
        console.error('Error cargando datos:', error);
        const depSelect = document.getElementById('departamento');
        depSelect.innerHTML = '<option value="">Error cargando departamentos...</option>';
    }
}

function actualizarMunicipios() {
    const depSelect = document.getElementById('departamento');
    const munSelect = document.getElementById('municipio');
    const departamento = depSelect.value;
    
    munSelect.innerHTML = '<option value="">Seleccione una ciudad/municipio...</option>';
    
    if (departamento && departamentosData[departamento]) {
        Array.from(departamentosData[departamento])
            .sort()
            .forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio;
                option.textContent = municipio;
                munSelect.appendChild(option);
            });
        munSelect.disabled = false;
    } else {
        munSelect.disabled = true;
    }
}

// Función para inicializar la selección de roles
function initRoleSelection() {
    const roleCards = document.querySelectorAll('.role-card');
    const hiddenInput = document.getElementById('categoria');
    
    roleCards.forEach(card => {
        card.addEventListener('click', function() {
            // Eliminar clase selected de todas las tarjetas
            roleCards.forEach(c => c.classList.remove('selected'));
            
            // Añadir clase selected a la tarjeta clickeada
            this.classList.add('selected');
            
            // Actualizar el valor del input oculto
            const roleValue = this.dataset.role;
            hiddenInput.value = roleValue;
            
            // Disparar evento change para actualizar el formulario
            const event = new Event('change');
            hiddenInput.dispatchEvent(event);
            
            // Actualizar campos basados en la categoría
            actualizarCamposCategoria();
        });
    });
}

// Función para inicializar la selección de género
function initGenderSelection() {
    const genderCards = document.querySelectorAll('.gender-card');
    const hiddenInput = document.getElementById('genero');
    
    genderCards.forEach(card => {
        card.addEventListener('click', function() {
            // Eliminar clase selected de todas las tarjetas
            genderCards.forEach(c => c.classList.remove('selected'));
            
            // Añadir clase selected a la tarjeta clickeada
            this.classList.add('selected');
            
            // Actualizar el valor del input oculto
            const genderValue = this.dataset.gender;
            hiddenInput.value = genderValue;
            
            // Verificar que el valor se haya establecido
            console.log('Género seleccionado:', hiddenInput.value);
        });
    });
}

// Variables para manejar la confirmación
let currentCardToDeselect = null;

// Inicializar el diálogo de confirmación
function initConfirmationDialog() {
    const dialog = document.getElementById('confirmation-dialog');
    const cancelBtn = document.getElementById('confirm-cancel');
    const confirmBtn = document.getElementById('confirm-yes');
    
    // Manejador para el botón de cancelar
    cancelBtn.addEventListener('click', () => {
        hideConfirmationDialog();
        currentCardToDeselect = null;
    });
    
    // Manejador para el botón de confirmar
    confirmBtn.addEventListener('click', () => {
        if (currentCardToDeselect) {
            // Deseleccionar la tarjeta
            currentCardToDeselect.classList.remove('selected');
            currentCardToDeselect.querySelector('.especialidad-icon').textContent = '+';
            
            // Deseleccionar los radios
            const radios = currentCardToDeselect.querySelectorAll('input[type="radio"]:checked');
            radios.forEach(radio => {
                radio.checked = false;
            });
            
            // Actualizar resumen
            actualizarResumenEspecialidades();
            
            // Limpiar referencia
            currentCardToDeselect = null;
        }
        hideConfirmationDialog();
    });
}

// Mostrar el diálogo de confirmación
function showConfirmationDialog(cardToDeselect, especialidadNombre) {
    const dialog = document.getElementById('confirmation-dialog');
    const message = dialog.querySelector('p');
    
    // Actualizar mensaje con el nombre de la especialidad
    message.textContent = `¿Realmente deseas quitar la especialidad "${especialidadNombre}"?`;
    
    // Guardar referencia a la tarjeta
    currentCardToDeselect = cardToDeselect;
    
    // Mostrar diálogo
    dialog.classList.remove('hidden');
    dialog.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

// Ocultar el diálogo de confirmación
function hideConfirmationDialog() {
    const dialog = document.getElementById('confirmation-dialog');
    dialog.classList.remove('active');
    setTimeout(() => {
        dialog.classList.add('hidden');
    }, 300);
    document.body.style.overflow = ''; // Restaurar scroll
}

// Actualizar initForm para incluir la inicialización de roles y género
function initForm() {
    // Cargar departamentos y ciudades
    cargarDepartamentosYCiudades();
    
    // Inicializar selección de roles
    initRoleSelection();
    
    // Inicializar selección de género
    initGenderSelection();
    
    // Inicializar diálogo de confirmación
    initConfirmationDialog();
    
    // Escuchar cambios en el select de departamento
    const depSelect = document.getElementById('departamento');
    depSelect.addEventListener('change', actualizarMunicipios);
    
    // Validación de términos
    const termsInputs = ['termsContact', 'termsPrivacy'].map(id => 
        document.getElementById(id));
    termsInputs.forEach(input => 
        input.addEventListener('change', validarTerminos));
    
    validarTerminos();
    
    // Initial update of fields
    actualizarCamposCategoria();

    // Agregar validación para número de documento
    const numeroDocumento = document.getElementById('numeroDocumento');
    numeroDocumento.addEventListener('input', function(e) {
        // Eliminar cualquier caracter que no sea número
        let valor = e.target.value.replace(/\D/g, '');
        
        // Limitar a 20 dígitos
        valor = valor.substring(0, 20);
        
        // Actualizar el valor del campo
        e.target.value = valor;
    });

    // Agregar validación para teléfono
    const telefono = document.getElementById('telefono');
    telefono.addEventListener('input', function(e) {
        // Eliminar cualquier caracter que no sea número
        let valor = e.target.value.replace(/\D/g, '');
        
        // Limitar a 10 dígitos
        valor = valor.substring(0, 10);
        
        // Actualizar el valor del campo
        e.target.value = valor;
        
        // Validar longitud y mostrar/ocultar error
        if (valor.length > 0 && valor.length !== 10) {
            mostrarError(this, 'El teléfono debe tener exactamente 10 dígitos');
        } else {
            limpiarError(this);
            // Restaurar la validación normal del formulario
            if (!valor) {
                mostrarError(this, 'Por favor ingresa tu número de teléfono');
            }
        }
    });

    // Hacer lo mismo para el teléfono secundario
    const telefonoSecundario = document.getElementById('telefonoSecundario');
    telefonoSecundario.addEventListener('input', function(e) {
        // Eliminar cualquier caracter que no sea número
        let valor = e.target.value.replace(/\D/g, '');
        
        // Limitar a 10 dígitos
        valor = valor.substring(0, 10);
        
        // Actualizar el valor del campo
        e.target.value = valor;
        
        // Validar longitud solo si hay algún valor
        if (valor.length > 0 && valor.length !== 10) {
            mostrarError(this, 'El teléfono debe tener exactamente 10 dígitos');
        } else {
            limpiarError(this);
        }
    });

    // Agregar el event listener para el submit del formulario
    const form = document.getElementById('registroForm');
    form.addEventListener('submit', manejarEnvioFormulario);

    // Inicializar el input de fecha
    initDateInput();

    // Actualizar la validación en tiempo real
    document.getElementById('fechaNacimiento').addEventListener('change', function(e) {
        if (!validarEdad(e.target.value)) {
            e.target.setCustomValidity('Debes ser mayor de edad para registrarte');
            alert('Debes ser mayor de edad para registrarte');
        } else {
            e.target.setCustomValidity('');
        }
    });

    // Agregar listeners para limpiar errores cuando se completen los campos
    const camposRequeridos = [
        'tipoDocumento', 'numeroDocumento', 'nombre', 'apellido',
        'telefono', 'email', 'fechaNacimiento', 'genero',
        'departamento', 'municipio', 'disponibilidad'
    ];

    camposRequeridos.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', function() {
                if (this.value) {
                    // Limpiar error cuando el campo tenga valor
                    this.classList.remove('invalid');
                    const errorDiv = this.parentNode.querySelector('.error-message');
                    if (errorDiv) {
                        errorDiv.remove();
                    }
                }
            });

            // Para inputs de texto, también escuchar el evento input
            if (elemento.type === 'text' || elemento.type === 'email' || elemento.type === 'tel') {
                elemento.addEventListener('input', function() {
                    if (this.value) {
                        this.classList.remove('invalid');
                        const errorDiv = this.parentNode.querySelector('.error-message');
                        if (errorDiv) {
                            errorDiv.remove();
                        }
                    }
                });
            }
        }
    });

    // Agregar listeners especiales para roles que requieren campos adicionales
    document.getElementById('categoria').addEventListener('change', function() {
        const categoria = this.value;
        if (categoria === 'arquitecto' || categoria === 'siso') {
            const experiencia = document.getElementById('experiencia');
            if (experiencia) {
                experiencia.addEventListener('change', function() {
                    if (this.value) {
                        this.classList.remove('invalid');
                        const errorDiv = this.parentNode.querySelector('.error-message');
                        if (errorDiv) {
                            errorDiv.remove();
                        }
                    }
                });
            }

            if (categoria === 'arquitecto') {
                const software = document.getElementById('software');
                if (software) {
                    software.addEventListener('change', function() {
                        if (this.value) {
                            this.classList.remove('invalid');
                            const errorDiv = this.parentNode.querySelector('.error-message');
                            if (errorDiv) {
                                errorDiv.remove();
                            }
                        }
                    });
                }
            }
        }
    });
}

// Modificar la función actualizarCamposCategoria para trabajar con el input oculto
function actualizarCamposCategoria() {
    const categoria = document.getElementById('categoria').value;
    
    // First, remove required attribute from all fields
    document.querySelectorAll('input, select').forEach(input => {
        input.required = false;
    });

    // Hide all fields first
    document.querySelectorAll('.categoria-campos').forEach(campo => {
        campo.classList.add('hidden');
        // Make inputs not required when hidden
        campo.querySelectorAll('input, select').forEach(input => {
            input.required = false;
            // Ensure the input is focusable when visible
            if (campo.classList.contains('hidden')) {
                input.tabIndex = -1;
            } else {
                input.tabIndex = 0;
            }
        });
    });

    if (categoriaConfig[categoria]) {
        // Show relevant fields
        categoriaConfig[categoria].campos.forEach(campoId => {
            const campo = document.getElementById(campoId);
            if (campo) {
                campo.classList.remove('hidden');
                
                // Make visible inputs focusable
                campo.querySelectorAll('input, select').forEach(input => {
                    input.tabIndex = 0;
                });
                
                // Show specialties for técnico/instalador
                if ((categoria === 'tecnico' || categoria === 'instalador') && 
                    campoId === 'tecnico-instalador') {
                    mostrarEspecialidades(categoria);
                }
                
                // Set required fields only for visible elements
                if (categoriaConfig[categoria].required) {
                    categoriaConfig[categoria].required.forEach(fieldId => {
                        const input = document.getElementById(fieldId);
                        if (input && !campo.classList.contains('hidden')) {
                            input.required = true;
                        }
                    });
                }
            }
        });
    }

    // Update form layout
    const form = document.getElementById('registroForm');
    if (categoria === 'tecnico' || categoria === 'instalador') {
        form.classList.add('with-specialties');
    } else {
        form.classList.remove('with-specialties');
    }
}

function mostrarEspecialidades(categoria) {
    const container = document.querySelector('.especialidades-grid');
    container.innerHTML = '';

    if (!document.querySelector('.selected-especialidades')) {
        const selectedContainer = document.createElement('div');
        selectedContainer.className = 'selected-especialidades hidden';
        selectedContainer.innerHTML = `
            <h4>Especialidades seleccionadas:</h4>
            <div class="selected-list"></div>
        `;
        container.parentElement.appendChild(selectedContainer);
    }

    Object.entries(especialidadesConfig[categoria]).forEach(([key, nombre]) => {
        const card = document.createElement('div');
        card.className = 'especialidad-card';
        card.innerHTML = `
            <div class="especialidad-header">
                <span class="especialidad-nombre">${nombre}</span>
                <span class="especialidad-icon">+</span>
            </div>
            <div class="especialidad-content">
                <div class="experiencia-selector" data-especialidad="${key}">
                    <div class="experiencia-option">
                        <input type="radio" name="${key}-exp" id="${key}-exp1" value="1">
                        <label for="${key}-exp1">Menos de 1 año</label>
                    </div>
                    <div class="experiencia-option">
                        <input type="radio" name="${key}-exp" id="${key}-exp2" value="2">
                        <label for="${key}-exp2">Entre 1 y 3 años</label>
                    </div>
                    <div class="experiencia-option">
                        <input type="radio" name="${key}-exp" id="${key}-exp3" value="3">
                        <label for="${key}-exp3">Entre 3 y 5 años</label>
                    </div>
                    <div class="experiencia-option">
                        <input type="radio" name="${key}-exp" id="${key}-exp4" value="4">
                        <label for="${key}-exp4">Más de 5 años</label>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);

        // Event listener para header click con confirmación
        const header = card.querySelector('.especialidad-header');
        header.addEventListener('click', (e) => {
            const card = e.target.closest('.especialidad-card');
            const isSelected = card.classList.contains('selected');
            const especialidadNombre = card.querySelector('.especialidad-nombre').textContent;
            
            if (isSelected) {
                // Si está seleccionada, mostrar confirmación antes de deseleccionar
                showConfirmationDialog(card, especialidadNombre);
            } else {
                // Si no está seleccionada, simplemente seleccionarla
                card.classList.add('selected');
                card.querySelector('.especialidad-icon').textContent = '−';
                actualizarResumenEspecialidades();
            }
        });

        // Event listeners para radio buttons y labels
        card.querySelectorAll('.experiencia-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                
                const card = option.closest('.especialidad-card');
                if (!card.classList.contains('selected')) {
                    card.classList.add('selected');
                    card.querySelector('.especialidad-icon').textContent = '−';
                }
                actualizarResumenEspecialidades();
            });
        });

        // Stop propagation for the entire experiencia-selector
        const experienciaSelector = card.querySelector('.experiencia-selector');
        experienciaSelector.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Add event listeners for radio buttons
        card.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                e.stopPropagation();
                
                // Remove selected class from all options in this group
                const group = radio.closest('.experiencia-selector');
                group.querySelectorAll('.experiencia-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Add selected class to parent option
                const option = radio.closest('.experiencia-option');
                option.classList.add('selected');
                
                // Ensure card is selected
                const card = radio.closest('.especialidad-card');
                if (!card.classList.contains('selected')) {
                    card.classList.add('selected');
                    card.querySelector('.especialidad-icon').textContent = '−';
                }
                
                actualizarResumenEspecialidades();
            });
        });
    });
}

function actualizarResumenEspecialidades() {
    const selectedContainer = document.querySelector('.selected-especialidades');
    const selectedList = selectedContainer.querySelector('.selected-list');
    const selectedCards = document.querySelectorAll('.especialidad-card.selected');

    if (selectedCards.length > 0) {
        selectedContainer.classList.remove('hidden');
        selectedList.innerHTML = '';

        selectedCards.forEach(card => {
            const nombre = card.querySelector('.especialidad-nombre').textContent;
            const experiencia = card.querySelector('input[type="radio"]:checked');
            const experienciaTexto = experiencia ? 
                experiencia.nextElementSibling.textContent : 'Experiencia no especificada';

            const item = document.createElement('div');
            item.className = 'selected-item';
            item.innerHTML = `
                <span>${nombre}</span> - 
                <small>${experienciaTexto}</small>
            `;
            selectedList.appendChild(item);
        });
    } else {
        selectedContainer.classList.add('hidden');
    }
}

function actualizarExperiencia(categoria) {
    const experienciaContainer = document.getElementById('experiencia-container');
    const especialidadesSeleccionadas = document.querySelectorAll('.especialidades-grid input[type="checkbox"]:checked');
    
    if (especialidadesSeleccionadas.length > 0) {
        experienciaContainer.classList.remove('hidden');
        experienciaContainer.innerHTML = '<h3>Años de experiencia</h3>';
        
        especialidadesSeleccionadas.forEach(checkbox => {
            const key = checkbox.dataset.especialidad;
            const nombre = especialidadesConfig[categoria][key];
            
            const expDiv = document.createElement('div');
            expDiv.className = 'experiencia-input-group';
            expDiv.innerHTML = `
                <label for="${key}-exp">${nombre}</label>
                <input type="number" 
                    id="${key}-exp" 
                    min="0" 
                    max="50" 
                    required 
                    placeholder="Años">
            `;
            experienciaContainer.appendChild(expDiv);
        });
    } else {
        experienciaContainer.classList.add('hidden');
    }
}

function validarTerminos() {
    const termsContact = document.getElementById('termsContact');
    const termsPrivacy = document.getElementById('termsPrivacy');
    const submitButton = document.querySelector('.btn[type="submit"]');
    
    const termosAceptados = termsContact.checked && termsPrivacy.checked;
    submitButton.disabled = !termosAceptados;
    submitButton.style.opacity = termosAceptados ? '1' : '0.5';
    
    [termsContact, termsPrivacy].forEach(checkbox => {
        checkbox.parentElement.style.backgroundColor = 
            checkbox.checked ? '#f8f9fa' : '#fff0f0';
    });
}

function validarFormulario() {
    let isValid = true;
    const camposRequeridos = [
        { id: 'tipoDocumento', mensaje: 'Por favor selecciona el tipo de documento' },
        { id: 'numeroDocumento', mensaje: 'Por favor ingresa tu número de documento' },
        { id: 'nombre', mensaje: 'Por favor ingresa tu nombre' },
        { id: 'apellido', mensaje: 'Por favor ingresa tu apellido' },
        { id: 'telefono', mensaje: 'Por favor ingresa tu número de teléfono' },
        { id: 'email', mensaje: 'Por favor ingresa tu correo electrónico' },
        { id: 'fechaNacimiento', mensaje: 'Por favor selecciona tu fecha de nacimiento' },
        { id: 'genero', mensaje: 'Por favor selecciona tu género' },
        { id: 'departamento', mensaje: 'Por favor selecciona tu departamento' },
        { id: 'municipio', mensaje: 'Por favor selecciona tu municipio' },
        { id: 'disponibilidad', mensaje: 'Por favor selecciona tu disponibilidad' }
    ];

    // Limpiar mensajes de error anteriores
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    // Validar cada campo requerido
    camposRequeridos.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (!elemento.value) {
            mostrarError(elemento, campo.mensaje);
            isValid = false;
        } else if (campo.id === 'telefono' && elemento.value.length !== 10) {
            // Validación específica para teléfono
            mostrarError(elemento, 'El teléfono debe tener exactamente 10 dígitos');
            isValid = false;
        }
    });

    // Validar campos específicos según el rol
    const categoria = document.getElementById('categoria').value;
    if (categoria === 'arquitecto' || categoria === 'siso') {
        const experiencia = document.getElementById('experiencia');
        if (!experiencia.value) {
            mostrarError(experiencia, 'Por favor ingresa tus años de experiencia');
            isValid = false;
        }
        
        if (categoria === 'arquitecto') {
            const software = document.getElementById('software');
            if (!software.value) {
                mostrarError(software, 'Por favor ingresa el software que manejas');
                isValid = false;
            }
        }
    }

    return isValid;
}

function mostrarError(elemento, mensaje) {
    elemento.classList.add('invalid');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = mensaje;
    elemento.parentNode.appendChild(errorDiv);
    
    // Hacer scroll al primer error si no está visible
    if (!isElementInViewport(elemento)) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Actualizar la función de manejo del formulario
async function manejarEnvioFormulario(e) {
    e.preventDefault();
    
    if (!validarFormulario()) {
        return;
    }

    // Obtener todos los valores necesarios
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
    const genero = document.getElementById('genero').value;
    const categoria = document.getElementById('categoria').value;

    // Validaciones iniciales con mensajes más claros
    if (!fechaNacimiento) {
        alert('Por favor selecciona tu fecha de nacimiento');
        return;
    }

    if (!genero) {
        alert('Por favor selecciona tu género');
        document.querySelector('.gender-container').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Log de verificación
    console.log('Valores antes de enviar:', {
        fechaNacimiento,
        genero,
        categoria
    });

    try {
        // Preparar datos base con los nombres de campos correctos
        const datosBase = {
            rol: categoria,
            tipo_documento: document.getElementById('tipoDocumento').value,
            numero_documento: document.getElementById('numeroDocumento').value,
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            telefono: document.getElementById('telefono').value,
            telefono_secundario: document.getElementById('telefonoSecundario').value || null,
            email: document.getElementById('email').value,
            departamento: document.getElementById('departamento').value,
            municipio: document.getElementById('municipio').value,
            disponibilidad: document.getElementById('disponibilidad').value,
            fechanacimiento: fechaNacimiento, // Asegurarse de que este campo se envíe
            genero: genero, // Asegurarse de que este campo se envíe
            fecha: new Date().toISOString()
        };

        // Log de verificación de los datos base
        console.log('Datos base a enviar:', datosBase);

        // Añadir datos específicos según el rol
        if (categoria === 'arquitecto' || categoria === 'siso') {
            Object.assign(datosBase, {
                experiencia: document.getElementById('experiencia').value,
                software: categoria === 'arquitecto' ? document.getElementById('software').value : null
            });
        } else if (categoria === 'tecnico' || categoria === 'instalador') {
            const especialidades = obtenerEspecialidadesDetalladas();
            Object.assign(datosBase, especialidades);
        }

        // Log final de todos los datos
        console.log('Datos completos a enviar:', datosBase);

        // Enviar al worker
        const response = await fetch('https://workers-playground-soft-butterfly-c2c6.calidad.workers.dev', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosBase)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error completo:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(errorText);
        }

        mostrarMensajeExito();

    } catch (error) {
        console.error('Error detallado:', error);
        alert('Error al enviar el formulario: ' + error.message);
    }
}

function obtenerEspecialidadesDetalladas() {
    const especialidades = {
        drywall_superboard: false,
        pintura_acabados: false,
        electricidad: false,
        plomeria: false,
        carpinteria: false,
        enchapado: false,
        instalacion_cocinas: false,
        instalacion_pisos: false,
        drywall_superboard_experiencia: null,
        pintura_acabados_experiencia: null,
        electricidad_experiencia: null,
        plomeria_experiencia: null,
        carpinteria_experiencia: null,
        enchapado_experiencia: null,
        instalacion_cocinas_experiencia: null,
        instalacion_pisos_experiencia: null
    };

    // Mantener el mapeo dentro de la función
    const mappings = {
        'Drywall / Superboard': 'drywall_superboard',
        'Pintura y Acabados': 'pintura_acabados',
        'Electricidad': 'electricidad',
        'Plomería': 'plomeria',
        'Carpintería': 'carpinteria',
        'Enchapado': 'enchapado',
        'Instalación de Cocinas': 'instalacion_cocinas',
        'Instalación de Pisos': 'instalacion_pisos'
    };

    document.querySelectorAll('.especialidad-card').forEach(card => {
        const nombre = card.querySelector('.especialidad-nombre').textContent;
        const isSelected = card.classList.contains('selected');
        const experienciaRadio = card.querySelector('input[type="radio"]:checked');
        
        const columnName = mappings[nombre];
        if (columnName) {
            especialidades[columnName] = isSelected;
            if (isSelected && experienciaRadio) {
                especialidades[`${columnName}_experiencia`] = experienciaRadio.nextElementSibling.textContent;
            }
        }
    });

    return especialidades;
}

function recolectarDatosEspecificos(categoria) {
    const datos = {};
    
    if (categoria === 'tecnico' || categoria === 'instalador') {
        // Get specialties and experience
        const especialidadesData = obtenerEspecialidadesDetalladas();
        Object.assign(datos, especialidadesData);
        
    } else if (categoria === 'arquitecto' || categoria === 'siso') {
        datos['Experiencia'] = document.getElementById('experiencia').value;
        datos['Software'] = document.getElementById('software')?.value || '';
    }
    
    return datos;
}

// Update the headers function in your script
function getHeaders(sheetName) {
    if (sheetName === 'Arquitectos y SISO') {
        return [
            'Fecha',
            'Rol',
            'Tipo Documento',
            'Número Documento',
            'Nombre',
            'Apellido',
            'Teléfono',
            'Teléfono Secundario',
            'Email',
            'Departamento',
            'Municipio',
            'Disponibilidad'
        ];
    } else {
        return [
            'Fecha',
            'Rol',
            'Tipo_Documento',
            'Numero_Documento',
            'Nombre',
            'Apellido',
            'Telefono',
            'Telefono_Secundario',
            'Email',
            'Departamento',
            'Municipio',
            'Disponibilidad',
            'Drywall_Superboard',
            'Drywall_Superboard_Experiencia',
            'Pintura_y_Acabados',
            'Pintura_y_Acabados_Experiencia',
            'Electricidad',
            'Electricidad_Experiencia',
            'Plomeria',
            'Plomeria_Experiencia',
            'Carpinteria',
            'Carpinteria_Experiencia',
            'Enchapado',
            'Enchapado_Experiencia',
            'Instalacion_de_Cocinas',
            'Instalacion_de_Cocinas_Experiencia',
            'Instalacion_de_Pisos',
            'Instalacion_de_Pisos_Experiencia'
        ];
    }
}

function validarDocumento(e) {
    const input = e.target;
    const value = input.value.replace(/\D/g, ''); // Remove non-digits
    input.value = value;
}

async function enviarDatosASheets(sheetName, datos) {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sheetName: sheetName,
        datos: datos
      })
    });

    const resultText = await response.text(); // Primero obtenemos el texto bruto

    try {
      const result = JSON.parse(resultText); // Intentamos parsear a JSON
      if (result.status === 'error') {
        throw new Error(result.message);
      }
      return true;
    } catch (error) {
      console.error('Error al parsear respuesta:', resultText);
      throw error;
    }

  } catch (error) {
    console.error('Error enviando datos a Sheets:', error);
    throw error;
  }
}

function mostrarMensajeExito() {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    // Crear mensaje
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h3>¡Registro Exitoso!</h3>
        <p>Gracias por registrarte en Manos Maestras.</p>
        <p>Nos pondremos en contacto contigo pronto.</p>
        <button>Aceptar</button>
    `;

    // Agregar event listener al botón
    const button = successMessage.querySelector('button');
    button.addEventListener('click', () => {
        overlay.remove();
        successMessage.remove();
        window.location.reload(); // Recargar el formulario
    });

    // Agregar al DOM
    document.body.appendChild(overlay);
    document.body.appendChild(successMessage);

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (document.body.contains(overlay)) {
            overlay.remove();
            successMessage.remove();
            window.location.reload();
        }
    }, 5000);
}

function formatDataForSheet(sheetName, datos) {
    const headers = getHeaders(sheetName);
    const formattedData = {};
    
    headers.forEach(header => {
        switch(header) {
            case 'Tipo_Documento':
                formattedData[header] = datos['Tipo Documento'];
                break;
            case 'Numero_Documento':
        }
    });
    
    return formattedData;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initForm);

const validaciones = {
  // Reglas para la tabla "profesionales"
  profesionales: {
    // Campos obligatorios que deben estar presentes
    required: [
      'nombre', 
      'apellido', 
      'tipoDocumento', 
      'numeroDocumento',
      'telefono',
      'email',
      'departamento',
      'municipio',
      'categoria'
    ],
    // Patrones de expresiones regulares para validar el formato
    patterns: {
      nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,  // Solo letras, espacios y tildes, 2-50 caracteres
      apellido: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/, // Solo letras, espacios y tildes, 2-50 caracteres
      numeroDocumento: /^\d{6,12}$/,               // Solo números, 6-12 dígitos
      telefono: /^[0-9]{10}$/,                     // Solo números, exactamente 10 dígitos
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/         // Formato básico de email
    }
  },
  
  // Reglas para la tabla "arquitectos_siso"
  arquitectos_siso: {
    required: [
      'nombre',
      'apellido',
      'tipoDocumento',
      'numeroDocumento',
      'telefono',
      'email',
      'departamento',
      'municipio',
      'experiencia',
      'software'
    ],
    patterns: {
      // Las mismas validaciones de formato que profesionales
      nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
      apellido: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
      numeroDocumento: /^\d{6,12}$/,
      telefono: /^[0-9]{10}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      experiencia: /^\d{1,2}$/                     // Solo números, 1-2 dígitos (0-99 años)
    }
  }
};

function validarEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    // Calcular edad considerando mes y día
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    // Si no ha llegado el mes de cumpleaños, o si es el mes pero no ha llegado el día
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    return edad >= 18;
}

// Actualizar la configuración del input de fecha
function initDateInput() {
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    
    // Calcular la fecha máxima (18 años atrás desde hoy)
    const hoy = new Date();
    const maxDate = new Date(
        hoy.getFullYear() - 18,
        hoy.getMonth(),
        hoy.getDate()
    );
    
    // Formatear la fecha como YYYY-MM-DD
    const maxDateString = maxDate.toISOString().split('T')[0];
    
    // Establecer el atributo max
    fechaNacimiento.setAttribute('max', maxDateString);
}

// Función auxiliar para verificar si un elemento está visible
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Función auxiliar para limpiar error
function limpiarError(elemento) {
    elemento.classList.remove('invalid');
    const errorDiv = elemento.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}