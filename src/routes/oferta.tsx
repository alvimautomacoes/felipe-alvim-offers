import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { clearOffer, loadConfig, loadOffer, type OfferPayload } from "@/lib/platform-config";

export const Route = createFileRoute("/oferta")({
  head: () => ({
    meta: [
      { title: "Sua Oferta Exclusiva — Nutri Felipe Alvim" },
      { name: "description", content: "Plano de acompanhamento com condição especial liberada." },
    ],
  }),
  component: OfferPage,
});

function OfferPage() {
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferPayload | null>(null);

  useEffect(() => {
    const o = loadOffer();
    if (!o?.token) {
      navigate({ to: "/" });
      return;
    }
    const cfg = loadConfig();
    setOffer({
      token: o.token,
      title: o.title ?? cfg.offerTitle,
      description: o.description ?? cfg.offerDescription,
      price: o.price ?? cfg.offerPrice,
      ctaLink: o.ctaLink ?? cfg.ctaLink,
      slotsRemaining: o.slotsRemaining ?? cfg.totalSlots,
    });
  }, [navigate]);

  if (!offer) return null;

  return (
    <main className="min-h-screen bg-background px-5 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl border overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="p-6 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur">
              Oferta liberada
            </span>
            <h1 className="mt-3 text-2xl font-bold leading-tight">{offer.title}</h1>
          </div>

          <div className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{offer.description}</p>

            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-foreground">{offer.price}</span>
            </div>

            {typeof offer.slotsRemaining === "number" && (
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-medium text-foreground">
                  {offer.slotsRemaining > 0
                    ? `Restam ${offer.slotsRemaining} ${offer.slotsRemaining === 1 ? "vaga" : "vagas"}`
                    : "Vagas esgotadas"}
                </span>
              </div>
            )}

            <a
              href={offer.ctaLink}
              target="_blank"
              rel="noreferrer"
              className="block text-center w-full py-3 rounded-xl font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
              style={{ background: "var(--gradient-hero)" }}
            >
              Quero garantir minha vaga
            </a>

            <button
              onClick={() => { clearOffer(); navigate({ to: "/" }); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Sair
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">Nutricionista Felipe Alvim</p>
      </div>
    </main>
  );
}
