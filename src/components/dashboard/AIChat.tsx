import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chat as geminiChat, ChatMessage } from "@/integrations/gemini/client";
import { Bot, Send, Loader2 } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "system", content: "Você é um assistente de IA focado em gerar insights práticos sobre clientes, projetos, agenda e financeiro da Noxus." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeContext, setIncludeContext] = useState(true);
  const { user } = useAuth();
  const { clientes, projetos, agendamentos, transacoes, isLoading: dataLoading } = useDashboardData("30d");

  function buildContextSummary() {
    try {
      const norm = (v: any) => String(v || "").toLowerCase();
      const clientesNomes = (clientes || [])
        .map((c: any) => c?.nome)
        .filter((n: any) => typeof n === "string")
        .slice(0, 5);
      const projetosTitulos = (projetos || [])
        .map((p: any) => p?.titulo)
        .filter((t: any) => typeof t === "string")
        .slice(0, 5);
      const agendasResumo = (agendamentos || [])
        .slice(0, 3)
        .map((a: any) => `${a?.status || ""}`)
        .filter((s: any) => typeof s === "string" && s.length > 0);

      const linhas = [
        `Usuário: ${user?.email || "(não autenticado)"}`,
        `Clientes (30d): ${clientes?.length || 0}`,
        `Projetos (30d): ${projetos?.length || 0}`,
        `Agendamentos (30d): ${agendamentos?.length || 0}`,
        `Transações (30d): ${transacoes?.length || 0}`,
      ];

      if (clientesNomes.length) {
        linhas.push(`Clientes em foco: ${clientesNomes.join(", ")}`);
      }
      if (projetosTitulos.length) {
        linhas.push(`Projetos em destaque: ${projetosTitulos.join(", ")}`);
      }
      if (agendasResumo.length) {
        linhas.push(`Agenda (amostra): ${agendasResumo.join(", ")}`);
      }

      // Resumo financeiro com acesso direto aos valores
      const receitasTotal = (transacoes || [])
        .filter((t: any) => norm(t?.tipo) === "receita")
        .reduce((sum: number, t: any) => sum + Number(t?.valor || 0), 0);
      const despesasTotal = (transacoes || [])
        .filter((t: any) => norm(t?.tipo) === "despesa")
        .reduce((sum: number, t: any) => sum + Number(t?.valor || 0), 0);
      const saldo = receitasTotal - despesasTotal;

      const receitasLiquidadas = (transacoes || [])
        .filter((t: any) => norm(t?.tipo) === "receita" && !!t?.data_liquidacao)
        .reduce((sum: number, t: any) => sum + Number(t?.valor || 0), 0);
      const receitasPendentes = (transacoes || [])
        .filter((t: any) => norm(t?.tipo) === "receita" && !t?.data_liquidacao)
        .reduce((sum: number, t: any) => sum + Number(t?.valor || 0), 0);
      const despesasLiquidadas = (transacoes || [])
        .filter((t: any) => norm(t?.tipo) === "despesa" && !!t?.data_liquidacao)
        .reduce((sum: number, t: any) => sum + Number(t?.valor || 0), 0);
      const despesasPendentes = (transacoes || [])
        .filter((t: any) => norm(t?.tipo) === "despesa" && !t?.data_liquidacao)
        .reduce((sum: number, t: any) => sum + Number(t?.valor || 0), 0);

      linhas.push(
        `Receitas (30d): R$ ${receitasTotal.toFixed(2)}`,
        `Despesas (30d): R$ ${despesasTotal.toFixed(2)}`,
        `Saldo (30d): R$ ${saldo.toFixed(2)}`,
        `Receitas liquidadas: R$ ${receitasLiquidadas.toFixed(2)} | pendentes: R$ ${receitasPendentes.toFixed(2)}`,
        `Despesas liquidadas: R$ ${despesasLiquidadas.toFixed(2)} | pendentes: R$ ${despesasPendentes.toFixed(2)}`
      );

      // Amostra das últimas transações com valores
      const recentes = (transacoes || [])
        .slice()
        .sort((a: any, b: any) => {
          const da = new Date(a?.data_vencimento || a?.created_at || 0).getTime();
          const db = new Date(b?.data_vencimento || b?.created_at || 0).getTime();
          return db - da;
        })
        .slice(0, 10)
        .map((t: any) => {
          const data = new Date(t?.data_vencimento || t?.created_at || Date.now()).toLocaleDateString("pt-BR");
          const valor = Number(t?.valor || 0).toFixed(2);
          const tipo = (t?.tipo || "-").toString();
          const cat = (t?.categoria || "-").toString();
          const desc = (t?.descricao || "").toString();
          const status = t?.data_liquidacao ? "liquidada" : "pendente";
          return `${data} • ${tipo} • R$ ${valor} • ${cat} • ${status}${desc ? " • " + desc : ""}`;
        });

      if (recentes.length) {
        linhas.push("Últimas transações (amostra):");
        linhas.push(...recentes);
      }

      return linhas.join("\n");
    } catch {
      return "";
    }
  }

  const onSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setError(null);
    const next = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      // Injeta contexto de dados do sistema no primeiro system message
      const sys = messages[0];
      const context = includeContext && !dataLoading ? buildContextSummary() : "";
      const sysWithCtx: ChatMessage = context
        ? { role: "system", content: `${sys.content}\n\nContexto do sistema (30d):\n${context}\n\nUse o contexto acima para responder com recomendações práticas.` }
        : sys;
      const msgsForAI = [sysWithCtx, ...messages.slice(1), { role: "user", content: trimmed }];
      const reply = await geminiChat(msgsForAI);
      setMessages([...next, reply]);
    } catch (e: any) {
      setError(e?.message || "Falha ao consultar a IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border/40 bg-background shadow-sm h-full flex flex-col">
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Chat de IA (Insights)</CardTitle>
            <p className="text-xs text-muted-foreground">Converse com a IA para obter recomendações e análises.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1 min-h-0 flex flex-col">
        <div className="space-y-4 flex-1 min-h-0 flex flex-col">
          {/* Context toggle */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox id="ctx" checked={includeContext} onCheckedChange={(v) => setIncludeContext(Boolean(v))} />
            <label htmlFor="ctx">Incluir contexto do sistema (últimos 30 dias)</label>
            {includeContext && dataLoading && (
              <span className="ml-2">Carregando dados…</span>
            )}
          </div>
          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-border/40 p-3 bg-muted/20">
            {messages.filter(m => m.role !== "system").length === 0 ? (
              <p className="text-sm text-muted-foreground">Faça uma pergunta, por exemplo: "Quais oportunidades de upsell vejo esta semana?"</p>
            ) : (
              <div className="space-y-3">
                {messages.filter(m => m.role !== "system").map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Pensando…
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Input
              placeholder="Digite sua pergunta…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <Button onClick={onSend} disabled={loading} className="gap-2">
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}