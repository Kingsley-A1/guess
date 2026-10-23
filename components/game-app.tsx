"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Heart,
  HelpCircle,
  Leaf,
  Map,
  Settings2,
  Sparkles,
  Star,
  Sun,
  Users,
} from "lucide-react";
import { GameBoard } from "./game-board";
import { AdventureMap } from "./adventure-map";
import { GameDialogs } from "./game-dialogs";
import { guess, hint, LEVELS, makeRound, stars, type Round } from "@/lib/game";
import type { RoomView } from "@/lib/rooms";
type Mode = "adventure" | "daily" | "friends";
type Progress = { stars: number[] };
type Session = { code: string; token: string };
const emptyProgress = () => ({ stars: Array<number>(10).fill(0) });
function dailyRound() {
  const date = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (const c of date) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
  return makeRound(100, 7, (hash % 100) + 1);
}
async function api(
  path: string,
  method = "GET",
  data?: unknown,
  token?: string,
) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
    cache: "no-store",
  });
  const result = await res.json();
  if (!res.ok)
    throw new Error(result.error ?? "Could not connect. Please try again.");
  return result;
}
export function GameApp() {
  const [mode, setMode] = useState<Mode>("adventure");
  const [level, setLevel] = useState(0);
  const [round, setRound] = useState<Round>(() => makeRound(10, 4));
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [room, setRoom] = useState<RoomView | null>(null);
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(true);
  const [sound, setSound] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const help = useRef<HTMLDialogElement>(null);
  const settings = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // Remove the prototype's worker so an upgrade cannot keep serving the old app.
    navigator.serviceWorker
      ?.getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => {});
    try {
      const saved = JSON.parse(
        localStorage.getItem("king:v2:progress") ?? "null",
      );
      if (
        Array.isArray(saved?.stars) &&
        saved.stars.length === 10 &&
        saved.stars.every(
          (n: unknown) =>
            Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 3,
        )
      )
        setProgress(saved);
      setName(localStorage.getItem("kingGuesser_playerName") ?? "");
      setSound(localStorage.getItem("king:v2:sound") === "true");
      const last = JSON.parse(localStorage.getItem("king:v2:room") ?? "null");
      if (last?.code && last?.token) setSession(last);
    } catch {
      /* Storage can be unavailable in private browsing. */
    }
    const invite = new URLSearchParams(window.location.search).get("room");
    if (invite && /^[A-Z2-9]{6}$/.test(invite.toUpperCase())) {
      setCode(invite.toUpperCase());
      setMode("friends");
      try {
        const previous = JSON.parse(
          localStorage.getItem("king:v2:room") ?? "null",
        );
        if (previous?.code !== invite.toUpperCase()) setSession(null);
      } catch {
        setSession(null);
      }
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      try {
        localStorage.setItem("king:v2:progress", JSON.stringify(progress));
      } catch {}
  }, [progress, loaded]);
  useEffect(() => {
    if (!session || mode !== "friends") return;
    let active = true;
    const poll = async () => {
      try {
        const next: RoomView = await api(
          `/api/rooms/${session.code}`,
          "GET",
          undefined,
          session.token,
        );
        if (active) {
          setRoom((old) =>
            !old || old.code !== next.code || next.version >= old.version
              ? next
              : old,
          );
          setConnected(true);
          setError("");
        }
      } catch (e) {
        if (active) {
          setConnected(false);
          setError((e as Error).message);
        }
      }
    };
    void poll();
    const timer = setInterval(() => {
      if (!document.hidden) void poll();
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [session, mode]);
  function tone(won = false) {
    if (!sound) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(won ? 660 : 330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        won ? 990 : 440,
        ctx.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
      osc.onended = () => void ctx.close();
    } catch {}
  }
  function chooseMode(next: Mode) {
    setMode(next);
    setError("");
    setValue("");
    if (next === "daily") setRound(dailyRound());
    if (next === "adventure")
      setRound(makeRound(LEVELS[level].max, LEVELS[level].budget));
  }
  function chooseLevel(index: number) {
    setLevel(index);
    setRound(makeRound(LEVELS[index].max, LEVELS[index].budget));
    setError("");
    setValue("");
    input.current?.focus();
  }
  function record(next: Round) {
    setRound(next);
    tone(next.status === "won");
    if (mode === "adventure" && next.status === "won")
      setProgress((old) => ({
        stars: old.stars.map((n, i) =>
          i === level ? Math.max(n, stars(next)) : n,
        ),
      }));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!/^\d+$/.test(value)) {
      setError("Enter a whole number to make your guess.");
      return;
    }
    if (mode === "friends") {
      await roomAction("guess", Number(value));
      return;
    }
    try {
      record(guess(round, Number(value)));
      setValue("");
      input.current?.focus();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function openRoom(join: boolean) {
    setBusy(true);
    setError("");
    try {
      const next: Session = await api(
        join ? `/api/rooms/${code.toUpperCase()}` : "/api/rooms",
        "POST",
        { action: "join", name },
      );
      const view: RoomView = await api(
        `/api/rooms/${next.code}`,
        "GET",
        undefined,
        next.token,
      );
      setRoom(view);
      setSession(next);
      setConnected(true);
      try {
        localStorage.setItem("king:v2:room", JSON.stringify(next));
        localStorage.setItem("kingGuesser_playerName", name);
      } catch {}
      window.history.replaceState({}, "", `?room=${next.code}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function roomAction(action: "guess" | "rematch", number?: number) {
    if (!session || !room || busy) return;
    setBusy(true);
    setError("");
    try {
      const next: RoomView = await api(
        `/api/rooms/${session.code}`,
        "POST",
        { action, value: number, version: room.version },
        session.token,
      );
      setRoom((old) => (!old || next.version >= old.version ? next : old));
      setValue("");
      tone(next.round.status === "won");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function forgetRoom() {
    setSession(null);
    setRoom(null);
    setError("");
    try {
      localStorage.removeItem("king:v2:room");
    } catch {}
    window.history.replaceState({}, "", "/");
  }
  const totalStars = progress.stars.reduce((a, b) => a + b, 0);
  const title =
    mode === "daily"
      ? "A fresh little challenge."
      : mode === "friends"
        ? "Good guesses. Better company."
        : "Small guesses.\nBig little victories.";
  return (
    <div className="app-shell">
      <a className="skip-link" href="#play">
        Skip to game
      </a>
      <aside className="sidebar">
        <a href="/" className="brand" aria-label="King Guesser home">
          <span className="brand-mark">
            <Crown size={23} />
          </span>
          <span>
            king<span className="brand-light">guesser</span>
            <span className="brand-period">.</span>
          </span>
        </a>
        <div className="sidebar-label">A LITTLE PLAY, EVERY DAY</div>
        <nav aria-label="Game modes">
          {(
            [
              { id: "adventure", icon: Map, label: "The adventure" },
              { id: "daily", icon: Sun, label: "Daily little puzzle" },
              { id: "friends", icon: Users, label: "Play with friends" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => chooseMode(item.id)}
              className={`nav-item ${mode === item.id ? "active" : ""}`}
              aria-current={mode === item.id ? "page" : undefined}
            >
              <item.icon size={19} />
              {item.label}
              {mode === item.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="small-note">
            <div className="note-icon">
              <Leaf size={22} />
            </div>
            <strong>A moment for your mind.</strong>
            <p>
              No rush. No pressure.
              <br />
              Just you and a little curiosity.
            </p>
            <span>
              Made for the joy of it <Heart size={12} />
            </span>
          </div>
          <button
            className="quiet-button"
            onClick={() => help.current?.showModal()}
          >
            <HelpCircle size={17} /> How to play <ChevronRight size={15} />
          </button>
        </div>
      </aside>
      <main className="main-content min-w-0">
        <header className="topbar">
          <div className="breadcrumb">
            Your daily dose of <span>“I got it!”</span>
            <Sparkles size={15} />
          </div>
          <div className="top-actions flex items-center gap-5">
            <span className="star-total">
              <Star size={16} fill="currentColor" />
              {totalStars}
              <span>/ 30</span>
            </span>
            <button
              className="icon-button"
              onClick={() => settings.current?.showModal()}
              aria-label="Settings"
            >
              <Settings2 size={19} />
            </button>
          </div>
        </header>
        <section className="hero relative flex items-center justify-between">
          <div>
            <div className="eyebrow">
              <span /> LITTLE NUMBERS. LOVELY POSSIBILITIES.
            </div>
            <h1>{title}</h1>
            <p>
              {mode === "friends"
                ? "Invite your favourite rival. Every clue is a gift to the next player."
                : mode === "daily"
                  ? "One puzzle, the same number for everyone. A new beginning every UTC day."
                  : "Follow the clues. Trust your curiosity. Find the hidden number."}
              <br />
              {mode === "adventure" && "Your next “aha!” is just a guess away."}
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-star s1">✳</span>
            <span className="art-star s2">✧</span>
            <span className="art-number n1">7</span>
            <span className="art-number n2">?</span>
            <div className="sun-face">
              <div className="tiny-crown">♛</div>
              <div className="eyes">
                <i />
                <i />
              </div>
              <div className="smile" />
              <div className="cheek left" />
              <div className="cheek right" />
            </div>
            <span className="art-caption">a little closer to brilliant</span>
            <span className="art-dot" />
          </div>
        </section>
        <div className="content-grid grid items-start">
          <GameBoard
            mode={mode}
            level={level}
            round={round}
            room={room}
            name={name}
            setName={setName}
            code={code}
            setCode={setCode}
            session={session}
            busy={busy}
            connected={connected}
            error={error}
            value={value}
            setValue={setValue}
            setError={setError}
            input={input}
            submit={submit}
            onCreate={(join) => void openRoom(join)}
            onReconnect={() => setSession((old) => (old ? { ...old } : null))}
            onHint={() => {
              try {
                record(hint(round));
                setError("");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
            onReplay={() => {
              if (round.status === "won" && mode === "adventure" && level < 9)
                chooseLevel(level + 1);
              else if (mode === "daily") {
                setRound(dailyRound());
                setValue("");
              } else
                chooseLevel(round.status === "won" && level === 9 ? 0 : level);
            }}
            onRematch={() => void roomAction("rematch")}
            forgetRoom={forgetRoom}
          />

          <AdventureMap
            level={level}
            active={mode === "adventure"}
            scores={progress.stars}
            onSelect={(i) => {
              setMode("adventure");
              chooseLevel(i);
            }}
          />
        </div>
        <section className="discovery-row" aria-label="More ways to play">
          <button
            className="discovery-card daily-card"
            onClick={() => chooseMode("daily")}
          >
            <span className="discovery-icon">
              <Sun size={26} />
            </span>
            <span>
              <strong>A fresh puzzle, every day.</strong>
              <span>Your tiny daily ritual. Same puzzle for everyone.</span>
            </span>
            <ArrowRight size={19} />
          </button>
          <button
            className="discovery-card friends-card"
            onClick={() => chooseMode("friends")}
          >
            <span className="discovery-icon">
              <Users size={25} />
            </span>
            <span>
              <strong>Joy is better shared.</strong>
              <span>A private duel. A friend. A little friendly rivalry.</span>
            </span>
            <ArrowRight size={19} />
          </button>
        </section>
        <footer className="site-footer">
          <span>
            <Crown size={14} /> Small game. Big heart.
          </span>
          <button onClick={() => help.current?.showModal()}>
            A little help?
          </button>
          <span>Take a breath. Make a guess.</span>
        </footer>
      </main>
      <GameDialogs
        help={help}
        settings={settings}
        sound={sound}
        onSound={(next) => {
          setSound(next);
          try {
            localStorage.setItem("king:v2:sound", String(next));
          } catch {}
        }}
      />
    </div>
  );
}
