-- Table for architects and SISO professionals
CREATE TABLE arquitectos_siso (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    tipo_documento TEXT NOT NULL,
    numero_documento TEXT NOT NULL UNIQUE,
    nombre TEXT,
    apellido TEXT,
    telefono TEXT,
    telefono_secundario TEXT,
    email TEXT,
    departamento TEXT,
    municipio TEXT,
    rol TEXT CHECK (rol IN ('arquitecto', 'siso')),
    experiencia TEXT,
    software TEXT,
    disponibilidad TEXT
);

-- Enable Row Level Security
ALTER TABLE arquitectos_siso ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Enable read access for all users" ON arquitectos_siso
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON arquitectos_siso
    FOR INSERT WITH CHECK (true);

-- Add indexes
CREATE INDEX idx_arquitectos_siso_rol ON arquitectos_siso(rol);
CREATE INDEX idx_arquitectos_siso_doc ON arquitectos_siso(tipo_documento, numero_documento);

-- Add useful functions
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON arquitectos_siso
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
