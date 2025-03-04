const categoriaConfig = {
    arquitecto: {
        campos: ['arquitecto-siso', 'disponibilidad-section'],
        required: ['experiencia', 'software', 'certificaciones', 'disponibilidad']
    },
    siso: {
        campos: ['arquitecto-siso', 'disponibilidad-section'],
        required: ['experiencia', 'certificaciones', 'disponibilidad']
    },
    tecnico: {
        campos: ['tecnico-instalador', 'certificaciones-section', 'disponibilidad-section'],
        required: ['disponibilidad']
    },
    instalador: {
        campos: ['tecnico-instalador', 'certificaciones-section', 'disponibilidad-section'],
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

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwT_bIbEEymjZQ5bPjbN5OrbxGWPDc2hPzgi1AUPbbDePkAHE1nFMECAdse3vjX5E8A/exec';

// Función para inicializar el formulario
function initForm() {
    // Remove the departamentos logic since it's handled by lugares.js
    
    // Event Listeners
    document.getElementById('categoria').addEventListener('change', actualizarCamposCategoria);
    document.getElementById('registroForm').addEventListener('submit', manejarEnvioFormulario);
    
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

async function manejarEnvioFormulario(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
        const categoria = document.getElementById('categoria').value;
        
        // Prepare base data structure
        const datos = {
            'Fecha': new Date().toLocaleString('es-CO'),
            'Rol': categoria,
            'Tipo_Documento': document.getElementById('tipoDocumento').value,
            'Numero_Documento': document.getElementById('numeroDocumento').value,
            'Nombre': document.getElementById('nombre').value,
            'Apellido': document.getElementById('apellido').value,
            'Telefono': document.getElementById('telefono').value,
            'Telefono_Secundario': document.getElementById('telefonoSecundario').value || 'No especificado',
            'Email': document.getElementById('email').value,
            'Departamento': document.getElementById('departamento').value,
            'Municipio': document.getElementById('municipio').value,
            'Certificaciones': document.getElementById('certificaciones')?.value || '',
            'Disponibilidad': document.getElementById('disponibilidad').value
        };

        // Add role-specific data
        if (categoria === 'arquitecto' || categoria === 'siso') {
            datos['Experiencia'] = document.getElementById('experiencia')?.value || '';
            datos['Software'] = document.getElementById('software')?.value || '';
        } else if (categoria === 'tecnico' || categoria === 'instalador') {
            const especialidadesData = obtenerEspecialidadesDetalladas();
            Object.assign(datos, especialidadesData);
        }

        // Convert data to URL-encoded format
        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(datos)) {
            formData.append(key, value);
        }

        // Create a hidden iframe for the response
        const iframe = document.createElement('iframe');
        iframe.name = 'hidden-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Create the form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = GOOGLE_APPS_SCRIPT_URL;
        form.target = 'hidden-iframe';
        form.style.display = 'none';

        // Add all data as hidden inputs
        for (const [key, value] of Object.entries(datos)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }

        // Add form to body
        document.body.appendChild(form);

        // Submit form and handle response
        form.submit();

        // Show success message after a brief delay
        setTimeout(() => {
            mostrarMensajeExito();
            // Clean up
            document.body.removeChild(form);
            document.body.removeChild(iframe);
        }, 2000);

    } catch (error) {
        console.error('Error en el envío:', error);
        alert('Error al enviar el formulario. Por favor intente nuevamente.');
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

function obtenerEspecialidadesDetalladas() {
    const especialidades = {};
    const experienciasTexto = {
        '1': 'Menos de 1 año',
        '2': 'Entre 1 y 3 años',
        '3': 'Entre 3 y 5 años',
        '4': 'Más de 5 años'
    };

    const mappings = {
        'Drywall / Superboard': 'Drywall_Superboard',
        'Pintura y Acabados': 'Pintura_y_Acabados',
        'Electricidad': 'Electricidad',
        'Plomería': 'Plomeria',
        'Carpintería': 'Carpinteria',
        'Enchapado': 'Enchapado',
        'Instalación de Cocinas': 'Instalacion_de_Cocinas',
        'Instalación de Pisos': 'Instalacion_de_Pisos'
    };

    document.querySelectorAll('.especialidad-card').forEach(card => {
        const nombre = card.querySelector('.especialidad-nombre').textContent;
        const isSelected = card.classList.contains('selected');
        const experienciaRadio = card.querySelector('input[type="radio"]:checked');
        
        const columnName = mappings[nombre];
        if (!columnName) return;
        
        especialidades[columnName] = isSelected ? 'Sí' : 'No';
        
        if (isSelected && experienciaRadio) {
            especialidades[`${columnName}_Experiencia`] = experienciasTexto[experienciaRadio.value];
        } else {
            especialidades[`${columnName}_Experiencia`] = '';
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
            'Certificaciones',
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
            'Certificaciones',
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
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetName: sheetName,
        datos: datos
      })
    });

    if (response.type === 'opaque') {
      // This is expected with no-cors mode
      return true;
    }

    const result = await response.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }

    return true;
  } catch (error) {
    console.error('Error sending data to sheets:', error);
    throw error;
  }
}

function mostrarMensajeExito() {
  const successMessage = document.createElement('div');
  successMessage.className = 'success-message';
  successMessage.innerHTML = `
    <h3>¡Registro Exitoso!</h3>
    <p>Gracias por registrarte en Manos Maestras.</p>
    <p>Nos pondremos en contacto contigo pronto.</p>
    <button onclick="window.location.reload()">Aceptar</button>
  `;
  document.body.appendChild(successMessage);

  // Remove message after 5 seconds
  setTimeout(() => {
    successMessage.remove();
    window.location.reload();
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
                formattedData[header] = datos['Número Documento'];
                break;
            case 'Telefono':
                formattedData[header] = datos['Teléfono'];
                break;
            case 'Telefono_Secundario':
                formattedData[header] = datos['Teléfono Secundario'];
                break;
            default:
                formattedData[header] = datos[header] || '';
        }
    });
    
    return formattedData;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initForm);