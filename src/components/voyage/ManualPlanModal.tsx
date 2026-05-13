import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, MapPin, Clock, Tag, Sparkles, Trash2, GripVertical } from "lucide-react";
import { getPlaceImage } from "@/lib/place-image";
import { PlaceImage } from "@/components/voyage/PlaceImage";
import type { Day, Place } from "@/lib/trip-data";
import { toast } from "sonner";

const TAGS = [
  "Landmark", "Museum", "Food", "Dinner", "Lunch", "Breakfast",
  "Market", "Beach", "Hike", "Sunset", "Nightlife", "Shopping",
  "Culture", "Temple", "Park", "Viewpoint", "Spa", "Tour", "Activity",
];

const EMOJIS: Record<string, string> = {
  Landmark: "🏛️", Museum: "🖼️", Food: "🍽️", Dinner: "🍷",
  Lunch: "🥗", Breakfast: "☕", Market: "🛍️", Beach: "🌊",
  Hike: "🥾", Sunset: "🌅", Nightlife: "🎶", Shopping: "🛒",
  Culture: "🎭", Temple: "⛩️", Park: "🌿", Viewpoint: "🔭",
  Spa: "💆", Tour: "🗺️", Activity: "⚡",
};

interface Props {
  onClose: () => void;
  onSave: (days: Day[]) => void;
  existingDays: Day[];
  destination: string;
  startDate?: string;
  endDate?: string;
}

