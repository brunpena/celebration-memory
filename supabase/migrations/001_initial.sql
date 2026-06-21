-- ============================================================
-- CELEBRATION MEMORY — Schema inicial
-- ============================================================

-- Planos de assinatura
CREATE TABLE plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,             -- basico | pro | enterprise
  max_events INT,                       -- NULL = ilimitado
  max_storage_gb INT,
  max_users  INT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO plans (name, max_events, max_storage_gb, max_users, price_monthly) VALUES
  ('basico',     3,   20,  1,  0),
  ('pro',        15,  200, 5,  99),
  ('enterprise', NULL, NULL, NULL, 299);

-- Contas (agências / clientes)
CREATE TABLE accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  logo_url        TEXT,
  primary_color   TEXT NOT NULL DEFAULT '#7c3aed',
  secondary_color TEXT NOT NULL DEFAULT '#db2777',
  domain          TEXT UNIQUE,
  plan_id         UUID REFERENCES plans(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usuários do sistema (espelha auth.users)
CREATE TABLE users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role       TEXT NOT NULL DEFAULT 'administrador',  -- proprietario | administrador | editor | visualizador
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  date        DATE,
  location    TEXT,
  cover_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'rascunho',  -- rascunho | ativo | encerrado | arquivado
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_account_id ON events(account_id);
CREATE INDEX idx_events_slug       ON events(slug);
CREATE INDEX idx_events_status     ON events(status);

-- Convidados / participantes
CREATE TABLE guests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name       TEXT,
  email      TEXT,
  phone      TEXT,
  message    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_guests_event_id ON guests(event_id);

-- Arquivos da galeria (fotos e vídeos)
CREATE TABLE gallery_files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES guests(id) ON DELETE SET NULL,
  file_url      TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type     TEXT NOT NULL DEFAULT 'photo',   -- photo | video
  file_size     BIGINT NOT NULL DEFAULT 0,
  original_name TEXT,
  is_approved   BOOLEAN NOT NULL DEFAULT true,
  is_favorite   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gallery_files_event_id   ON gallery_files(event_id);
CREATE INDEX idx_gallery_files_file_type  ON gallery_files(file_type);
CREATE INDEX idx_gallery_files_created_at ON gallery_files(created_at);

-- Lista de presentes por evento
CREATE TABLE gift_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT 'Lista de Presentes',
  pix_key     TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Presentes individuais
CREATE TABLE gifts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_list_id  UUID NOT NULL REFERENCES gift_lists(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  value         NUMERIC(10,2),
  image_url     TEXT,
  category      TEXT,
  quantity      INT NOT NULL DEFAULT 1,
  status        TEXT NOT NULL DEFAULT 'disponivel',  -- disponivel | reservado | comprado
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gifts_gift_list_id ON gifts(gift_list_id);

-- Pedidos / compras de presentes
CREATE TABLE gift_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_id       UUID NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  guest_name    TEXT NOT NULL,
  message       TEXT,
  paid          BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Log de auditoria / atividades
CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_account_id  ON audit_logs(account_id);
CREATE INDEX idx_audit_logs_created_at  ON audit_logs(created_at);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_lists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;

-- Helper: retorna o account_id do usuário logado
CREATE OR REPLACE FUNCTION auth_account_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT account_id FROM users WHERE id = auth.uid()
$$;

-- accounts
CREATE POLICY "users see own account" ON accounts
  FOR SELECT USING (id = auth_account_id());

-- users
CREATE POLICY "users see team members" ON users
  FOR SELECT USING (account_id = auth_account_id());

-- events
CREATE POLICY "users manage own events" ON events
  FOR ALL USING (account_id = auth_account_id());

-- Leitura pública dos eventos ativos (para as páginas /e/[slug])
CREATE POLICY "public read active events" ON events
  FOR SELECT USING (status IN ('ativo', 'encerrado'));

-- guests — leitura pública (convidados inserem a si mesmos)
CREATE POLICY "public insert guests" ON guests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND status = 'ativo')
  );
CREATE POLICY "admin read guests" ON guests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND account_id = auth_account_id())
  );

-- gallery_files
CREATE POLICY "public insert gallery files" ON gallery_files
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND status = 'ativo')
  );
CREATE POLICY "public read approved gallery files" ON gallery_files
  FOR SELECT USING (is_approved = true);
CREATE POLICY "admin manage gallery files" ON gallery_files
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND account_id = auth_account_id())
  );

-- gift_lists / gifts
CREATE POLICY "public read gift lists" ON gift_lists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND status IN ('ativo', 'encerrado'))
  );
CREATE POLICY "admin manage gift lists" ON gift_lists
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND account_id = auth_account_id())
  );
CREATE POLICY "public read gifts" ON gifts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gift_lists gl
      JOIN events e ON e.id = gl.event_id
      WHERE gl.id = gift_list_id AND e.status IN ('ativo', 'encerrado')
    )
  );
CREATE POLICY "admin manage gifts" ON gifts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gift_lists gl
      JOIN events e ON e.id = gl.event_id
      WHERE gl.id = gift_list_id AND e.account_id = auth_account_id()
    )
  );

-- gift_orders
CREATE POLICY "public insert gift orders" ON gift_orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read gift orders" ON gift_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gifts g
      JOIN gift_lists gl ON gl.id = g.gift_list_id
      JOIN events e ON e.id = gl.event_id
      WHERE g.id = gift_id AND e.account_id = auth_account_id()
    )
  );

-- audit_logs
CREATE POLICY "admin manage logs" ON audit_logs
  FOR ALL USING (account_id = auth_account_id());

-- ============================================================
-- Storage bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-files', 'event-files', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public upload event files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-files');

CREATE POLICY "public read event files" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-files');

CREATE POLICY "admin delete event files" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-files' AND auth.uid() IS NOT NULL);
