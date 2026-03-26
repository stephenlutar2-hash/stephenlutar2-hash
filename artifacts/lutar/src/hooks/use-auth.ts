// Mock hook to show standard structure
// In a real app with an API, this would use @szl-holdings/api-client-react
import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<{ username: string; role: string } | null>({
    username: "admin",
    role: "EMPEROR"
  });

  // Mock checking session
  useEffect(() => {
    // In real app: fetch('/api/me')
    const checkAuth = async () => {
      setIsAuthenticated(true);
    };
    checkAuth();
  }, []);

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, logout };
}
