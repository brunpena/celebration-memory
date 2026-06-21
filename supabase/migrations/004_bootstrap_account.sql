-- ============================================================
-- Bootstrap de conta + usuário no primeiro login/registro
--
-- Problema: a policy de SELECT em "accounts" depende de
-- auth_account_id(), que por sua vez depende de já existir uma
-- linha em "users" com account_id preenchido. No momento da
-- criação da conta esse vínculo ainda não existe, então o
-- INSERT ... RETURNING (feito pelo PostgREST) é bloqueado pela
-- própria policy de SELECT e a transação inteira sofre rollback.
--
-- Esta função roda com privilégios do dono (SECURITY DEFINER),
-- contornando o problema de ovo-e-galinha de forma atômica e seguro
-- (só atua sobre o próprio usuário autenticado).
-- ============================================================

CREATE OR REPLACE FUNCTION bootstrap_account(p_name TEXT, p_account_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_account_id UUID;
  v_email TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  SELECT account_id INTO v_account_id FROM users WHERE id = v_user_id;
  IF v_account_id IS NOT NULL THEN
    RETURN v_account_id;
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

  INSERT INTO accounts (name) VALUES (p_account_name)
  RETURNING id INTO v_account_id;

  INSERT INTO users (id, email, name, role, account_id)
  VALUES (v_user_id, v_email, p_name, 'proprietario', v_account_id)
  ON CONFLICT (id) DO UPDATE SET account_id = v_account_id;

  RETURN v_account_id;
END;
$$;

GRANT EXECUTE ON FUNCTION bootstrap_account(TEXT, TEXT) TO authenticated;
