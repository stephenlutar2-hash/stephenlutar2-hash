import { useState, useEffect, createContext, useContext, type ReactNode } from "react";

const TOKEN_KEY = "szl_token";
const USER_KEY = "szl_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser<T = Record<string, unknown>>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser<T>(user: T): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: (redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  onLogout,
}: {
  children: ReactNode;
  onLogout?: () => void;
}) {
  const [token, setTokenState] = useState<string | null>(getToken);

  const login = (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
  };

  const logout = (redirectTo?: string) => {
    clearToken();
    setTokenState(null);
    onLogout?.();
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function AuthGuard({
  children,
  fallback,
  loginPath = "login",
  redirectComponent: RedirectComp,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  loginPath?: string;
  redirectComponent?: React.ComponentType<{ to: string }>;
}) {
  const [checked, setChecked] = useState(false);
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated && !RedirectComp) {
      const base = document.querySelector("base")?.href || "/";
      window.location.href = `${base}${loginPath}`;
    }
    setChecked(true);
  }, [authenticated, loginPath, RedirectComp]);

  if (!authenticated && RedirectComp) {
    return <RedirectComp to={`/${loginPath}`} />;
  }

  if (!checked || !authenticated) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
