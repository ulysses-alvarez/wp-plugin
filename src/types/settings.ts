export interface SiteConfig {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
}

export interface SettingsState {
  settings: SiteConfig | null;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<SiteConfig>) => Promise<void>;
}
