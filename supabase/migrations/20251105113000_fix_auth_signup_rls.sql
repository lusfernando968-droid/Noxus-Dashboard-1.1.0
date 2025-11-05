-- Correção de RLS para cadastro de usuário
-- Objetivo: permitir que a trigger `public.handle_new_user` consiga inserir
-- registros em `public.profiles` e `public.user_roles` durante o signup,
-- evitando o erro: "Database error saving new user".

DROP POLICY IF EXISTS "Usuários podem criar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Permitir que a função/trigger (rodando como owner, geralmente postgres)
-- insira o perfil independentemente do contexto JWT
DROP POLICY IF EXISTS "Sistema pode inserir perfis via trigger" ON public.profiles;
CREATE POLICY "Sistema pode inserir perfis via trigger"
  ON public.profiles
  FOR INSERT
  TO postgres
  WITH CHECK (true);

-- Políticas para `public.user_roles`
-- Permitir inserção pela trigger para criar o primeiro admin e os demais como user
DROP POLICY IF EXISTS "Sistema pode inserir roles via trigger" ON public.user_roles;
CREATE POLICY "Sistema pode inserir roles via trigger"
  ON public.user_roles
  FOR INSERT
  TO postgres
  WITH CHECK (true);

-- Observação: mantemos políticas de SELECT/UPDATE existentes e restritivas.
-- Esta migração não altera visibilidade, apenas garante que o fluxo de signup
-- consiga criar os registros necessários.