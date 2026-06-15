import { supabase, isSupabaseConfigured } from "./supabase";

export type Plan = {
  id: string;
  name: string;
  badge?: string;
  description: string;
  price: string;
  originalPrice?: string;
  features: string[];
  whatsappMessage: string; // supports {nome} and {plano}
  highlighted?: boolean;
};

export type PlatformConfig = {
  accessWebhookUrl: string;
  adminWebhookUrl: string;
  adminPassword: string;
  keyword: string;
  whatsappNumber: string; // digits only, with country code
  offerHeadline: string;
  offerSubheadline: string;
  totalSlots: number;
  plans: Plan[];
};

const STORAGE_KEY = "fa_platform_config_v2";

export const defaultConfig: PlatformConfig = {
  accessWebhookUrl: "",
  adminWebhookUrl: "",
  adminPassword: "felipe2026",
  keyword: "",
  whatsappNumber: "5561992939930",
  offerHeadline: "Sua condição exclusiva foi liberada",
  offerSubheadline:
    "Escolha o plano de acompanhamento ideal e garanta o desconto especial enquanto há vagas.",
  totalSlots: 10,
  plans: [
    {
      id: "essencial",
      name: "Essencial",
      badge: "Início",
      description: "Plano ideal para começar sua transformação com acompanhamento mensal.",
      price: "R$ 297",
      originalPrice: "R$ 497",
      features: [
        "Consulta inicial completa",
        "Plano alimentar personalizado",
        "Suporte por 30 dias",
      ],
      whatsappMessage:
        "Olá Felipe! Meu nome é {nome} e quero garantir o desconto no plano {plano}.",
    },
    {
      id: "premium",
      name: "Premium",
      badge: "Mais escolhido",
      description: "Acompanhamento completo com ajustes quinzenais e suporte direto.",
      price: "R$ 597",
      originalPrice: "R$ 997",
      features: [
        "Tudo do Essencial",
        "Ajustes quinzenais do plano",
        "Suporte direto via WhatsApp",
        "Lista de substituições inteligentes",
      ],
      whatsappMessage: "Olá Felipe! Sou {nome} e quero garantir o desconto no plano {plano}.",
    },
    {
      id: "elite",
      name: "Elite",
      badge: "Resultado máximo",
      description: "Acompanhamento high ticket com atendimento prioritário e estratégia completa.",
      price: "R$ 1.297",
      originalPrice: "R$ 1.997",
      features: [
        "Tudo do Premium",
        "Atendimento prioritário",
        "Avaliação de exames",
        "Estratégia de suplementação",
        "Acesso direto 7 dias por semana",
      ],
      whatsappMessage: "Olá Felipe! Aqui é {nome}, quero garantir minha vaga no plano {plano}.",
    },
  ],
};

export function loadConfig(): PlatformConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw);
    return {
      ...defaultConfig,
      ...parsed,
      plans:
        Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : defaultConfig.plans,
    };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(cfg: PlatformConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export async function fetchConfigFromSupabase(): Promise<PlatformConfig> {
  if (!isSupabaseConfigured || !supabase) return loadConfig();
  try {
    const { data, error } = await supabase
      .from("felipe_alvim_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      console.warn("Could not fetch from Supabase, using local cache:", error);
      return loadConfig();
    }

    const parsed: PlatformConfig = {
      accessWebhookUrl: data.access_webhook_url ?? "",
      adminWebhookUrl: data.admin_webhook_url ?? "",
      adminPassword: data.admin_password ?? "felipe2026",
      keyword: data.keyword ?? "",
      whatsappNumber: data.whatsapp_number ?? "5561992939930",
      offerHeadline: data.offer_headline ?? "Sua condição exclusiva foi liberada",
      offerSubheadline:
        data.offer_subheadline ??
        "Escolha o plano de acompanhamento ideal e garanta o desconto especial enquanto há vagas.",
      totalSlots: data.total_slots ?? 10,
      plans: Array.isArray(data.plans) ? data.plans : defaultConfig.plans,
    };

    // Sync into local backup
    saveConfig(parsed);
    return parsed;
  } catch (err) {
    console.error("Error fetching from Supabase:", err);
    return loadConfig();
  }
}

export async function saveConfigToSupabase(
  cfg: PlatformConfig,
): Promise<{ success: boolean; error?: string }> {
  // Always save locally first as offline/session backup
  saveConfig(cfg);

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error:
        "Supabase não está configurado. Verifique as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu arquivo .env ou no painel da Vercel.",
    };
  }
  try {
    const { error } = await supabase.from("felipe_alvim_config").upsert({
      id: 1,
      access_webhook_url: cfg.accessWebhookUrl,
      admin_webhook_url: cfg.adminWebhookUrl,
      admin_password: cfg.adminPassword,
      keyword: cfg.keyword,
      whatsapp_number: cfg.whatsappNumber,
      offer_headline: cfg.offerHeadline,
      offer_subheadline: cfg.offerSubheadline,
      total_slots: cfg.totalSlots,
      plans: cfg.plans,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error writing to Supabase:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Failed to write to Supabase:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

export type OfferAccess = { token: string; slotsRemaining?: number };

const OFFER_KEY = "fa_offer_access_v2";

export function saveAccess(payload: OfferAccess) {
  localStorage.setItem(OFFER_KEY, JSON.stringify(payload));
}

export function loadAccess(): OfferAccess | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OFFER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAccess() {
  localStorage.removeItem(OFFER_KEY);
}

export function buildWhatsappUrl(number: string, message: string) {
  const clean = number.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}
