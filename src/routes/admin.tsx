import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  defaultConfig,
  loadConfig,
  saveConfig,
  fetchConfigFromSupabase,
  saveConfigToSupabase,
  type Plan,
  type PlatformConfig,
} from "@/lib/platform-config";
import {
  Settings,
  ShieldAlert,
  KeyRound,
  Plus,
  Trash,
  RotateCcw,
  Save,
  Sparkles,
  LogOut,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Nutri Felipe Alvim" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [cfg, setCfg] = useState<PlatformConfig | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCfg(loadConfig());

    async function syncFromDb() {
      const dbConfig = await fetchConfigFromSupabase();
      setCfg(dbConfig);
    }
    syncFromDb();

    if (typeof window !== "undefined" && sessionStorage.getItem("fa_admin_ok") === "1") {
      setAuthed(true);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const current = loadConfig();
    if (password === current.adminPassword) {
      sessionStorage.setItem("fa_admin_ok", "1");
      setAuthed(true);
    } else {
      setAuthError("Senha incorreta");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!cfg) return;
    setStatus(null);
    setSending(true);

    try {
      const savedToSupabase = await saveConfigToSupabase(cfg);

      if (cfg.adminWebhookUrl) {
        await fetch(cfg.adminWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cfg),
        });
      }

      if (savedToSupabase) {
        setStatus("Configurações salvas no Supabase com sucesso!");
      } else {
        setStatus("Configurações salvas localmente, mas falhou ao sincronizar com o Supabase.");
      }
    } catch {
      setStatus("Salvo localmente, mas falhou ao sincronizar ou notificar o webhook.");
    } finally {
      setSending(false);
    }
  }

  function updatePlan(idx: number, patch: Partial<Plan>) {
    if (!cfg) return;
    const plans = [...cfg.plans];
    plans[idx] = { ...plans[idx], ...patch };
    setCfg({ ...cfg, plans });
  }

  function addPlan() {
    if (!cfg) return;
    const id = "plano-" + Date.now();
    setCfg({
      ...cfg,
      plans: [
        ...cfg.plans,
        {
          id,
          name: "Novo Plano VIP",
          description: "Descrever os diferenciais deste plano de acompanhamento.",
          price: "R$ 997",
          features: ["Atendimento Individualizado", "Estratégia Nutricional"],
          whatsappMessage:
            "Olá Felipe! Meu nome é {nome} e quero garantir o desconto no plano {plano}.",
        },
      ],
    });
  }

  function removePlan(idx: number) {
    if (!cfg) return;
    if (cfg.plans.length <= 1) return;
    setCfg({ ...cfg, plans: cfg.plans.filter((_, i) => i !== idx) });
  }

  function resetDefaults() {
    if (!confirm("Restaurar configurações padrão do Felipe Alvim?")) return;
    setCfg(defaultConfig);
    setStatus("Configurações originais restauradas.");
  }

  function handleLogout() {
    sessionStorage.removeItem("fa_admin_ok");
    setAuthed(false);
    setPassword("");
  }

  if (!authed) {
    return (
      <main
        className="min-h-screen relative overflow-hidden flex items-center justify-center px-5 py-10 text-white"
        style={{ background: "var(--gradient-noir)" }}
      >
        {/* Decorative gold orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-35 orb-float"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 orb-float"
          style={{
            background: "radial-gradient(circle, var(--gold-deep) 0%, transparent 70%)",
            animationDelay: "3s",
          }}
        />

        <div className="relative w-full max-w-md z-10 animate-fade-up">
          <div
            className="rounded-3xl p-px"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--gold) 25%, transparent), color-mix(in oklab, var(--gold) 5%, transparent))",
              boxShadow: "var(--shadow-noir)",
            }}
          >
            <form
              onSubmit={handleLogin}
              className="rounded-[calc(theme(borderRadius.3xl)-1px)] p-8 flex flex-col"
              style={{ background: "var(--noir-soft)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-black/40 border border-gold/30 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-gold" style={{ color: "var(--gold)" }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Painel Executivo</h1>
                  <p className="text-xs text-white/40 uppercase tracking-widest">Acesso Restrito</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-xs uppercase tracking-wider text-gold-soft font-semibold mb-2"
                    style={{ color: "var(--gold-soft)" }}
                  >
                    Senha de Administrador
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3.5 rounded-xl bg-black/40 border text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/40 transition-all font-mono"
                      style={{ borderColor: "color-mix(in oklab, var(--gold) 25%, transparent)" }}
                      required
                    />
                  </div>
                </div>

                {authError && (
                  <p className="text-sm text-rose-400 font-medium bg-rose-950/20 py-2 px-3 rounded-lg border border-rose-500/10">
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase transition-transform active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  style={{ background: "var(--gradient-gold)", color: "var(--noir)" }}
                >
                  <KeyRound className="h-4 w-4" />
                  Identificar-se
                </button>
              </div>
            </form>
          </div>
          <p className="text-center text-xs text-white/30 mt-6 md:mt-8">
            <Link to="/" className="underline hover:text-white/60">
              Voltar à página de acesso público
            </Link>
          </p>
        </div>
      </main>
    );
  }

  if (!cfg) return null;

  return (
    <main
      className="min-h-screen text-white relative overflow-hidden px-5 py-10 md:py-16"
      style={{ background: "var(--gradient-noir)" }}
    >
      {/* Background orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-20 orb-float"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 animate-fade-up">
          <div className="flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-2xl bg-black/50 border border-gold/30 flex items-center justify-center"
              style={{ boxShadow: "var(--shadow-gold)" }}
            >
              <Settings className="h-6 w-6 text-gold" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display tracking-tight text-gold-gradient">
                Painel de Controle
              </h1>
              <p className="text-xs text-white/50">
                Personalize ofertas, chaves e webhooks para o Instagram
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetDefaults}
              className="px-3.5 py-2 rounded-xl border text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors text-white/70 hover:text-white hover:bg-white/5 border-white/10 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Resetar
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl border text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 border-rose-500/10 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          </div>
        </header>

        <form
          onSubmit={handleSave}
          className="space-y-8 animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          <Card title="Integrações / Webhooks">
            <Field
              label="Webhook de Acesso (POST)"
              hint="Recebe { palavra } e deve retornar { ok, token, slotsRemaining }. Se deixado em branco, a validação é feita localmente pela palavra-chave secreta definida abaixo."
            >
              <input
                type="url"
                value={cfg.accessWebhookUrl}
                onChange={(e) => setCfg({ ...cfg, accessWebhookUrl: e.target.value })}
                placeholder="https://seu-servico.com/api/validar"
                className={inputCls}
                style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
              />
            </Field>

            <Field
              label="Webhook do Painel Admin (POST)"
              hint="Opcional. Recebe todas as configurações atualizadas deste painel em tempo real sempre que você salvar."
            >
              <input
                type="url"
                value={cfg.adminWebhookUrl}
                onChange={(e) => setCfg({ ...cfg, adminWebhookUrl: e.target.value })}
                placeholder="https://seu-servico.com/api/salvar-config"
                className={inputCls}
                style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
              />
            </Field>
          </Card>

          <Card title="Página e Regras de Oferta">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Palavra-chave de Acesso (Padrão)">
                <input
                  value={cfg.keyword}
                  onChange={(e) => setCfg({ ...cfg, keyword: e.target.value })}
                  placeholder="Ex: QUEROVAGA"
                  className={inputCls}
                  style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Vagas Totais">
                  <input
                    type="number"
                    min={0}
                    value={cfg.totalSlots}
                    onChange={(e) => setCfg({ ...cfg, totalSlots: Number(e.target.value) })}
                    className={inputCls}
                    style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                  />
                </Field>
                <Field label="WhatsApp de Envio">
                  <input
                    value={cfg.whatsappNumber}
                    onChange={(e) =>
                      setCfg({ ...cfg, whatsappNumber: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="5561..."
                    className={inputCls}
                    style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                  />
                </Field>
              </div>
            </div>

            <Field label="Headline da Oferta VIP">
              <input
                value={cfg.offerHeadline}
                onChange={(e) => setCfg({ ...cfg, offerHeadline: e.target.value })}
                className={inputCls}
                style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
              />
            </Field>

            <Field label="Subheadline">
              <textarea
                value={cfg.offerSubheadline}
                onChange={(e) => setCfg({ ...cfg, offerSubheadline: e.target.value })}
                rows={2}
                className={inputCls}
                style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
              />
            </Field>
          </Card>

          <Card
            title="Modelos de Planos"
            action={
              <button
                type="button"
                onClick={addPlan}
                className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gold/30 text-gold-soft hover:bg-white/5 cursor-pointer flex items-center gap-1"
                style={{ color: "var(--gold-soft)" }}
              >
                <Plus className="h-3 w-3" />
                Adicionar Plano
              </button>
            }
          >
            <div className="space-y-6">
              {cfg.plans.map((plan, i) => (
                <div
                  key={plan.id}
                  className="rounded-2xl p-5 space-y-4 relative"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid color-mix(in oklab, var(--gold) 10%, transparent)",
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest text-gold-soft"
                      style={{ color: "var(--gold-soft)" }}
                    >
                      Plano 0{i + 1}
                    </span>
                    <button
                      type="button"
                      disabled={cfg.plans.length <= 1}
                      onClick={() => removePlan(i)}
                      className="text-xs text-rose-400 hover:text-rose-300 disabled:opacity-30 cursor-pointer flex items-center gap-1"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nome do Plano">
                      <input
                        value={plan.name}
                        onChange={(e) => updatePlan(i, { name: e.target.value })}
                        className={inputCls}
                        style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                      />
                    </Field>
                    <Field label="Selo / Badge (opcional)">
                      <input
                        value={plan.badge ?? ""}
                        onChange={(e) => updatePlan(i, { badge: e.target.value })}
                        placeholder="Ex: Mais escolhido"
                        className={inputCls}
                        style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                      />
                    </Field>
                  </div>

                  <Field label="Descrição Curta">
                    <textarea
                      value={plan.description}
                      onChange={(e) => updatePlan(i, { description: e.target.value })}
                      rows={2}
                      className={inputCls}
                      style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Preço Promocional">
                      <input
                        value={plan.price}
                        onChange={(e) => updatePlan(i, { price: e.target.value })}
                        className={inputCls}
                        style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                      />
                    </Field>
                    <Field label="Preço Original (Riscado)">
                      <input
                        value={plan.originalPrice ?? ""}
                        onChange={(e) => updatePlan(i, { originalPrice: e.target.value })}
                        className={inputCls}
                        style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                      />
                    </Field>
                  </div>

                  <Field label="Diferenciais / Benefícios (hum por linha)">
                    <textarea
                      value={plan.features.join("\n")}
                      onChange={(e) =>
                        updatePlan(i, {
                          features: e.target.value
                            .split("\n")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={3}
                      className={inputCls}
                      style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                    />
                  </Field>

                  <Field
                    label="Mensagem do WhatsApp Pré-preenchida"
                    hint="Use {nome} e {plano} para personalizar baseado em quem preencher."
                  >
                    <textarea
                      value={plan.whatsappMessage}
                      onChange={(e) => updatePlan(i, { whatsappMessage: e.target.value })}
                      rows={2}
                      className={inputCls}
                      style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
                    />
                  </Field>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Segurança">
            <Field label="Senha de Acesso ao Painel">
              <input
                type="text"
                value={cfg.adminPassword}
                onChange={(e) => setCfg({ ...cfg, adminPassword: e.target.value })}
                className={inputCls}
                style={{ borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)" }}
              />
            </Field>
          </Card>

          {status && (
            <div
              className="text-sm rounded-xl px-4 py-3.5 border font-semibold flex items-center gap-2 animate-fade-up"
              style={{
                background: "rgba(124, 58, 237, 0.05)",
                borderColor: "color-mix(in oklab, var(--gold) 35%, transparent)",
                color: "var(--gold-soft)",
              }}
            >
              <Sparkles className="h-4 w-4 text-gold shrink-0" style={{ color: "var(--gold)" }} />
              {status}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 active:scale-[0.98] hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            style={{
              background: "var(--gradient-gold)",
              color: "var(--noir)",
              boxShadow: "var(--shadow-gold)",
            }}
          >
            <Save className="h-4 w-4" />
            {sending ? "Salvando Alterações..." : "Confirmar e Gravar Configurações"}
          </button>
        </form>

        <footer className="mt-12 text-center text-xs text-white/30 border-t border-white/5 pt-6">
          <p>Felipe Alvim — Executive Office Administration Portal</p>
          <p className="mt-2">
            <Link to="/" className="underline hover:text-white/60">
              Abrir Portal Público de Vendas
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

const inputCls =
  "w-full mt-1 px-4 py-2.5 rounded-xl bg-black/45 border text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all";

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border rounded-2xl p-6 backdrop-blur-md relative"
      style={{
        background: "var(--noir-soft)",
        borderColor: "color-mix(in oklab, var(--gold) 15%, transparent)",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xs font-semibold uppercase tracking-widest text-gold"
          style={{ color: "var(--gold-soft)" }}
        >
          {title}
        </h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-left text-sm font-medium text-white/90">
      <span className="block text-xs uppercase tracking-wider text-white/60 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-white/40 mt-1 leading-relaxed">{hint}</span>}
    </label>
  );
}
