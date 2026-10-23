"use client";
import { useEffect, useRef, useState } from "react";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaControls() {
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const [failed, setFailed] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const updating = useRef(false);

  useEffect(() => {
    const connection = () => setOffline(!navigator.onLine);
    const standalone = matchMedia("(display-mode: standalone)");
    const installation = () => {
      setInstalled(
        standalone.matches ||
          Boolean(
            (navigator as Navigator & { standalone?: boolean }).standalone,
          ),
      );
      setInstall(null);
    };
    const prompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    const changed = () => {
      if (updating.current) window.location.reload();
    };
    connection();
    installation();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    window.addEventListener("beforeinstallprompt", prompt);
    window.addEventListener("appinstalled", installation);
    standalone.addEventListener("change", installation);
    let active = true;
    let registration: ServiceWorkerRegistration | undefined;
    const inspect = () => {
      if (!active || !registration) return;
      if (registration.active) setReady(true);
      if (registration.waiting) setWaiting(registration.waiting);
      const worker = registration.installing;
      if (worker)
        worker.addEventListener("statechange", () => {
          if (!active) return;
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          )
            setWaiting(worker);
          if (worker.state === "activated") setReady(true);
          if (worker.state === "redundant") setFailed(true);
        });
    };
    const check = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        registration?.update().catch(() => {});
    };
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", changed);
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((value) => {
          if (!active) return;
          registration = value;
          inspect();
          registration.addEventListener("updatefound", inspect);
        })
        .catch(() => {
          if (active) setFailed(true);
        });
      navigator.serviceWorker.ready.then(() => {
        if (active) setReady(true);
      });
      document.addEventListener("visibilitychange", check);
    }
    return () => {
      active = false;
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.removeEventListener("beforeinstallprompt", prompt);
      window.removeEventListener("appinstalled", installation);
      standalone.removeEventListener("change", installation);
      navigator.serviceWorker?.removeEventListener("controllerchange", changed);
      registration?.removeEventListener("updatefound", inspect);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return (
    <div className="pwa-controls">
      <p role="status">
        {offline
          ? "You’re offline. Adventure and the daily puzzle are here for you; friend duels need a connection."
          : ready
            ? "Ready for offline play. Friend duels need a connection."
            : failed
              ? "Offline play couldn’t finish setting up. Reconnect and reopen the game to try again."
              : "Open the game online once to prepare offline play."}
      </p>
      {installed ? (
        <p>King Guesser is on your home screen. A little joy, always close.</p>
      ) : install ? (
        <button
          className="primary-button"
          onClick={async () => {
            try {
              await install.prompt();
              await install.userChoice;
            } catch {
              // Browser-menu installation remains available if the prompt fails.
            } finally {
              setInstall(null);
            }
          }}
        >
          Install King Guesser
        </button>
      ) : (
        <p>
          Keep us close: choose “Install app” in your browser menu. On iPhone or
          iPad, use Safari’s Share menu → Add to Home Screen.
        </p>
      )}
      {waiting && (
        <div>
          <p>
            A fresh version is ready. Updating starts a new round; your stars
            and interface are saved.
          </p>
          <button
            className="primary-button"
            onClick={() => {
              updating.current = true;
              waiting.postMessage({ type: "SKIP_WAITING" });
            }}
          >
            Update game
          </button>
        </div>
      )}
    </div>
  );
}
