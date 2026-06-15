import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadConfig, saveAccess, fetchConfigFromSupabase } from "@/lib/platform-config";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/$keyword")({
  head: () => ({
    meta: [
      { title: "Buscando Oferta Especial — Nutri Felipe Alvim" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: KeywordValidationPage,
});

function KeywordValidationPage() {
  const { keyword } = Route.useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Acessando convite reservado...");

  useEffect(() => {
    async function validateSlug() {
      if (!keyword) {
        navigate({ to: "/" });
        return;
      }

      // Ignore standard page paths if they leak here
      const kwLower = keyword.toLowerCase();
      if (kwLower === "admin" || kwLower === "oferta") {
        return;
      }

      try {
        const cfg = await fetchConfigFromSupabase();
        let ok = false;
        let token = "";
        let slotsRemaining: number | undefined;

        if (cfg.accessWebhookUrl) {
          setStatus("Verificando credenciais de acesso...");
          const res = await fetch(cfg.accessWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ palavra: keyword.trim() }),
          });
          const data = await res.json();
          ok = !!data?.ok;
          token = data?.token ?? "";
          slotsRemaining = data?.slotsRemaining;
        } else {
          // Fallback local: compara com a palavra-chave configurada
          ok = !!cfg.keyword && keyword.trim().toLowerCase() === cfg.keyword.trim().toLowerCase();
          token = ok ? "slug-" + Date.now() : "";
          slotsRemaining = cfg.totalSlots;
        }

        if (ok) {
          setStatus("Acesso concedido! Redirecionando...");
          saveAccess({
            token: token || "slug-auto-" + Date.now(),
            slotsRemaining,
          });
          // Pequeno delay para efeito visual refinado
          setTimeout(() => {
            navigate({ to: "/oferta" });
          }, 800);
        } else {
          sessionStorage.setItem(
            "fa_entry_error",
            `O código de acesso "${keyword}" não é válido ou já expirou.`,
          );
          navigate({ to: "/" });
        }
      } catch (err) {
        console.error(err);
        sessionStorage.setItem(
          "fa_entry_error",
          "Ocorreu um erro ao validar sua chave de acesso. Tente novamente.",
        );
        navigate({ to: "/" });
      }
    }

    validateSlug();
  }, [keyword, navigate]);

  return (
    <main
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center px-5 py-10 text-white"
      style={{ background: "var(--gradient-noir)" }}
    >
      {/* Decorative gold orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30 orb-float"
        style={{
          background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-20 orb-float"
        style={{
          background: "radial-gradient(circle, var(--gold-deep) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />

      <div className="relative text-center max-w-sm z-10 flex flex-col items-center">
        {/* Luxury Gold Pulsing Loader */}
        <div
          className="relative h-20 w-20 flex items-center justify-center rounded-2xl mb-8 border animate-[pulse_2s_infinite]"
          style={{
            borderColor: "color-mix(in oklab, var(--gold) 40%, transparent)",
            background: "var(--noir-soft)",
            boxShadow: "var(--shadow-gold)",
          }}
        >
          <Sparkles className="h-8 w-8 text-gold" style={{ color: "var(--gold)" }} />
        </div>

        <h1 className="font-display text-2xl font-semibold tracking-wide text-gold-gradient mb-2">
          Portal Felipe Alvim
        </h1>
        <p className="text-sm text-white/50 animate-pulse font-mono tracking-wider">{status}</p>
      </div>
    </main>
  );
}
