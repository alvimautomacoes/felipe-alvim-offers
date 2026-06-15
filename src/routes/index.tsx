import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  loadConfig,
  saveAccess,
  fetchConfigFromSupabase,
  saveConfigToSupabase,
  type PlatformConfig,
} from "@/lib/platform-config";
import { LockKeyhole, Sparkles, UserCheck, Flame } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acesso Exclusivo — Nutri Felipe Alvim" },
      {
        name: "description",
        content:
          "Insira sua palavra-chave para acessar a oferta exclusiva do nutricionista Felipe Alvim.",
      },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  const navigate = useNavigate();
  const [palavra, setPalavra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cfg, setCfg] = useState<PlatformConfig | null>(null);
  const [slots, setSlots] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const live = await fetchConfigFromSupabase();
        setCfg(live);
        setSlots(live.totalSlots || 10);
      } catch {
        const local = loadConfig();
        setCfg(local);
        setSlots(local.totalSlots || 10);
      }
    }
    load();
    const redirectErr = sessionStorage.getItem("fa_entry_error");
    if (redirectErr) {
      setError(redirectErr);
      sessionStorage.removeItem("fa_entry_error");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const dbCfg = await fetchConfigFromSupabase();
      let ok = false;
      let token = "";
      let slotsRemaining: number | undefined;

      if (dbCfg.accessWebhookUrl) {
        const res = await fetch(dbCfg.accessWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ palavra: palavra.trim(), vagas: dbCfg.totalSlots }),
        });
        const data = await res.json();
        ok = !!data?.ok;
        token = data?.token ?? "";
        slotsRemaining = data?.slotsRemaining ?? data?.vagas ?? data?.slots;
      } else {
        // Fallback local: compara com a palavra-chave configurada
        ok = !!dbCfg.keyword && palavra.trim().toLowerCase() === dbCfg.keyword.trim().toLowerCase();
        token = ok ? "local-" + Date.now() : "";
        slotsRemaining = dbCfg.totalSlots;
      }

      if (ok) {
        // Reduz em 1 as vagas e salva no banco de dados para criar escassez real cooperativa
        const nextSlots = Math.max(0, dbCfg.totalSlots - 1);
        dbCfg.totalSlots = nextSlots;
        await saveConfigToSupabase(dbCfg);

        saveAccess({
          token: token || "local-auto-" + Date.now(),
          slotsRemaining:
            slotsRemaining !== undefined ? Math.max(0, slotsRemaining - 1) : nextSlots,
        });
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
        style={{
          background: "radial-gradient(circle, var(--gold-deep) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
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
        {/* Brand Logo Integration */}
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <div className="p-3.5 rounded-full bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] mb-4 animate-fade-in text-amber-400">
            <Sparkles className="h-8 w-8" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-white mt-2">
            Acesso <span className="text-gold-gradient">Reservado</span>
          </h1>
          <p className="mt-2 text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
            Insira o código secreto recebido na sua conversa privada para liberar seus benefícios de
            acompanhamento exclusivo.
          </p>
        </div>

        {/* Modern Urgency Widget */}
        {slots !== null && (
          <div className="mb-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 hover:from-amber-500/15 border border-amber-500/25 rounded-3xl p-5 text-center backdrop-blur-md relative overflow-hidden shadow-[0_8px_32px_0_rgba(197,160,89,0.1)] animate-[pulse_3s_infinite_ease-in-out]">
            {/* Ambient background glow and pattern */}
            <div className="absolute -left-12 -top-12 w-28 h-28 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
            <div className="absolute right-3 top-3 opacity-15">
              <Flame className="h-10 w-10 text-amber-500" />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>INSCRIÇÕES ALTAMENTE LIMITADAS</span>
            </div>

            <p className="mt-2 text-sm font-medium text-white/90">
              {slots > 0 ? (
                <>
                  Restam apenas{" "}
                  <span className="text-gold font-bold text-lg px-0.5 animate-pulse">
                    {slots} {slots === 1 ? "vaga" : "vagas"}
                  </span>{" "}
                  disponíveis esta semana!
                </>
              ) : (
                <span className="text-rose-400 font-bold">
                  Vagas esgotadas para esta semana! Fila de espera ativa.
                </span>
              )}
            </p>

            {/* Gold premium progress bar */}
            <div className="mt-4 w-full bg-black/40 h-3 rounded-full p-[2px] border border-white/5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 h-full rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (1 - slots / Math.max(slots ?? 10, 10)) * 100),
                  )}%`,
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-white/45 px-0.5 font-mono">
              <span className="font-semibold text-amber-500/90">
                {Math.max(0, Math.max(slots ?? 10, 10) - slots)} preenchidas
              </span>
              <span>Apenas {slots} restantes</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div
          className="rounded-3xl p-px"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--gold) 25%, transparent), color-mix(in oklab, var(--gold) 5%, transparent))",
            boxShadow: "var(--shadow-noir)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-[calc(theme(borderRadius.3xl)-1px)] p-7 flex flex-col"
            style={{ background: "var(--noir-soft)" }}
          >
            <label
              className="text-xs uppercase tracking-widest font-semibold mb-2.5 text-gold-soft"
              htmlFor="palavra"
              style={{ color: "var(--gold-soft)" }}
            >
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
          <p className="text-xs text-white/40 tracking-wider">Nutricionista Felipe Alvim</p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
            Acompanhamento Nutricional Exclusivo
          </p>
        </div>
      </div>
    </main>
  );
}
