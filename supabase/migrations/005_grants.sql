-- ============================================================
-- GRANTs de tabela para anon/authenticated
--
-- O Postgres verifica os GRANTs de tabela ANTES de avaliar as
-- policies de RLS. Sem GRANT, toda query via PostgREST falha com
-- "permission denied for table X", independente das policies
-- estarem corretas. Este projeto nunca teve esses GRANTs
-- configurados no schema public, então nenhuma operação direta
-- de tabela (fora das funções SECURITY DEFINER) funcionava.
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Garante que tabelas/sequences/funções criadas em futuras
-- migrations (sempre como "postgres") também recebam o GRANT
-- automaticamente, sem precisar repetir isso manualmente.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
