export type PlatformConfig = {
  accessWebhookUrl: string;
  adminWebhookUrl: string;
  adminPassword: string;
  keyword: string;
  offerTitle: string;
  offerDescription: string;
  offerPrice: string;
  ctaLink: string;
  totalSlots: number;
};

const STORAGE_KEY = "fa_platform_config_v1";

export const defaultConfig: PlatformConfig = {
  accessWebhookUrl: "",
  adminWebhookUrl: "",
  adminPassword: "felipe2026",
  keyword: "",
  offerTitle: "Plano de Acompanhamento Exclusivo",
  offerDescription: "Acompanhamento nutricional personalizado com condição especial liberada por tempo limitado.",
  offerPrice: "R$ 497",
  ctaLink: "https://wa.me/",
  totalSlots: 10,
};

export function loadConfig(): PlatformConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return defaultConfig;
  }
}

export function saveConfig(cfg: PlatformConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

export type OfferPayload = {
  title?: string;
  description?: string;
  price?: string;
  ctaLink?: string;
  slotsRemaining?: number;
  token: string;
};

const OFFER_KEY = "fa_offer_payload_v1";

export function saveOffer(payload: OfferPayload) {
  localStorage.setItem(OFFER_KEY, JSON.stringify(payload));
}

export function loadOffer(): OfferPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(OFFER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearOffer() {
  localStorage.removeItem(OFFER_KEY);
}
