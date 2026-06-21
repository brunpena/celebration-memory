-- ============================================================
-- Policies que faltavam para o fluxo de autenticação completo
-- (registro de novo usuário/conta e edição de perfil/conta)
-- ============================================================

-- users — usuário autenticado pode criar e editar seu próprio registro
CREATE POLICY "users insert self" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users update self" ON users
  FOR UPDATE USING (id = auth.uid());

-- accounts — qualquer usuário autenticado pode criar uma conta nova
-- (acontece uma única vez, no registro) e editar a própria conta
CREATE POLICY "authenticated users create account" ON accounts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users update own account" ON accounts
  FOR UPDATE USING (id = auth_account_id());
