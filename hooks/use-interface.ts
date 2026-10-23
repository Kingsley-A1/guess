"use client";
import { useEffect, useState } from "react";
import {
  INTERFACE_STORAGE_KEY,
  isInterface,
  type InterfaceId,
} from "@/lib/interfaces";
export function useInterface() {
  const [selected, setSelected] = useState<InterfaceId>("cobalt");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(INTERFACE_STORAGE_KEY);
      if (isInterface(stored)) {
        setSelected(stored);
        document.documentElement.dataset.interface = stored;
      }
    } catch {}
  }, []);
  function choose(value: string) {
    if (!isInterface(value)) return;
    setSelected(value);
    document.documentElement.dataset.interface = value;
    try {
      localStorage.setItem(INTERFACE_STORAGE_KEY, value);
    } catch {}
  }
  return { selected, choose };
}
