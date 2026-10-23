import { useState, type FormEvent, type RefObject } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Flag,
  Heart,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { LEVELS, stars, type Round } from "@/lib/game";
import type { RoomView } from "@/lib/rooms";
type Props = {
  mode: "adventure" | "daily" | "friends";
  level: number;
  round: Round;
  room: RoomView | null;
  name: string;
  setName: (name: string) => void;
  code: string;
  setCode: (code: string) => void;
  session: { code: string; token: string } | null;
  busy: boolean;
  connected: boolean;
  error: string;
  value: string;
  setValue: (value: string) => void;
  setError: (message: string) => void;
  input: RefObject<HTMLInputElement | null>;
  submit: (event: FormEvent) => void;
  onCreate: (join: boolean) => void;
  onReconnect: () => void;
  onHint: () => void;
  onReplay: () => void;
  onRematch: () => void;
  forgetRoom: () => void;
};
export function GameBoard({
  mode,
  level,
  round,
  room,
  name,
  setName,
  code,
  setCode,
  session,
  busy,
  connected,
  error,
  value,
  setValue,
  setError,
  input,
  submit,
  onCreate,
  onReconnect,
  onHint,
  onReplay,
  onRematch,
  forgetRoom,
}: Props) {
  const [copied, setCopied] = useState(false);
  const online = mode === "friends" && !!room;
  const current = online ? room.round : round;
  const last = current.guesses.at(-1);
  const waiting = online && room.players.length < 2;
  const myTurn = online && room.turn === room.you && !waiting;
  const canGuess =
    current.status === "playing" && (!online || (myTurn && connected));
  const displayLevel = LEVELS[level];
  return (
    <section id="play" className="play-card" aria-label="Number guessing game">
      {mode === "friends" && !room ? (
        <>
          <div className="card-top">
            <span className="pill">
              <Users size={14} /> THE FRIENDLY DUEL
            </span>
            <span className="muted">2 players · 1 secret</span>
          </div>
          <div className="lobby">
            <div className="lobby-symbol">
              <Users size={36} />
            </div>
            <h2>A little friendly competition?</h2>
            <p>
              One number from 1–100. Take turns guessing.
              <br />
              Shared clues. Twelve chances. First to find it wins.
            </p>
            <label className="field-label" htmlFor="player-name">
              What should we call you?
            </label>
            <input
              id="player-name"
              className="text-input"
              maxLength={20}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="primary-button full"
              disabled={busy || !name.trim()}
              onClick={() => onCreate(false)}
            >
              Create a private room <ArrowRight size={18} />
            </button>
            <div className="divider">
              <span>or join a friend</span>
            </div>
            <form
              className="join-form"
              onSubmit={(e) => {
                e.preventDefault();
                onCreate(true);
              }}
            >
              <input
                aria-label="Six-character room code"
                className="text-input code-input"
                maxLength={6}
                value={code}
                placeholder="ROOM CODE"
                onChange={(e) =>
                  setCode(
                    e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""),
                  )
                }
              />
              <button
                className="secondary-button"
                disabled={busy || code.length !== 6 || !name.trim()}
              >
                Join room <ArrowRight size={17} />
              </button>
            </form>
            {session && (
              <button className="quiet-button" onClick={() => onReconnect()}>
                Reconnect to room {session.code}
              </button>
            )}
            <p className="fine-print">
              No sign-up. Rooms expire after one hour.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="card-top">
            <span className="pill">
              {online ? <Users size={14} /> : <Flag size={14} />}{" "}
              {online
                ? `DUEL ${room.match}`
                : mode === "daily"
                  ? "THE DAILY PUZZLE"
                  : `LEVEL ${String(level + 1).padStart(2, "0")} / 10`}
            </span>
            <span className="muted">
              {online
                ? "Shared clues"
                : mode === "daily"
                  ? "Same number for everyone"
                  : displayLevel.name}
            </span>
          </div>
          {online && (
            <div className="duel-bar">
              {room.players.map((player, i) => (
                <span
                  key={i}
                  className={room.turn === i ? "player-current" : ""}
                >
                  <span className="avatar">
                    {player.slice(0, 1).toUpperCase()}
                  </span>
                  {player}
                  {room.you === i ? " (you)" : ""}
                  {room.turn === i && current.status === "playing" && (
                    <span className="turn-dot" />
                  )}
                </span>
              ))}
              {waiting && <span className="muted">Waiting for a friend…</span>}
            </div>
          )}
          {waiting ? (
            <div className="waiting-room">
              <div className="lobby-symbol">
                <Users size={32} />
              </div>
              <h2>Your room is ready.</h2>
              <p>Send your friend this code or copy the invite link.</p>
              <strong className="room-code">{room.code}</strong>
              <button
                className="secondary-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/?room=${room.code}`,
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  } catch {
                    setError(
                      "Copy the room code above and share it with your friend.",
                    );
                  }
                }}
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}{" "}
                {copied ? "Invite copied" : "Copy invite link"}
              </button>
              <p className="fine-print">
                Keep this tab open. Your friend plays from another device.
              </p>
            </div>
          ) : (
            <>
              <div className="game-heading">
                <span className="little-spark">✦</span>
                <h2>
                  {current.status === "won"
                    ? online
                      ? `${room.players[room.winner ?? 0]} found it!`
                      : "Oh, you brilliant thing."
                    : current.status === "lost"
                      ? "Every guess teaches you."
                      : "There’s a number hiding."}
                </h2>
                <p>
                  {current.status === "playing" ? (
                    <>
                      Somewhere between <strong>1</strong> and{" "}
                      <strong>{current.max.toLocaleString()}</strong>.{" "}
                      {online
                        ? myTurn
                          ? "Your turn to find it."
                          : `${room.players[room.turn]} is thinking…`
                        : "Can you find it?"}
                    </>
                  ) : current.status === "won" ? (
                    "A little curiosity goes a long way."
                  ) : (
                    "A fresh start is always one click away."
                  )}
                </p>
              </div>
              {current.status === "playing" ? (
                <>
                  <div className="range-card">
                    <div className="range-label">
                      <span>YOUR SEARCH ZONE</span>
                      <span>
                        {current.high - current.low + 1} possibilities
                      </span>
                    </div>
                    <div className="range-track">
                      <div
                        className="range-fill"
                        style={{
                          left: `${((current.low - 1) / current.max) * 100}%`,
                          width: `${Math.max(1, ((current.high - current.low + 1) / current.max) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="range-numbers">
                      <strong>{current.low.toLocaleString()}</strong>
                      <span>The clues bring you closer</span>
                      <strong>{current.high.toLocaleString()}</strong>
                    </div>
                  </div>
                  <form onSubmit={submit} className="guess-form">
                    <label htmlFor="guess" className="field-label">
                      Your best guess
                    </label>
                    <div className="guess-entry">
                      <input
                        ref={input}
                        id="guess"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Hmm…"
                        aria-describedby="game-feedback game-error"
                        disabled={!canGuess || busy}
                      />
                      <button
                        className="primary-button"
                        disabled={!canGuess || busy || !value}
                      >
                        {busy ? "Sending…" : "Make a guess"}
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                  <div className="game-meta">
                    <span className="chances">
                      <span className="chance-dots">
                        {Array.from({ length: current.budget }, (_, i) => (
                          <i
                            className={i < current.spent ? "used" : ""}
                            key={i}
                          />
                        ))}
                      </span>
                      {current.budget - current.spent} guesses left
                    </span>
                    {!online && (
                      <button
                        className="hint-button"
                        onClick={() => {
                          onHint();
                        }}
                        disabled={current.low === current.high}
                      >
                        <Lightbulb size={16} /> A little hint{" "}
                        <span>−1 guess</span>
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="result">
                  <div
                    className={`result-number ${current.status === "won" ? "success" : ""}`}
                  >
                    {current.secret}
                  </div>
                  {!online && current.status === "won" && (
                    <div
                      className="result-stars"
                      aria-label={`${stars(round)} stars`}
                    >
                      {[1, 2, 3].map((n) => (
                        <Star
                          key={n}
                          size={29}
                          fill={n <= stars(round) ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  )}
                  <p>
                    {current.status === "won"
                      ? `Found in ${current.spent} ${current.spent === 1 ? "guess" : "guesses"}${current.hints ? " (including hints)" : ""}.`
                      : "That was the hidden number. Ready for another go?"}
                  </p>
                  {online ? (
                    <button
                      className="primary-button"
                      onClick={() => onRematch()}
                      disabled={busy || room.ready.includes(room.you)}
                    >
                      {room.ready.includes(room.you)
                        ? "Waiting for your friend…"
                        : "Play a rematch"}
                      <RotateCcw size={17} />
                    </button>
                  ) : (
                    <button
                      className="primary-button"
                      onClick={() => onReplay()}
                    >
                      {current.status === "won" && mode === "adventure"
                        ? level < 9
                          ? "On to the next adventure"
                          : "Play the adventure again"
                        : "Give it another go"}
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              )}
              <div
                id="game-feedback"
                className={`feedback ${last?.direction === "correct" ? "feedback-won" : ""}`}
                aria-live="polite"
              >
                {current.status === "playing" ? (
                  last ? (
                    <>
                      <span className="feedback-icon">
                        {last.direction === "higher" ? (
                          <ArrowUp size={18} />
                        ) : (
                          <ArrowDown size={18} />
                        )}
                      </span>
                      <span>
                        <strong>
                          {last.value}? Think {last.direction}.
                        </strong>
                        <span>{last.warmth}. You’re narrowing it down.</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="feedback-icon">
                        <Sparkles size={18} />
                      </span>
                      <span>
                        <strong>
                          {current.hints
                            ? "A little nudge in the right direction."
                            : "Every adventure starts with a guess."}
                        </strong>
                        <span>
                          {current.hints
                            ? "Your search zone is smaller now."
                            : "Try the middle. Or follow your instinct."}
                        </span>
                      </span>
                    </>
                  )
                ) : (
                  <>
                    <span className="feedback-icon">
                      <Heart size={18} />
                    </span>
                    <span>
                      <strong>
                        {current.status === "won"
                          ? "Small wins deserve a little celebration."
                          : "You’ve got this."}
                      </strong>
                      <span>
                        {current.status === "won"
                          ? "Take that good feeling into your next round."
                          : "Use the clues to cut your search zone in half."}
                      </span>
                    </span>
                  </>
                )}
              </div>
              {current.guesses.length > 0 && (
                <div className="guess-history" aria-label="Guess history">
                  <span>THE TRAIL SO FAR</span>
                  <div>
                    {current.guesses.map((g, i) => (
                      <span
                        key={i}
                        title={`${g.value}: ${g.direction}${online ? ` · ${room.players[g.player ?? 0]}` : ""}`}
                        className={g.direction === "correct" ? "correct" : ""}
                      >
                        {g.value}
                        {g.direction === "correct" ? (
                          <Check size={12} />
                        ) : g.direction === "higher" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {online && (
            <div className="room-footer">
              <span
                className={
                  connected
                    ? "connection-status"
                    : "connection-status disconnected"
                }
              >
                {connected ? "Connected" : "Reconnecting…"} · {room.code}
              </span>
              <button className="text-button" onClick={forgetRoom}>
                Leave room
              </button>
            </div>
          )}
        </>
      )}
      {error && (
        <p id="game-error" role="alert" className="error-message">
          {error}
        </p>
      )}
    </section>
  );
}
