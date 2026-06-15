import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { defaultConfig, loadConfig, saveConfig, type Plan, type PlatformConfig } from "@/lib/platform-config";

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
    saveConfig(cfg);
    try {
      if (cfg.adminWebhookUrl) {
        await fetch(cfg.adminWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cfg),
        });
      }
      setStatus("Configurações salvas com sucesso.");
    } catch {
      setStatus("Salvo localmente, mas falhou ao enviar para o webhook.");
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
          name: "Novo plano",
          description: "",
          price: "R$ 0",
          features: [""],
          whatsappMessage: "Olá Felipe! Meu nome é {nome} e quero o plano {plano}.",
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
    if (!confirm("Restaurar configurações padrão?")) return;
    setCfg(defaultConfig);
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-background">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-card border rounded-2xl p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <h1 className="text-xl font-bold mb-1">Painel admin</h1>
          <p className="text-sm text-muted-foreground mb-4">Acesso restrito.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-xl bg-input border focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
          {authError && <p className="mt-2 text-sm text-destructive">{authError}</p>}
          <button type="submit" className="mt-4 w-full py-3 rounded-xl font-semibold text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
            Entrar
          </button>
        </form>
      </main>
    );
  }

  if (!cfg) return null;

  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Painel admin</h1>
            <p className="text-sm text-muted-foreground">Configure a oferta, os planos e os webhooks.</p>
          </div>
          <button onClick={resetDefaults} className="text-xs text-muted-foreground hover:text-foreground underline">
            Restaurar padrão
          </button>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <Card title="Webhooks">
            <Field label="Webhook de acesso (POST)" hint="Recebe { palavra } e deve retornar { ok, token, slotsRemaining }. Se vazio, valida localmente pela palavra-chave.">
              <input type="url" value={cfg.accessWebhookUrl} onChange={(e) => setCfg({ ...cfg, accessWebhookUrl: e.target.value })} placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Webhook do admin (POST)" hint="Recebe todas as configurações ao salvar.">
              <input type="url" value={cfg.adminWebhookUrl} onChange={(e) => setCfg({ ...cfg, adminWebhookUrl: e.target.value })} placeholder="https://..." className={inputCls} />
            </Field>
          </Card>

          <Card title="Página da oferta">
            <Field label="Palavra-chave de acesso">
              <input value={cfg.keyword} onChange={(e) => setCfg({ ...cfg, keyword: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Título principal">
              <input value={cfg.offerHeadline} onChange={(e) => setCfg({ ...cfg, offerHeadline: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Subtítulo">
              <textarea value={cfg.offerSubheadline} onChange={(e) => setCfg({ ...cfg, offerSubheadline: e.target.value })} rows={2} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total de vagas">
                <input type="number" min={0} value={cfg.totalSlots} onChange={(e) => setCfg({ ...cfg, totalSlots: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label="WhatsApp (DDI+DDD+nº)" hint="Apenas dígitos.">
                <input value={cfg.whatsappNumber} onChange={(e) => setCfg({ ...cfg, whatsappNumber: e.target.value.replace(/\D/g, "") })} className={inputCls} />
              </Field>
            </div>
          </Card>

          <Card
            title="Planos"
            action={
              <button type="button" onClick={addPlan} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-accent text-accent-foreground hover:brightness-95">
                + Adicionar plano
              </button>
            }
          >
            <div className="space-y-5">
              {cfg.plans.map((plan, i) => (
                <div key={plan.id} className="border rounded-xl p-4 space-y-3 bg-background">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plano {i + 1}</span>
                    <button type="button" disabled={cfg.plans.length <= 1} onClick={() => removePlan(i)} className="text-xs text-destructive hover:underline disabled:opacity-40">
                      Remover
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nome">
                      <input value={plan.name} onChange={(e) => updatePlan(i, { name: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Badge (opcional)">
                      <input value={plan.badge ?? ""} onChange={(e) => updatePlan(i, { badge: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Descrição">
                    <textarea value={plan.description} onChange={(e) => updatePlan(i, { description: e.target.value })} rows={2} className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Preço com desconto">
                      <input value={plan.price} onChange={(e) => updatePlan(i, { price: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Preço original (opcional)">
                      <input value={plan.originalPrice ?? ""} onChange={(e) => updatePlan(i, { originalPrice: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Itens inclusos (um por linha)">
                    <textarea
                      value={plan.features.join("\n")}
                      onChange={(e) => updatePlan(i, { features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                      rows={4}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Mensagem do WhatsApp" hint="Use {nome} e {plano} como variáveis.">
                    <textarea value={plan.whatsappMessage} onChange={(e) => updatePlan(i, { whatsappMessage: e.target.value })} rows={3} className={inputCls} />
                  </Field>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Segurança">
            <Field label="Senha do admin">
              <input value={cfg.adminPassword} onChange={(e) => setCfg({ ...cfg, adminPassword: e.target.value })} className={inputCls} />
            </Field>
          </Card>

          {status && <p className="text-sm text-foreground bg-accent rounded-lg px-3 py-2">{status}</p>}

          <button type="submit" disabled={sending} className="w-full py-3 rounded-xl font-semibold text-primary-foreground disabled:opacity-60" style={{ background: "var(--gradient-hero)" }}>
            {sending ? "Salvando..." : "Salvar configurações"}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm";

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card border rounded-2xl p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground mt-1">{hint}</span>}
    </label>
  );
}
