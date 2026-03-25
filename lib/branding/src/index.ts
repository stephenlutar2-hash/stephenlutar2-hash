export const THEME_CSS_VARIABLES = [
  "background", "foreground",
  "card", "card-foreground", "card-border",
  "popover", "popover-foreground", "popover-border",
  "primary", "primary-foreground", "primary-border",
  "secondary", "secondary-foreground", "secondary-border",
  "muted", "muted-foreground", "muted-border",
  "accent", "accent-foreground", "accent-border",
  "destructive", "destructive-foreground", "destructive-border",
  "border", "input", "ring", "radius",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
] as const;

export type ThemeCSSVariable = (typeof THEME_CSS_VARIABLES)[number];

export interface BrandTheme {
  name: string;
  fontSans: string;
  fontDisplay: string;
  colors: Record<string, string>;
}
