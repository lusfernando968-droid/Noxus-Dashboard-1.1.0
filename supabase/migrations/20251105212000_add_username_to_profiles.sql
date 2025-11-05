-- Adicionar coluna opcional 'username' à tabela de perfis
-- Motivo: alguns fluxos de signup estão referenciando profiles.username
-- e falham quando a coluna não existe.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT;

-- Opcional: índice para buscas por username (não único por enquanto)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);