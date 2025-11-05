-- Tabelas de cidades e vínculo cliente-cidade
-- Cria suporte persistente para múltiplas cidades por cliente, conforme a UI

-- Tabela de cidades (por usuário)
CREATE TABLE IF NOT EXISTS public.cidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Evitar duplicidade de nomes por usuário (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS cidades_user_nome_unique
  ON public.cidades (user_id, lower(nome));

-- Habilitar RLS e políticas
ALTER TABLE public.cidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias cidades"
  ON public.cidades
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias cidades"
  ON public.cidades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias cidades"
  ON public.cidades
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias cidades"
  ON public.cidades
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_cidades_updated_at
  BEFORE UPDATE ON public.cidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_cidades_user_id ON public.cidades(user_id);

-- Tabela de vínculo clientes_cidades
CREATE TABLE IF NOT EXISTS public.clientes_cidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id TEXT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  cidade_id UUID NOT NULL REFERENCES public.cidades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Evitar vínculos duplicados
CREATE UNIQUE INDEX IF NOT EXISTS clientes_cidades_unique_link
  ON public.clientes_cidades (user_id, cliente_id, cidade_id);

-- Habilitar RLS e políticas
ALTER TABLE public.clientes_cidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus vínculos clientes_cidades"
  ON public.clientes_cidades
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios vínculos clientes_cidades"
  ON public.clientes_cidades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios vínculos clientes_cidades"
  ON public.clientes_cidades
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios vínculos clientes_cidades"
  ON public.clientes_cidades
  FOR DELETE
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_cidades_user_id ON public.clientes_cidades(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cidades_cliente_id ON public.clientes_cidades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cidades_cidade_id ON public.clientes_cidades(cidade_id);