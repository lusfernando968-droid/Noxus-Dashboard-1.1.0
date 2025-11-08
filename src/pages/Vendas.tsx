import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Users, Briefcase, Calendar, DollarSign, Target, Sparkles, Star, Check, Mail, MessageCircle } from "lucide-react";

export default function Vendas() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // Substitua pelos contatos oficiais
  const WHATSAPP_NUMBER = "5599999999999"; // ex.: 55DDDNNNNNNNN
  const EMAIL_ADDRESS = "vendas@empresa.com";

  const openWhatsApp = () => {
    const text = `Olá! Gostaria de falar com Vendas sobre o SGE.\n\nNome: ${contactName}\nEmail: ${contactEmail}\nMensagem: ${contactMessage}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setContactOpen(false);
  };

  const sendEmail = () => {
    const subject = "Contato SGE - Fale com Vendas";
    const body = `Nome: ${contactName}\nEmail: ${contactEmail}\n\nMensagem:\n${contactMessage}`;
    window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setContactOpen(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Hero */}
      <header className="relative overflow-hidden px-6 pt-20 pb-12 sm:pt-28">
        {/* Fundo animado apenas no herói */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
          <FlickeringGrid
            squareSize={4}
            gridGap={6}
            flickerChance={0.25}
            maxOpacity={0.25}
            className="w-full h-full"
          />
        </div>
        <div className="mx-auto max-w-6xl text-center">
          <Badge className="rounded-xl mb-4" variant="outline">Novo • Inteligente • Eficiente</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">SGE — Sistema de Gestão Empresarial</h1>
          <p className="mt-4 text-muted-foreground text-lg sm:text-xl">
            Organize clientes, projetos, agendamentos e financeiro em um só lugar.
            Insights inteligentes ajudam você a tomar decisões com segurança.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="rounded-2xl">Entrar agora</Button>
            </Link>
            <a href="#recursos">
              <Button size="lg" variant="outline" className="rounded-2xl">Ver recursos</Button>
            </a>
            <Button size="lg" variant="secondary" className="rounded-2xl" onClick={() => setContactOpen(true)}>
              Fale com Vendas
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Já tem conta? Use o botão "Entrar agora" para fazer login.
          </p>
        </div>
      </header>

      {/* Destaques */}
      <section id="recursos" className="px-6 pb-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Clientes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Cadastre, segmente e acompanhe relacionamento e indicações. Visualizações
              flexíveis com lista, grade e tabela para diferentes fluxos.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" /> Projetos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Planeje e acompanhe status, etapas e responsáveis. Tenha visão
              consolidada do progresso com indicadores claros.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Calendário integrado com detalhes de compromissos. Evite conflitos,
              ganhe produtividade e tenha sua agenda sempre organizada.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Controle receitas e despesas com relatórios rápidos. Acompanhe
              tendências e faça planejamentos mais precisos.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> Metas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Defina metas e acompanhe o progresso. Mantenha o foco com métricas
              claras e feedback contínuo.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Insights inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Descubra padrões e oportunidades automaticamente. Tome decisões
              embasadas com análises intuitivas.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="px-6 pb-16">
        <div className="mx-auto max-w-6xl text-center mb-8">
          <Badge className="rounded-xl" variant="secondary">O que dizem nossos clientes</Badge>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Resultados reais no dia a dia</h2>
          <p className="mt-2 text-muted-foreground">Produtividade, organização e clareza para tomar decisões melhores.</p>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex gap-1 text-yellow-500 mb-2">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-500" />))}
              </div>
              <p className="text-sm text-muted-foreground">
                "O SGE reduziu nosso retrabalho e centralizou a visão dos projetos.
                Ficamos mais rápidos para entregar com qualidade."
              </p>
              <div className="mt-4 text-sm">
                <span className="font-semibold">Mariana</span> • Gestora de Projetos
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex gap-1 text-yellow-500 mb-2">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-500" />))}
              </div>
              <p className="text-sm text-muted-foreground">
                "A visão financeira e de metas trouxe previsibilidade. Hoje planejo com
                segurança e consigo acompanhar tendências facilmente."
              </p>
              <div className="mt-4 text-sm">
                <span className="font-semibold">Carlos</span> • Diretor Financeiro
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex gap-1 text-yellow-500 mb-2">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-4 w-4 fill-yellow-500" />))}
              </div>
              <p className="text-sm text-muted-foreground">
                "Agendamentos e clientes integrados simplificaram minha rotina. Finalmente
                tenho tudo em um só lugar e sem confusão."
              </p>
              <div className="mt-4 text-sm">
                <span className="font-semibold">Aline</span> • Consultora
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planos (Pricing) */}
      <section id="planos" className="px-6 pb-20">
        <div className="mx-auto max-w-6xl text-center mb-8">
          <Badge className="rounded-xl" variant="secondary">Planos simples e transparentes</Badge>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Escolha o plano ideal</h2>
          <p className="mt-2 text-muted-foreground">Comece pequeno e evolua quando precisar.</p>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Starter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold">R$ 0</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Clientes e Projetos básicos</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Agendamentos essenciais</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Relatórios simples</li>
              </ul>
              <div className="mt-6">
                <Link to="/auth">
                  <Button className="w-full rounded-xl">Começar grátis</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="rounded-2xl border-primary">
            <CardHeader>
              <CardTitle className="text-xl">Pro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold">R$ 79</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Tudo do Starter</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Financeiro avançado</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Metas com progresso</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Insights inteligentes</li>
              </ul>
              <div className="mt-6">
                <Link to="/auth">
                  <Button className="w-full rounded-xl">Assinar Pro</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Business</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-extrabold">R$ 199</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Tudo do Pro</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Equipes e permissões avançadas</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Suporte prioritário</li>
              </ul>
              <div className="mt-6">
                <Button className="w-full rounded-xl" onClick={() => setContactOpen(true)}>Fale com vendas</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Política de Preços */}
      <section id="politica" className="px-6 pb-16">
        <div className="mx-auto max-w-6xl text-center mb-8">
          <Badge className="rounded-xl" variant="outline">Política de preços</Badge>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Transparente, sem pegadinhas</h2>
          <p className="mt-2 text-muted-foreground">Resumo das regras para contratação e cobrança.</p>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Ciclo de cobrança mensal e cancelamento sem multa.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Upgrade ou downgrade de plano a qualquer momento (ajuste proporcional).</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Cancelamento pelo painel: acesso permanece até o fim do ciclo vigente.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Valores podem variar conforme impostos locais e promoções.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Formas de pagamento: cartão de crédito (outros métodos sob consulta).</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Suporte incluso em todos os planos; prioridade no Business.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Planos e benefícios podem ser atualizados sem aviso prévio.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Uso do Starter é gratuito para começar e avaliar o produto.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Solicite condições especiais para equipes ou volume.</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Dúvidas? Fale com vendas pelo botão do plano Business.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="px-6 pb-24">
        <div className="mx-auto max-w-6xl text-center mb-8">
          <Badge className="rounded-xl" variant="outline">FAQs</Badge>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Perguntas frequentes</h2>
          <p className="mt-2 text-muted-foreground">Respostas rápidas para as dúvidas mais comuns.</p>
        </div>
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Posso mudar de plano depois?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sim. Você pode fazer upgrade ou downgrade a qualquer momento pelo painel. O ajuste é proporcional ao ciclo vigente.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Há limite de usuários ou projetos?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Os limites variam por plano. O Starter atende o uso inicial; Pro e Business ampliam usuários, projetos e recursos avançados.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Como é o suporte?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Todos os planos têm suporte. No Business, o atendimento é prioritário e com SLA diferenciado.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Meus dados estão seguros?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Utilizamos práticas modernas de segurança e controle de acesso. Recomendamos ativar autenticação segura e políticas de equipe.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Posso importar dados existentes?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sim. Oferecemos orientação para importar informações de clientes, projetos e agenda. Fale com vendas para suporte no onboarding.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">O que acontece ao cancelar?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              O acesso permanece até o fim do ciclo atual. Você pode reativar quando quiser fazendo login novamente.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chamada final */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl bg-muted/40 p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Pronto para simplificar sua gestão?</h2>
          <p className="mt-2 text-muted-foreground">
            Comece agora e veja como o SGE acelera seu dia a dia.
          </p>
          <div className="mt-6">
            <Link to="/auth">
              <Button size="lg" className="rounded-2xl">Fazer login e começar</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal: Fale com Vendas */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Fale com Vendas</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo e entre em contato por Email ou WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input placeholder="Seu nome" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="seu@email.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea placeholder="Conte brevemente sua necessidade" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={openWhatsApp}>
              <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
            </Button>
            <Button onClick={sendEmail}>
              <Mail className="h-4 w-4" /> Enviar por Email
            </Button>
          </DialogFooter>
          <p className="text-xs text-muted-foreground mt-2">
            Contatos oficiais: WhatsApp {WHATSAPP_NUMBER} • Email {EMAIL_ADDRESS}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}