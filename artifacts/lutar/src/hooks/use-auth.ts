import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [user, setUser] = useState<{ username: string; role: string } | null>({
    username: "admin",
    role: "EMPEROR"
  });

  useEffect(() => {
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
