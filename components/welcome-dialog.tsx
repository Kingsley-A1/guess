"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, CrownSimple } from "@phosphor-icons/react";

const WELCOME_KEY = "king:v2:welcomed";

export function WelcomeDialog() {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(WELCOME_KEY) === "true") return;
    } catch {
      // A restricted browser can still show and dismiss the welcome.
    }
    dialog.current?.showModal();
  }, []);

  function rememberWelcome() {
    try {
      localStorage.setItem(WELCOME_KEY, "true");
    } catch {
      // Remembering a visit is optional when browser storage is unavailable.
    }
  }

  return (
    <dialog
      ref={dialog}
      className="modal welcome-dialog"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      onClose={rememberWelcome}
    >
      <span className="welcome-crown" aria-hidden="true">
        <CrownSimple size={32} weight="duotone" />
      </span>
      <h2 id="welcome-title">Welcome to King Guesser</h2>
      <p className="welcome-tagline">A little guess. A big adventure.</p>
      <p id="welcome-description">
        Find the hidden number. Follow the higher-or-lower clues, earn stars,
        and discover how far a little curiosity can take you.
      </p>
      <button
        className="primary-button"
        autoFocus
        onClick={() => dialog.current?.close()}
      >
        Let’s play <ArrowRight size={18} aria-hidden="true" />
      </button>
      <p className="welcome-note">
        Your next “I got it!” is just a guess away.
      </p>
    </dialog>
  );
}
