"use client";

import { useSyncExternalStore } from "react";
import { AUTH_EVENT, getCurrentUser } from "@/lib/cart";

export function isAdminUser(): boolean {
  return getCurrentUser()?.role === "admin";
}

function subscribe(cb: () => void) {
  window.addEventListener(AUTH_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(AUTH_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getServerSnapshot() {
  return false;
}

export function useIsAdmin(): boolean {
  return useSyncExternalStore(subscribe, isAdminUser, getServerSnapshot);
}
