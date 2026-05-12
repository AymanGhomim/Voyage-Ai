import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Sparkles, X, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type Mode = "login" | "signup";

interface Props {
  onClose: () => void;
  defaultMode?: Mode;
}

export function AuthModal({ onClose, defaultMode = "login" }: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const { login, signup } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl shadow-card"
      >
        {/* Aurora glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-40 blur-3xl gradient-aurora"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full opacity-25 blur-3xl gradient-sunset"
        />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10 transition"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="relative px-8 pt-8 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-aurora shadow-glow">
              <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Voyage<span className="text-gradient-aurora">AI</span>
            </span>
          </div>

          {/* Tab toggle */}
          <div className="relative mt-6 flex rounded-2xl bg-white/5 p-1">
            <motion.div
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-xl gradient-aurora shadow-glow"
              animate={{ x: mode === "login" ? 4 : "calc(100% + 4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors ${
                  mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
        </div>

        {/* Form panel */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <LoginForm key="login" onClose={onClose} onSwitchMode={() => setMode("signup")} login={login} />
            ) : (
              <SignupForm key="signup" onClose={onClose} onSwitchMode={() => setMode("login")} signup={signup} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Login Form ──────────────────────────────────────────────────────────────
function LoginForm({
  onClose,
  onSwitchMode,
  login,
}: {
  onClose: () => void;
  onSwitchMode: () => void;
  login: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back! ✈️", { description: "Your trips are ready." });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      onSubmit={submit}
      className="space-y-4 px-8 pb-8 pt-6"
    >
      <AuthField label="Email" icon={Mail}>
        <input
          type="email"
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="auth-input"
        />
      </AuthField>

      <AuthField label="Password" icon={Lock}>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="auth-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </AuthField>

      <ErrorBanner error={error} />

      <button
        type="submit"
        disabled={loading}
        className="auth-btn w-full"
        style={{ background: "var(--gradient-aurora)" }}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
        ) : (
          <><ArrowRight className="h-4 w-4" /> Sign in</>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        No account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-foreground underline-offset-2 hover:underline"
        >
          Create one free
        </button>
      </p>

      {/* Demo hint */}
      <DemoHint />
    </motion.form>
  );
}

// ─── Signup Form ─────────────────────────────────────────────────────────────
function SignupForm({
  onClose,
  onSwitchMode,
  signup,
}: {
  onClose: () => void;
  onSwitchMode: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-destructive", "bg-accent", "bg-emerald-400"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      toast.success("Welcome to Voyage AI! 🌍", { description: "Your first adventure awaits." });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      onSubmit={submit}
      className="space-y-4 px-8 pb-8 pt-6"
    >
      <AuthField label="Full name" icon={UserIcon}>
        <input
          type="text"
          autoFocus
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Maya Johnson"
          maxLength={50}
          className="auth-input"
        />
      </AuthField>

      <AuthField label="Email" icon={Mail}>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="auth-input"
        />
      </AuthField>

      <AuthField label="Password" icon={Lock}>
        <div className="space-y-2">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="auth-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Strength bar */}
          {password.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      pwStrength >= i ? strengthColor[pwStrength] : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">{strengthLabel[pwStrength]}</span>
            </div>
          )}
        </div>
      </AuthField>

      <ErrorBanner error={error} />

      <button
        type="submit"
        disabled={loading}
        className="auth-btn w-full"
        style={{ background: "var(--gradient-aurora)" }}
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Create account</>
        )}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-foreground underline-offset-2 hover:underline"
        >
          Sign in
        </button>
      </p>
    </motion.form>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function AuthField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorBanner({ error }: { error: string | null }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function DemoHint() {
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);

  const loginDemo = async () => {
    setLoading(true);
    const DEMO_EMAIL = "demo@voyage.ai";
    const DEMO_PASS = "demo1234";
    // Ensure demo account exists
    const registry: Record<string, { name: string; password: string; avatarColor: string }> =
      JSON.parse(localStorage.getItem("voyage_registry") ?? "{}");
    if (!registry[DEMO_EMAIL]) {
      try {
        await signup("Demo User", DEMO_EMAIL, DEMO_PASS);
        setLoading(false);
        return;
      } catch {
        // already exists — fall through to login
      }
    }
    try {
      await login(DEMO_EMAIL, DEMO_PASS);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-center">
      <p className="text-[11px] text-muted-foreground">Just exploring?</p>
      <button
        type="button"
        onClick={loginDemo}
        disabled={loading}
        className="mt-1 text-xs font-medium text-foreground/70 underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50 transition"
      >
        {loading ? "Loading demo…" : "Continue with demo account →"}
      </button>
    </div>
  );
}
