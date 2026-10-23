"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CrownSimple,
  GearSix,
  Question,
  CaretDown,
  Palette,
  X,
} from "@phosphor-icons/react";
import { INTERFACES } from "@/lib/interfaces";
import { useInterface } from "@/hooks/use-interface";
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
  const { selected: interfaceId, choose: chooseInterface } = useInterface();
  const levels = useRef<HTMLDialogElement>(null);
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
  return (
    <div className="app-shell">
      <a className="skip-link" href="#play">
        Skip to game
      </a>
      <header className="app-header">
        <a href="/" className="brand" aria-label="King Guesser home">
          <CrownSimple size={38} weight="fill" />
          <span>
            <b>king</b>guesser
          </span>
        </a>
        <div className="select-control mode-control">
          <select
            aria-label="Game mode"
            value={mode}
            onChange={(e) => chooseMode(e.target.value as Mode)}
          >
            <option value="adventure">Adventure</option>
            <option value="daily">Daily little puzzle</option>
            <option value="friends">Play with friends</option>
          </select>
          <CaretDown size={15} weight="bold" />
        </div>
        <div className="header-actions">
          <div className="select-control interface-control">
            <Palette size={17} />
            <select
              aria-label="Interface"
              value={interfaceId}
              onChange={(e) => chooseInterface(e.target.value)}
            >
              {INTERFACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <CaretDown size={13} />
          </div>
          <button
            className="icon-button"
            onClick={() => help.current?.showModal()}
            aria-label="How to play"
          >
            <Question size={22} weight="bold" />
          </button>
          <button
            className="icon-button"
            onClick={() => settings.current?.showModal()}
            aria-label="Settings"
          >
            <GearSix size={21} weight="fill" />
          </button>
        </div>
      </header>
      <main className="main-content min-w-0">
        <GameBoard
          interfaceId={interfaceId}
          scores={progress.stars}
          onLevels={() => levels.current?.showModal()}
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
      </main>
      <dialog
        ref={levels}
        className="modal level-modal"
        aria-label="Choose a level"
      >
        <button
          className="modal-close icon-button"
          aria-label="Close levels"
          onClick={() => levels.current?.close()}
        >
          <X size={20} />
        </button>
        <AdventureMap
          level={level}
          active={mode === "adventure"}
          scores={progress.stars}
          onSelect={(index) => {
            setMode("adventure");
            chooseLevel(index);
            levels.current?.close();
          }}
        />
        <p className="total-stars">
          {totalStars} of 30 stars collected. One little victory at a time.
        </p>
      </dialog>
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
