import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
};

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser };

type AuthContextValue = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const STORAGE_KEY = "voyage_auth_user";

const AVATAR_COLORS = [
  "from-fuchsia-400 to-violet-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-violet-500",
];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

// Simulated user registry stored in localStorage.
// In a real app this would be a Supabase/Firebase/API call.
function getRegistry(): Record<string, { name: string; password: string; avatarColor: string }> {
  try {
    return JSON.parse(localStorage.getItem("voyage_registry") ?? "{}");
  } catch {
    return {};
  }
}

function saveRegistry(r: Record<string, { name: string; password: string; avatarColor: string }>) {
  localStorage.setItem("voyage_registry", JSON.stringify(r));
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const user = JSON.parse(raw) as AuthUser;
        setState({ status: "authenticated", user });
        return;
      }
    } catch {
      // corrupted storage — clear it
      localStorage.removeItem(STORAGE_KEY);
    }
    setState({ status: "unauthenticated" });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 700));

    const registry = getRegistry();
    const key = email.toLowerCase().trim();
    const entry = registry[key];

    if (!entry || entry.password !== password) {
      throw new Error("Invalid email or password.");
    }

    const user: AuthUser = {
      id: btoa(key),
      name: entry.name,
      email: key,
      avatarColor: entry.avatarColor,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setState({ status: "authenticated", user });
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 700));

    const key = email.toLowerCase().trim();
    const registry = getRegistry();

    if (registry[key]) {
      throw new Error("An account with this email already exists.");
    }

    const avatarColor = randomColor();
    registry[key] = { name: name.trim(), password, avatarColor };
    saveRegistry(registry);

    const user: AuthUser = { id: btoa(key), name: name.trim(), email: key, avatarColor };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setState({ status: "authenticated", user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ status: "unauthenticated" });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useAuthUser(): AuthUser | null {
  const { state } = useAuth();
  return state.status === "authenticated" ? state.user : null;
}

export function useIsAuthenticated(): boolean {
  const { state } = useAuth();
  return state.status === "authenticated";
}
