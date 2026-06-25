"use client";

import { useEffect, useState } from "react";
import { Close } from "@carbon/icons-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsDismissed(localStorage.getItem("pwaPromptDismissed") === "true");

    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "development") {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
          }
        });
      } else {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    if (result.outcome === "accepted") setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwaPromptDismissed", "true");
    setIsDismissed(true);
  };

  if (isInstalled || !deferredPrompt || isDismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex md:hidden items-center gap-1 bg-card/80 backdrop-blur border border-secondary/30 p-1 shadow-lg"
         style={{ clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)" }}>
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 bg-secondary px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white dark:text-black shadow-lg transition-all hover:opacity-90 active:scale-95 cursor-pointer"
        style={{ clipPath: "polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)" }}
      >
        Install App
      </button>
      <button
        onClick={handleDismiss}
        className="p-1 text-muted-text hover:text-secondary transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <Close className="w-4 h-4" />
      </button>
    </div>
  );
}
