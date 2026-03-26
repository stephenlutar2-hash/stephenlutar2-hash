declare global {
  interface Window {
    szlTrack?: (category: string, action: string, label?: string, value?: number) => void;
  }
}

export function trackEvent(category: string, action: string, label?: string, value?: number): void {
  window.szlTrack?.(category, action, label, value);
}
