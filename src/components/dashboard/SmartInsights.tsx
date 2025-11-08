import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Brain,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Lightbulb,
  Users,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  RefreshCw
} from "lucide-react";
import { chat as geminiChat, ChatMessage } from "@/integrations/gemini/client";

interface SmartInsightsProps {
  transacoes: any[];
  clientes: any[];
  projetos: any[];
  agendamentos: any[];
}

interface Insight {
  id: string;
  type: 'warning' | 'opportunity' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
  icon: any;
  color: string;
  bgColor: string;
}

// Dados mockados de clientes para demonstração
const mockClients = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@empresa.com",
    phone: "(11) 99999-9999",
    company: "Tech Solutions Ltda",
    value: 15000,
    status: "Ativo",
    lastContact: "2024-01-15",
    opportunity: "Upgrade para plano Premium"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@startup.com",
    phone: "(11) 88888-8888",
    company: "Startup Inovadora",
    value: 8500,
    status: "Potencial",
    lastContact: "2024-01-12",
    opportunity: "Serviços de consultoria adicional"
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    email: "carlos@comercio.com",
    phone: "(11) 77777-7777",
    company: "Comércio Digital",
    value: 22000,
    status: "Negociação",
    lastContact: "2024-01-10",
    opportunity: "Expansão para novos módulos"
  }
];