function makePlaceId() {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function ManualPlanModal({ onClose, onSave, existingDays, destination, startDate }: Props) {
  const [days, setDays] = useState<Day[]>(
    existingDays.length > 0
      ? existingDays
      : [{ day: 1, title: "Day 1", date: startDate ? fmtDate(startDate, 0) : "Day 1", places: [] }],
  );
  const [editingDayIdx, setEditingDayIdx] = useState<number>(0);
  const [addingPlace, setAddingPlace] = useState(false);

  // ── Day helpers ─────────────────────────────────────────────────────────────
  const addDay = () => {
    const num = days.length + 1;
    const dateStr = startDate ? fmtDate(startDate, days.length) : `Day ${num}`;
    setDays((prev) => [
      ...prev,
      { day: num, title: `Day ${num}`, date: dateStr, places: [] },
    ]);
    setEditingDayIdx(days.length);
  };

  const removeDay = (idx: number) => {
    if (days.length === 1) { toast.error("Need at least one day"); return; }
    setDays((prev) => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })));
    setEditingDayIdx((prev) => Math.max(0, prev > idx ? prev - 1 : prev));
  };

  const updateDayTitle = (idx: number, title: string) => {
    setDays((prev) => prev.map((d, i) => i === idx ? { ...d, title } : d));
  };

  // ── Place helpers ────────────────────────────────────────────────────────────
  const addPlace = (place: Omit<Place, "id" | "image">) => {
    const image = getPlaceImage(place.name, place.city, place.tag);
    const newPlace: Place = { id: makePlaceId(), image, ...place };
    setDays((prev) =>
      prev.map((d, i) =>
        i === editingDayIdx ? { ...d, places: [...d.places, newPlace] } : d,
      ),
    );
    setAddingPlace(false);
  };

  const removePlace = (dayIdx: number, placeId: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx ? { ...d, places: d.places.filter((p) => p.id !== placeId) } : d,
      ),
    );
  };

  const handleSave = () => {
    const valid = days.every((d) => d.title.trim());
    if (!valid) { toast.error("Each day needs a title"); return; }
    onSave(days);
  };

  const activeDay = days[editingDayIdx];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-background/80 backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl shadow-card sm:max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Manual planning</p>
            <h2 className="font-display text-2xl">{destination}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
              style={{ background: "var(--gradient-aurora)" }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Save plan
            </button>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Days sidebar */}
          <div className="flex w-48 shrink-0 flex-col border-r border-white/8 p-3">
            <p className="mb-2 px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Days</p>
            <div className="flex-1 space-y-1 overflow-y-auto">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`group flex items-center gap-1 rounded-xl px-2 py-2 cursor-pointer transition ${
                    editingDayIdx === i ? "bg-white/10 ring-1 ring-white/15" : "hover:bg-white/5"
                  }`}
                  onClick={() => setEditingDayIdx(i)}
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">Day {d.day}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{d.places.length} place{d.places.length !== 1 ? "s" : ""}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeDay(i); }}
                    className="hidden h-5 w-5 shrink-0 place-items-center rounded group-hover:grid text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addDay}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/20 px-3 py-2 text-xs text-muted-foreground transition hover:border-white/40 hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add day
            </button>
          </div>

          {/* Day editor */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {activeDay && (
              <>
                {/* Day title editor */}
                <div className="border-b border-white/8 px-5 py-3">
                  <input
                    value={activeDay.title}
                    onChange={(e) => updateDayTitle(editingDayIdx, e.target.value)}
                    placeholder="Day title…"
                    className="w-full bg-transparent font-display text-xl focus:outline-none placeholder:text-muted-foreground/40"
                  />
                  <p className="mt-0.5 text-xs text-muted-foreground">{activeDay.date}</p>
                </div>

                {/* Places list */}
                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                  <AnimatePresence>
                    {activeDay.places.length === 0 && !addingPlace && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-10 text-center"
                      >
                        <MapPin className="mx-auto h-8 w-8 text-muted-foreground/30" />
                        <p className="mt-3 text-sm text-muted-foreground">No places yet</p>
                        <p className="text-xs text-muted-foreground/60">Add your first stop below</p>
                      </motion.div>
                    )}

                    {activeDay.places.map((place) => (
                      <motion.div
                        key={place.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="group flex items-center gap-3 rounded-2xl bg-white/5 p-3 hover:bg-white/8 transition"
                      >
                        {/* Thumbnail */}
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                          <PlaceImage
                            name={place.name}
                            city={place.city}
                            tag={place.tag}
                            alt={place.name}
                            width={200}
                            height={200}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">{place.emoji} {place.name}</p>
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />{place.city}
                            <span className="mx-1 opacity-40">·</span>
                            <Clock className="h-3 w-3" />{place.time}
                            <span className="mx-1 opacity-40">·</span>
                            {place.tag}
                          </p>
                        </div>
                        <button
                          onClick={() => removePlace(editingDayIdx, place.id)}
                          className="hidden h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:text-destructive group-hover:grid transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add place form */}
                  <AnimatePresence>
                    {addingPlace && (
                      <AddPlaceForm
                        destination={destination}
                        onAdd={addPlace}
                        onCancel={() => setAddingPlace(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Add place button */}
                {!addingPlace && (
                  <div className="border-t border-white/8 p-4">
                    <button
                      onClick={() => setAddingPlace(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-3 text-sm text-muted-foreground transition hover:border-white/40 hover:text-foreground"
                    >
                      <Plus className="h-4 w-4" /> Add place to Day {activeDay.day}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Add Place Form ─────────────────────────────────────────────────────────────
function AddPlaceForm({
  destination,
  onAdd,
  onCancel,
}: {
  destination: string;
  onAdd: (place: Omit<Place, "id" | "image">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState(destination);
  const [tag, setTag] = useState("Landmark");
  const [time, setTime] = useState("10:00");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Place name is required"); return; }
    onAdd({ name: name.trim(), city: city.trim() || destination, emoji: EMOJIS[tag] ?? "📍", tag, time });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={submit}
      className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3"
    >
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">New place</p>

      {/* Name */}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Place name (e.g. Eiffel Tower)"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
      </div>

      {/* City */}
      <div className="relative">
        <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City / Area"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Time */}
        <div className="relative">
          <Clock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none [color-scheme:dark]"
          />
        </div>

        {/* Tag */}
        <div className="relative">
          <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm focus:border-primary/50 focus:outline-none"
          >
            {TAGS.map((t) => <option key={t} value={t}>{EMOJIS[t]} {t}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-[1.01]"
          style={{ background: "var(--gradient-aurora)" }}
        >
          Add place
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 transition"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

function fmtDate(startDate: string, offsetDays: number): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
