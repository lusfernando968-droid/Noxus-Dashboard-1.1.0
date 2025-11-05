-- Auto-confirmar email no momento do signup (ambiente de desenvolvimento)
-- Atualiza a função handle_new_user para marcar email_confirmed_at

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Confirmar email imediatamente para permitir login sem verificação
  UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = NEW.id;

  -- Criar perfil com valores seguros
  INSERT INTO public.profiles (id, nome_completo, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nome_completo'), ''), 'Usuário'),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '')
  );

  -- Primeiro usuário vira admin automaticamente; demais viram user
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;

  RETURN NEW;
END;
$$;