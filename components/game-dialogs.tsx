import type { RefObject } from "react";
import { ArrowRight, Settings2, Sparkles, Volume2, X } from "lucide-react";
type Props = {
  help: RefObject<HTMLDialogElement | null>;
  settings: RefObject<HTMLDialogElement | null>;
  sound: boolean;
  onSound: (value: boolean) => void;
};
export function GameDialogs({ help, settings, sound, onSound }: Props) {
  return (
    <>
      <dialog ref={help} className="modal">
        <button
          className="modal-close icon-button"
          onClick={() => help.current?.close()}
          aria-label="Close help"
        >
          <X size={20} />
        </button>
        <span className="pill">
          <Sparkles size={14} /> THE LITTLE GUIDE
        </span>
        <h2>Curiosity looks good on you.</h2>
        <p>
          There’s a hidden whole number. Guess it before your chances run out.
        </p>
        <ol>
          <li>
            <strong>Make a guess.</strong> Try the middle of the search zone.
          </li>
          <li>
            <strong>Follow the clue.</strong> Higher or lower? The range shrinks
            after every guess.
          </li>
          <li>
            <strong>Find your moment.</strong> Find the number to earn stars and
            unlock the next level.
          </li>
        </ol>
        <p>
          A hint halves your search zone and uses one guess. In a duel, both
          players see every clue and take turns; the player who finds the number
          wins. Both players must agree to a rematch.
        </p>
        <button
          className="primary-button"
          onClick={() => help.current?.close()}
        >
          Let’s find that number <ArrowRight size={17} />
        </button>
      </dialog>
      <dialog ref={settings} className="modal">
        <button
          className="modal-close icon-button"
          onClick={() => settings.current?.close()}
          aria-label="Close settings"
        >
          <X size={20} />
        </button>
        <span className="pill">
          <Settings2 size={14} /> MAKE YOURSELF AT HOME
        </span>
        <h2>Your kind of quiet.</h2>
        <label className="setting-row">
          <span>
            <Volume2 size={20} /> Gentle sound effects
          </span>
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => {
              onSound(e.target.checked);
            }}
          />
        </label>
        <p>
          Your adventure progress stays in this browser. No account or tracking
          required. Clearing browser storage will reset it.
        </p>
        <p>
          Keyboard friendly. Motion follows your device’s reduced-motion
          preference.
        </p>
      </dialog>
    </>
  );
}
