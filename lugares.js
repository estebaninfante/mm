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
        // Mostrar mensaje de error amigable al usuario
        const depSelect = document.getElementById('departamento');
        depSelect.innerHTML = '<option value="">Error cargando departamentos...</option>';
    }
}

function actualizarMunicipios() {
    const depSelect = document.getElementById('departamento');
    const munSelect = document.getElementById('municipio');
    const departamento = depSelect.value;
    
    // Resetear el select de municipios
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    cargarDepartamentosYCiudades();
    
    // Escuchar cambios en el select de departamento
    const depSelect = document.getElementById('departamento');
    depSelect.addEventListener('change', actualizarMunicipios);
});