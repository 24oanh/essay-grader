import { createContext, useContext, useState } from "react";
import * as authApi from "../api/authApi";
import { AUTH_KEY, loadAuth } from "../api/http";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadAuth); // { token, username, role }

  const save = (data) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    setUser(data);
  };

  const login = async (username, password) => save(await authApi.login(username, password));
  const register = async (username, password) => save(await authApi.register(username, password));
  const loginWithGoogle = async (credential) => save(await authApi.googleLogin(credential));

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === "ADMIN",
        isTeacher: user?.role === "TEACHER",
        isStaff: user?.role === "ADMIN" || user?.role === "TEACHER",
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);