export function SmartInsights({ transacoes, clientes, projetos, agendamentos }: SmartInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<number>(Date.now());
  const [aiError, setAiError] = useState<string | null>(null);

  const [insights, setInsights] = useState<Insight[]>([
    // Base inicial (fallback) — será substituída por IA quando disponível
    {
      id: '1',
      type: 'warning',
      title: 'Clientes Inativos Detectados',
      description: 'Parte dos clientes está inativa há mais de 60 dias. Risco de churn alto.',
      impact: 'high',
      action: 'Enviar campanha de reativação',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10'
    },
    {
      id: '2',
      type: 'opportunity',
      title: 'Oportunidade de Upsell',
      description: 'Clientes com histórico de pequenos serviços podem aceitar projetos maiores.',
      impact: 'high',
      action: 'Criar proposta personalizada',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
  ]);

  const handleInsightClick = (insight: Insight) => {
    setSelectedInsight(insight);
    setIsModalOpen(true);
  };

  const contextSummary = useMemo(() => {
    try {
      const norm = (v: any) => String(v || '').toLowerCase();

      const clientesCount = clientes?.length || 0;
      const projetosCount = projetos?.length || 0;
      const agendamentosCount = agendamentos?.length || 0;
      const transacoesCount = transacoes?.length || 0;

      // Ticket médio (somente RECEITA)
      const receitas = (transacoes || []).filter((t: any) => norm(t?.tipo) === 'receita');
      const totalReceitas = receitas.reduce((sum: number, t: any) => sum + Number(t?.valor || 0), 0);
      const ticketMedio = receitas.length ? totalReceitas / receitas.length : 0;

      // Recorrência de clientes (clientes com 2+ agendamentos não cancelados)
      const validAg = (agendamentos || []).filter((a: any) => norm(a?.status) !== 'cancelado');
      const porCliente: Record<string, number> = {};
      for (const a of validAg) {
        const cid = String(a?.cliente_id || a?.clienteId || a?.cliente || '');
        if (!cid) continue;
        porCliente[cid] = (porCliente[cid] || 0) + 1;
      }
      const clientesUnicos = Object.keys(porCliente).length;
      const clientesRecorrentes = Object.values(porCliente).filter((n) => n >= 2).length;
      const taxaRecorrencia = clientesUnicos ? Math.round((clientesRecorrentes / clientesUnicos) * 100) : 0;

      // Cancelamentos
      const cancelados = (agendamentos || []).filter((a: any) => norm(a?.status) === 'cancelado').length;
      const taxaCancelamento = agendamentosCount ? Math.round((cancelados / agendamentosCount) * 100) : 0;

      const clientesTop = (clientes || [])
        .map((c: any) => c?.nome)
        .filter((n: any) => typeof n === 'string' && n.trim().length)
        .slice(0, 5);
      const projetosTop = (projetos || [])
        .map((p: any) => p?.titulo)
        .filter((t: any) => typeof t === 'string' && t.trim().length)
        .slice(0, 5);

      return [
        `Clientes(30d): ${clientesCount}`,
        `Projetos(30d): ${projetosCount}`,
        `Agendamentos(30d): ${agendamentosCount}`,
        `Transações(30d): ${transacoesCount}`,
        `Ticket médio: R$ ${Math.round(ticketMedio).toLocaleString('pt-BR')}`,
        `Recorrência: ${taxaRecorrencia}% (${clientesRecorrentes}/${clientesUnicos})`,
        `Cancelamentos: ${cancelados} (${taxaCancelamento}%)`,
        clientesTop.length ? `Clientes foco: ${clientesTop.join(', ')}` : '',
        projetosTop.length ? `Projetos destaque: ${projetosTop.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n');
    } catch {
      return '';
    }
  }, [clientes, projetos, agendamentos, transacoes]);

  function mapTypeToIcon(type: Insight['type']) {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'opportunity':
        return Lightbulb;
      case 'trend':
        return TrendingUp;
      case 'recommendation':
        return Brain;
      default:
        return Brain;
    }
  }

  async function generateAiInsights() {
    setIsRefreshing(true);
    setAiError(null);
    try {
      const sys: ChatMessage = {
        role: 'system',
        content:
          'Você é uma IA de estratégia de negócios. Gere insights práticos baseados nos dados do sistema. Retorne APENAS JSON válido no formato: {"insights":[{"id":"string","type":"warning|opportunity|trend|recommendation","title":"string","description":"string","impact":"high|medium|low","action":"string"}]}.'
      };
      const userPrompt = `Contexto (30d):\n${contextSummary}\n\nRegras:\n- Foque em recomendações acionáveis e sucintas.\n- Use títulos objetivos.\n- Não inclua dados sensíveis.\n- Priorize 4-6 itens.`;
      const response = await geminiChat([sys, { role: 'user', content: userPrompt }]);

      let parsed: any = null;
      try {
        parsed = JSON.parse(response.content);
      } catch {
        // Se não vier JSON, tenta extrair bloco JSON simples
        const match = response.content.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }

      const items: Insight[] = (parsed?.insights || []).map((i: any, idx: number) => {
        const icon = mapTypeToIcon(i.type);
        const colorMap: Record<string, string> = {
          warning: 'text-red-600',
          opportunity: 'text-green-600',
          trend: 'text-blue-600',
          recommendation: 'text-purple-600',
        };
        const bgMap: Record<string, string> = {
          warning: 'bg-red-500/10',
          opportunity: 'bg-green-500/10',
          trend: 'bg-blue-500/10',
          recommendation: 'bg-purple-500/10',
        };
        return {
          id: i.id || String(idx + 1),
          type: i.type,
          title: i.title,
          description: i.description,
          impact: i.impact,
          action: i.action,
          icon,
          color: colorMap[i.type] || 'text-muted-foreground',
          bgColor: bgMap[i.type] || 'bg-muted/20',
        } as Insight;
      });

      if (items.length) {
        setInsights(items);
        setLastRefreshAt(Date.now());
      } else {
        setAiError('A IA não retornou insights válidos. Mantendo base padrão.');
      }
    } catch (e: any) {
      setAiError(e?.message || 'Falha ao gerar insights com a IA');
    } finally {
      setIsRefreshing(false);
    }
  }

  const renderDetailedContent = () => {
    if (!selectedInsight) return null;

    switch (selectedInsight.type) {
      case 'Oportunidade':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Detalhes da Oportunidade</h4>
              <p className="text-green-700 text-sm">{selectedInsight.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clientes Relevantes ({mockClients.length})
              </h4>
              <div className="space-y-3">
                {mockClients.map((client) => (
                  <Card key={client.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{client.name}</h5>
                          <Badge variant={client.status === 'Ativo' ? 'default' : client.status === 'Potencial' ? 'secondary' : 'outline'}>
                            {client.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{client.company}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-green-600">{client.opportunity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">R$ {client.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Potencial</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 'Alerta':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">Detalhes do Alerta</h4>
              <p className="text-red-700 text-sm">{selectedInsight.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Ações Recomendadas
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Entrar em contato com clientes em até 24h</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Revisar estratégia de retenção</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Oferecer benefícios exclusivos</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Tendência':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Análise de Tendência</h4>
              <p className="text-blue-700 text-sm">{selectedInsight.description}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Métricas de Crescimento
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">+23%</div>
                  <div className="text-sm text-muted-foreground">Crescimento mensal</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">R$ 45K</div>
                  <div className="text-sm text-muted-foreground">Receita projetada</div>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">{selectedInsight.description}</p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Mais detalhes sobre este insight estarão disponíveis em breve.
              </p>
            </div>
          </div>
        );
    }
  };
  
  useEffect(() => {
    // Gera automaticamente ao abrir, mas mantém fallback se quota estiver zerada
    generateAiInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Contadores para cards de topo padronizados
  const totalInsights = insights.length;
  const oportunidadesAtivas = insights.filter(i => i.type === 'opportunity').length;
  const recomendacoesAtivas = insights.filter(i => i.type === 'recommendation').length;

  const getImpactBadge = (impact: string) => {
    const label = impact === 'high' ? 'Alto Impacto' : impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto';
    return <Badge variant="outline" className="rounded-full text-xs">{label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'opportunity':
        return Lightbulb;
      case 'trend':
        return TrendingUp;
      case 'recommendation':
        return Brain;
      default:
        return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header minimalista */}
      <Card className="rounded-2xl border border-border/40 bg-background shadow-sm">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Insights Inteligentes</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Análises baseadas em IA para otimizar seu negócio
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={generateAiInsights}
              data-clickable="true"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando…' : 'Gerar com IA'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Chat embutido removido – utilizar apenas o chat flutuante global */}

      {/* Cards de resumo no topo - padrão das outras páginas */}
      {/* Marcador de última atualização (sutil) */}
      <div className="text-xs text-muted-foreground pl-1">Última atualização: {new Date(lastRefreshAt).toLocaleTimeString()}</div>
      {/* Cards de Estatísticas no topo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Insights Ativos</p>
          </div>
          <p className="text-xl font-semibold">
            {totalInsights}
          </p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Potencial de Receita</p>
          </div>
          <p className="text-xl font-semibold">
            R$ 15K
          </p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Clientes Impactados</p>
          </div>
          <p className="text-xl font-semibold">
            20
          </p>
        </Card>

        <Card className="p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Oportunidades Ativas</p>
          </div>
          <p className="text-xl font-semibold">
            {oportunidadesAtivas}
          </p>
        </Card>
      </div>

      {/* Insights Grid minimalista */}
      <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          const TypeIcon = getTypeIcon(insight.type);
          
          return (
            <Card 
              key={insight.id} 
              className="rounded-2xl border border-border/40 bg-background shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              onClick={() => handleInsightClick(insight)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {insight.type}
                        </span>
                      </div>
                    </div>
                    {getImpactBadge(insight.impact)}
                  </div>

                  {/* Content compacto */}
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-sm text-foreground">{insight.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>

                  {/* Indicador de clique */}
                  <div className="flex items-center justify-end pt-2">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedInsight && (
                <>
                  <div className="p-2 rounded-xl bg-primary/10">
                    {(() => {
                      const IconComponent = selectedInsight.icon;
                      return <IconComponent className="w-5 h-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <span className="text-lg font-semibold">{selectedInsight.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const TypeIcon = getTypeIcon(selectedInsight.type);
                        return <TypeIcon className="w-4 h-4 text-muted-foreground" />;
                      })()}
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {selectedInsight.type}
                      </span>
                      {getImpactBadge(selectedInsight.impact)}
                    </div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-6">
            {renderDetailedContent()}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}