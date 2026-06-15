import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loadConfig, saveAccess } from "@/lib/platform-config";
import { LockKeyhole, Sparkles, UserCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acesso Exclusivo — Nutri Felipe Alvim" },
      { name: "description", content: "Insira sua palavra-chave para acessar a oferta exclusiva do nutricionista Felipe Alvim." },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  const navigate = useNavigate();
  const [palavra, setPalavra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cfg = loadConfig();
    setLoading(true);
    try {
      let ok = false;
      let token = "";
      let slotsRemaining: number | undefined;

      if (cfg.accessWebhookUrl) {
        const res = await fetch(cfg.accessWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ palavra: palavra.trim() }),
        });
        const data = await res.json();
        ok = !!data?.ok;
        token = data?.token ?? "";
        slotsRemaining = data?.slotsRemaining;
      } else {
        // Fallback local: compara com a palavra-chave configurada
        ok = !!cfg.keyword && palavra.trim().toLowerCase() === cfg.keyword.trim().toLowerCase();
        token = ok ? "local-" + Date.now() : "";
        slotsRemaining = cfg.totalSlots;
      }

      if (ok && token) {
        saveAccess({ token, slotsRemaining });
        navigate({ to: "/oferta" });
      } else {
        setError("Chave secreta inválida. Verifique e tente novamente.");
      }
    } catch {
      setError("Não foi possível validar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-5 py-10 text-white"
      style={{ background: "var(--gradient-noir)" }}
    >
      {/* Decorative gold orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 orb-float"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 orb-float"
        style={{ background: "radial-gradient(circle, var(--gold-deep) 0%, transparent 70%)", animationDelay: "3s" }}
      />
      {/* Grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative w-full max-w-md z-10 animate-fade-up">
        {/* Header content with luxury vibes */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-5 border relative" 
               style={{ 
                 borderColor: "color-mix(in oklab, var(--gold) 40%, transparent)",
                 background: "var(--noir-soft)",
                 boxShadow: "var(--shadow-gold)"
               }}>
            <LockKeyhole className="h-6 w-6 text-gold-soft" style={{ color: "var(--gold-soft)" }} />
            <Sparkles className="h-4 w-4 absolute -top-1.5 -right-1.5 text-gold animate-pulse" style={{ color: "var(--gold)" }} />
          </div>
          
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-gold-gradient">
            Acesso Reservado
          </h1>
          <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
            Insira o código secreto recebido na sua conversa privada para liberar seus benefícios de acompanhamento exclusivo.
          </p>
        </div>

        {/* Form Container */}
        <div 
          className="rounded-3xl p-px"
          style={{
            background: "linear-gradient(180deg, color-mix(in oklab, var(--gold) 25%, transparent), color-mix(in oklab, var(--gold) 5%, transparent))",
            boxShadow: "var(--shadow-noir)"
          }}
        >
          <form 
            onSubmit={handleSubmit} 
            className="rounded-[calc(theme(borderRadius.3xl)-1px)] p-7 flex flex-col"
            style={{ background: "var(--noir-soft)" }}
          >
            <label className="text-xs uppercase tracking-widest font-semibold mb-2.5 text-gold-soft" htmlFor="palavra" style={{ color: "var(--gold-soft)" }}>
              Código de Acesso
            </label>
            
            <div className="relative">
              <input
                id="palavra"
                type="text"
                value={palavra}
                onChange={(e) => setPalavra(e.target.value)}
                placeholder="Insira a palavra-chave secreta"
                autoComplete="off"
                className="w-full px-4 py-3.5 rounded-xl bg-black/40 border focus:outline-none focus:ring-2 text-base text-white placeholder:text-white/30 text-center font-semibold tracking-wide"
                style={{
                  borderColor: "color-mix(in oklab, var(--gold) 35%, transparent)",
                  // @ts-expect-error css var
                  "--tw-ring-color": "var(--gold)",
                }}
                required
              />
            </div>

            {error && (
              <p className="mt-3.5 text-sm text-rose-400 text-center font-medium bg-rose-950/20 py-2.5 px-3 rounded-lg border border-rose-500/10">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !palavra.trim()}
              className="mt-5 w-full py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase transition-transform active:scale-[0.98] hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: "var(--gradient-gold)", color: "var(--noir)" }}
            >
              {loading ? (
                "Verificando..."
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Liberar Acesso
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 space-y-1">
          <p className="text-xs text-white/40 tracking-wider">
            Nutricionista Felipe Alvim
          </p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
            Acompanhamento Nutricional Exclusivo
          </p>
        </div>
      </div>
    </main>
  );
}

