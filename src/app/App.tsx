import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useAnimation,
} from "motion/react";
import {
  ThumbsUp, Zap, Target, Users, Flame,
  Clock, MapPin, X, Check, RotateCcw, RefreshCw,
  Bookmark, Layers, Heart, Sparkles, ArrowRight, Trophy,
  Star, Wine, Smile, Info, Bolt,
} from "lucide-react";

/* ── Overlay opacity context ───────────────────────────────── */
const OverlayCtx = createContext<{ opacity: number; setOpacity: (v: number) => void }>({ opacity: 0.9, setOpacity: () => {} });

/* ── Tokens ────────────────────────────────────────────────── */
const A  = "#f5a623";
const S  = "#1a1a1a";
const IN = "#111111";
const BD = "#2a2a2a";
const MU = "#666666";
const ME = { dupr: 3.41, avatar: "AR" };

/* ── Avatar photos ────────────────────────────────────────── */
const AVATAR_PHOTOS: Record<string, string> = {
  AR: "https://i.pravatar.cc/80?img=33",
  SK: "https://i.pravatar.cc/80?img=5",
  TM: "https://i.pravatar.cc/80?img=12",
  JP: "https://i.pravatar.cc/80?img=18",
  MT: "https://i.pravatar.cc/80?img=51",
  CL: "https://i.pravatar.cc/80?img=59",
  SB: "https://i.pravatar.cc/80?img=60",
  PR: "https://i.pravatar.cc/80?img=25",
  TN: "https://i.pravatar.cc/80?img=52",
  DW: "https://i.pravatar.cc/80?img=53",
  ML: "https://i.pravatar.cc/80?img=23",
  LC: "https://i.pravatar.cc/80?img=35",
  BP: "https://i.pravatar.cc/80?img=54",
  AN: "https://i.pravatar.cc/80?img=9",
  LN: "https://i.pravatar.cc/80?img=57",
  RS: "https://i.pravatar.cc/80?img=20",
  HO: "https://i.pravatar.cc/80?img=24",
  NM: "https://i.pravatar.cc/80?img=56",
  MR: "https://i.pravatar.cc/80?img=11",
  JL: "https://i.pravatar.cc/80?img=13",
  KP: "https://i.pravatar.cc/80?img=16",
  TC: "https://i.pravatar.cc/80?img=14",
  GG: "https://i.pravatar.cc/80?img=68",
  JN: "https://i.pravatar.cc/80?img=7",
  PL: "https://i.pravatar.cc/80?img=8",
  MC: "https://i.pravatar.cc/80?img=26",
  DT: "https://i.pravatar.cc/80?img=15",
};

function PhotoAvatar({ initials, size, fallbackBg = "#333", fallbackColor = "#fff", style = {} }: {
  initials: string; size: number; fallbackBg?: string; fallbackColor?: string; style?: React.CSSProperties;
}) {
  const src = AVATAR_PHOTOS[initials];
  return src ? (
    <img src={src} alt={initials}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", ...style }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: "50%", background: fallbackBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 600, color: fallbackColor, ...style }}>
      {initials}
    </div>
  );
}

/* ── Types ─────────────────────────────────────────────────── */
type Session     = { id: number; name: string; venue: string; court: string; time: string; format: string; totalSpots: number; filled: number; matchScore: number; gameQuality: number; waitMinutes: number; duprRange: { min: number; max: number; avg: number }; vibe: string; vibeExtra: string[]; players: { name: string; dupr: number; avatar: string; isFriend: boolean }[]; friendCount: number; };
type ConcernId   = "friends" | "swiperight" | "wait" | "level" | "vibe";
type FilterId    = "all" | "fast" | "level" | "friends";
type SwipeAction = "join" | "skip";
type TabId       = "swipe" | "saved" | "scene" | "test" | "testsaved" | "test2";
type AroundMeTab = "hotspots" | "circle";

/* ── Data ──────────────────────────────────────────────────── */
const ALL_SESSIONS: Session[] = [
  { id: 1, name: "Saigon Smash Social", venue: "D9 Sports Club", court: "Courts 3–5c", time: "7:30 PM", format: "Round Robin", totalSpots: 20, filled: 14, matchScore: 92, gameQuality: 4.6, waitMinutes: 6, duprRange: { min: 3.1, max: 3.7, avg: 3.38 }, vibe: "Social", vibeExtra: ["Fast rotations", "Beer after"], players: [{ name: "Sarah", dupr: 3.41, avatar: "SK", isFriend: true }, { name: "Taylor", dupr: 3.47, avatar: "TM", isFriend: true }, { name: "Jordan", dupr: 3.19, avatar: "JP", isFriend: true }, { name: "Mike", dupr: 3.28, avatar: "MT", isFriend: false }, { name: "Chris", dupr: 3.33, avatar: "CL", isFriend: false }, { name: "Sam", dupr: 3.55, avatar: "SB", isFriend: false }], friendCount: 3 },
  { id: 2, name: "D7 Competitive RR", venue: "District 7 Courts", court: "Courts 1–2", time: "8:00 PM", format: "Competitive", totalSpots: 16, filled: 12, matchScore: 78, gameQuality: 4.9, waitMinutes: 14, duprRange: { min: 3.3, max: 4.1, avg: 3.72 }, vibe: "Intense", vibeExtra: ["Skill-first", "No mercy"], players: [{ name: "Priya", dupr: 3.88, avatar: "PR", isFriend: false }, { name: "Tom", dupr: 3.71, avatar: "TN", isFriend: false }, { name: "Dane", dupr: 4.02, avatar: "DW", isFriend: false }, { name: "Mai", dupr: 3.45, avatar: "ML", isFriend: false }], friendCount: 0 },
  { id: 3, name: "Rooftop Rally Chill", venue: "Landmark 81", court: "Courts R1–R2", time: "7:00 PM", format: "Open Play", totalSpots: 12, filled: 4, matchScore: 63, gameQuality: 3.7, waitMinutes: 2, duprRange: { min: 2.8, max: 3.5, avg: 3.1 }, vibe: "Chill", vibeExtra: ["Relaxed", "City views"], players: [{ name: "Lin", dupr: 3.2, avatar: "LC", isFriend: false }, { name: "Ben", dupr: 2.95, avatar: "BP", isFriend: false }], friendCount: 0 },
  { id: 4, name: "Ben Thanh Night Rally", venue: "Ben Thanh Sports", court: "Courts 2–4", time: "9:00 PM", format: "Open Play", totalSpots: 18, filled: 9, matchScore: 85, gameQuality: 4.3, waitMinutes: 4, duprRange: { min: 3.0, max: 3.8, avg: 3.45 }, vibe: "Social", vibeExtra: ["Late night", "Fun energy"], players: [{ name: "Anna", dupr: 3.52, avatar: "AN", isFriend: true }, { name: "Leon", dupr: 3.38, avatar: "LN", isFriend: false }, { name: "Rosa", dupr: 3.44, avatar: "RS", isFriend: false }], friendCount: 1 },
  { id: 5, name: "Thao Dien Morning", venue: "Thao Dien Courts", court: "Courts 1–3", time: "6:30 AM", format: "Round Robin", totalSpots: 16, filled: 11, matchScore: 71, gameQuality: 4.1, waitMinutes: 8, duprRange: { min: 2.9, max: 3.6, avg: 3.25 }, vibe: "Chill", vibeExtra: ["Early birds", "Cool temps"], players: [{ name: "Hoa", dupr: 3.1, avatar: "HO", isFriend: false }, { name: "Nam", dupr: 3.3, avatar: "NM", isFriend: false }], friendCount: 0 },
];

const SAVED_IDS = [1, 2, 4];

/* ── Detail panels ─────────────────────────────────────────── */
const SWIPE_AVATARS = [
  { initials: "MR", color: "#7C3AED" }, { initials: "JL", color: "#0D9488" },
  { initials: "KP", color: "#BE185D" }, { initials: "DW", color: "#B45309" },
  { initials: "AN", color: "#1D4ED8" }, { initials: "TC", color: "#0F766E" },
];

function SwipeRightPanel() {
  return (
    <div style={{ background: IN, border: `1px solid ${BD}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 40, fontWeight: 600, color: A, lineHeight: 1 }}>56</span>
          <div style={{ fontSize: 11, color: MU, marginTop: 4 }}>players chose this tonight</div>
        </div>
        <div style={{ textAlign: "right", paddingTop: 2 }}>
          <div style={{ fontSize: 12, color: A, fontWeight: 600, marginBottom: 4 }}>🔥 Trending #1</div>
          <div style={{ fontSize: 11, color: MU }}>89% join rate</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex" }}>
          {SWIPE_AVATARS.map((a, i) => (
            <PhotoAvatar key={i} initials={a.initials} size={30} fallbackBg={a.color}
              style={{ border: "2px solid #111", marginLeft: i > 0 ? -8 : 0, position: "relative", zIndex: 6 - i }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: MU, marginLeft: 10 }}>+ 52 players</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <span style={{ fontSize: 10, color: MU, background: BD, borderRadius: 20, padding: "3px 10px" }}>Most popular tonight</span>
        <span style={{ fontSize: 10, color: MU, background: BD, borderRadius: 20, padding: "3px 10px" }}>Fast filling</span>
      </div>
    </div>
  );
}

function WaitPanel({ s }: { s: Session }) {
  const pct = (s.filled / s.totalSpots) * 100;
  return (
    <div style={{ background: IN, border: `1px solid ${BD}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 40, fontWeight: 600, color: A, lineHeight: 1 }}>{s.waitMinutes <= 3 ? "Now" : `${s.waitMinutes}m`}</span>
        <span style={{ fontSize: 13, color: MU, paddingTop: 2 }}>until you play</span>
      </div>
      <div style={{ height: 4, background: BD, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: A, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: MU }}>{s.filled} of {s.totalSpots} spots · {s.totalSpots - s.filled} remaining</span>
    </div>
  );
}

