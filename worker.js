const supabaseUrl = 'https://pqwgflxtvhndxpkjnjjn.supabase.co';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi6InBxd2dmbHh0dmhuZHhwa2puampuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NjAxNzQsImV4cCI6MjA1NDUzNjE3NH0.U4o51TxRWI4-K2cdG4t3mr4l5Rh0L2AwhK-7nSyixWU';

export default {
  async fetch(request, env) {
    // Validar CORS con origen específico
    const allowedOrigins = ['https://manosmaestras.com', 'http://localhost:5500', 'https://estebaninfante.github.io/mm/'];
    const origin = request.headers.get('Origin');
    
    if (!allowedOrigins.includes(origin)) {
      return new Response('Origen no permitido', { status: 403 });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Validaciones y configuración
    const validaciones = {
      profesionales: {
        required: [
          'nombre', 
          'apellido', 
          'tipoDocumento', 
          'numeroDocumento', 
          'telefono', 
          'email',
          'fechaNacimiento',
          'genero',
          'departamento',
          'municipio',
          'disponibilidad',
          'rol'
        ],
        patterns: {
          nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
          apellido: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
          numeroDocumento: /^\d{6,12}$/,
          telefono: /^[0-9]{10}$/,
          telefonoSecundario: /^[0-9]{10}$|^$/,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          fechaNacimiento: /^\d{4}-\d{2}-\d{2}$/,
          genero: /^(masculino|femenino|otro)$/,
          rol: /^(tecnico|instalador)$/,
          disponibilidad: /^(inmediata|proximo|proyectos)$/
        },
        allowedValues: {
          tipoDocumento: ['CC', 'CE', 'PA']
        }
      },
      otros_profesionales: {
        required: [
          'nombre',
          'apellido',
          'tipoDocumento',
          'numeroDocumento',
          'telefono',
          'email',
          'fechaNacimiento',
          'genero',
          'departamento',
          'municipio',
          'disponibilidad',
          'rol'
        ],
        patterns: {
          nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
          apellido: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
          numeroDocumento: /^\d{6,12}$/,
          telefono: /^[0-9]{10}$/,
          telefonoSecundario: /^[0-9]{10}$|^$/,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          fechaNacimiento: /^\d{4}-\d{2}-\d{2}$/,
          genero: /^(masculino|femenino|otro)$/,
          rol: /^(ayudante|aseador)$/,
          disponibilidad: /^(inmediata|proximo|proyectos)$/
        },
        allowedValues: {
          tipoDocumento: ['CC', 'CE', 'PA']
        }
      }
    };

    try {
      // Validación de Content-Type
      const contentType = request.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        return new Response(JSON.stringify({
          error: 'Tipo de contenido no válido',
          details: 'Se requiere application/json'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      let requestBody;
      try {
        requestBody = await request.json();
      } catch (e) {
        return new Response(JSON.stringify({
          error: 'JSON inválido',
          details: 'El cuerpo de la solicitud no es un JSON válido'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Limitar el tamaño de los datos
      const bodySize = JSON.stringify(requestBody).length;
      if (bodySize > 100000) { // 100KB límite
        return new Response(JSON.stringify({
          error: 'Tamaño de datos excedido',
          details: 'El tamaño de los datos supera el límite permitido'
        }), {
          status: 413,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // Determinar tabla y validar datos
      const endpoint = new URL(request.url).pathname.split('/').pop();
      let tableName;

      // Determinar la tabla según el rol, no solo por el endpoint
      if (endpoint === 'arquitectos-siso') {
        tableName = 'arquitectos_siso';
      } else {
        // Para los demás endpoints, revisar el rol
        if (requestBody.rol === 'ayudante' || requestBody.rol === 'aseador') {
          tableName = 'otros_profesionales';
        } else {
          tableName = 'profesionales';
        }
      }
      
      // Validar datos
      const validationResult = validateData(requestBody, validaciones[tableName]);
      if (!validationResult.isValid) {
        return new Response(JSON.stringify({
          error: 'Datos inválidos',
          details: validationResult.errors
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Sanitizar datos antes de enviar a Supabase
      const sanitizedData = sanitizeData(validationResult.data);

      // Validación adicional para fechas
      if (sanitizedData.fechaNacimiento) {
        const birthDate = new Date(sanitizedData.fechaNacimiento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        // Verificar que sea mayor de 18 años
        if (age < 18 || (age === 18 && today.getMonth() < birthDate.getMonth()) || 
            (age === 18 && today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
          return new Response(JSON.stringify({
            error: 'Edad no válida',
            details: 'Debes ser mayor de edad para registrarte'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }

      // Enviar a Supabase usando las variables de entorno
      const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(JSON.stringify({
          error: 'Error de base de datos',
          details: `Error al guardar datos: ${errorText}`,
          status: response.status
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const responseData = await response.json();
      return new Response(JSON.stringify({
        success: true,
        message: 'Datos guardados correctamente',
        data: responseData
      }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Error interno:', error);
      return new Response(JSON.stringify({
        error: 'Error interno del servidor',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

function validateData(data, validationRules) {
  const errors = [];
  const validatedData = {};
  
  // Validar campos requeridos
  for (const field of validationRules.required) {
    if (!data[field] && data[field] !== 0) {
      errors.push(`Campo requerido: ${field}`);
    } else {
      validatedData[field] = data[field];
    }
  }

  // Validar patrones
  for (const [field, pattern] of Object.entries(validationRules.patterns)) {
    if (data[field] && !pattern.test(data[field])) {
      errors.push(`Formato inválido: ${field}`);
    } else if (data[field]) {
      validatedData[field] = data[field];
    }
  }

  // Validar valores permitidos
  if (validationRules.allowedValues) {
    for (const [field, allowedValues] of Object.entries(validationRules.allowedValues)) {
      if (data[field] && !allowedValues.includes(data[field])) {
        errors.push(`Valor no permitido para: ${field}`);
      }
    }
  }

  // Validar especialidades para técnicos e instaladores
  if ((data.rol === 'tecnico' || data.rol === 'instalador') && data.especialidades) {
    // Validar estructura y contenido de especialidades
    if (typeof data.especialidades !== 'object') {
      errors.push('Formato inválido para especialidades');
    } else {
      validatedData.especialidades = data.especialidades;
    }
  }

  // Campos opcionales que pasen la validación
  for (const [key, value] of Object.entries(data)) {
    if (!validatedData[key] && value !== null && value !== undefined) {
      // Solo incluir campos válidos que no estén ya incluidos
      if (key !== 'especialidades' || (data.rol !== 'tecnico' && data.rol !== 'instalador')) {
        validatedData[key] = value;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: validatedData
  };
}

function sanitizeData(data) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Sanitización más estricta para prevenir inyecciones
      sanitized[key] = value
        .trim()
        .replace(/<[^>]*>/g, '') // Remover tags HTML
        .replace(/('|"|\|\\)/g, '') // Remover comillas y barras invertidas (para prevenir SQL injection)
        .replace(/(\r\n|\n|\r)/g, ' ') // Reemplazar saltos de línea por espacios
        .replace(/--/g, '') // Prevenir comentarios SQL
        .replace(/;/g, '') // Prevenir terminadores de sentencias SQL
        .substring(0, 1000); // Limitar longitud
    } else if (typeof value === 'object' && value !== null) {
      // Para objetos como especialidades, sanitizamos recursivamente
      sanitized[key] = JSON.stringify(sanitizeNestedObject(value));
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function sanitizeNestedObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => 
      typeof item === 'object' && item !== null 
        ? sanitizeNestedObject(item) 
        : sanitizeValue(item)
    );
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeNestedObject(value);
    } else {
      sanitized[key] = sanitizeValue(value);
    }
  }
  return sanitized;
}

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .trim()
      .replace(/<[^>]*>/g, '')
      .replace(/('|"|\|\\)/g, '')
      .replace(/(\r\n|\n|\r)/g, ' ')
      .replace(/--/g, '')
      .replace(/;/g, '')
      .substring(0, 500);
  }
  return value;
}
