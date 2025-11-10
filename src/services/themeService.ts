import type { SiteConfig } from '../types/settings';

/**
 * Aplica los colores del tema dinámicamente al documento
 */
export const applyTheme = (settings: SiteConfig): void => {
  console.log('[applyTheme] Applying theme with settings:', settings);

  if (!settings) {
    console.warn('[applyTheme] No settings provided');
    return;
  }

  const root = document.documentElement;

  // Aplicar color primario
  if (settings.primaryColor) {
    console.log('[applyTheme] Setting primary color:', settings.primaryColor);
    root.style.setProperty('--color-primary', settings.primaryColor);

    // Calcular variantes del color primario
    const primaryHover = adjustColor(settings.primaryColor, -20);
    const primaryLight = adjustColor(settings.primaryColor, 90);

    console.log('[applyTheme] Setting hover color:', primaryHover);
    console.log('[applyTheme] Setting light color:', primaryLight);

    root.style.setProperty('--color-primary-hover', primaryHover);
    root.style.setProperty('--color-primary-light', primaryLight);

    // Verify that the CSS variables were set
    const verifyPrimary = getComputedStyle(root).getPropertyValue('--color-primary');
    console.log('[applyTheme] Verified --color-primary value:', verifyPrimary);
  } else {
    console.warn('[applyTheme] No primaryColor in settings');
  }
};

/**
 * Ajusta el brillo de un color hexadecimal
 * @param hex Color en formato #RRGGBB
 * @param percent Porcentaje de ajuste (-100 a 100)
 */
function adjustColor(hex: string, percent: number): string {
  // Remover el #
  const num = parseInt(hex.replace('#', ''), 16);

  // Extraer componentes RGB
  let r = (num >> 16) + Math.round(2.55 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(2.55 * percent);
  let b = (num & 0x0000FF) + Math.round(2.55 * percent);

  // Asegurar que estén en el rango 0-255
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  // Convertir de vuelta a hex
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
