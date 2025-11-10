export interface SiteConfig {
  wpSiteName: string;      // Nombre del sitio de WordPress (solo lectura)
  logoId: number;           // ID del attachment del logo
  logoUrl: string;          // URL del logo (calculada desde logoId)
  primaryColor: string;
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
