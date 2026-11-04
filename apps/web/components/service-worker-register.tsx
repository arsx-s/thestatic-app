"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw").catch((error) => {
      console.error("Service worker registration failed", error);
    });
  }, []);

  return null;
}
