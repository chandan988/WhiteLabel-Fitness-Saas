import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("coach_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [tokens, setTokens] = useState(() => {
    const stored = localStorage.getItem("coach_tokens");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("coach_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("coach_user");
    }
  }, [user]);

  useEffect(() => {
    if (tokens) {
      localStorage.setItem("coach_tokens", JSON.stringify(tokens));
    } else {
      localStorage.removeItem("coach_tokens");
    }
  }, [tokens]);

  const login = async (payload) => {
    const { data } = await loginApi(payload);
    const enrichedUser = {
      ...data.user,
      tenantSlug: data.tenant?.slug || data.user?.tenantSlug
    };
    setUser(enrichedUser);
    localStorage.setItem("coach_user", JSON.stringify(enrichedUser));
    setTokens(data.tokens);
    localStorage.setItem("coach_tokens", JSON.stringify(data.tokens));
    return { ...data, user: enrichedUser };
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem("coach_user");
    localStorage.removeItem("coach_tokens");
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
