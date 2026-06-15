export type Plan = {
  id: string;
  name: string;
  badge?: string;
  description: string;
  price: string;
  originalPrice?: string;
  features: string[];
  whatsappMessage: string; // supports {nome} and {plano}
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
  offerSubheadline: "Escolha o plano de acompanhamento ideal e garanta o desconto especial enquanto há vagas.",
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
      whatsappMessage:
        "Olá Felipe! Sou {nome} e quero garantir o desconto no plano {plano}.",
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
      whatsappMessage:
        "Olá Felipe! Aqui é {nome}, quero garantir minha vaga no plano {plano}.",
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
      plans: Array.isArray(parsed.plans) && parsed.plans.length > 0 ? parsed.plans : defaultConfig.plans,
    };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(cfg: PlatformConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
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
