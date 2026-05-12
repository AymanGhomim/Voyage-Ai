import { createContext, useContext, useState, useEffect } from "react";

export type AuthUser = {
  name: string;
  email: string;
  initials: string;
  color: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const COLORS = [
  "from-fuchsia-400 to-violet-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-violet-500",
];

function pickColor(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + hash * 31;
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type StoredUser = { name: string; email: string; password: string };

const USERS_KEY = "voyage_users";
const SESSION_KEY = "voyage_session";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 750));
    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
    const u: AuthUser = {
      name: found.name,
      email: found.email,
      initials: getInitials(found.name),
      color: pickColor(found.email),
    };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 750));
    const users: StoredUser[] = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase()))
      throw new Error("هذا البريد الإلكتروني مُسجَّل بالفعل.");
    users.push({ name: name.trim(), email: email.trim().toLowerCase(), password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const u: AuthUser = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      initials: getInitials(name),
      color: pickColor(email),
    };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
