import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadConfig, saveConfig, type PlatformConfig } from "@/lib/platform-config";

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
          body: JSON.stringify({
            keyword: cfg.keyword,
            offerTitle: cfg.offerTitle,
            offerDescription: cfg.offerDescription,
            offerPrice: cfg.offerPrice,
            ctaLink: cfg.ctaLink,
            totalSlots: cfg.totalSlots,
          }),
        });
      }
      setStatus("Configurações salvas com sucesso.");
    } catch {
      setStatus("Salvo localmente, mas falhou ao enviar para o webhook.");
    } finally {
      setSending(false);
    }
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
      <div className="max-w-xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Painel admin</h1>
          <p className="text-sm text-muted-foreground">Configure a oferta e os webhooks da plataforma.</p>
        </header>

        <form onSubmit={handleSave} className="bg-card border rounded-2xl p-6 space-y-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <Section title="Webhooks">
            <Field label="Webhook de acesso (POST)" hint="Recebe { palavra } e deve retornar { ok, token, ... }">
              <input type="url" value={cfg.accessWebhookUrl} onChange={(e) => setCfg({ ...cfg, accessWebhookUrl: e.target.value })} placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Webhook do admin (POST)" hint="Recebe as configurações salvas">
              <input type="url" value={cfg.adminWebhookUrl} onChange={(e) => setCfg({ ...cfg, adminWebhookUrl: e.target.value })} placeholder="https://..." className={inputCls} />
            </Field>
          </Section>

          <Section title="Oferta">
            <Field label="Palavra-chave de acesso">
              <input value={cfg.keyword} onChange={(e) => setCfg({ ...cfg, keyword: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Título da oferta">
              <input value={cfg.offerTitle} onChange={(e) => setCfg({ ...cfg, offerTitle: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Descrição">
              <textarea value={cfg.offerDescription} onChange={(e) => setCfg({ ...cfg, offerDescription: e.target.value })} rows={3} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço">
                <input value={cfg.offerPrice} onChange={(e) => setCfg({ ...cfg, offerPrice: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Total de vagas">
                <input type="number" min={0} value={cfg.totalSlots} onChange={(e) => setCfg({ ...cfg, totalSlots: Number(e.target.value) })} className={inputCls} />
              </Field>
            </div>
            <Field label="Link do botão CTA">
              <input type="url" value={cfg.ctaLink} onChange={(e) => setCfg({ ...cfg, ctaLink: e.target.value })} className={inputCls} />
            </Field>
          </Section>

          <Section title="Segurança">
            <Field label="Senha do admin">
              <input value={cfg.adminPassword} onChange={(e) => setCfg({ ...cfg, adminPassword: e.target.value })} className={inputCls} />
            </Field>
          </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
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
