import type { SiteConfig } from '../types/settings';

/**
 * Aplica los colores del tema dinámicamente al documento
 */
export const applyTheme = (settings: SiteConfig): void => {
  if (!settings) {
    return;
  }

  const root = document.documentElement;

  // Aplicar color primario
  if (settings.primaryColor) {
    root.style.setProperty('--color-primary', settings.primaryColor);

    // Calcular variantes del color primario
    const primaryHover = adjustColor(settings.primaryColor, -20);   // -20% brillo para hover
    const primaryLight = adjustColor(settings.primaryColor, 97);    // +97% brillo para fondos muy claros (~10% opacidad)

    root.style.setProperty('--color-primary-hover', primaryHover);
    root.style.setProperty('--color-primary-light', primaryLight);

    // Calcular colores de texto con contraste adecuado
    const primaryText = getContrastTextColor(settings.primaryColor);
    const primaryLightText = getContrastTextColor(primaryLight);

    root.style.setProperty('--color-primary-text', primaryText);
    root.style.setProperty('--color-primary-light-text', primaryLightText);
  }
};

/**
 * Ajusta el brillo de un color hexadecimal
 * @param hex Color en formato #RRGGBB
 * @param percent Porcentaje de ajuste (-100 a 100)
 */
export function adjustColor(hex: string, percent: number): string {
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

/**
 * Convierte un color hexadecimal a RGB
 * @param hex Color en formato #RRGGBB
 * @returns Objeto con componentes r, g, b
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = parseInt(hex.replace('#', ''), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Calcula la luminosidad relativa de un color según WCAG 2.1
 * @param hex Color en formato #RRGGBB
 * @returns Luminosidad (0-1)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  
  // Convertir a valores sRGB
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 
      ? val / 12.92 
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  // Fórmula de luminosidad relativa (WCAG)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Determina si usar texto claro u oscuro según el fondo para máximo contraste
 * @param bgColor Color de fondo hexadecimal
 * @returns Color de texto recomendado (#ffffff o #000000)
 */
export function getContrastTextColor(bgColor: string): string {
  const luminance = getLuminance(bgColor);
  
  // Si el fondo es claro (luminancia > 0.5), usar texto oscuro
  // Si el fondo es oscuro (luminancia <= 0.5), usar texto claro
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Calcula el ratio de contraste entre dos colores según WCAG 2.1
 * @param color1 Primer color hexadecimal
 * @param color2 Segundo color hexadecimal
 * @returns Ratio de contraste (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}
