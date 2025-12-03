import { createContext, useContext, useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { loginUser, registerUser } from '../api/client';
import { AuthResponse, User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'scd_token';
const USER_KEY = 'scd_user';

export const AuthProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const persistAuth = ({ user: authUser, token: authToken }: AuthResponse): void => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  };

  const login = async (credentials: { email: string; password: string }): Promise<void> => {
    const response = await loginUser(credentials);
    persistAuth(response);
  };

  const register = async (payload: { name: string; email: string; password: string; role: string }): Promise<void> => {
    const response = await registerUser(payload);
    persistAuth(response);
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (updates: Partial<User>): void => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const value = { user, token, loading, login, register, logout, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
