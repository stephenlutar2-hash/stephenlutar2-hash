# Theme Reference — Creating a New App Theme

Every app in the portfolio shares a common CSS variable contract. Each app defines
its own brand palette by setting these CSS custom properties in `:root`.

## Required CSS Variables

All variables use HSL values without the `hsl()` wrapper (e.g., `226 71% 4%`).

### Core

| Variable             | Purpose                          |
|----------------------|----------------------------------|
| `--background`       | Page background                  |
| `--foreground`       | Default text color               |
| `--border`           | Default border color             |
| `--input`            | Input element borders            |
| `--ring`             | Focus ring color                 |
| `--radius`           | Base border radius (e.g. 0.75rem)|

### Semantic Colors (each has `-foreground` and optional `-border` variants)

| Variable             | Purpose                          |
|----------------------|----------------------------------|
| `--primary`          | Primary action/brand color       |
| `--secondary`        | Secondary actions/surfaces       |
| `--muted`            | Muted/subdued surfaces           |
| `--accent`           | Accent highlights                |
| `--destructive`      | Error/danger actions             |
| `--card`             | Card background                  |
| `--popover`          | Popover/dropdown background      |

### Chart Colors (optional)

| Variable      | Purpose               |
|---------------|------------------------|
| `--chart-1`   | Primary chart color    |
| `--chart-2`   | Secondary chart color  |
| `--chart-3`   | Tertiary chart color   |
| `--chart-4`   | Quaternary chart color |
| `--chart-5`   | Quinary chart color    |

## Quick Start — New App `index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=YOUR_FONTS&display=swap');
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-card-border: hsl(var(--card-border));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-popover-border: hsl(var(--popover-border));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-primary-border: var(--primary-border);
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-secondary-border: var(--secondary-border);
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-muted-border: var(--muted-border);
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-accent-border: var(--accent-border);
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-destructive-border: var(--destructive-border);

  --font-sans: 'Your Sans Font', sans-serif;
  --font-display: 'Your Display Font', sans-serif;
  --font-mono: 'Menlo', monospace;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --background: 226 71% 4%;
  --foreground: 210 40% 98%;
  /* ... set all variables above with your brand colors ... */
  --radius: 0.75rem;
}

@layer base {
  * { @apply border-border; }
  body { @apply font-sans antialiased bg-background text-foreground overflow-x-hidden; }
  h1, h2, h3, h4, h5, h6 { @apply font-display tracking-tight; }
}
```

## Shared Packages

| Package              | Import                    | Provides                                      |
|----------------------|---------------------------|-----------------------------------------------|
| `@workspace/ui`      | `import { Button } from "@workspace/ui"` | All shadcn/ui components, `cn()` utility, hooks |
| `@workspace/branding`| CSS files + TS types      | Theme contract CSS, base layer, utility classes |
| `@workspace/platform`| `import { ErrorBoundary } from "@workspace/platform"` | Auth, layout, error boundary, loading states |
