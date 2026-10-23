import { useState } from "react";
import { ArrowRight, Check, Copy, Users } from "lucide-react";
import type { RoomView } from "@/lib/rooms";
type LobbyProps = {
  name: string;
  setName: (name: string) => void;
  code: string;
  setCode: (code: string) => void;
  busy: boolean;
  session: { code: string; token: string } | null;
  onCreate: (join: boolean) => void;
  onReconnect: () => void;
};
export function RoomLobby({
  name,
  setName,
  code,
  setCode,
  busy,
  session,
  onCreate,
  onReconnect,
}: LobbyProps) {
  return (
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
              setCode(e.target.value.toUpperCase().replace(/[^A-Z2-9]/g, ""))
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
        <p className="fine-print">No sign-up. Rooms expire after one hour.</p>
      </div>
    </>
  );
}
export function RoomWaiting({
  room,
  setError,
}: {
  room: RoomView;
  setError: (message: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
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
            setError("Copy the room code above and share it with your friend.");
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
  );
}
