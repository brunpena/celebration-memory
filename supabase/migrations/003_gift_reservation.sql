-- ============================================================
-- Reserva pública de presentes
-- Convidados não têm permissão de UPDATE em "gifts" (apenas o
-- administrador da conta tem). Esta função roda com privilégios
-- do dono (SECURITY DEFINER) para marcar um presente como
-- reservado de forma atômica e seguro, sem abrir RLS de UPDATE
-- para o público.
-- ============================================================

CREATE OR REPLACE FUNCTION reserve_gift(p_gift_id UUID, p_guest_name TEXT, p_message TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE gifts SET status = 'reservado' WHERE id = p_gift_id AND status = 'disponivel';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este presente não está mais disponível.';
  END IF;

  INSERT INTO gift_orders (gift_id, guest_name, message)
  VALUES (p_gift_id, p_guest_name, p_message);
END;
$$;

GRANT EXECUTE ON FUNCTION reserve_gift(UUID, TEXT, TEXT) TO anon, authenticated;
