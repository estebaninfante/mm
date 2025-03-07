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
          'genero'
        ],
        patterns: {
          nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
          apellido: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
          numeroDocumento: /^\d{6,12}$/,
          telefono: /^[0-9]{10}$/,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          fechaNacimiento: /^\d{4}-\d{2}-\d{2}$/,
          genero: /^(masculino|femenino|otro)$/
        }
      },
      arquitectos_siso: {
        required: [
          'nombre',
          'apellido',
          'tipoDocumento',
          'numeroDocumento',
          'telefono',
          'email',
          'fechaNacimiento',
          'genero',
          'experiencia'
        ],
        patterns: {
          nombre: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
          numeroDocumento: /^\d{6,12}$/,
          experiencia: /^\d{1,2}$/,
          fechaNacimiento: /^\d{4}-\d{2}-\d{2}$/,
          genero: /^(masculino|femenino|otro)$/
        }
      }
    };

    try {
      const requestBody = await request.json();
      
      // Determinar tabla y validar datos
      const endpoint = new URL(request.url).pathname.split('/').pop();
      const tableName = endpoint === 'arquitectos-siso' ? 'arquitectos_siso' : 'profesionales';
      
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

      const responseData = await response.json();
      return new Response(JSON.stringify(responseData), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
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
  
  // Validar campos requeridos
  for (const field of validationRules.required) {
    if (!data[field]) {
      errors.push(`Campo requerido: ${field}`);
    }
  }

  // Validar patrones
  for (const [field, pattern] of Object.entries(validationRules.patterns)) {
    if (data[field] && !pattern.test(data[field])) {
      errors.push(`Formato inválido: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    data
  };
}

function sanitizeData(data) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Eliminar HTML/scripts y caracteres especiales
      sanitized[key] = value
        .trim()
        .replace(/<[^>]*>/g, '')
        .replace(/[^\w\s@.-áéíóúÁÉÍÓÚñÑ]/g, '');
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
