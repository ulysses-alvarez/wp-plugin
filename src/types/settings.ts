export interface PriceRoundingLevel {
  threshold: number;    // Price threshold (e.g., 100000 for 100k)
  multiplier: number;   // Rounding multiplier (e.g., 10000 to round to nearest 10k)
}

export interface SiteConfig {
  wpSiteName: string;      // Nombre del sitio de WordPress (solo lectura)
  logoId: number;           // ID del attachment del logo
  logoUrl: string;          // URL del logo (calculada desde logoId)
  primaryColor: string;
  priceRounding: PriceRoundingLevel[];  // Price rounding configuration
}

export interface SettingsState {
  settings: SiteConfig | null;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SiteConfig>) => Promise<void>;
  uploadLogo: (file: File) => Promise<{ id: number; url: string }>;
  deleteLogo: () => Promise<void>;
}
