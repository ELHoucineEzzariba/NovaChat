"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "novachat-theme";
const THEME_EVENT = "novachat-theme-change";

function readTheme(): ThemeMode {
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

function applyTheme(theme: ThemeMode) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): ThemeMode {
  return "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);

  const setTheme = useCallback((next: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
