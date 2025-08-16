/*
  # MELANO INC CRM Schema
  
  1. New Tables
    - `crm_clientes` 
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)  
      - `phone` (text)
      - `budget` (text)
      - `urgency` (text)
      - `message` (text)
      - `lang` (text, default 'es')
      - `source` (text, default 'landing_page')
      - `status` (text, default 'nuevo')
      - `user_agent` (text)
      - `referrer` (text)
      - `url` (text) 
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `crm_interactions`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `type` (text) -- email, whatsapp, call, meeting
      - `content` (text)
      - `status` (text)
      - `created_at` (timestamp)
      
    - `crm_analytics`
      - `id` (uuid, primary key)
      - `event` (text)
      - `data` (jsonb)
      - `client_id` (uuid, nullable)
      - `session_id` (text)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for service role access
    - Add policies for authenticated users if needed
    
  3. Indexes
    - Email index for quick lookups
    - Created_at indexes for reporting
    - Status indexes for filtering
*/

-- Create crm_clientes table
CREATE TABLE IF NOT EXISTS crm_clientes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text NOT NULL,
    budget text NOT NULL,
    urgency text NOT NULL,
    message text NOT NULL,
    lang text DEFAULT 'es' NOT NULL,
    source text DEFAULT 'landing_page' NOT NULL,
    status text DEFAULT 'nuevo' NOT NULL,
    user_agent text,
    referrer text,
    url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create crm_interactions table
CREATE TABLE IF NOT EXISTS crm_interactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES crm_clientes(id) ON DELETE CASCADE,
    type text NOT NULL, -- email, whatsapp, call, meeting
    content text NOT NULL,
    status text DEFAULT 'pendiente' NOT NULL, -- pendiente, enviado, completado, fallido
    created_at timestamptz DEFAULT now()
);

-- Create crm_analytics table
CREATE TABLE IF NOT EXISTS crm_analytics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event text NOT NULL,
    data jsonb DEFAULT '{}',
    client_id uuid REFERENCES crm_clientes(id) ON DELETE SET NULL,
    session_id text,
    created_at timestamptz DEFAULT now()
);

-- Add updated_at trigger for crm_clientes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_crm_clientes_updated_at'
    ) THEN
        CREATE TRIGGER update_crm_clientes_updated_at 
            BEFORE UPDATE ON crm_clientes 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crm_clientes_email ON crm_clientes(email);
CREATE INDEX IF NOT EXISTS idx_crm_clientes_created_at ON crm_clientes(created_at);
CREATE INDEX IF NOT EXISTS idx_crm_clientes_status ON crm_clientes(status);
CREATE INDEX IF NOT EXISTS idx_crm_clientes_source ON crm_clientes(source);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_client_id ON crm_interactions(client_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_type ON crm_interactions(type);
CREATE INDEX IF NOT EXISTS idx_crm_analytics_event ON crm_analytics(event);
CREATE INDEX IF NOT EXISTS idx_crm_analytics_created_at ON crm_analytics(created_at);

-- Enable Row Level Security
ALTER TABLE crm_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (full access)
CREATE POLICY "Service role has full access to crm_clientes"
    ON crm_clientes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to crm_interactions"
    ON crm_interactions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to crm_analytics"
    ON crm_analytics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for authenticated users (if admin panel is needed later)
CREATE POLICY "Authenticated users can read crm_clientes"
    ON crm_clientes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read crm_interactions"
    ON crm_interactions
    FOR SELECT
    TO authenticated
    USING (true);

-- Insert sample data for testing
INSERT INTO crm_clientes (name, email, phone, budget, urgency, message, lang) VALUES
('Test User', 'test@demo.com', '+5492235506595', '>20000', 'asap', 'Testing MELANO INC system', 'es')
ON CONFLICT (email) DO NOTHING;

-- Create view for reporting
CREATE OR REPLACE VIEW crm_dashboard AS
SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.budget,
    c.urgency,
    c.status,
    c.lang,
    c.source,
    c.created_at,
    COUNT(i.id) as total_interactions,
    MAX(i.created_at) as last_interaction
FROM crm_clientes c
LEFT JOIN crm_interactions i ON c.id = i.client_id
GROUP BY c.id, c.name, c.email, c.phone, c.budget, c.urgency, c.status, c.lang, c.source, c.created_at
ORDER BY c.created_at DESC;

-- Grant access to the view
GRANT SELECT ON crm_dashboard TO service_role;
GRANT SELECT ON crm_dashboard TO authenticated;