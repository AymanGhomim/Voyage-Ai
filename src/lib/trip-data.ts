import santorini from "@/assets/hero-santorini.jpg";
import tokyo from "@/assets/place-tokyo.jpg";
import bali from "@/assets/place-bali.jpg";
import iceland from "@/assets/place-iceland.jpg";
import { getPlaceImage } from "@/lib/place-image";

export type Place = {
  id: string;
  name: string;
  city: string;
  emoji: string;
  tag: string;
  time: string;
  image: string;
};

export type Day = {
  day: number;
  title: string;
  date: string;
  places: Place[];
};

export type Trip = {
  id: string;
  title: string;
  destination: string;
  dates: string;
  cover: string;
  budget: { spent: number; total: number };
  members: { name: string; color: string }[];
  days: Day[];
};

export const trips: Trip[] = [
  {
    id: "santorini",
    title: "Santorini Escape",
    destination: "Greece",
    dates: "Jun 12 – Jun 19",
    cover: santorini,
    budget: { spent: 1840, total: 3200 },
    members: [
      { name: "Maya", color: "from-fuchsia-400 to-violet-500" },
      { name: "Leo",  color: "from-amber-400 to-orange-500" },
      { name: "Sana", color: "from-sky-400 to-cyan-500" },
      { name: "Theo", color: "from-emerald-400 to-teal-500" },
    ],
    days: [
      {
        day: 1,
        title: "Arrival & Caldera Sunset",
        date: "Jun 12",
        places: [
          { id: "p1", name: "Oia Village",  city: "Santorini",   emoji: "🌅", tag: "Sunset", time: "18:30", image: getPlaceImage("Oia Village",  "Santorini",   "Sunset") },
          { id: "p2", name: "Ammoudi Bay",  city: "Santorini",   emoji: "🍷", tag: "Dinner", time: "20:30", image: getPlaceImage("Ammoudi Bay",  "Santorini",   "Dinner") },
        ],
      },
      {
        day: 2,
        title: "Volcano & Hot Springs",
        date: "Jun 13",
        places: [
          { id: "p3", name: "Nea Kameni",   city: "Volcano",     emoji: "🌋", tag: "Hike",   time: "10:00", image: getPlaceImage("Nea Kameni",   "Volcano",     "Hike")   },
          { id: "p4", name: "Palea Kameni", city: "Hot Springs", emoji: "♨️", tag: "Swim",   time: "13:00", image: getPlaceImage("Palea Kameni", "Hot Springs", "Swim")   },
        ],
      },
      {
        day: 3,
        title: "Wine & Cliffside Drift",
        date: "Jun 14",
        places: [
          { id: "p5", name: "Santo Wines",  city: "Pyrgos",      emoji: "🍇", tag: "Tasting", time: "16:00", image: getPlaceImage("Santo Wines", "Pyrgos", "Tasting") },
        ],
      },
    ],
  },
  {
    id: "tokyo",
    title: "Neon Tokyo",
    destination: "Japan",
    dates: "Sep 02 – Sep 11",
    cover: tokyo,
    budget: { spent: 2200, total: 4800 },
    members: [
      { name: "Kai", color: "from-pink-400 to-rose-500" },
      { name: "Riv", color: "from-indigo-400 to-violet-500" },
    ],
    days: [],
  },
  {
    id: "bali",
    title: "Bali Reset",
    destination: "Indonesia",
    dates: "Nov 18 – Nov 28",
    cover: bali,
    budget: { spent: 600, total: 2600 },
    members: [{ name: "Ana", color: "from-emerald-400 to-lime-500" }],
    days: [],
  },
  {
    id: "iceland",
    title: "Aurora Run",
    destination: "Iceland",
    dates: "Feb 03 – Feb 09",
    cover: iceland,
    budget: { spent: 0, total: 3400 },
    members: [{ name: "Jules", color: "from-cyan-400 to-blue-500" }],
    days: [],
  },
];
