import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Users, Map, Wand2, MessageSquare, LogOut, User } from "lucide-react";
import { useAuth, useAuthUser } from "@/lib/auth";
import { AuthModal } from "@/components/voyage/AuthModal";
import { toast } from "sonner";
import heroImg from "@/assets/hero-santorini.jpg";
import tokyo from "@/assets/place-tokyo.jpg";
import bali from "@/assets/place-bali.jpg";
import iceland from "@/assets/place-iceland.jpg";

export function Landing() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { logout, state } = useAuth();
  const user = useAuthUser();
  const isLoading = state.status === "loading";

  const openLogin = () => { setAuthMode("login"); setAuthOpen(true); };
  const openSignup = () => { setAuthMode("signup"); setAuthOpen(true); };

  const handleLogout = () => {
    logout();
    toast.success("Signed out", { description: "See you next adventure! ✈️" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Aurora glows */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "var(--gradient-aurora)" }} />
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl gradient-sunset" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-aurora shadow-glow">
            <span className="font-display text-xl text-primary-foreground">V</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Voyage<span className="text-gradient-aurora">AI</span></span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition hover:text-foreground">Features</a>
          <a href="#ai" className="text-sm text-muted-foreground transition hover:text-foreground">AI Assistant</a>
          <a href="#trips" className="text-sm text-muted-foreground transition hover:text-foreground">Demo Trip</a>
        </nav>

        {/* Auth nav actions */}
        {!isLoading && (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* User avatar */}
                <div className={`hidden md:flex items-center gap-2 rounded-full glass px-3 py-1.5 text-sm`}>
                  <div className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${user.avatarColor} text-[10px] font-bold text-white`}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate text-sm">{user.name}</span>
                </div>
                <Link to="/app" className="glass rounded-full px-5 py-2 text-sm font-medium transition hover:bg-white/10">
                  Open app
                </Link>
                <button
                  onClick={handleLogout}
                  className="grid h-9 w-9 place-items-center rounded-full glass transition hover:bg-white/10"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={openLogin} className="text-sm text-muted-foreground transition hover:text-foreground">
                  Sign in
                </button>
                <button
                  onClick={openSignup}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
                  style={{ background: "var(--gradient-aurora)" }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>New · AI-generated itineraries in seconds</span>
          </div>
          <h1 className="mt-6 font-display text-6xl leading-[1.05] md:text-8xl">
            Plan dream trips
            <br />
            <em className="text-gradient-aurora not-italic">together</em>, with AI.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A cinematic, collaborative workspace for travel. Co-design itineraries with your friends —
            powered by an AI that thinks like a local.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                to="/app"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
                style={{ background: "var(--gradient-aurora)" }}
              >
                Go to your trips
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={openSignup}
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
                  style={{ background: "var(--gradient-aurora)" }}
                >
                  Start planning free
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
                <button
                  onClick={openLogin}
                  className="glass inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium hover:bg-white/10 transition"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Hero showcase */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative mx-auto mt-20 max-w-6xl"
        >
          <div className="glass-strong relative overflow-hidden rounded-3xl shadow-card">
            <img src={heroImg} alt="Santorini at sunset" width={1920} height={1280} className="h-[420px] w-full object-cover md:h-[560px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute left-6 top-6 hidden md:block"
            >
              <div className="glass-strong w-64 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> AI suggestion
                </div>
                <p className="mt-2 text-sm">Catch the sunset at <span className="font-semibold">Oia Castle</span> — 23 min from your villa.</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              className="absolute right-6 top-10 hidden md:block"
            >
              <div className="glass-strong w-72 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Budget · Trip 1</span>
                  <span className="text-xs font-medium">€1,840 / 3,200</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[58%] rounded-full" style={{ background: "var(--gradient-aurora)" }} />
                </div>
                <div className="mt-3 flex -space-x-2">
                  {["M", "L", "S", "T"].map((c, i) => (
                    <div key={i} className="grid h-7 w-7 place-items-center rounded-full border-2 border-background text-[11px] font-semibold gradient-aurora">{c}</div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-2xl px-5 py-3 text-sm whitespace-nowrap">
              <span className="text-muted-foreground">Day 1 · </span>
              <span>Caldera sunset → Ammoudi dinner → Stargaze rooftop</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Built for explorers</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">A travel workspace that <em className="text-gradient-aurora not-italic">feels alive</em>.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Wand2, title: "AI itineraries", body: "Generate a full day-by-day plan tuned to your vibe in seconds.", img: tokyo },
            { icon: Users, title: "Real-time co-planning", body: "Your friends edit the same trip with you, live. No more group chats.", img: bali },
            { icon: Map, title: "Map-first thinking", body: "See routes, distances and hidden gems on a soft, animated map.", img: iceland },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass lift relative overflow-hidden rounded-3xl p-6"
            >
              <div className="absolute inset-0 opacity-25">
                <img src={f.img} alt="" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
              </div>
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-xl glass-strong">
                  <f.icon className="h-4 w-4 text-accent" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-10 md:p-16">
          <div aria-hidden className="absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-50 blur-3xl gradient-aurora" />
          <div className="relative grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs">
                <MessageSquare className="h-3.5 w-3.5 text-accent" />
                AI Travel Assistant
              </div>
              <h2 className="mt-5 font-display text-4xl md:text-5xl">Tell it a feeling. <br /><em className="text-gradient-aurora not-italic">Get a trip.</em></h2>
              <p className="mt-5 max-w-md text-muted-foreground">
                "5 days in Greece, romantic, slow mornings, sunset everything." Voyage AI designs an itinerary with restaurants, drives, and golden hour windows — instantly.
              </p>
              {user ? (
                <Link
                  to="/app"
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-aurora)" }}
                >
                  Try it now <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={openSignup}
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-aurora)" }}
                >
                  Try it free <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {[
                { d: "Day 1", t: "Caldera arrival · Oia sunset · Ammoudi", e: "🌅" },
                { d: "Day 2", t: "Volcano hike · Hot springs swim · Cliffside spa", e: "🌋" },
                { d: "Day 3", t: "Wine country drive · Pyrgos rooftop · Stargazing", e: "🍇" },
              ].map((row, i) => (
                <motion.div
                  key={row.d}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="glass flex items-center gap-4 rounded-2xl p-4"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-xl">{row.e}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{row.d}</p>
                    <p className="text-sm">{row.t}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="trips" className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center">
        <h2 className="font-display text-5xl md:text-7xl">Your next trip is <em className="text-gradient-aurora not-italic">already waiting</em>.</h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">Free while in beta. No credit card. Bring your friends.</p>
        {user ? (
          <Link
            to="/app"
            className="mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow"
            style={{ background: "var(--gradient-aurora)" }}
          >
            <User className="h-4 w-4" /> Open your workspace
          </Link>
        ) : (
          <button
            onClick={openSignup}
            className="mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
            style={{ background: "var(--gradient-aurora)" }}
          >
            Create free account <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </section>

      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Voyage AI · Designed for dreamers.
      </footer>

      {/* Auth modal */}
      <AnimatePresence>
        {authOpen && (
          <AuthModal
            key={authMode}
            onClose={() => setAuthOpen(false)}
            defaultMode={authMode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