function LevelPanel({ s }: { s: Session }) {
  const pct    = (v: number) => Math.max(0, Math.min(100, ((v - 2) / 3) * 100));
  const rLeft  = pct(s.duprRange.min);
  const rWidth = pct(s.duprRange.max) - rLeft;
  const myPos  = pct(ME.dupr);
  const inRange = ME.dupr >= s.duprRange.min && ME.dupr <= s.duprRange.max;
  return (
    <div style={{ background: IN, border: `1px solid ${BD}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <span style={{ fontSize: 40, fontWeight: 600, color: A, lineHeight: 1 }}>{inRange ? "✓" : "~"}</span>
        <span style={{ fontSize: 13, color: MU, paddingTop: 2 }}>Range {s.duprRange.min}–{s.duprRange.max} · avg {s.duprRange.avg.toFixed(2)}</span>
      </div>
      <div style={{ position: "relative", height: 8, background: BD, borderRadius: 4 }}>
        <div style={{ position: "absolute", top: 0, height: "100%", background: A + "33", borderRadius: 4, left: `${rLeft}%`, width: `${rWidth}%` }} />
        <div style={{ position: "absolute", top: "50%", transform: "translate(-50%,-50%)", left: `${myPos}%`, width: 20, height: 20, borderRadius: "50%", background: A, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 600, color: "#000" }}>me</div>
      </div>
    </div>
  );
}

const FRIEND_COLORS = ["#7C3AED", "#0D9488", "#BE185D", "#B45309", "#1D4ED8"];

function FriendsPanel({ s }: { s: Session }) {
  const friends = s.players.filter(p => p.isFriend);
  return (
    <div style={{ background: IN, border: `1px solid ${BD}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 40, fontWeight: 600, color: friends.length > 0 ? A : MU, lineHeight: 1 }}>
          {friends.length > 0 ? friends.length : "—"}
        </span>
        <span style={{ fontSize: 13, color: MU, paddingTop: 2 }}>{friends.length > 0 ? "contacts going tonight" : "no contacts going"}</span>
      </div>
      {friends.length > 0 ? (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-start" }}>
          {friends.map((p, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <PhotoAvatar initials={p.avatar} size={56} fallbackBg={FRIEND_COLORS[i % FRIEND_COLORS.length]}
                style={{ border: `2px solid ${A}33` }} />
              <span style={{ fontSize: 10, color: "#aaa" }}>{p.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 12, color: MU, margin: 0 }}>None of your contacts are going yet.</p>
      )}
    </div>
  );
}

function VibePanel({ s }: { s: Session }) {
  return (
    <div style={{ background: IN, border: `1px solid ${BD}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ fontSize: 40, fontWeight: 600, color: A, lineHeight: 1 }}>{s.vibe}</span>
        <span style={{ fontSize: 13, color: MU, paddingTop: 2 }}>{s.format}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {s.vibeExtra.map((v, i) => (
          <span key={i} style={{ fontSize: 11, color: MU, border: `1px solid ${BD}`, borderRadius: 20, padding: "3px 10px" }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Friends row ───────────────────────────────────────────── */
const FRIEND_AVATARS_ROW = [
  { initials: "PR", color: "#7C3AED" },
  { initials: "DW", color: "#0D9488" },
  { initials: "LC", color: "#BE185D" },
];
function FriendsRow() {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: MU, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        Top Players Joining
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex" }}>
          {FRIEND_AVATARS_ROW.map((a, i) => (
            <PhotoAvatar key={i} initials={a.initials} size={32} fallbackBg={a.color}
              style={{ border: "2px solid #0a0a0a", marginLeft: i > 0 ? -6 : 0, position: "relative", zIndex: 3 - i }} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: MU, marginLeft: 10 }}>+ 9 others (3.2–3.6)</span>
      </div>
    </div>
  );
}

/* ── Tile strip ────────────────────────────────────────────── */
const TILES: { id: ConcernId; icon: React.ReactNode; label: (s: Session) => string; sub: string }[] = [
  { id: "friends",    icon: <Users    size={18} strokeWidth={1.5} />, label: s => `${s.friendCount}`,                    sub: "Friends"     },
  { id: "swiperight", icon: <ThumbsUp size={18} strokeWidth={1.5} />, label: _s => "56",                                sub: "Swipe Right" },
  { id: "wait",       icon: <Zap      size={18} strokeWidth={1.5} />, label: s => s.waitMinutes <= 3 ? "Now" : `${s.waitMinutes}m`, sub: "Wait" },
  { id: "level",      icon: <Target   size={18} strokeWidth={1.5} />, label: s => s.duprRange.avg.toFixed(2),           sub: "Avg DUPR"    },
  { id: "vibe",       icon: <Flame    size={18} strokeWidth={1.5} />, label: s => s.vibe,                               sub: "Vibe"        },
];

/* ── Auto-rotate hook ──────────────────────────────────────── */
const TILE_ORDER: ConcernId[] = TILES.map(t => t.id);

function useAutoRotate(active: ConcernId, setActive: (id: ConcernId) => void) {
  const stopped = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (stopped.current) return;
    const timer = setInterval(() => {
      if (stopped.current) return;
      const idx = TILE_ORDER.indexOf(activeRef.current);
      setActive(TILE_ORDER[(idx + 1) % TILE_ORDER.length]);
    }, 3000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserTap = (id: ConcernId) => {
    stopped.current = true;
    setActive(id);
  };

  return handleUserTap;
}

/* ── Card background images ────────────────────────────────── */
const CARD_BG_IMAGES = ["/card-bg.webp", "/card-bg-2.jpg"];

function CardBgRotator() {
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveImg(prev => (prev + 1) % CARD_BG_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      {CARD_BG_IMAGES.map((src, i) => (
        <div key={src} style={{ position: "absolute", inset: 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, opacity: i === activeImg ? 1 : 0, transition: "opacity 1.2s ease-in-out" }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.90)", zIndex: 1 }} />
    </>
  );
}

function TestCardBgRotator() {
  const { opacity } = useContext(OverlayCtx);
  const [activeImg, setActiveImg] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveImg(prev => (prev + 1) % CARD_BG_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <>
      {CARD_BG_IMAGES.map((src, i) => (
        <div key={src} style={{ position: "absolute", inset: 0, backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0, opacity: i === activeImg ? 1 : 0, transition: "opacity 1.2s ease-in-out" }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${opacity})`, zIndex: 1, transition: "background 0.15s ease" }} />
    </>
  );
}

/* ── CardContent ───────────────────────────────────────────── */
function CardContent({ s, active, setActive, carouselMode = false, isBestMatch = false, onRemove }: {
  s: Session; active: ConcernId; setActive: (id: ConcernId) => void;
  carouselMode?: boolean; isBestMatch?: boolean; onRemove?: () => void;
}) {
  const handleUserTap = useAutoRotate(active, setActive);
  return (
    <div style={{ position: "relative", border: `1px solid ${BD}`, borderRadius: 20, overflow: "hidden", ...(carouselMode ? { flex: 1, display: "flex", flexDirection: "column" } as React.CSSProperties : {}) }}>
      <CardBgRotator />
      {/* Card content */}
      <div style={{ position: "relative", zIndex: 2, padding: 16, ...(carouselMode ? { flex: 1, display: "flex", flexDirection: "column" } as React.CSSProperties : {}) }}>
      {isBestMatch && (
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: A, border: `1px solid ${A}55`, borderRadius: 20, padding: "3px 10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Best Match
          </span>
        </div>
      )}
      {/* Name + match */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>{s.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: MU }}>
            <Clock size={11} color={MU} strokeWidth={1.5} /><span>{s.time}</span>
            <span>·</span>
            <MapPin size={11} color={MU} strokeWidth={1.5} /><span>{s.court}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: A, lineHeight: 1 }}>{s.matchScore}%</div>
          <div style={{ fontSize: 10, color: MU, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>Match</div>
        </div>
      </div>
      {/* Tile strip */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {TILES.map(t => {
          const isActive = active === t.id;
          return (
            <button key={t.id} onClick={() => handleUserTap(t.id)} style={{ flex: 1, background: IN, border: `1px solid ${isActive ? A : BD}`, borderRadius: 12, padding: "10px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
              <span style={{ color: A }}>{t.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1 }}>{t.label(s)}</span>
              <span style={{ fontSize: 10, color: MU, lineHeight: 1 }}>{t.sub}</span>
            </button>
          );
        })}
      </div>
      {/* Friends row */}
      <FriendsRow />
      {/* Detail panel */}
      <div style={{ height: carouselMode ? undefined : 158, flex: carouselMode ? 1 : undefined, overflow: "hidden", minHeight: carouselMode ? 158 : undefined }}>
        {active === "friends"    && <FriendsPanel    s={s} />}
        {active === "swiperight" && <SwipeRightPanel />}
        {active === "wait"       && <WaitPanel       s={s} />}
        {active === "level"      && <LevelPanel      s={s} />}
        {active === "vibe"       && <VibePanel       s={s} />}
      </div>
      {/* CTA */}
      {carouselMode ? (
        <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", gap: 8 }}>
          <a href="https://reclub.co/m/3CUP8A" target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, textDecoration: "none" }}>
            <div style={{ width: "100%", background: A, borderRadius: 14, padding: "12px 0", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600, color: "#1a0a00", textAlign: "center" }}>
              Join on Reclub
            </div>
          </a>
          {onRemove && (
            <button onClick={onRemove}
              style={{ width: "20%", flexShrink: 0, background: IN, border: `1px solid ${BD}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color="#888" strokeWidth={2} />
            </button>
          )}
        </div>
      ) : (
        <button style={{ marginTop: 12, width: "100%", background: A, border: "none", borderRadius: 14, padding: "14px 0", cursor: "pointer", fontFamily: "inherit" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>Shortlist</div>
        </button>
      )}
      </div>{/* end card content */}
    </div>
  );
}

/* ── SwipeCard ─────────────────────────────────────────────── */
function SwipeCard({ s, isExiting, exitDir, onAction, onExited }: {
  s: Session; isExiting: boolean; exitDir: SwipeAction;
  onAction: (a: SwipeAction) => void; onExited: () => void;
}) {
  const controls  = useAnimation();
  const x         = useMotionValue(0);
  const rotate    = useTransform(x, [-220, 0, 220], [-8, 0, 8]);
  const joinOp    = useTransform(x, [20, 90], [0, 1]);
  const skipOp    = useTransform(x, [-20, -90], [0, 1]);
  const [active, setActive]    = useState<ConcernId>("friends");
  const [grayFlash, setGrayFlash] = useState(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    exitingRef.current = false; setGrayFlash(false); setActive("friends"); x.set(0);
    controls.set({ opacity: 0.85, scale: 0.95, x: 0 });
    controls.start({ opacity: 1, scale: 1, transition: { duration: 0.22, ease: "easeOut" } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  useEffect(() => {
    if (!isExiting || exitingRef.current) return;
    exitingRef.current = true;
    if (exitDir === "skip") setGrayFlash(true);
    const tx = exitDir === "join" ? 520 : -520;
    controls.start({ x: tx, opacity: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (exitingRef.current) return;
    const { offset, velocity } = info;
    if (offset.x > 80 || velocity.x > 400) {
      exitingRef.current = true; onAction("join");
      controls.start({ x: 520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
    } else if (offset.x < -80 || velocity.x < -400) {
      exitingRef.current = true; setGrayFlash(true); onAction("skip");
      controls.start({ x: -520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 320, damping: 28 } });
    }
  };

  return (
    <motion.div animate={controls} style={{ x, rotate, position: "relative", touchAction: "pan-y" }}
      drag={exitingRef.current ? false : "x"} dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.88} dragMomentum={false} onDragEnd={handleDragEnd} whileDrag={{ cursor: "grabbing" }}>
      <motion.div style={{ position: "absolute", top: 20, right: 20, zIndex: 20, pointerEvents: "none", opacity: joinOp, background: A + "22", border: `1.5px solid ${A}`, borderRadius: 8, padding: "5px 14px" }}>
        <span style={{ color: A, fontSize: 12, fontWeight: 600 }}>JOIN ✓</span>
      </motion.div>
      <motion.div style={{ position: "absolute", top: 20, left: 20, zIndex: 20, pointerEvents: "none", opacity: skipOp, background: "rgba(60,60,60,0.5)", border: "1.5px solid #555", borderRadius: 8, padding: "5px 14px" }}>
        <span style={{ color: "#999", fontSize: 12, fontWeight: 600 }}>SKIP ✕</span>
      </motion.div>
      {grayFlash && (
        <motion.div style={{ position: "absolute", inset: 0, background: "#3c3c3c", borderRadius: 20, zIndex: 15, pointerEvents: "none" }}
          initial={{ opacity: 0 }} animate={{ opacity: [0, 0.45, 0] }} transition={{ duration: 0.42 }} />
      )}
      <CardContent s={s} active={active} setActive={setActive} />
    </motion.div>
  );
}

/* ── Secondary card ────────────────────────────────────────── */
function Sig({ icon, label, color = A }: { icon: React.ReactNode; label: string; color?: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 4 }}>{icon}<span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span></div>;
}
function Div() { return <div style={{ width: 1, height: 12, background: BD }} />; }

function getSwipeCount(id: number): number {
  return 20 + ((id * 37 + 13) % 60);
}

function SecondaryCard({ s }: { s: Session }) {
  const inRange = ME.dupr >= s.duprRange.min && ME.dupr <= s.duprRange.max;
  const mc = s.matchScore >= 85 ? A : s.matchScore >= 70 ? "#888" : "#555";
  const swipeCount = getSwipeCount(s.id);
  return (
    <div style={{ background: S, border: `1px solid ${BD}`, borderRadius: 20, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{s.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: MU }}>
            <Clock size={10} color={MU} strokeWidth={1.5} /><span>{s.time}</span><span>·</span>
            <MapPin size={10} color={MU} strokeWidth={1.5} /><span>{s.venue}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: mc, lineHeight: 1 }}>{s.matchScore}%</div>
          <div style={{ fontSize: 10, color: MU, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>Match</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Sig icon={<ThumbsUp size={11} fill={A} color={A} strokeWidth={1.5} />} label={`${swipeCount}`} />
        <Div /><Sig icon={<Zap size={11} color={A} strokeWidth={1.5} />} label={s.waitMinutes <= 3 ? "Now" : `${s.waitMinutes}m`} />
        <Div /><Sig icon={<Target size={11} color={inRange ? A : MU} strokeWidth={1.5} />} label={inRange ? "My level" : "Above"} color={inRange ? A : MU} />
        <Div /><Sig icon={<Users size={11} color={s.friendCount > 0 ? A : MU} strokeWidth={1.5} />} label={s.friendCount > 0 ? `${s.friendCount} fr.` : "—"} color={s.friendCount > 0 ? A : MU} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: MU }}>{s.totalSpots - s.filled} left</span>
      </div>
    </div>
  );
}

/* ── Shared top bar (sticky) ───────────────────────────────── */
function TopBar({ subtitle, title, size = 20, onAvatarTap }: { subtitle?: string; title: string; size?: number; onAvatarTap?: () => void }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#0a0a0a", padding: subtitle ? "16px 16px 12px" : "12px 16px 10px", marginLeft: -16, marginRight: -16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {subtitle && <div style={{ fontSize: 11, color: MU, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{subtitle}</div>}
          <div style={{ fontSize: size, fontWeight: 600, color: "#fff" }}>{title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: IN, border: `1px solid ${BD}`, borderRadius: 20, padding: "4px 10px", fontSize: 13, fontWeight: 600, color: A }}>{ME.dupr}</div>
          <div onClick={onAvatarTap} style={{ cursor: onAvatarTap ? "pointer" : "default" }}>
            <PhotoAvatar initials={ME.avatar} size={34} fallbackBg={A} fallbackColor="#000" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bottom nav ────────────────────────────────────────────── */
function BottomNav({ active, onSelect, savedCount }: { active: TabId; onSelect: (t: TabId) => void; savedCount: number }) {
  const tabs: { id: TabId; icon: React.ReactNode; label: string; badge?: number }[] = [
    // { id: "swipe", icon: <Layers   size={18} strokeWidth={1.5} />, label: "Swipe" },
    // { id: "saved", icon: <Bookmark size={18} strokeWidth={1.5} />, label: "Saved", badge: savedCount },
    { id: "scene", icon: <MapPin   size={18} strokeWidth={1.5} />, label: "Around Me" },
    { id: "test",  icon: <Sparkles size={18} strokeWidth={1.5} />, label: "Happening" },
    { id: "test2", icon: <Zap size={18} strokeWidth={1.5} />, label: "Test2" },
    { id: "testsaved", icon: <Heart size={18} strokeWidth={1.5} />, label: "Shortlist" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#0a0a0a", borderTop: "0.5px solid #1e1e1e", display: "flex", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom, 0px)", height: "calc(64px + env(safe-area-inset-bottom, 0px))" }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, paddingBottom: 10, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>
            <div style={{ position: "relative" }}>
              <span style={{ color: on ? A : "#444" }}>{t.icon}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <div style={{ position: "absolute", top: -4, right: -8, background: A, color: "#1a0a00", fontSize: 8, fontWeight: 600, borderRadius: 10, padding: "1px 5px", minWidth: 14, textAlign: "center" }}>{t.badge}</div>
              )}
            </div>
            <span style={{ fontSize: 9, color: on ? A : "#444" }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Carousel card ─────────────────────────────────────────── */
function CarouselCard({ s, isBestMatch, onRemove }: { s: Session; isBestMatch?: boolean; onRemove?: () => void }) {
  const [active, setActive] = useState<ConcernId>("friends");
  return (
    <div style={{ minWidth: 280, width: "82vw", maxWidth: 350, flexShrink: 0, scrollSnapAlign: "start", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <CardContent s={s} active={active} setActive={setActive} carouselMode isBestMatch={isBestMatch} onRemove={onRemove} />
      </div>
    </div>
  );
}

/* ── Saved screen ──────────────────────────────────────────── */
function SavedScreen({ sessions }: { sessions: Session[] }) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [sort, setSort] = useState<"match" | "wait" | "friends">("match");
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const visibleSessions = sessions.filter(s => !removedIds.has(s.id));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const approxCard = scrollRef.current.offsetWidth * 0.82 + 10;
    setCarouselIdx(Math.min(Math.round(scrollRef.current.scrollLeft / approxCard), visibleSessions.length - 1));
  };

  const handleRemove = (id: number) => {
    setRemovedIds(prev => new Set([...prev, id]));
  };

  const SORT_LABELS: Record<string, string> = { match: "Best match", wait: "Wait time", friends: "Friends" };

  return (
    <div>
      <div style={{ padding: "0 16px" }}>
        <TopBar subtitle="Saved" title="Your shortlist" />
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["match", "wait", "friends"] as const).map(s2 => {
            const on = sort === s2;
            return (
              <button key={s2} onClick={() => setSort(s2)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: on ? 600 : 400, background: on ? A : IN, color: on ? "#000" : MU, border: on ? "none" : `1px solid ${BD}`, cursor: "pointer", fontFamily: "inherit" }}>
                {SORT_LABELS[s2]}
              </button>
            );
          })}
        </div>
      </div>
      <div ref={scrollRef} onScroll={handleScroll}
        style={{ display: "flex", gap: 10, paddingLeft: 12, paddingRight: 12, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", alignItems: "stretch" } as React.CSSProperties}>
        {visibleSessions.length > 0 ? visibleSessions.map((sess, i) => (
          <CarouselCard key={sess.id} s={sess} isBestMatch={i === 0} onRemove={() => handleRemove(sess.id)} />
        )) : (
          <div style={{ padding: "48px 0", color: MU, fontSize: 13 }}>No saved sessions yet.</div>
        )}
      </div>
      {visibleSessions.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {visibleSessions.map((_, i) => (
            <div key={i} style={{ height: 5, width: i === carouselIdx ? 12 : 5, borderRadius: 3, background: i === carouselIdx ? A : "#1e1e1e", transition: "all 0.2s" }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Around Me screen ──────────────────────────────────────── */
const CLUBS_NEARBY = [
  { initials: "BB",  name: "Big Balls Club",  dupr: "3.2 – 3.8", dist: "1.2 km", contacts: 8, top: true  },
  { initials: "N11", name: "Next11 Club",     dupr: "3.4 – 4.0", dist: "1.8 km", contacts: 5, top: false },
  { initials: "SS",  name: "Smash Social",    dupr: "3.0 – 3.5", dist: "2.4 km", contacts: 3, top: false },
  { initials: "VC",  name: "Vạn Phúc City",  dupr: "3.5 – 4.2", dist: "2.9 km", contacts: 1, top: false },
  { initials: "D7",  name: "D7 Courts",       dupr: "3.8 – 4.5", dist: "4.1 km", contacts: 0, top: false },
];

type ActionPart = { text: string; highlight: boolean };
type MiniCard   = { name: string; district: string; time: string; spots: string };
const CIRCLE_FEED: {
  initials: string; bgColor: string; textColor: string; dupr: number;
  name: string; followedByDefault: boolean;
  actionParts: ActionPart[]; miniCard: MiniCard | null; timestamp: string;
}[] = [
  {
    initials: "GG", bgColor: "#1f1040", textColor: "#afa9ec", dupr: 3.22,
    name: "Guigui", followedByDefault: true,
    actionParts: [{ text: "joining ", highlight: false }, { text: "Next11 Club", highlight: true }, { text: " tomorrow at 9:00 AM", highlight: false }],
    miniCard: { name: "Next11", district: "D2", time: "9:00 AM", spots: "3 left" },
    timestamp: "12 min ago",
  },
  {
    initials: "JN", bgColor: "#0a2a1a", textColor: "#5dcaa5", dupr: 3.47,
    name: "John N.", followedByDefault: false,
    actionParts: [{ text: "played at ", highlight: false }, { text: "Big Balls Club", highlight: true }, { text: " · 14 times this month", highlight: false }],
    miniCard: null,
    timestamp: "Last seen 2 days ago",
  },
  {
    initials: "SK", bgColor: "#3a1020", textColor: "#ed93b1", dupr: 3.47,
    name: "Sarah K.", followedByDefault: true,
    actionParts: [{ text: "DUPR updated ", highlight: false }, { text: "3.41", highlight: true }, { text: " → ", highlight: false }, { text: "3.47", highlight: true }, { text: " after last night", highlight: false }],
    miniCard: null,
    timestamp: "Yesterday · Big Balls Club",
  },
  {
    initials: "TM", bgColor: "#2a1a5a", textColor: "#afa9ec", dupr: 3.55,
    name: "Taylor M.", followedByDefault: true,
    actionParts: [{ text: "saved ", highlight: false }, { text: "Saigon Smash Social", highlight: true }, { text: " for tonight", highlight: false }],
    miniCard: { name: "Smash Social", district: "D1", time: "7:30 PM", spots: "6 left" },
    timestamp: "35 min ago",
  },
];

const CROSSED_PATHS = [
  { initials: "JN", bgColor: "#0a2a1a", textColor: "#5dcaa5", dupr: 3.47, name: "John N.",  context: "8 sessions at Big Balls"    },
  { initials: "PL", bgColor: "#1f1040", textColor: "#afa9ec", dupr: 3.55, name: "Pierre L.", context: "5 sessions at Next11"        },
  { initials: "MC", bgColor: "#2a1000", textColor: "#ef9f27", dupr: 3.28, name: "Mai C.",    context: "4 sessions at Big Balls"    },
  { initials: "DT", bgColor: "#0a1a2a", textColor: "#85b7eb", dupr: 3.61, name: "David T.",  context: "3 sessions at Smash Social" },
];

function SceneScreen() {
  const [subTab, setSubTab] = useState<AroundMeTab>("hotspots");
  const [following, setFollowing] = useState<Set<string>>(
    new Set(CIRCLE_FEED.filter(f => f.followedByDefault).map(f => f.initials))
  );
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const toggleFollow = (initials: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      if (next.has(initials)) next.delete(initials); else next.add(initials);
      return next;
    });
  };

  const suggestions = CROSSED_PATHS.filter(p => !dismissed.has(p.initials));

  return (
    <div>
      <div style={{ padding: "0 16px" }}>
        <TopBar subtitle="Around you" title="Players & places" />
      </div>

      {/* Sub-tab switcher */}
      <div style={{ margin: "0 16px 16px", background: "#141414", borderRadius: 12, padding: 4, display: "flex" }}>
        {([["hotspots", "Hot Spots"], ["circle", "My Circle"]] as [AroundMeTab, string][]).map(([id, label]) => {
          const on = subTab === id;
          return (
            <button key={id} onClick={() => setSubTab(id)}
              style={{ flex: 1, background: on ? "#1e1e1e" : "none", borderRadius: 10, padding: "8px 4px", fontSize: 12, fontWeight: on ? 600 : 400, color: on ? A : "#555", border: "none", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {id === "hotspots" ? <Flame size={13} strokeWidth={1.5} /> : <Users size={13} strokeWidth={1.5} />}
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Hot Spots ── */}
      {subTab === "hotspots" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: MU, textTransform: "uppercase", letterSpacing: "0.1em" }}>Clubs near you · all time activity</span>
          </div>
          <div style={{ margin: "0 16px", background: "#111", borderRadius: 14, overflow: "hidden", border: "0.5px solid #1e1e1e" }}>
            {CLUBS_NEARBY.map((club, idx) => {
              const isLast = idx === CLUBS_NEARBY.length - 1;
              return (
                <div key={club.initials} style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 12, borderBottom: isLast ? "none" : "0.5px solid #1a1a1a" }}>
                  <span style={{ fontSize: 11, color: "#333", width: 12, flexShrink: 0, textAlign: "center" }}>{idx + 1}</span>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: "#1a1a1a", border: `0.5px solid ${club.top ? "#3a2200" : "#252525"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, color: club.top ? A : "#666", flexShrink: 0 }}>
                    {club.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#ddd", marginBottom: 3 }}>{club.name}</div>
                    <div style={{ fontSize: 10, color: A }}>{club.dupr}</div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#aaa", marginBottom: 3 }}>{club.dist}</div>
                    {club.contacts > 0 ? (
                      <div><span style={{ fontSize: 11, fontWeight: 500, color: A }}>{club.contacts}</span><span style={{ fontSize: 8, color: "#444", marginLeft: 2 }}>{club.contacts === 1 ? "contact" : "contacts"}</span></div>
                    ) : (
                      <div style={{ fontSize: 10, color: "#2a2a2a" }}>no contacts</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", padding: "14px 0 4px", fontSize: 11, color: "#444" }}>
            4 more clubs nearby ↓
          </div>
        </>
      )}

      {/* ── My Circle ── */}
      {subTab === "circle" && (
        <>
          {/* Crossed paths header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: MU, textTransform: "uppercase", letterSpacing: "0.1em" }}>Players you crossed paths with</span>
            <span style={{ fontSize: 11, color: "#555" }}>See all</span>
          </div>

          {/* Crossed paths carousel */}
          <div style={{ display: "flex", gap: 10, paddingLeft: 16, paddingRight: 16, overflowX: "auto", scrollbarWidth: "none" } as React.CSSProperties}>
            {suggestions.map(p => (
              <div key={p.initials} style={{ minWidth: 90, background: "#141414", border: "0.5px solid #1e1e1e", borderRadius: 12, padding: "10px 8px", textAlign: "center", position: "relative", flexShrink: 0 }}>
                {/* Dismiss */}
                <button onClick={() => setDismissed(prev => new Set([...prev, p.initials]))}
                  style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", lineHeight: 1 }}>
                  <X size={10} color="#333" strokeWidth={2} />
                </button>
                {/* Avatar */}
                <PhotoAvatar initials={p.initials} size={40} fallbackBg={p.bgColor} fallbackColor={p.textColor}
                  style={{ border: "1.5px solid #0a0a0a", margin: "0 auto 3px" }} />
                {/* DUPR */}
                <div style={{ fontSize: 10, fontWeight: 500, color: A, marginBottom: 2 }}>{p.dupr}</div>
                {/* Name */}
                <div style={{ fontSize: 11, fontWeight: 500, color: "#ddd", marginBottom: 4 }}>{p.name}</div>
                {/* Context */}
                <div style={{ fontSize: 9, color: "#444", lineHeight: 1.3, marginBottom: 8 }}>{p.context}</div>
                {/* Follow button */}
                <button onClick={() => toggleFollow(p.initials)}
                  style={{ width: "100%", border: "none", borderRadius: 8, padding: "4px 0", fontSize: 10, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    ...(following.has(p.initials) ? { background: "#1a1a1a", border: `0.5px solid ${A}`, color: A } : { background: A, color: "#1a0a00" }) }}>
                  {following.has(p.initials) ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "0.5px", background: "#1e1e1e", margin: "16px 16px 12px" }} />

          {/* Activity feed header */}
          <div style={{ fontSize: 11, color: MU, textTransform: "uppercase", letterSpacing: "0.1em", paddingLeft: 16, marginBottom: 10 }}>
            What your circle is up to
          </div>

          {CIRCLE_FEED.map((item, idx) => {
            const isFollowing = following.has(item.initials);
            const isLast = idx === CIRCLE_FEED.length - 1;
            return (
              <div key={item.initials} style={{ display: "flex", padding: "12px 16px", borderBottom: isLast ? "none" : "0.5px solid #0f0f0f", gap: 10 }}>
                {/* Avatar + DUPR */}
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 44 }}>
                  <PhotoAvatar initials={item.initials} size={36} fallbackBg={item.bgColor} fallbackColor={item.textColor}
                    style={{ border: "1.5px solid #0a0a0a" }} />
                  <span style={{ fontSize: 10, fontWeight: 500, color: A }}>{item.dupr}</span>
                </div>
                {/* Feed body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#ddd", marginBottom: 3 }}>
                    {item.name}
                    {isFollowing && <span style={{ fontSize: 9, color: "#333", fontWeight: 400 }}> · following</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: item.miniCard ? 6 : 4, lineHeight: 1.5 }}>
                    {item.actionParts.map((p, i) => (
                      <span key={i} style={{ color: p.highlight ? "#aaa" : "#555" }}>{p.text}</span>
                    ))}
                  </div>
                  {item.miniCard && (
                    <div style={{ background: "#141414", border: "0.5px solid #1e1e1e", borderRadius: 8, padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>{item.miniCard.name}</span>
                        <span style={{ fontSize: 10, color: "#777", marginLeft: 4 }}>· {item.miniCard.district} · {item.miniCard.time} · {item.miniCard.spots}</span>
                      </div>
                      <button style={{ background: A, border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 9, fontWeight: 600, color: "#1a0a00", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: 8 }}>
                        Join too
                      </button>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: "#666" }}>{item.timestamp}</div>
                </div>
                {/* Follow button */}
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  <button onClick={() => toggleFollow(item.initials)}
                    style={{ fontSize: 10, fontWeight: 500, borderRadius: 12, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", border: "none", ...(isFollowing ? { background: "#1a1a1a", border: "0.5px solid #f5a623", color: A } : { background: A, color: "#1a0a00" }) }}>
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

/* ── Test Screen — Premium Emotional UI ────────────────────── */
type TestFilterId = "foryou" | "competitive" | "friends";

const TEST_FILTERS: { id: TestFilterId; label: string; icon: React.ReactNode }[] = [
  { id: "foryou", label: "For You", icon: <Heart size={13} strokeWidth={1.5} /> },
  { id: "competitive", label: "Competitive", icon: <Trophy size={13} strokeWidth={1.5} /> },
  { id: "friends", label: "Friends", icon: <Users size={13} strokeWidth={1.5} /> },
];

const VENUE_DISTANCE: Record<string, string> = {
  "D9 Sports Club": "3.2 km",
  "District 7 Courts": "5.1 km",
  "Landmark 81": "1.8 km",
  "Ben Thanh Sports": "2.4 km",
  "Thao Dien Courts": "4.3 km",
};

const SESSION_PRICE: Record<number, string> = {
  1: "90k · 2h",
  2: "120k · 1.5h",
  3: "75k · 2h",
  4: "100k · 2h",
  5: "80k · 1.5h",
};

function MatchBadge({ pct }: { pct: number }) {
  const r = 50, c = 2 * Math.PI * r, dash = (pct / 100) * c;
  const softAmber = "rgba(220,170,60,0.85)";
  return (
    <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
      {/* Soft diffused glow */}
      <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,170,60,0.1) 0%, transparent 60%)", filter: "blur(12px)" }} />
      {/* Frosted glass */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(15,15,18,0.45)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} />
      <svg width={120} height={120} viewBox="0 0 120 120" style={{ position: "relative", transform: "rotate(-90deg)" }}>
        <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(220,170,60,0.08)" strokeWidth={1.5} />
        <circle cx={60} cy={60} r={r} fill="none" stroke={softAmber} strokeWidth={2}
          strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px rgba(220,170,60,0.3))" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 34, fontWeight: 700, color: softAmber, lineHeight: 1 }}>{pct}<span style={{ fontSize: 18, fontWeight: 500 }}>%</span></span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4, fontWeight: 400 }}>Great match!</span>
      </div>
    </div>
  );
}

function TestCardContent({ s, onShortlist, renderCta }: { s: Session; onShortlist?: () => void; renderCta?: React.ReactNode }) {
  const friends = s.players.filter(p => p.isFriend);
  const allAvatars = s.players.slice(0, 3);
  const friendLine = friends.length > 0
    ? `${friends[0].name} + ${Math.max(1, friends.length - 1)} friends joining`
    : `${s.filled} players joining`;
  const distance = VENUE_DISTANCE[s.venue] || "3.2 km";
  const price = SESSION_PRICE[s.id] || "90k · 2h";
  const remaining = Math.max(0, s.filled - 3);

  const inRange = ME.dupr >= s.duprRange.min && ME.dupr <= s.duprRange.max;
  const vibeTags: { icon: React.ReactNode; label: string }[] = [];
  if (s.matchScore >= 80) vibeTags.push({ icon: <Flame size={13} strokeWidth={1.8} color={A} />, label: "Popular" });
  vibeTags.push({ icon: <Target size={13} strokeWidth={1.8} color={A} />, label: inRange ? "Intermediate" : "Competitive" });
  if (s.vibe === "Social" || s.vibe === "Chill") vibeTags.push({ icon: <Wine size={13} strokeWidth={1.8} color={A} />, label: "Social vibe" });
  else vibeTags.push({ icon: <Zap size={13} strokeWidth={1.8} color={A} />, label: "Intense" });

  return (
    <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", height: "100%", width: "100%", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 0 0 0.5px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)" }}>
      <TestCardBgRotator />

      {/* Subtle cinematic tint only — dark shadow controlled by TestCardBgRotator */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(246,185,59,0.04)", zIndex: 2, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", padding: "16px 16px 20px", width: "100%" }}>

        {/* Top row: Tonight + time ... distance (right) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "auto", width: "100%" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(246,185,59,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(246,185,59,0.18)", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, color: A, flexShrink: 0 }}>
            <Clock size={11} strokeWidth={2} />
            Tonight
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", flexShrink: 0 }}>{s.time}</span>
          <span style={{ flex: 1, minWidth: 0 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.65)", flexShrink: 0 }}>
            <MapPin size={11} strokeWidth={1.5} />
            {distance}
          </span>
        </div>

        {/* Title block — first word line 1, rest line 2, 75% width */}
        <h2 style={{ fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 6px", maxWidth: "75%", textShadow: "0 2px 20px rgba(0,0,0,0.6), 0 0 40px rgba(0,0,0,0.3)" }}>
          {s.name.split(" ")[0]}<br /><span style={{ display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name.split(" ").slice(1).join(" ")}</span>
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, width: "100%" }}>
          <Layers size={12} color="rgba(255,255,255,0.55)" strokeWidth={1.5} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>{price}</span>
        </div>

        {/* Match badge */}
        <div style={{ marginTop: 2, marginBottom: 14, position: "relative", zIndex: 3 }}>
          <MatchBadge pct={s.matchScore} />
        </div>

        {/* Social proof — 3 avatars + "+N" */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, width: "100%", minWidth: 0 }}>
          <div style={{ display: "flex", flexShrink: 0 }}>
            {allAvatars.map((p, i) => (
              <PhotoAvatar key={p.avatar} initials={p.avatar} size={30} fallbackBg="#333"
                style={{ border: "2px solid rgba(11,11,12,0.8)", marginLeft: i > 0 ? -8 : 0, position: "relative", zIndex: 6 - i }} />
            ))}
            {remaining > 0 && (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "2px solid rgba(11,11,12,0.8)", marginLeft: -8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", position: "relative", zIndex: 0, backdropFilter: "blur(8px)" }}>
                +{remaining}
              </div>
            )}
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.4, minWidth: 0 }}>
            {friends.length > 0 ? `${friends[0].name} +${Math.max(1, friends.length - 1)} friends` : `${s.filled} players`}
            <br />
            joining <Heart size={11} fill="rgba(220,170,60,0.8)" color="rgba(220,170,60,0.8)" strokeWidth={0} style={{ display: "inline", verticalAlign: "-1px" }} />
          </span>
        </div>

        {/* Tags — flex-wrap for small screens */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, width: "100%" }}>
          {vibeTags.map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(246,185,59,0.06)", borderRadius: 20, padding: "5px 12px", fontSize: 11, fontWeight: 500, color: "rgba(220,170,60,0.9)", flexShrink: 1, minWidth: 0 }}>
              {t.icon} {t.label}
            </span>
          ))}
        </div>

        {/* CTA — full width, fluid */}
        {renderCta || (
          <button onClick={onShortlist} style={{ width: "100%", background: A, border: "none", borderRadius: 18, padding: "14px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 16, fontWeight: 700, color: "#0B0B0C", letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 0 40px rgba(245,166,35,0.2), 0 4px 20px rgba(245,166,35,0.25)" }}>
            <span style={{ flex: 1, textAlign: "center" }}>Shortlist</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

function TestSwipeCard({ s, isExiting, exitDir, onAction, onExited }: {
  s: Session; isExiting: boolean; exitDir: SwipeAction;
  onAction: (a: SwipeAction) => void; onExited: () => void;
}) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-6, 0, 6]);
  const joinOp = useTransform(x, [20, 90], [0, 1]);
  const skipOp = useTransform(x, [-20, -90], [0, 1]);
  const exitingRef = useRef(false);

  useEffect(() => {
    exitingRef.current = false; x.set(0);
    controls.set({ opacity: 0.85, scale: 0.96, x: 0 });
    controls.start({ opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  useEffect(() => {
    if (!isExiting || exitingRef.current) return;
    exitingRef.current = true;
    const tx = exitDir === "join" ? 520 : -520;
    controls.start({ x: tx, opacity: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (exitingRef.current) return;
    const { offset, velocity } = info;
    if (offset.x > 80 || velocity.x > 400) {
      exitingRef.current = true; onAction("join");
      controls.start({ x: 520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
    } else if (offset.x < -80 || velocity.x < -400) {
      exitingRef.current = true; onAction("skip");
      controls.start({ x: -520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 320, damping: 28 } });
    }
  };

  return (
    <motion.div animate={controls} style={{ x, rotate, position: "relative", touchAction: "pan-y", height: "100%" }}
      drag={exitingRef.current ? false : "x"} dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.88} dragMomentum={false} onDragEnd={handleDragEnd} whileDrag={{ cursor: "grabbing" }}>
      <motion.div style={{ position: "absolute", top: 60, right: 20, zIndex: 20, pointerEvents: "none", opacity: joinOp, background: "rgba(245,166,35,0.15)", border: `1.5px solid ${A}`, borderRadius: 12, padding: "6px 16px" }}>
        <span style={{ color: A, fontSize: 14, fontWeight: 700 }}>I'M IN ✓</span>
      </motion.div>
      <motion.div style={{ position: "absolute", top: 60, left: 20, zIndex: 20, pointerEvents: "none", opacity: skipOp, background: "rgba(60,60,60,0.4)", border: "1.5px solid #444", borderRadius: 12, padding: "6px 16px" }}>
        <span style={{ color: "#888", fontSize: 14, fontWeight: 700 }}>PASS ✕</span>
      </motion.div>
      <TestCardContent s={s} onShortlist={() => { if (!exitingRef.current) { exitingRef.current = true; onAction("join"); controls.start({ x: 520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited); } }} />
    </motion.div>
  );
}

/* ── Test Secondary Card (up next) ─────────────────────────── */
function TestSecondaryCard({ s }: { s: Session }) {
  const mc = s.matchScore >= 85 ? A : s.matchScore >= 70 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)";
  const distance = VENUE_DISTANCE[s.venue] || "3.2 km";
  const price = SESSION_PRICE[s.id] || "90k · 2h";
  const friends = s.players.filter(p => p.isFriend);
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
      <TestCardBgRotator />
      <div style={{ position: "relative", zIndex: 2, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{s.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            <span>{s.time}</span><span>·</span><span>{price}</span><span>·</span><span>{distance}</span>
          </div>
          {friends.length > 0 && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
              {friends[0].name} {friends.length > 1 ? `+${friends.length - 1} friends` : "going"}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: mc, lineHeight: 1 }}>{s.matchScore}%</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>Match</div>
        </div>
      </div>
    </div>
  );
}

/* ── Overlay settings — bottom sheet, no backdrop dim ────────── */
function OverlaySettingsSheet({ onClose }: { onClose: () => void }) {
  const { opacity, setOpacity } = useContext(OverlayCtx);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "flex-end", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430 }}>
      <div onClick={onClose} style={{ flex: 1, pointerEvents: "auto" }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          pointerEvents: "auto",
          background: "rgba(20,20,20,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px 20px 0 0",
          padding: "18px 20px calc(20px + env(safe-area-inset-bottom, 0px))",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Dark shadow</span>
          <span style={{ fontSize: 13, color: A, fontWeight: 600 }}>{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(opacity * 100)}
          onChange={e => setOpacity(Number(e.target.value) / 100)}
          style={{ width: "100%", accentColor: A, height: 6, cursor: "pointer", display: "block" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>See photo</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Dark</span>
        </div>
      </div>
    </div>
  );
}

function TestScreen() {
  const [testFilter, setTestFilter] = useState<TestFilterId>("foryou");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [history, setHistory] = useState<Array<{ idx: number; action: SwipeAction }>>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDir, setExitDir] = useState<SwipeAction>("join");
  const [showOverlay, setShowOverlay] = useState(false);

  const deck = ALL_SESSIONS.filter(s => {
    if (testFilter === "competitive") return s.vibe === "Intense" || s.duprRange.avg >= 3.5;
    if (testFilter === "friends") return s.friendCount > 0;
    return true;
  });

  const isDone = currentIdx >= deck.length;
  const current = deck[currentIdx];
  const upNext = deck.slice(currentIdx + 1, currentIdx + 4);
  const canUndo = history.length > 0 && !isExiting;

  const triggerExit = (action: SwipeAction) => {
    if (isExiting) return;
    setExitDir(action); setIsExiting(true);
  };
  const handleAction = (_action: SwipeAction) => {};
  const handleExited = () => {
    setHistory(prev => [...prev, { idx: currentIdx, action: exitDir }]);
    setCurrentIdx(prev => prev + 1);
    setIsExiting(false);
  };
  const handleUndo = () => {
    if (!canUndo) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIdx(last.idx);
  };
  const handleReload = () => { setCurrentIdx(0); setHistory([]); setIsExiting(false); };

  useEffect(() => { setCurrentIdx(0); setHistory([]); setIsExiting(false); }, [testFilter]);

  return (
    <div style={{ padding: "0 16px" }}>
      <TopBar title="Find your game" onAvatarTap={() => setShowOverlay(true)} />
      {showOverlay && <OverlaySettingsSheet onClose={() => setShowOverlay(false)} />}

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, width: "100%" }}>
        {TEST_FILTERS.map(f => {
          const on = testFilter === f.id;
          return (
            <button key={f.id} onClick={() => setTestFilter(f.id)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, flexShrink: 0, fontSize: 12, fontWeight: on ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
                background: on ? A : IN,
                color: on ? "#000" : MU,
                border: `1px solid ${on ? A : BD}`,
              }}>
              <span style={{ color: on ? "#000" : A, display: "flex" }}>{f.icon}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {isDone ? (
        <div style={{ textAlign: "center", padding: "56px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏓</div>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
            {deck.length === 0 ? "No games match this filter." : "You've seen all games tonight."}
          </p>
          <button onClick={handleReload}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: A, border: "none", borderRadius: 14, padding: "12px 28px", fontSize: 14, fontWeight: 700, color: "#0B0B0C", cursor: "pointer", fontFamily: "inherit" }}>
            <RefreshCw size={15} strokeWidth={2} /> Start over
          </button>
        </div>
      ) : current && (
        <>
          {/* Card stack */}
          <div style={{ position: "relative", marginBottom: 12, height: "min(572px, 64vh)", width: "100%" }}>
            {deck[currentIdx + 2] && (
              <motion.div animate={isExiting ? { opacity: 0.3 } : { opacity: 0.12 }} transition={{ duration: 0.3 }}
                style={{ position: "absolute", top: 8, left: 12, right: 12, bottom: -4, background: "rgba(30,30,30,0.6)", borderRadius: 28, zIndex: 0, pointerEvents: "none" }} />
            )}
            {deck[currentIdx + 1] && (
              <motion.div animate={isExiting ? { opacity: 0.6 } : { opacity: 0.25 }} transition={{ duration: 0.3 }}
                style={{ position: "absolute", top: 4, left: 6, right: 6, bottom: -2, background: "rgba(30,30,30,0.8)", borderRadius: 28, zIndex: 1, pointerEvents: "none" }} />
            )}
            <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
              <TestSwipeCard s={current} isExiting={isExiting} exitDir={exitDir} onAction={handleAction} onExited={handleExited} />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 28, marginBottom: 20 }}>
            <button onClick={() => triggerExit("skip")} disabled={isExiting}
              style={{ width: 58, height: 58, borderRadius: "50%", background: "#1a1a1a", border: "1.5px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", cursor: isExiting ? "default" : "pointer", opacity: isExiting ? 0.4 : 1 }}>
              <X size={24} color="#777" strokeWidth={2} />
            </button>
            <button onClick={handleUndo} disabled={!canUndo}
              style={{ width: 52, height: 52, borderRadius: "50%", background: "#1a1a1a", border: "1.5px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", cursor: canUndo ? "pointer" : "default", opacity: canUndo ? 1 : 0.35, transition: "opacity 0.2s" }}>
              <RotateCcw size={18} color="#888" strokeWidth={2} />
            </button>
            <button onClick={() => triggerExit("join")} disabled={isExiting}
              style={{ width: 64, height: 64, borderRadius: "50%", background: A, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: isExiting ? "default" : "pointer", opacity: isExiting ? 0.5 : 1, boxShadow: "0 0 36px rgba(245,166,35,0.25), 0 4px 16px rgba(245,166,35,0.3)" }}>
              <Heart size={28} color="#0B0B0C" fill="#0B0B0C" strokeWidth={2} />
            </button>
          </div>

          {/* Up next */}
          {upNext.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Up next</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upNext.map((s, i) => (
                  <div key={s.id} style={{ opacity: 1 - i * 0.2 }}>
                    <TestSecondaryCard s={s} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Test2 card (Happening duplicate + new swipe UI) ───────── */
const RING_COLORS = ["#7F77DD", "#1D9E75", "#D4537E", "#f5a623"];

function RingedAvatar({ initials, ringColor, size = 52 }: { initials: string; ringColor: string; size?: number }) {
  const inner = size - 5;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%", border: `2.5px solid ${ringColor}`, boxSizing: "border-box",
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <PhotoAvatar initials={initials} size={inner} fallbackBg="#333" style={{ display: "block" }} />
      </div>
      <div style={{
        position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%",
        background: "#22c55e", border: "2px solid #0a0a0a", boxSizing: "border-box", zIndex: 3,
      }} />
    </div>
  );
}

function MatchDialCorner({ pct }: { pct: number }) {
  const size = 72;
  const r = 28;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const softAmber = "rgba(220,170,60,0.9)";
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: "50%", background: "rgba(15,15,18,0.55)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)", position: "relative",
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(245,166,35,0.15)" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={A} strokeWidth={3}
          strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: softAmber, lineHeight: 1 }}>{pct}<span style={{ fontSize: 11, fontWeight: 500 }}>%</span></span>
      </div>
    </div>
  );
}

function Test2CardContent({ s, onJoin }: { s: Session; onJoin?: () => void }) {
  const distance = VENUE_DISTANCE[s.venue] || "3.2 km";
  const price = SESSION_PRICE[s.id] || "90k · 2h";
  const displayPlayers = s.players.slice(0, 4);
  const friendCount = Math.max(s.friendCount, displayPlayers.filter(p => p.isFriend).length, 4);
  const spotsLeft = s.totalSpots - s.filled;
  const duprLabel = `Mostly ${s.duprRange.min.toFixed(1)}–${s.duprRange.max.toFixed(1)}`;
  const regulars = displayPlayers.slice(0, 3);

  return (
    <div style={{ position: "relative", borderRadius: 28, overflow: "visible", height: "100%", width: "100%", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 0 0 0.5px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)" }}>
      <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", height: "100%", width: "100%" }}>
        <TestCardBgRotator />
        <div style={{ position: "absolute", inset: 0, background: "rgba(246,185,59,0.04)", zIndex: 2, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 3, height: "100%", display: "flex", flexDirection: "column", padding: "0 16px 18px", width: "100%" }}>
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 20 }}>
            <MatchDialCorner pct={s.matchScore} />
          </div>

          {/* Row 1: Time pill + FILLING FAST + 6 joined — all one line */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 0 6px", width: "100%" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(246,185,59,0.12)", backdropFilter: "blur(16px)", border: "1px solid rgba(246,185,59,0.18)", borderRadius: 20, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: A, flexShrink: 0 }}>
              <Clock size={10} strokeWidth={2} /> {s.time}
            </span>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0, animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#22c55e", textTransform: "uppercase", whiteSpace: "nowrap" }}>FILLING FAST</span>
            <span style={{ fontSize: 11, color: "#555" }}>·</span>
            <span style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap" }}>6 joined recently</span>
          </div>

          {/* Spacer to push content down */}
          <div style={{ flex: 1, minHeight: 0, marginBottom: "auto" }} />

          <h2 style={{ fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, margin: "0 0 6px", maxWidth: "75%", paddingRight: 48, textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
            {s.name.split(" ")[0]}<br />
            <span style={{ display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name.split(" ").slice(1).join(" ")}</span>
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            <Layers size={12} color="rgba(255,255,255,0.55)" strokeWidth={1.5} />
            <span>{price}</span>
            <span style={{ color: "#555" }}>|</span>
            <MapPin size={11} color="rgba(255,255,255,0.55)" strokeWidth={1.5} />
            <span>{distance}</span>
          </div>

          {/* Large ringed avatars + overflow circle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            {displayPlayers.map((p, i) => (
              <RingedAvatar key={p.avatar} initials={p.avatar} ringColor={RING_COLORS[i % RING_COLORS.length]} />
            ))}
            <div style={{
              width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 500, color: "#aaa", flexShrink: 0,
            }}>+6</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", overflow: "hidden", fontSize: 12 }}>
            <Users size={12} color={A} strokeWidth={2} />
            <span style={{ color: A, fontWeight: 500 }}>{friendCount} friends joining</span>
            <span style={{ color: "#555" }}>|</span>
            <span style={{ color: "#7F77DD" }}>{duprLabel}</span>
            <span style={{ color: "#555" }}>|</span>
            <Smile size={12} color="#1D9E75" strokeWidth={2} />
            <span style={{ color: "#1D9E75" }}>Great vibes</span>
          </div>

          {/* Frosted bottom panel — 12px gap from metadata strip */}
          <div style={{
            marginTop: 12, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderRadius: 12, padding: "10px", border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {/* Your regulars block */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
                <Zap size={20} color={A} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>Competitive tonight</div>
                  <div style={{ fontSize: 11, color: "#666" }}>Fast games · High energy</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ display: "flex" }}>
                  {regulars.map((p, i) => (
                    <PhotoAvatar key={p.avatar} initials={p.avatar} size={33} fallbackBg="#333"
                      style={{ border: "1px solid rgba(255,255,255,0.2)", marginLeft: i > 0 ? -8 : 0, position: "relative", zIndex: 3 - i }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: "#666", marginTop: 4, textAlign: "center" }}>Your regulars are here</span>
              </div>
            </div>

            {/* CTA row */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button type="button" onClick={onJoin} style={{
                flex: 1, background: A, border: "none", borderRadius: 14, padding: "11px 12px", cursor: "pointer", fontFamily: "inherit",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                boxShadow: "0 0 32px rgba(245,166,35,0.2)",
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1a0a00" }}>Shortlist · {spotsLeft} spots left</span>
                <span style={{ fontSize: 11, color: "rgba(0,0,0,0.5)" }}>{s.filled} / {s.totalSpots} filled</span>
              </button>
              <button type="button" style={{
                width: 52, height: 52, flexShrink: 0, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
                border: "0.5px solid rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "pointer", fontFamily: "inherit",
              }}>
                <Info size={18} color="#aaa" strokeWidth={1.5} />
                <span style={{ fontSize: 9, color: "#777" }}>Details</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Test2SwipeCard({ s, isExiting, exitDir, onAction, onExited }: {
  s: Session; isExiting: boolean; exitDir: SwipeAction;
  onAction: (a: SwipeAction) => void; onExited: () => void;
}) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-6, 0, 6]);
  const joinOp = useTransform(x, [20, 90], [0, 1]);
  const skipOp = useTransform(x, [-20, -90], [0, 1]);
  const exitingRef = useRef(false);

  useEffect(() => {
    exitingRef.current = false; x.set(0);
    controls.set({ opacity: 0.85, scale: 0.96, x: 0 });
    controls.start({ opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  useEffect(() => {
    if (!isExiting || exitingRef.current) return;
    exitingRef.current = true;
    const tx = exitDir === "join" ? 520 : -520;
    controls.start({ x: tx, opacity: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (exitingRef.current) return;
    const { offset, velocity } = info;
    if (offset.x > 80 || velocity.x > 400) {
      exitingRef.current = true; onAction("join");
      controls.start({ x: 520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
    } else if (offset.x < -80 || velocity.x < -400) {
      exitingRef.current = true; onAction("skip");
      controls.start({ x: -520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 320, damping: 28 } });
    }
  };

  const triggerJoin = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    onAction("join");
    controls.start({ x: 520, opacity: 0, transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] } }).then(onExited);
  };

  return (
    <motion.div animate={controls} style={{ x, rotate, position: "relative", touchAction: "pan-y", height: "100%" }}
      drag={exitingRef.current ? false : "x"} dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.88} dragMomentum={false} onDragEnd={handleDragEnd} whileDrag={{ cursor: "grabbing" }}>
      <motion.div style={{ position: "absolute", top: 60, right: 20, zIndex: 20, pointerEvents: "none", opacity: joinOp, background: "rgba(245,166,35,0.15)", border: `1.5px solid ${A}`, borderRadius: 12, padding: "6px 16px" }}>
        <span style={{ color: A, fontSize: 14, fontWeight: 700 }}>I'M IN ✓</span>
      </motion.div>
      <motion.div style={{ position: "absolute", top: 60, left: 20, zIndex: 20, pointerEvents: "none", opacity: skipOp, background: "rgba(60,60,60,0.4)", border: "1.5px solid #444", borderRadius: 12, padding: "6px 16px" }}>
        <span style={{ color: "#888", fontSize: 14, fontWeight: 700 }}>PASS ✕</span>
      </motion.div>
      <Test2CardContent s={s} onJoin={triggerJoin} />
    </motion.div>
  );
}

function Test2Screen() {
  const [testFilter, setTestFilter] = useState<TestFilterId>("foryou");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [history, setHistory] = useState<Array<{ idx: number; action: SwipeAction }>>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [exitDir, setExitDir] = useState<SwipeAction>("join");
  const [showOverlay, setShowOverlay] = useState(false);

  const deck = ALL_SESSIONS.filter(s => {
    if (testFilter === "competitive") return s.vibe === "Intense" || s.duprRange.avg >= 3.5;
    if (testFilter === "friends") return s.friendCount > 0;
    return true;
  });

  const isDone = currentIdx >= deck.length;
  const current = deck[currentIdx];
  const upNext = deck.slice(currentIdx + 1, currentIdx + 4);
  const canUndo = history.length > 0 && !isExiting;

  const triggerExit = (action: SwipeAction) => {
    if (isExiting) return;
    setExitDir(action); setIsExiting(true);
  };
  const handleAction = (_action: SwipeAction) => {};
  const handleExited = () => {
    setHistory(prev => [...prev, { idx: currentIdx, action: exitDir }]);
    setCurrentIdx(prev => prev + 1);
    setIsExiting(false);
  };
  const handleUndo = () => {
    if (!canUndo) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIdx(last.idx);
  };
  const handleReload = () => { setCurrentIdx(0); setHistory([]); setIsExiting(false); };

  useEffect(() => { setCurrentIdx(0); setHistory([]); setIsExiting(false); }, [testFilter]);

  return (
    <div style={{ padding: "0 16px" }}>
      <TopBar title="Find your game" onAvatarTap={() => setShowOverlay(true)} />
      {showOverlay && <OverlaySettingsSheet onClose={() => setShowOverlay(false)} />}

      <div style={{ display: "flex", gap: 8, marginBottom: 12, width: "100%" }}>
        {TEST_FILTERS.map(f => {
          const on = testFilter === f.id;
          return (
            <button key={f.id} onClick={() => setTestFilter(f.id)}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, flexShrink: 0, fontSize: 12, fontWeight: on ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
                background: on ? A : IN, color: on ? "#000" : MU, border: `1px solid ${on ? A : BD}` }}>
              <span style={{ color: on ? "#000" : A, display: "flex" }}>{f.icon}</span>
              {f.label}
            </button>
          );
        })}
      </div>

      {isDone ? (
        <div style={{ textAlign: "center", padding: "56px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏓</div>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>
            {deck.length === 0 ? "No games match this filter." : "You've seen all games tonight."}
          </p>
          <button onClick={handleReload}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: A, border: "none", borderRadius: 14, padding: "12px 28px", fontSize: 14, fontWeight: 700, color: "#0B0B0C", cursor: "pointer", fontFamily: "inherit" }}>
            <RefreshCw size={15} strokeWidth={2} /> Start over
          </button>
        </div>
      ) : current && (
        <>
          <div style={{ position: "relative", marginBottom: 12, height: "min(572px, 64vh)", width: "100%" }}>
            {deck[currentIdx + 2] && (
              <motion.div animate={isExiting ? { opacity: 0.3 } : { opacity: 0.12 }} transition={{ duration: 0.3 }}
                style={{ position: "absolute", top: 8, left: 12, right: 12, bottom: -4, background: "rgba(30,30,30,0.6)", borderRadius: 28, zIndex: 0, pointerEvents: "none" }} />
            )}
            {deck[currentIdx + 1] && (
              <motion.div animate={isExiting ? { opacity: 0.6 } : { opacity: 0.25 }} transition={{ duration: 0.3 }}
                style={{ position: "absolute", top: 4, left: 6, right: 6, bottom: -2, background: "rgba(30,30,30,0.8)", borderRadius: 28, zIndex: 1, pointerEvents: "none" }} />
            )}
            <div style={{ position: "relative", zIndex: 2, height: "100%" }}>
              <Test2SwipeCard s={current} isExiting={isExiting} exitDir={exitDir} onAction={handleAction} onExited={handleExited} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 28, marginBottom: 20 }}>
            <button onClick={() => triggerExit("skip")} disabled={isExiting}
              style={{ width: 58, height: 58, borderRadius: "50%", background: "#1a1a1a", border: "1.5px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", cursor: isExiting ? "default" : "pointer", opacity: isExiting ? 0.4 : 1 }}>
              <X size={24} color="#777" strokeWidth={2} />
            </button>
            <button onClick={handleUndo} disabled={!canUndo}
              style={{ width: 52, height: 52, borderRadius: "50%", background: "#1a1a1a", border: "1.5px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", cursor: canUndo ? "pointer" : "default", opacity: canUndo ? 1 : 0.35 }}>
              <RotateCcw size={18} color="#888" strokeWidth={2} />
            </button>
            <button onClick={() => triggerExit("join")} disabled={isExiting}
              style={{ width: 64, height: 64, borderRadius: "50%", background: A, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: isExiting ? "default" : "pointer", opacity: isExiting ? 0.5 : 1, boxShadow: "0 0 36px rgba(245,166,35,0.25)" }}>
              <Heart size={28} color="#0B0B0C" fill="#0B0B0C" strokeWidth={2} />
            </button>
          </div>

          {upNext.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Up next</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upNext.map((s, i) => (
                  <div key={s.id} style={{ opacity: 1 - i * 0.2 }}>
                    <TestSecondaryCard s={s} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Test Saved Screen ─────────────────────────────────────── */
function TestCarouselCard({ s, onRemove }: { s: Session; onRemove?: () => void }) {
  const savedCta = (
    <div style={{ display: "flex", gap: 8, width: "100%" }}>
      <a href="https://reclub.co/m/3CUP8A" target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none" }}>
        <div style={{ width: "100%", background: A, borderRadius: 18, padding: "14px 0", fontSize: 16, fontWeight: 700, color: "#0B0B0C", textAlign: "center", boxShadow: "0 0 40px rgba(245,166,35,0.2), 0 4px 20px rgba(245,166,35,0.25)" }}>Join on Reclub</div>
      </a>
      {onRemove && (
        <button onClick={onRemove}
          style={{ width: 52, flexShrink: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={16} color="rgba(255,255,255,0.4)" strokeWidth={2} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{ width: "84vw", maxWidth: 360, flexShrink: 0, scrollSnapAlign: "start", display: "flex", flexDirection: "column", height: "100%" }}>
      <TestCardContent s={s} renderCta={savedCta} />
    </div>
  );
}

function TestSavedScreen({ sessions }: { sessions: Session[] }) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [sort, setSort] = useState<"match" | "wait" | "friends">("match");
  const [removedIds, setRemovedIds] = useState<Set<number>>(new Set());
  const [showOverlay, setShowOverlay] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleSessions = sessions.filter(s => !removedIds.has(s.id));

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const approxCard = scrollRef.current.offsetWidth * 0.84 + 10;
    setCarouselIdx(Math.min(Math.round(scrollRef.current.scrollLeft / approxCard), visibleSessions.length - 1));
  };
  const handleRemove = (id: number) => setRemovedIds(prev => new Set([...prev, id]));

  const SORT_LABELS: Record<string, string> = { match: "Best match", wait: "Wait time", friends: "Friends" };

  return (
    <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", height: "calc(100dvh - 64px)" }}>
      <TopBar title="Your shortlist" onAvatarTap={() => setShowOverlay(true)} />
      {showOverlay && <OverlaySettingsSheet onClose={() => setShowOverlay(false)} />}

      {/* Sort pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexShrink: 0 }}>
        {(["match", "wait", "friends"] as const).map(s2 => {
          const on = sort === s2;
          return (
            <button key={s2} onClick={() => setSort(s2)}
              style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: on ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
                background: on ? A : IN, color: on ? "#000" : MU,
                border: `1px solid ${on ? A : BD}` }}>
              {SORT_LABELS[s2]}
            </button>
          );
        })}
      </div>

      {/* Carousel + dots — fill remaining height */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div ref={scrollRef} onScroll={handleScroll}
          style={{ flex: 1, display: "flex", gap: 12, marginLeft: -16, paddingLeft: 16, marginRight: -16, paddingRight: 16, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", alignItems: "stretch" } as React.CSSProperties}>
          {visibleSessions.length > 0 ? visibleSessions.map((sess, i) => (
            <TestCarouselCard key={sess.id} s={sess} onRemove={() => handleRemove(sess.id)} />
          )) : (
            <div style={{ padding: "48px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No saved sessions yet.</div>
          )}
        </div>

        {/* Dots */}
        {visibleSessions.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "12px 0", flexShrink: 0 }}>
            {visibleSessions.map((_, i) => (
              <div key={i} style={{ height: 5, width: i === carouselIdx ? 14 : 5, borderRadius: 3, background: i === carouselIdx ? A : "rgba(255,255,255,0.1)", transition: "all 0.2s" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Filter config ─────────────────────────────────────────── */
const FILTERS: { id: FilterId; label: string; icon?: React.ReactNode }[] = [
  { id: "all",     label: "All" },
  { id: "fast",    label: "Fast",     icon: <Zap    size={12} strokeWidth={1.5} /> },
  { id: "level",   label: "My level", icon: <Target size={12} strokeWidth={1.5} /> },
  { id: "friends", label: "Friends",  icon: <Users  size={12} strokeWidth={1.5} /> },
];

/* ── App ───────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("test");
  const [overlayOpacity, setOverlayOpacity] = useState(0.9);
  const savedSessions = ALL_SESSIONS.filter(s => SAVED_IDS.includes(s.id));

  // Swipe state
  const [filter,     setFilter]     = useState<FilterId>("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [history,    setHistory]    = useState<Array<{ idx: number; action: SwipeAction }>>([]);
  const [isExiting,  setIsExiting]  = useState(false);
  const [exitDir,    setExitDir]    = useState<SwipeAction>("join");
  const [feedback,   setFeedback]   = useState<"joined" | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const deck = ALL_SESSIONS.filter(s => {
    if (filter === "fast")    return s.waitMinutes <= 8;
    if (filter === "level")   return ME.dupr >= s.duprRange.min && ME.dupr <= s.duprRange.max;
    if (filter === "friends") return s.friendCount > 0;
    return true;
  });

  const isDone     = currentIdx >= deck.length;
  const current    = deck[currentIdx];
  const upNext     = deck.slice(currentIdx + 1, currentIdx + 6);
  const canUndo    = history.length > 0 && !isExiting;
  const totalCards = deck.length;
  const currentCardN = Math.min(currentIdx + 1, totalCards);
  const progressPct  = totalCards > 0 ? (currentIdx / totalCards) * 100 : 0;

  const showJoinedPill = () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback("joined");
    setSavedCount(prev => prev + 1);
    feedbackTimer.current = setTimeout(() => setFeedback(null), 1500);
  };

  const triggerExit = (action: SwipeAction) => {
    if (isExiting) return;
    if (action === "join") showJoinedPill();
    setExitDir(action); setIsExiting(true);
  };

  const handleAction = (action: SwipeAction) => { if (action === "join") showJoinedPill(); };

  const handleExited = () => {
    setHistory(prev => [...prev, { idx: currentIdx, action: exitDir }]);
    setCurrentIdx(prev => prev + 1);
    setIsExiting(false);
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIdx(last.idx);
  };

  const handleReload = () => { setCurrentIdx(0); setHistory([]); setIsExiting(false); setFeedback(null); };

  useEffect(() => { setCurrentIdx(0); setHistory([]); setIsExiting(false); }, [filter]);

  return (
    <OverlayCtx.Provider value={{ opacity: overlayOpacity, setOpacity: setOverlayOpacity }}>
    <div style={{ minHeight: "100dvh", background: "#050505", fontFamily: "Inter, sans-serif", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      {/* Mobile shell */}
      <div id="mobile-shell" style={{ position: "relative", width: "100%", maxWidth: 430, height: "100dvh", background: "#0a0a0a", overflowY: "auto", overflowX: "hidden", paddingBottom: 130 }}>
      {/* Feedback pill */}
      <AnimatePresence>
        {feedback === "joined" && (
          <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }} transition={{ duration: 0.18 }}
            style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 999, background: A, borderRadius: 40, padding: "12px 28px", display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
            <Check size={18} color="#000" strokeWidth={2.5} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>Shortlisted!</span>
          </motion.div>
        )}
      </AnimatePresence>

        {/* ── SWIPE TAB ── */}
        {activeTab === "swipe" && (
          <div style={{ padding: "0 16px" }}>
            <TopBar title="Find your game" />

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {FILTERS.map(f => {
                const on = filter === f.id;
                return (
                  <button key={f.id} onClick={() => setFilter(f.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 20, flexShrink: 0, fontSize: 12, fontWeight: on ? 600 : 400, color: on ? "#000" : MU, background: on ? A : IN, border: `1px solid ${on ? A : BD}`, cursor: "pointer", fontFamily: "inherit" }}>
                    {f.icon && <span style={{ color: on ? "#000" : A }}>{f.icon}</span>}
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Progress row + bar */}
            {!isDone && totalCards > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>Card {currentCardN} of {totalCards}</span>
                  <span style={{ fontSize: 10, color: A, fontWeight: 500 }}>{savedCount} saved</span>
                </div>
                <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, marginBottom: 16, width: "100%" }}>
                  <div style={{ width: `${progressPct}%`, height: "100%", background: A, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </>
            )}

            {/* Empty deck */}
            {isDone && (
              <div style={{ textAlign: "center", padding: "56px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🏓</div>
                <div style={{ fontSize: 14, color: MU, marginBottom: 24 }}>{deck.length === 0 ? "No sessions match this filter." : "You've seen all sessions tonight."}</div>
                <button onClick={handleReload} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: A, border: "none", borderRadius: 14, padding: "12px 28px", fontSize: 14, fontWeight: 600, color: "#000", cursor: "pointer", fontFamily: "inherit" }}>
                  <RefreshCw size={15} strokeWidth={2} /> Start over
                </button>
              </div>
            )}

            {/* Card stack */}
            {!isDone && current && (
              <>
                <div style={{ position: "relative", marginBottom: 16 }}>
                  {deck[currentIdx + 2] && (
                    <motion.div animate={isExiting ? { opacity: 0.45 } : { opacity: 0.2 }} transition={{ duration: 0.32 }}
                      style={{ position: "absolute", top: 8, left: 16, right: 16, bottom: -8, background: S, border: "1px solid rgba(42,42,42,0.45)", borderRadius: 20, zIndex: 0, pointerEvents: "none" }} />
                  )}
                  {deck[currentIdx + 1] && (
                    <motion.div animate={isExiting ? { opacity: 0.8 } : { opacity: 0.4 }} transition={{ duration: 0.32 }}
                      style={{ position: "absolute", top: 4, left: 8, right: 8, bottom: -4, background: S, border: "1px solid rgba(42,42,42,0.65)", borderRadius: 20, zIndex: 1, pointerEvents: "none" }} />
                  )}
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <SwipeCard s={current} isExiting={isExiting} exitDir={exitDir} onAction={handleAction} onExited={handleExited} />
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginBottom: 20 }}>
                  <button onClick={() => triggerExit("skip")} disabled={isExiting} style={{ width: 52, height: 52, borderRadius: "50%", background: IN, border: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: isExiting ? "default" : "pointer", opacity: isExiting ? 0.4 : 1 }}>
                    <X size={22} color="#888" strokeWidth={2} />
                  </button>
                  <button onClick={handleUndo} disabled={!canUndo} style={{ width: 40, height: 40, borderRadius: "50%", background: canUndo ? IN : "transparent", border: `1px solid ${canUndo ? BD : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: canUndo ? "pointer" : "default", opacity: canUndo ? 1 : 0.2, transition: "opacity 0.2s" }}>
                    <RotateCcw size={16} color={canUndo ? "#aaa" : "#555"} strokeWidth={2} />
                  </button>
                  <button onClick={() => triggerExit("join")} disabled={isExiting} style={{ width: 52, height: 52, borderRadius: "50%", background: isExiting ? "#a06b10" : A, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: isExiting ? "default" : "pointer", opacity: isExiting ? 0.5 : 1 }}>
                    <Check size={22} color="#000" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Up next */}
                {upNext.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: MU, marginBottom: 10 }}>Up next</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {upNext.map((s, i) => (
                        <div key={s.id} style={{ opacity: 1 - i * 0.18 }}>
                          <SecondaryCard s={s} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── SAVED TAB ── */}
        {activeTab === "saved" && <SavedScreen sessions={savedSessions} />}

        {/* ── SCENE TAB ── */}
        {activeTab === "scene" && <SceneScreen />}

        {/* ── TEST TAB (Happening) ── */}
        {activeTab === "test" && <TestScreen />}

        {/* ── TEST2 TAB ── */}
        {activeTab === "test2" && <Test2Screen />}

        {/* ── TEST SAVED TAB ── */}
        {activeTab === "testsaved" && <TestSavedScreen sessions={savedSessions} />}

      {/* Bottom nav */}
      <BottomNav active={activeTab} onSelect={setActiveTab} savedCount={savedCount} />
      </div>{/* end mobile-shell */}
    </div>
    </OverlayCtx.Provider>
  );
}
