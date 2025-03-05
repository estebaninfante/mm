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

// Función para inicializar el formulario
function initForm() {
    // Validación de términos
    const termsInputs = ['termsContact', 'termsPrivacy'].map(id => 
        document.getElementById(id));
    termsInputs.forEach(input => 
        input.addEventListener('change', validarTerminos));
    
    validarTerminos();
    
    // Initial update of fields
    actualizarCamposCategoria();

    // Add document number validation
    const numeroDocumento = document.getElementById('numeroDocumento');
    numeroDocumento.addEventListener('input', validarDocumento);

    // Add event listener for category change
    const categoriaSelect = document.getElementById('categoria');
    categoriaSelect.addEventListener('change', actualizarCamposCategoria);

    // Agregar el event listener para el submit del formulario
    const form = document.getElementById('registroForm');
    form.addEventListener('submit', manejarEnvioFormulario);
}

// Fix actualizarCamposCategoria function
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

        // Event listener for header click
        const header = card.querySelector('.especialidad-header');
        header.addEventListener('click', (e) => {
            const card = e.target.closest('.especialidad-card');
            card.classList.toggle('selected');
            card.querySelector('.especialidad-icon').textContent = 
                card.classList.contains('selected') ? '−' : '+';
            actualizarResumenEspecialidades();
        });

        // Event listeners for radio buttons and labels
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

// Update manejarEnvioFormulario function
async function manejarEnvioFormulario(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const categoria = document.getElementById('categoria').value;
        
        // Determine the correct API endpoint based on role
        const endpoint = (categoria === 'arquitecto' || categoria === 'siso')
            ? "arquitectos-siso"
            : "profesionales";  // Cambiado de "tecnicos" a "profesionales"
        
        const apiUrl = `https://workers-playground-soft-butterfly-c2c6.calidad.workers.dev/api/${endpoint}`;
        
        // Prepare base data (removed created_at field)
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
            disponibilidad: document.getElementById('disponibilidad').value
        };

        // Add role-specific data
        if (categoria === 'arquitecto' || categoria === 'siso') {
            Object.assign(datosBase, {
                experiencia: document.getElementById('experiencia').value,
                software: categoria === 'arquitecto' ? document.getElementById('software').value : null,
            });
        } else {
            // For técnicos e instaladores, add specialties
            Object.assign(datosBase, obtenerEspecialidadesDetalladas());
        }

        console.log(`Enviando datos a: ${apiUrl}`);
        console.log('Datos a enviar:', JSON.stringify(datosBase, null, 2));

        // Send data to Worker
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(datosBase)
        });

        // Log the response status and headers
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }

        const resultado = await response.json();
        console.log('Respuesta del Worker:', resultado);
        
        if (resultado.error) {
            throw new Error(resultado.error);
        }

        mostrarMensajeExito();

    } catch (error) {
        console.error('Error detallado:', error);
        alert('Error al enviar el formulario: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Unirme al equipo';
    }
}

function prepareDatos(categoria) {
    // Your existing data preparation logic
    const datos = {
        'Fecha': new Date().toLocaleString('es-CO'),
        'Rol': categoria,
        // ... rest of your data collection
    };

    // Add role-specific details
    if (categoria === 'tecnico' || categoria === 'instalador') {
        Object.assign(datos, obtenerEspecialidadesDetalladas());
    }

    return datos;
}

// Update obtenerEspecialidadesDetalladas to return boolean values
function obtenerEspecialidadesDetalladas() {
    const especialidades = {};
    const experienciasTexto = {
        '1': 'Menos de 1 año',
        '2': 'Entre 1 y 3 años',
        '3': 'Entre 3 y 5 años',
        '4': 'Más de 5 años'
    };

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
            especialidades[`${columnName}_experiencia`] = isSelected && experienciaRadio 
                ? experienciaRadio.nextElementSibling.textContent 
                : null;
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