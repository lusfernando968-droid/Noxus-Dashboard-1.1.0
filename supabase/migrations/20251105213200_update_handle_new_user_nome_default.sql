-- Garantir que nome_completo nunca seja nulo ao criar perfil
-- Ajusta a função handle_new_user para usar fallback e tratar strings vazias

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nome_completo'), ''), 'Usuário'),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '')
  );

  -- Primeiro usuário vira admin automaticamente
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