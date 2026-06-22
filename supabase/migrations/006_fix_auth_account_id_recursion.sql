-- ============================================================
-- Corrige recursão infinita em auth_account_id()
--
-- A função consulta "users" para achar o account_id do usuário
-- logado, mas a policy de SELECT em "users" ("users see team
-- members") também chama auth_account_id() para filtrar as
-- linhas. Como a função não era SECURITY DEFINER, sua consulta
-- interna a "users" reavaliava a mesma policy, que chamava a
-- função de novo — recursão infinita até esgotar a pilha do
-- Postgres ("stack depth limit exceeded"). Isso quebrava (de
-- forma silenciosa, como erro 500) toda policy que dependa dela:
-- accounts, events, audit_logs e as policies "admin manage *"
-- de guests/gallery_files/gift_lists/gifts.
--
-- Tornar a função SECURITY DEFINER faz sua consulta interna
-- rodar sem RLS, quebrando o ciclo. Isso é seguro aqui porque a
-- função é fixa e só pode retornar o account_id do PRÓPRIO
-- usuário autenticado (auth.uid()), nunca de terceiros.
-- ============================================================

CREATE OR REPLACE FUNCTION auth_account_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_id FROM users WHERE id = auth.uid()
$$;
