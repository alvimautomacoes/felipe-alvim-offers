import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  buildWhatsappUrl,
  clearAccess,
  fillTemplate,
  loadAccess,
  loadConfig,
  fetchConfigFromSupabase,
  type Plan,
  type PlatformConfig,
} from "@/lib/platform-config";

import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "Oferta Exclusiva — Nutri Felipe Alvim" },
      {
        name: "description",
        content: "Planos de acompanhamento high ticket com condição especial liberada.",
      },
    ],
  }),
  component: OfferPage,
});

function OfferPage() {
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<PlatformConfig | null>(null);
  const [slots, setSlots] = useState<number | undefined>(undefined);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [nome, setNome] = useState("");

  useEffect(() => {
    const access = loadAccess();
    if (!access?.token) {
      navigate({ to: "/" });
      return;
    }

    // Attempt local load first to avoid any visual flicker while Supabase fetches
    const initialConfig = loadConfig();
    setCfg(initialConfig);
    setSlots(access.slotsRemaining ?? initialConfig.totalSlots);

    // Fetch and sync newest settings from live DB
    async function syncDb() {
      const dbConfig = await fetchConfigFromSupabase();
      setCfg(dbConfig);
      setSlots(access.slotsRemaining ?? dbConfig.totalSlots);
    }
    syncDb();
  }, [navigate]);

  const featured = useMemo(() => {
    if (!cfg) return null;
    const found = cfg.plans.find((p) => p.highlighted);
    if (found) return found;
    return cfg.plans[Math.min(1, cfg.plans.length - 1)];
  }, [cfg]);

  if (!cfg) return null;

  function openWhatsapp() {
    if (!selected || !cfg) return;
    const message = fillTemplate(selected.whatsappMessage, {
      nome: nome.trim(),
      plano: selected.name,
    });
    const url = buildWhatsappUrl(cfg.whatsappNumber, message);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main
      className="min-h-screen relative overflow-hidden text-white"
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
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-5 py-12 md:py-20">
        {/* Header */}
        <header className="text-center max-w-2xl mx-auto animate-fade-up flex flex-col items-center">
          <div className="p-3.5 rounded-full bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] mb-6 animate-fade-in text-amber-400">
            <Sparkles className="h-8 w-8" />
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border"
            style={{
              borderColor: "color-mix(in oklab, var(--gold) 40%, transparent)",
              color: "var(--gold-soft)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            Acesso liberado ·{" "}
            {typeof slots === "number"
              ? slots > 0
                ? `${slots} ${slots === 1 ? "vaga restante" : "vagas restantes"}`
                : "vagas esgotadas"
              : "vagas limitadas"}
          </div>
          <h1 className="font-display mt-6 text-4xl md:text-6xl font-semibold leading-[1.05]">
            <span className="text-gold-gradient">{cfg.offerHeadline}</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed">
            {cfg.offerSubheadline}
          </p>
        </header>

        {/* Plans grid */}
        <section className="mt-14 grid gap-6 md:grid-cols-3">
          {cfg.plans.map((plan, i) => {
            const isFeatured = featured?.id === plan.id;
            return (
              <article
                key={plan.id}
                className="relative rounded-3xl p-px animate-fade-up"
                style={{
                  animationDelay: `${i * 100}ms`,
                  background: isFeatured
                    ? "var(--gradient-gold)"
                    : "linear-gradient(180deg, color-mix(in oklab, var(--gold) 25%, transparent), color-mix(in oklab, var(--gold) 5%, transparent))",
                  boxShadow: isFeatured ? "var(--shadow-gold)" : "var(--shadow-noir)",
                }}
              >
                <div
                  className="relative h-full rounded-[calc(theme(borderRadius.3xl)-1px)] p-7 flex flex-col"
                  style={{ background: "var(--noir-soft)" }}
                >
                  {plan.badge && (
                    <span
                      className="self-start text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
                      style={{
                        borderColor: "color-mix(in oklab, var(--gold) 50%, transparent)",
                        color: "var(--gold-soft)",
                        background: "color-mix(in oklab, var(--gold) 10%, transparent)",
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="font-display mt-5 text-2xl font-semibold text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed min-h-[3rem]">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex flex-col gap-1">
                    {plan.originalPrice && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 line-through decoration-rose-500 decoration-2">
                          De {plan.originalPrice}
                        </span>
                        <span className="text-[10px] font-mono text-white/45 uppercase tracking-widest font-semibold">
                          Por apenas
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-5xl font-extrabold text-gold-gradient tracking-tight">
                        {plan.price}
                      </span>
                      {plan.originalPrice && (
                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                          Desconto
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-white/80">
                        <span
                          className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{ background: "var(--gradient-gold)", color: "var(--noir)" }}
                        >
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setSelected(plan);
                      setNome("");
                    }}
                    className="mt-8 w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-transform active:scale-[0.98] hover:brightness-110"
                    style={{
                      background: isFeatured ? "var(--gradient-gold)" : "transparent",
                      color: isFeatured ? "var(--noir)" : "var(--gold-soft)",
                      border: isFeatured
                        ? "none"
                        : "1px solid color-mix(in oklab, var(--gold) 50%, transparent)",
                    }}
                  >
                    Garantir desconto
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="mt-16 text-center text-xs text-white/40">
          Nutricionista Felipe Alvim ·{" "}
          <button
            onClick={() => {
              clearAccess();
              navigate({ to: "/" });
            }}
            className="underline hover:text-white/70"
          >
            Sair
          </button>
        </footer>
      </div>

      {/* Name modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-up">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: "color-mix(in oklab, var(--noir) 80%, transparent)" }}
            onClick={() => setSelected(null)}
          />
          <div
            className="relative w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-px"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}
          >
            <div
              className="rounded-t-[calc(theme(borderRadius.3xl)-1px)] md:rounded-[calc(theme(borderRadius.3xl)-1px)] p-7"
              style={{ background: "var(--noir-soft)" }}
            >
              <p
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: "var(--gold-soft)" }}
              >
                Plano {selected.name}
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-white">
                Falta só seu nome
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Para o Felipe te chamar pelo nome no atendimento e liberar a condição especial.
              </p>

              <input
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="mt-5 w-full px-4 py-3.5 rounded-xl bg-black/40 border focus:outline-none focus:ring-2 text-base text-white placeholder:text-white/30"
                style={{
                  borderColor: "color-mix(in oklab, var(--gold) 30%, transparent)",
                  // @ts-expect-error css var
                  "--tw-ring-color": "var(--gold)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nome.trim()) openWhatsapp();
                }}
              />

              <button
                onClick={openWhatsapp}
                disabled={!nome.trim()}
                className="mt-5 w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide disabled:opacity-50 transition-transform active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-2"
                style={{ background: "var(--gradient-gold)", color: "var(--noir)" }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4 0-.1-.3-.2-.6-.3z" />
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3C4.1 15 3.6 13.5 3.6 12 3.6 7.4 7.4 3.6 12 3.6S20.4 7.4 20.4 12 16.6 20.2 12 20.2z" />
                </svg>
                Abrir conversa no WhatsApp
              </button>

              <button
                onClick={() => setSelected(null)}
                className="mt-3 w-full text-xs text-white/50 hover:text-white/80"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
