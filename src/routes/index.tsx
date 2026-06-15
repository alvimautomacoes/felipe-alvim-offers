import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loadConfig, saveAccess } from "@/lib/platform-config";

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
        setError("Palavra-chave inválida");
      }
    } catch {
      setError("Não foi possível validar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-10 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: "var(--gradient-hero)" }}>
            <span className="text-2xl">🥗</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Acesso Exclusivo</h1>
          <p className="mt-2 text-sm text-muted-foreground">Insira a palavra-chave que você recebeu para liberar sua condição especial.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 border" style={{ boxShadow: "var(--shadow-soft)" }}>
          <label className="block text-sm font-medium mb-2" htmlFor="palavra">Palavra-chave</label>
          <input
            id="palavra"
            type="text"
            value={palavra}
            onChange={(e) => setPalavra(e.target.value)}
            placeholder="Digite aqui"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl bg-input border border-border focus:outline-none focus:ring-2 focus:ring-ring text-base"
            required
          />
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading || !palavra.trim()}
            className="mt-4 w-full py-3 rounded-xl font-semibold text-primary-foreground disabled:opacity-60 transition-opacity"
            style={{ background: "var(--gradient-hero)" }}
          >
            {loading ? "Validando..." : "Acessar"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">Nutricionista Felipe Alvim</p>
      </div>
    </main>
  );
}
