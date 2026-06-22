-- Personalização visual da página pública do evento (plano de fundo/header + blocos de texto)
ALTER TABLE events ADD COLUMN page_design JSONB NOT NULL DEFAULT '{}'::jsonb;
