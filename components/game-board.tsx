import { useState, type FormEvent, type RefObject } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Backspace,
  Lightbulb,
  Star,
  CrownSimple,
  ArrowCounterClockwise,
  Check,
  CaretRight,
} from "@phosphor-icons/react";
import { LEVELS, stars, type Round } from "@/lib/game";
import { getInterface, type InterfaceId } from "@/lib/interfaces";
import type { RoomView } from "@/lib/rooms";
import { RoomLobby, RoomWaiting } from "./room-lobby";
type Mode = "adventure" | "daily" | "friends";
type CurrentRound = Round | RoomView["round"];
type Props = {
  interfaceId: InterfaceId;
  scores: number[];
  onLevels: () => void;
  mode: Mode;
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
function Companion({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  // Small pre-sized WebP: only the active interface's character is requested.
  return (
    <img
      className={`companion ${className}`}
      src={src}
      alt=""
      width={220}
      height={220}
      decoding="async"
    />
  );
}
function Chances({ current }: { current: CurrentRound }) {
  return (
    <span className="chances">
      <span className="chance-dots" aria-hidden="true">
        {Array.from({ length: current.budget }, (_, i) => (
          <i key={i} className={i < current.spent ? "used" : ""} />
        ))}
      </span>
      <span>
        <strong>{current.budget - current.spent}</strong> guesses left
      </span>
    </span>
  );
}
export function GameBoard(props: Props) {
  const {
    interfaceId,
    mode,
    level,
    round,
    room,
    busy,
    connected,
    error,
    input,
    onLevels,
    scores,
    forgetRoom,
  } = props;
  const theme = getInterface(interfaceId),
    online = mode === "friends" && !!room;
  const current = online ? room.round : round;
  const waiting = online && room.players.length < 2;
  const myTurn = online && room.turn === room.you && !waiting;
  const canGuess =
    current.status === "playing" && (!online || (myTurn && connected));
  const bottomProgress = [
    "friendly",
    "golden",
    "midnight",
    "evergreen",
  ].includes(interfaceId);
  const headerChances =
    ["friendly", "golden", "evergreen"].includes(interfaceId) &&
    current.status === "playing" &&
    !waiting;
  const progress = (
    <ol className="level-dots" aria-label={`Level ${level + 1} of 10`}>
      {LEVELS.map((item, i) => (
        <li
          key={item.name}
          className={i === level ? "current" : scores[i] ? "complete" : ""}
          aria-label={`Level ${i + 1}${scores[i] ? ", completed" : ""}${i === level ? ", current" : ""}`}
        />
      ))}
    </ol>
  );
  const label = online
    ? `DUEL ${room.match}`
    : mode === "daily"
      ? "THE DAILY PUZZLE"
      : `LEVEL ${String(level + 1).padStart(2, "0")} / 10`;
  return (
    <section
      id="play"
      className={`play-card layout-${theme.layout}`}
      aria-label="Number guessing game"
      data-layout={theme.layout}
    >
      {mode === "friends" && !room ? (
        <RoomLobby {...props} />
      ) : (
        <>
          <div
            className={`board-top ${headerChances && interfaceId !== "friendly" ? "head-inline" : ""}`}
          >
            <span className="stage-label">{label}</span>
            {headerChances && interfaceId !== "friendly" && (
              <Chances current={current} />
            )}
            {mode === "adventure" && !bottomProgress && (
              <button
                className="level-link"
                onClick={onLevels}
                aria-label="Choose a level"
              >
                Levels <CaretRight size={14} />
              </button>
            )}
            {mode === "daily" && (
              <span className="stage-note">A fresh puzzle every UTC day</span>
            )}
          </div>
          {headerChances && interfaceId === "friendly" && (
            <div className="head-chances">
              <Chances current={current} />
            </div>
          )}
          {mode === "adventure" && !bottomProgress && progress}
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
                </span>
              ))}
              {!waiting && current.status === "playing" && (
                <span className="turn-status" role="status">
                  {myTurn ? "Your turn" : `${room.players[room.turn]}’s turn`}
                </span>
              )}
            </div>
          )}
          {waiting ? (
            <RoomWaiting room={room} setError={props.setError} />
          ) : current.status === "playing" ? (
            <PlayRound
              key={`${mode}:${level}`}
              {...props}
              current={current}
              canGuess={canGuess}
              online={online}
            />
          ) : (
            <div className="result" role="status">
              {theme.character ? (
                <Companion src={theme.character} />
              ) : (
                <CrownSimple className="result-crown" size={56} weight="fill" />
              )}
              <h1>
                {current.status === "won"
                  ? online
                    ? `${room.players[room.winner ?? 0]} found it!`
                    : "Oh, you brilliant thing."
                  : "Every guess teaches you."}
              </h1>
              <p>
                {current.status === "won"
                  ? "A little curiosity goes a long way."
                  : "A fresh start is always one click away."}
              </p>
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
                      weight={n <= stars(round) ? "fill" : "regular"}
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
                  onClick={props.onRematch}
                  disabled={busy || room.ready.includes(room.you)}
                >
                  {room.ready.includes(room.you)
                    ? "Waiting for your friend…"
                    : "Play a rematch"}
                  <ArrowCounterClockwise size={21} />
                </button>
              ) : (
                <button className="primary-button" onClick={props.onReplay}>
                  {current.status === "won" && mode === "adventure"
                    ? level < 9
                      ? "On to the next adventure"
                      : "Play the adventure again"
                    : "Give it another go"}
                  <ArrowRight size={21} />
                </button>
              )}
            </div>
          )}
          {mode === "adventure" && bottomProgress && (
            <div className="level-footer">
              {progress}
              <button
                className="level-link"
                onClick={onLevels}
                aria-label="Choose a level"
              >
                Levels <CaretRight size={14} />
              </button>
            </div>
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
      {error && current.status === "playing" && mode !== "friends" && (
        <button className="text-button" onClick={() => input.current?.focus()}>
          Try another number
        </button>
      )}
    </section>
  );
}
function PlayRound({
  interfaceId,
  current,
  value,
  setValue,
  input,
  submit,
  busy,
  canGuess,
  onHint,
  online,
  mode,
  error,
}: Props & { current: CurrentRound; canGuess: boolean; online: boolean }) {
  const theme = getInterface(interfaceId),
    keypad = theme.layout === "keypad";
  const [hintAt, setHintAt] = useState(-1);
  const last = current.guesses.at(-1),
    hintNow = current.hints > 0 && hintAt === current.spent;
  const clue = hintNow
    ? "A little nudge."
    : last?.direction === "higher"
      ? "A little higher."
      : last?.direction === "lower"
        ? "A little lower."
        : "Let’s find that number.";
  const encouragement = hintNow
    ? "A smaller search zone. You’ve got this."
    : last
      ? "Good thinking. You’re getting closer."
      : "Every guess brings you closer.";
  const title =
    interfaceId === "cobalt"
      ? "A little closer."
      : interfaceId === "midnight"
        ? "Find your next little win."
        : interfaceId === "golden"
          ? `Find the number between ${current.low.toLocaleString()} and ${current.high.toLocaleString()}.`
          : interfaceId === "studio"
            ? "Nice thinking."
            : clue;
  const headerIsClue =
    interfaceId === "friendly" || interfaceId === "evergreen";
  function digit(d: string) {
    if (!canGuess || busy) return;
    setValue((value === "0" ? "" : value).concat(d).slice(0, 13));
    input.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <div
        className={`stage-heading ${theme.character && interfaceId !== "golden" ? "with-character" : ""}`}
        id="game-heading"
        aria-live={headerIsClue ? "polite" : "off"}
      >
        {theme.character && interfaceId !== "golden" && (
          <Companion src={theme.character} />
        )}
        <div>
          {interfaceId === "evergreen" &&
            last &&
            (last.direction === "higher" ? (
              <ArrowUp className="clue-arrow" size={42} />
            ) : (
              <ArrowDown className="clue-arrow" size={42} />
            ))}
          <h1>{title}</h1>
          <p>
            {interfaceId === "studio"
              ? last
                ? `Try a little ${last.direction}.`
                : "Your next little win is one guess away."
              : encouragement}
          </p>
          {headerIsClue && last && (
            <span className="last-guess">
              You tried <b>{last.value}</b>
            </span>
          )}
        </div>
      </div>
      <form className="turn-form" onSubmit={submit}>
        <div className="turn-grid">
          <div className="turn-clues">
            <div className="range-display">
              <span className="field-label">
                {keypad ? "Current range" : "Your search zone"}
              </span>
              <div className="range-numbers">
                <strong>{current.low.toLocaleString()}</strong>
                <span aria-hidden="true">–</span>
                <strong>{current.high.toLocaleString()}</strong>
              </div>
              {!keypad && (
                <progress
                  className="search-progress"
                  max={current.max}
                  value={current.high - current.low + 1}
                  aria-label={`${current.high - current.low + 1} possibilities remain`}
                />
              )}
            </div>
            <div className="entry-area">
              <label htmlFor="guess" className="field-label">
                Your guess
              </label>
              <input
                ref={input}
                id="guess"
                aria-label="Your best guess"
                type="text"
                inputMode={keypad ? "none" : "numeric"}
                autoComplete="off"
                maxLength={13}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="?"
                aria-describedby={`${headerIsClue ? "game-heading" : "game-feedback"}${error ? " game-error" : ""}`}
                aria-invalid={!!error}
                disabled={!canGuess || busy}
              />
            </div>
            <div
              className={`game-feedback ${headerIsClue ? "feedback-in-heading" : ""}`}
              id="game-feedback"
              aria-live={headerIsClue ? "off" : "polite"}
            >
              {interfaceId === "golden" && theme.character && (
                <Companion src={theme.character} />
              )}
              <div>
                <h2>
                  {hintNow ? (
                    "A little nudge."
                  ) : last && interfaceId === "golden" ? (
                    last.direction === "higher" ? (
                      "Higher!"
                    ) : (
                      "Lower!"
                    )
                  ) : last ? (
                    <>
                      {last.value}?{" "}
                      <span>
                        {last.direction === "higher"
                          ? "Go higher."
                          : "Go lower."}
                      </span>
                    </>
                  ) : (
                    "Your first clue is waiting."
                  )}
                </h2>
                <p>
                  {hintNow
                    ? "Your search zone just got smaller."
                    : last
                      ? interfaceId === "golden"
                        ? `You’re onto something. ${last.value} was a little ${last.direction === "higher" ? "low" : "high"}. Keep going.`
                        : `${last.warmth}. Keep going.`
                      : "Follow your curiosity. You’ve got this."}
                </p>
              </div>
            </div>
            {current.guesses.length > 0 && (
              <div className="guess-history" aria-label="Guess history">
                <span>Recent guesses</span>
                <div>
                  {current.guesses.slice(-6).map((g, i) => (
                    <span
                      key={`${g.value}-${i}`}
                      aria-label={`${g.value}: ${g.direction}`}
                      className={g.direction === "correct" ? "correct" : ""}
                    >
                      {g.value}
                      {g.direction === "correct" ? (
                        <Check size={16} />
                      ) : g.direction === "higher" ? (
                        <ArrowUp size={16} />
                      ) : (
                        <ArrowDown size={16} />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="turn-controls">
            {keypad && (
              <div className="keypad" aria-label="Number keypad">
                {[
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "clear",
                  "0",
                  "back",
                ].map((key) => (
                  <button
                    type="button"
                    key={key}
                    className={`number-key ${key === "clear" || key === "back" ? "utility-key" : ""}`}
                    disabled={!canGuess || busy}
                    aria-label={
                      key === "clear"
                        ? "Clear guess"
                        : key === "back"
                          ? "Delete last digit"
                          : `Digit ${key}`
                    }
                    onClick={() => {
                      if (key === "clear") setValue("");
                      else if (key === "back") setValue(value.slice(0, -1));
                      else digit(key);
                      input.current?.focus({ preventScroll: true });
                    }}
                  >
                    {key === "clear" ? (
                      "C"
                    ) : key === "back" ? (
                      <Backspace size={27} weight="fill" />
                    ) : (
                      key
                    )}
                  </button>
                ))}
              </div>
            )}
            <button
              type="submit"
              className="primary-button guess-button"
              aria-label="Make a guess"
              disabled={!canGuess || busy || !value}
            >
              {busy ? "Sending…" : "Guess"}
              <ArrowRight size={26} weight="bold" />
            </button>
          </div>
        </div>
        <div className="round-support">
          {!["friendly", "golden", "evergreen"].includes(interfaceId) && (
            <Chances current={current} />
          )}
          {!online && (
            <button
              type="button"
              className="hint-button"
              onClick={() => {
                setHintAt(current.spent + 1);
                onHint();
              }}
              disabled={current.low === current.high}
            >
              <Lightbulb size={21} weight="fill" />
              <span>
                Hint <small>· uses 1 guess</small>
              </span>
            </button>
          )}
          {mode === "daily" && (
            <span className="daily-note">Same number for everyone</span>
          )}
        </div>
      </form>
    </>
  );
}
