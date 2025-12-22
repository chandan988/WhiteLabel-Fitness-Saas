import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("super_admin_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("super_admin_token"));

  useEffect(() => {
    if (user) {
      localStorage.setItem("super_admin_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("super_admin_user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("super_admin_token", token);
    } else {
      localStorage.removeItem("super_admin_token");
    }
  }, [token]);

  const login = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
